"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/supabase/types"
import { requireAdmin } from "./guard"

export type ParticipantActionResult = { ok: true } | { ok: false; error: string }

function getAdminClient() {
  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

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
    car_year: string
    city: string
    lead_source: string
  }
): Promise<ParticipantActionResult> {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  const supabase = await createClient()
  const admin    = getAdminClient()

  const newEmail = data.email.trim()

  // Obtener user_id y email actual para saber si cambió
  const { data: current } = await supabase
    .from("participants")
    .select("user_id, email")
    .eq("id", participantId)
    .single() as { data: { user_id: string; email: string } | null }

  // Actualizar perfil en la tabla participants
  const { error } = await supabase
    .from("participants")
    .update({
      first_name:    data.first_name.trim(),
      last_name:     data.last_name.trim(),
      dni:           data.dni.replace(/\D/g, ""),
      phone:         data.phone.trim(),
      email:         newEmail,
      license_plate: data.license_plate.toUpperCase().replace(/\s/g, ""),
      car_brand:     data.car_brand.trim(),
      car_model:     data.car_model.trim(),
      car_year:      data.car_year ? Number(data.car_year) : null,
      city:          data.city.trim(),
      lead_source:   (["taller","repuestos","digital","qr","direct"].includes(data.lead_source)
                      ? data.lead_source
                      : "direct") as "taller" | "repuestos" | "digital" | "qr" | "direct",
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

  // Si el email cambió, sincronizar en Supabase Auth para que el login siga funcionando
  if (current?.user_id && current.email !== newEmail) {
    const { error: authError } = await admin.auth.admin.updateUserById(current.user_id, {
      email: newEmail,
    })
    if (authError) {
      // Rollback: restaurar el email original en participants para mantener consistencia
      await supabase
        .from("participants")
        .update({ email: current.email })
        .eq("id", participantId)
      return { ok: false, error: `No se pudo actualizar el email: ${authError.message}` }
    }
  }

  revalidatePath("/admin/participantes")
  return { ok: true }
}

export async function toggleBlockParticipant(participantId: string, block: boolean): Promise<ParticipantActionResult> {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  const supabase = await createClient()
  const { error } = await supabase
    .from("participants")
    .update({ is_blocked: block })
    .eq("id", participantId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/participantes")
  return { ok: true }
}

export async function deleteParticipant(participantId: string): Promise<ParticipantActionResult> {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  const supabase = await createClient()
  const admin    = getAdminClient()

  // Obtener user_id con el cliente SSR (sujeto a RLS — el admin puede leer esto)
  const { data, error: fetchError } = await supabase
    .from("participants")
    .select("user_id")
    .eq("id", participantId)
    .single() as { data: { user_id: string } | null; error: unknown }

  if (fetchError || !data?.user_id) return { ok: false, error: "Participante no encontrado." }

  // Eliminar en Auth con service_role — esto hace cascade sobre participants y user_roles
  const { error: authError } = await admin.auth.admin.deleteUser(data.user_id)
  if (authError) return { ok: false, error: authError.message }

  revalidatePath("/admin/participantes")
  return { ok: true }
}
