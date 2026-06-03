"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type SavePredictionResult =
  | { ok: true; points?: number }
  | { ok: false; error: string }

export async function savePrediction(
  participantId: string,
  matchId: string,
  score1: number,
  score2: number
): Promise<SavePredictionResult> {
  if (!Number.isInteger(score1) || !Number.isInteger(score2)) return { ok: false, error: "Marcador inválido." }
  if (score1 < 0 || score2 < 0)   return { ok: false, error: "El marcador no puede ser negativo." }
  if (score1 > 30 || score2 > 30) return { ok: false, error: "Marcador fuera de rango razonable." }

  const supabase = await createClient()

  // Verificar que el partido no esté bloqueado
  const { data: match } = await supabase
    .from("matches")
    .select("predictions_locked, is_finished, match_date")
    .eq("id", matchId)
    .single() as { data: { predictions_locked: boolean; is_finished: boolean; match_date: string } | null }

  if (!match) return { ok: false, error: "Partido no encontrado." }
  if (match.is_finished) return { ok: false, error: "El partido ya finalizó." }
  if (match.predictions_locked) return { ok: false, error: "El partido ya comenzó. No podés modificar tu pronóstico." }
  // Defensa independiente del cron: bloquear si la fecha del partido ya pasó
  if (new Date(match.match_date) <= new Date()) return { ok: false, error: "El partido ya comenzó. No podés modificar tu pronóstico." }

  const { error } = await supabase
    .from("predictions")
    .upsert(
      {
        participant_id:   participantId,
        match_id:         matchId,
        predicted_score1: score1,
        predicted_score2: score2,
      },
      { onConflict: "participant_id,match_id" }
    )

  if (error) return { ok: false, error: "Error al guardar. Intentá de nuevo." }

  revalidatePath("/dashboard/pronosticos")
  revalidatePath("/dashboard")
  return { ok: true }
}
