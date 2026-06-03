"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import type { Database, LeadSource, UserRole } from "@/lib/supabase/types"

type ParticipantInsert = Database["public"]["Tables"]["participants"]["Insert"]
type UserRoleInsert    = Database["public"]["Tables"]["user_roles"]["Insert"]

export interface RegisterData {
  first_name: string
  last_name: string
  dni: string
  phone: string
  email: string
  password: string
  license_plate: string
  car_brand: string
  car_model: string
  city: string
  accepts_terms: boolean
  accepts_marketing: boolean
}

export type RegisterResult =
  | { ok: true }
  | { ok: false; error: string }

export async function registerParticipant(data: RegisterData, captchaToken?: string): Promise<RegisterResult> {
  const supabase = await createClient()

  // 1. Crear usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      captchaToken,
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
      },
    },
  })

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { ok: false, error: "Este email ya está registrado." }
    }
    return { ok: false, error: authError.message }
  }

  if (!authData.user) {
    return { ok: false, error: "Error al crear el usuario. Intentá de nuevo." }
  }

  // 2. Crear perfil del participante
  const participantRow: ParticipantInsert = {
    user_id:           authData.user.id,
    first_name:        data.first_name,
    last_name:         data.last_name,
    dni:               data.dni.replace(/\D/g, ""),
    phone:             data.phone,
    email:             data.email,
    license_plate:     data.license_plate.toUpperCase().replace(/\s/g, ""),
    car_brand:         data.car_brand,
    car_model:         data.car_model,
    city:              data.city,
    accepts_terms:     data.accepts_terms,
    accepts_marketing: data.accepts_marketing,
    lead_source:       "direct" as LeadSource,
  }
  const { error: profileError } = await supabase
    .from("participants")
    .insert(participantRow)

  if (profileError) {
    // El usuario de auth ya fue creado — eliminarlo para evitar cuentas huérfanas
    const adminClient = createAdminClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await adminClient.auth.admin.deleteUser(authData.user.id)

    if (profileError.code === "23505") {
      if (profileError.message.includes("dni")) {
        return { ok: false, error: "Este DNI ya está registrado." }
      }
      if (profileError.message.includes("email")) {
        return { ok: false, error: "Este email ya está registrado." }
      }
      if (profileError.message.includes("license_plate")) {
        return { ok: false, error: "Esta patente ya está registrada." }
      }
    }
    return { ok: false, error: "Error al guardar tus datos. Intentá de nuevo." }
  }

  // 3. Asignar rol participant
  const roleRow: UserRoleInsert = { user_id: authData.user.id, role: "participant" as UserRole }
  await supabase.from("user_roles").insert(roleRow)

  return { ok: true }
}
