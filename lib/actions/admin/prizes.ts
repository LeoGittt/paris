"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "./guard"

function adminClient() {
  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function createPrize(data: {
  title: string
  description: string
  stage: string
  prize_type: string
  image_url?: string
}) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  if (!data.title.trim())
    return { ok: false, error: "El título del premio es requerido." }
  if (!data.stage.trim())
    return { ok: false, error: "La etapa del premio es requerida." }

  const { error } = await adminClient().from("prizes").insert({
    ...data,
    title: data.title.trim(),
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/premios")
  revalidatePath("/dashboard/premios")
  revalidatePath("/")
  return { ok: true }
}

export async function assignWinner(prizeId: string, participantId: string) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  const admin = adminClient()

  const { data: participant } = await admin
    .from("participants")
    .select("id, is_blocked")
    .eq("id", participantId)
    .single()

  if (!participant) return { ok: false, error: "Participante no encontrado." }
  if (participant.is_blocked) return { ok: false, error: "No se puede asignar un premio a un participante bloqueado." }

  const { error } = await admin
    .from("prizes")
    .update({ winner_id: participantId, status: "pending" })
    .eq("id", prizeId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/premios")
  revalidatePath("/dashboard/premios")
  return { ok: true }
}

export async function markPrizeDelivered(prizeId: string) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  const admin = adminClient()

  const { data: prize } = await admin
    .from("prizes")
    .select("winner_id, status")
    .eq("id", prizeId)
    .single()

  if (!prize?.winner_id) return { ok: false, error: "No se puede marcar como entregado: el premio no tiene ganador asignado." }
  if (prize.status === "delivered") return { ok: false, error: "El premio ya fue marcado como entregado." }

  const { error } = await admin
    .from("prizes")
    .update({ status: "delivered", delivered_at: new Date().toISOString() })
    .eq("id", prizeId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/premios")
  revalidatePath("/dashboard/premios")
  return { ok: true }
}

export async function deletePrize(prizeId: string) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  const { error } = await adminClient().from("prizes").delete().eq("id", prizeId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/premios")
  revalidatePath("/")
  return { ok: true }
}
