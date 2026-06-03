"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type MatchResult =
  | { ok: true }
  | { ok: false; error: string }

export async function saveMatchResult(
  matchId: string,
  score1: number,
  score2: number
): Promise<MatchResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("matches")
    .update({ score1, score2, is_finished: true, predictions_locked: true })
    .eq("id", matchId)

  if (error) return { ok: false, error: error.message }

  // Recalcular puntos automáticamente
  const { error: rpcError } = await supabase.rpc("recalculate_points", { match_id: matchId })
  if (rpcError) return { ok: false, error: `Resultado guardado pero error al recalcular: ${rpcError.message}` }

  revalidatePath("/admin/partidos")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/ranking")
  revalidatePath("/")
  return { ok: true }
}

export async function updateMatchDate(matchId: string, matchDate: string): Promise<MatchResult> {
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
  const supabase = await createClient()
  const { error } = await supabase
    .from("matches")
    .update({ team1, team2 })
    .eq("id", matchId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/partidos")
  return { ok: true }
}

export async function lockMatch(matchId: string): Promise<MatchResult> {
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
  const supabase = await createClient()
  const { error } = await supabase.from("matches").delete().eq("id", matchId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/partidos")
  revalidatePath("/dashboard")
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
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("matches").insert(matches)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/partidos")
  revalidatePath("/")
  return { ok: true }
}

export async function recalculateAllPoints(): Promise<MatchResult> {
  const supabase = await createClient()

  const { data: finishedMatches } = await supabase
    .from("matches")
    .select("id")
    .eq("is_finished", true) as { data: { id: string }[] | null }

  if (!finishedMatches?.length) return { ok: true }

  for (const match of finishedMatches) {
    await supabase.rpc("recalculate_points", { match_id: match.id })
  }

  revalidatePath("/admin")
  revalidatePath("/dashboard/ranking")
  revalidatePath("/")
  return { ok: true }
}
