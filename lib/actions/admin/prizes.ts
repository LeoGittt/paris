"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createPrize(data: {
  title: string
  description: string
  stage: string
  prize_type: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from("prizes").insert(data)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/premios")
  revalidatePath("/dashboard/premios")
  return { ok: true }
}

export async function assignWinner(prizeId: string, participantId: string) {
  const supabase = await createClient()
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
  await supabase.from("prizes").delete().eq("id", prizeId)
  revalidatePath("/admin/premios")
  return { ok: true }
}
