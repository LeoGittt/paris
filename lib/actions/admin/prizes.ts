"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createPrize(data: {
  title: string
  description: string
  stage: string
  prize_type: string
}) {
  if (!data.title.trim())
    return { ok: false, error: "El título del premio es requerido." }
  if (!data.stage.trim())
    return { ok: false, error: "La etapa del premio es requerida." }

  const supabase = await createClient()
  const { error } = await supabase.from("prizes").insert({
    ...data,
    title: data.title.trim(),
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/premios")
  revalidatePath("/dashboard/premios")
  return { ok: true }
}

export async function assignWinner(prizeId: string, participantId: string) {
  const supabase = await createClient()

  // Verificar que el participante existe y no está bloqueado
  const { data: participant } = await supabase
    .from("participants")
    .select("id, is_blocked")
    .eq("id", participantId)
    .single()

  if (!participant) return { ok: false, error: "Participante no encontrado." }
  if (participant.is_blocked) return { ok: false, error: "No se puede asignar un premio a un participante bloqueado." }

  const { error } = await supabase
    .from("prizes")
    .update({ winner_id: participantId, status: "pending" })
    .eq("id", prizeId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/premios")
  revalidatePath("/dashboard/premios")
  return { ok: true }
}

export async function markPrizeDelivered(prizeId: string) {
  const supabase = await createClient()

  // Verificar que el premio tiene ganador asignado antes de marcar como entregado
  const { data: prize } = await supabase
    .from("prizes")
    .select("winner_id, status")
    .eq("id", prizeId)
    .single()

  if (!prize?.winner_id) return { ok: false, error: "No se puede marcar como entregado: el premio no tiene ganador asignado." }
  if (prize.status === "delivered") return { ok: false, error: "El premio ya fue marcado como entregado." }

  const { error } = await supabase
    .from("prizes")
    .update({ status: "delivered", delivered_at: new Date().toISOString() })
    .eq("id", prizeId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/premios")
  revalidatePath("/dashboard/premios")
  return { ok: true }
}

export async function deletePrize(prizeId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("prizes").delete().eq("id", prizeId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/premios")
  return { ok: true }
}
