"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ParticipantActionResult = { ok: true } | { ok: false; error: string }

export async function updateParticipantProfile(
  participantId: string,
  data: {
    first_name: string
    last_name: string
    dni: string
    phone: string
    email: string
    license_plate: string
    car_brand: string
    car_model: string
    city: string
    lead_source: string
  }
): Promise<ParticipantActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("participants")
    .update({
      first_name:    data.first_name.trim(),
      last_name:     data.last_name.trim(),
      dni:           data.dni.replace(/\D/g, ""),
      phone:         data.phone.trim(),
      email:         data.email.trim(),
      license_plate: data.license_plate.toUpperCase().replace(/\s/g, ""),
      car_brand:     data.car_brand.trim(),
      car_model:     data.car_model.trim(),
      city:          data.city.trim(),
      lead_source:   data.lead_source as "taller" | "repuestos" | "digital" | "qr" | "direct",
    })
    .eq("id", participantId)

  if (error) {
    if (error.code === "23505") {
      if (error.message.includes("dni"))           return { ok: false, error: "Ese DNI ya está registrado." }
      if (error.message.includes("email"))         return { ok: false, error: "Ese email ya está registrado." }
      if (error.message.includes("license_plate")) return { ok: false, error: "Esa patente ya está registrada." }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath("/admin/participantes")
  return { ok: true }
}

export async function toggleBlockParticipant(participantId: string, block: boolean) {
  const supabase = await createClient()
  await supabase
    .from("participants")
    .update({ is_blocked: block })
    .eq("id", participantId)
  revalidatePath("/admin/participantes")
}

export async function deleteParticipant(participantId: string) {
  const supabase = await createClient()
  // Eliminar el user_id asociado también (cascade elimina el participant)
  const { data } = await supabase
    .from("participants")
    .select("user_id")
    .eq("id", participantId)
    .single() as { data: { user_id: string } | null }

  if (data?.user_id) {
    await supabase.auth.admin.deleteUser(data.user_id)
  }
  revalidatePath("/admin/participantes")
}
