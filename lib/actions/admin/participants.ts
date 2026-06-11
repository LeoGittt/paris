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

export type ParticipantPrediction = {
  id: string
  match_id: string
  team1: string
  team2: string
  team1_flag: string
  team2_flag: string
  match_date: string
  stage: string
  predicted_score1: number
  predicted_score2: number
  real_score1: number | null
  real_score2: number | null
  is_finished: boolean
  points_earned: number
  result: "pending" | "correct_winner" | "correct_exact" | "correct_diff" | "wrong"
  submitted_at: string
}

export async function getParticipantPredictions(
  participantId: string
): Promise<{ ok: true; predictions: ParticipantPrediction[] } | { ok: false; error: string }> {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("predictions")
    .select(`
      id,
      predicted_score1,
      predicted_score2,
      points_earned,
      result,
      submitted_at,
      matches (
        id, team1, team2, team1_flag, team2_flag,
        match_date, stage, score1, score2, is_finished
      )
    `)
    .eq("participant_id", participantId)

  if (error) return { ok: false, error: error.message }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const predictions: ParticipantPrediction[] = (data ?? []).map((row: any) => {
    const m = Array.isArray(row.matches) ? row.matches[0] : row.matches
    return {
      id:               row.id,
      match_id:         m?.id ?? "",
      team1:            m?.team1 ?? "",
      team2:            m?.team2 ?? "",
      team1_flag:       m?.team1_flag ?? "",
      team2_flag:       m?.team2_flag ?? "",
      match_date:       m?.match_date ?? "",
      stage:            m?.stage ?? "",
      predicted_score1: row.predicted_score1,
      predicted_score2: row.predicted_score2,
      real_score1:      m?.score1 ?? null,
      real_score2:      m?.score2 ?? null,
      is_finished:      m?.is_finished ?? false,
      points_earned:    row.points_earned,
      result:           row.result,
      submitted_at:     row.submitted_at,
    }
  })

  predictions.sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())

  return { ok: true, predictions }
}
