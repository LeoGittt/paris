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
  const supabase = await createClient()

  // Verificar que el partido no esté bloqueado
  const { data: match } = await supabase
    .from("matches")
    .select("predictions_locked, is_finished")
    .eq("id", matchId)
    .single() as { data: { predictions_locked: boolean; is_finished: boolean } | null }

  if (!match) return { ok: false, error: "Partido no encontrado." }
  if (match.predictions_locked) return { ok: false, error: "El partido ya comenzó. No podés modificar tu pronóstico." }
  if (match.is_finished) return { ok: false, error: "El partido ya finalizó." }

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
