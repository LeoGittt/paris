"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { MatchStage } from "@/lib/supabase/types"
import { requireAdmin } from "./guard"

const VALID_STAGES: MatchStage[] = [
  "group", "round_of_32", "round_of_16", "quarterfinal", "semifinal", "third_place", "final"
]

function isValidStage(s: string): s is MatchStage {
  return VALID_STAGES.includes(s as MatchStage)
}

function isValidISODate(s: string): boolean {
  if (!s || !s.includes("T")) return false
  const d = new Date(s)
  return !isNaN(d.getTime())
}

export type MatchResult =
  | { ok: true }
  | { ok: false; error: string }

export async function saveMatchResult(
  matchId: string,
  score1: number,
  score2: number
): Promise<MatchResult> {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  if (!Number.isInteger(score1) || !Number.isInteger(score2))
    return { ok: false, error: "Los marcadores deben ser números enteros." }
  if (score1 < 0 || score2 < 0)
    return { ok: false, error: "Los marcadores no pueden ser negativos." }
  if (score1 > 30 || score2 > 30)
    return { ok: false, error: "Marcador fuera de rango razonable (máx 30)." }

  const supabase = await createClient()

  const { error } = await supabase
    .from("matches")
    .update({ score1, score2, is_finished: true, predictions_locked: true })
    .eq("id", matchId)

  if (error) return { ok: false, error: error.message }

  // Recalcular puntos automáticamente
  const { error: rpcError } = await supabase.rpc("recalculate_points", { p_match_id: matchId })
  if (rpcError) return { ok: false, error: `Resultado guardado pero error al recalcular: ${rpcError.message}` }

  revalidatePath("/admin/partidos")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/ranking")
  revalidatePath("/")
  return { ok: true }
}

export async function updateMatchDate(matchId: string, matchDate: string): Promise<MatchResult> {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  if (!isValidISODate(matchDate))
    return { ok: false, error: "Formato de fecha inválido. Usar ISO 8601 (ej: 2026-06-15T18:00:00Z)." }

  const supabase = await createClient()
  const { error } = await supabase
    .from("matches")
    .update({ match_date: matchDate })
    .eq("id", matchId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/partidos")
  return { ok: true }
}

export async function updateMatchTeams(
  matchId: string,
  team1: string,
  team2: string
): Promise<MatchResult> {
  if (!team1.trim() || !team2.trim())
    return { ok: false, error: "Los nombres de los equipos no pueden estar vacíos." }
  if (team1.trim().toLowerCase() === team2.trim().toLowerCase())
    return { ok: false, error: "El local y el visitante no pueden ser el mismo equipo." }

  const supabase = await createClient()
  const { error } = await supabase
    .from("matches")
    .update({ team1: team1.trim(), team2: team2.trim() })
    .eq("id", matchId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/partidos")
  return { ok: true }
}

export async function lockMatch(matchId: string): Promise<MatchResult> {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  const supabase = await createClient()
  const { error } = await supabase
    .from("matches")
    .update({ predictions_locked: true })
    .eq("id", matchId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/partidos")
  return { ok: true }
}

export async function createMatch(data: {
  team1: string
  team2: string
  team1_flag: string
  team2_flag: string
  match_date: string
  stage: string
  group_name: string | null
  venue: string | null
}): Promise<MatchResult> {
  if (!data.team1.trim() || !data.team2.trim())
    return { ok: false, error: "Los nombres de los equipos son requeridos." }
  if (data.team1.trim().toLowerCase() === data.team2.trim().toLowerCase())
    return { ok: false, error: "El local y el visitante no pueden ser el mismo equipo." }
  if (!isValidStage(data.stage))
    return { ok: false, error: `Fase inválida: "${data.stage}". Valores válidos: ${VALID_STAGES.join(", ")}` }
  if (!isValidISODate(data.match_date))
    return { ok: false, error: "Formato de fecha inválido. Usar ISO 8601 (ej: 2026-06-15T18:00:00Z)." }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("matches").insert({
    team1:      data.team1,
    team2:      data.team2,
    team1_flag: data.team1_flag,
    team2_flag: data.team2_flag,
    match_date: data.match_date,
    stage:      data.stage,
    group_name: data.group_name,
    venue:      data.venue,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/partidos")
  revalidatePath("/")
  return { ok: true }
}

export async function deleteMatch(matchId: string): Promise<MatchResult> {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  const supabase = await createClient()

  // Verificar si el partido tiene resultado cargado
  const { data: match } = await supabase
    .from("matches")
    .select("is_finished")
    .eq("id", matchId)
    .single()

  if (match?.is_finished) {
    // Eliminar y luego recalcular todos los puntos para mantener integridad
    const { error } = await supabase.from("matches").delete().eq("id", matchId)
    if (error) return { ok: false, error: error.message }

    // Recalcular para que los puntos de ese partido desaparezcan
    const { data: remaining } = await supabase
      .from("matches")
      .select("id")
      .eq("is_finished", true) as { data: { id: string }[] | null }

    if (remaining?.length) {
      await Promise.all(
        remaining.map(m => supabase.rpc("recalculate_points", { p_match_id: m.id }))
      )
    } else {
      // No quedan partidos finalizados: resetear todos los puntos a 0
      // neq("total_points", -1) fuerza el filtro explícito requerido por PostgREST
      const { error: resetError } = await supabase
        .from("participants")
        .update({ total_points: 0, ranking_position: null })
        .neq("total_points", -1) // aplica a todos (ningún participante tiene -1)
      if (resetError) return { ok: false, error: `Error al resetear puntos: ${resetError.message}` }
    }
  } else {
    const { error } = await supabase.from("matches").delete().eq("id", matchId)
    if (error) return { ok: false, error: error.message }
  }

  revalidatePath("/admin/partidos")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/ranking")
  revalidatePath("/")
  return { ok: true }
}

export async function updateMatchDetails(
  matchId: string,
  data: {
    team1: string
    team2: string
    team1_flag: string
    team2_flag: string
    match_date: string
    group_name: string | null
  }
): Promise<MatchResult> {
  if (!data.team1.trim() || !data.team2.trim())
    return { ok: false, error: "Los nombres de los equipos no pueden estar vacíos." }
  if (data.team1.trim().toLowerCase() === data.team2.trim().toLowerCase())
    return { ok: false, error: "El local y el visitante no pueden ser el mismo equipo." }
  if (!data.match_date)
    return { ok: false, error: "La fecha del partido es requerida." }

  const supabase = await createClient()
  const { error } = await supabase
    .from("matches")
    .update({
      team1:      data.team1,
      team2:      data.team2,
      team1_flag: data.team1_flag,
      team2_flag: data.team2_flag,
      match_date: data.match_date,
      group_name: data.group_name,
    })
    .eq("id", matchId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/partidos")
  revalidatePath("/")
  return { ok: true }
}

export async function bulkCreateMatches(matches: {
  team1: string; team2: string; team1_flag: string; team2_flag: string
  match_date: string; stage: string; group_name: string | null; venue: string | null
}[]): Promise<MatchResult> {
  if (!matches.length) return { ok: false, error: "No hay partidos para importar." }

  const invalid = matches.find(m => !isValidStage(m.stage))
  if (invalid) return { ok: false, error: `Fase inválida en el CSV: "${invalid.stage}". Valores válidos: ${VALID_STAGES.join(", ")}` }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("matches").insert(matches)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/partidos")
  revalidatePath("/")
  return { ok: true }
}

export async function recalculateAllPoints(): Promise<MatchResult> {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  const supabase = await createClient()

  const { data: finishedMatches } = await supabase
    .from("matches")
    .select("id")
    .eq("is_finished", true) as { data: { id: string }[] | null }

  if (!finishedMatches?.length) return { ok: true }

  const results = await Promise.all(
    finishedMatches.map(match =>
      supabase.rpc("recalculate_points", { p_match_id: match.id })
    )
  )

  const failed = results.filter(r => r.error)
  if (failed.length > 0) {
    return { ok: false, error: `${failed.length} partido(s) no pudieron recalcularse. Intentá de nuevo.` }
  }

  revalidatePath("/admin")
  revalidatePath("/dashboard/ranking")
  revalidatePath("/")
  return { ok: true }
}
