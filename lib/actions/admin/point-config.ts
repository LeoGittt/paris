"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "./guard"

export type PointConfigResult = { ok: true } | { ok: false; error: string }

export async function updatePointConfig(
  configId: string,
  values: { correct_winner: number; correct_exact: number; correct_diff: number }
): Promise<PointConfigResult> {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  // Validar que los valores sean enteros no negativos
  const { correct_winner, correct_exact, correct_diff } = values
  if (!Number.isInteger(correct_winner) || !Number.isInteger(correct_exact) || !Number.isInteger(correct_diff))
    return { ok: false, error: "Los valores deben ser números enteros." }
  if (correct_winner < 0 || correct_exact < 0 || correct_diff < 0)
    return { ok: false, error: "Los valores no pueden ser negativos." }
  if (correct_exact < correct_winner)
    return { ok: false, error: "El puntaje por exacto debe ser mayor o igual al de ganador." }
  if (correct_winner > 99 || correct_exact > 99 || correct_diff > 99)
    return { ok: false, error: "Valores fuera de rango (máx 99)." }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("point_config")
    .update({
      correct_winner,
      correct_exact,
      correct_diff,
      updated_by: user?.id ?? null,
    })
    .eq("id", configId)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/admin/configuracion")
  return { ok: true }
}
