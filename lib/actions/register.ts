"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import type { Database, LeadSource, UserRole } from "@/lib/supabase/types"
import { checkRateLimit } from "@/lib/rate-limit"

type ParticipantInsert = Database["public"]["Tables"]["participants"]["Insert"]
type UserRoleInsert    = Database["public"]["Tables"]["user_roles"]["Insert"]

const admin = createAdminClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
  lead_source?: string
}

export type RegisterResult =
  | { ok: true }
  | { ok: false; error: string }

export async function registerParticipant(data: RegisterData, captchaToken?: string): Promise<RegisterResult> {

  // Validaciones síncronas primero
  if (!data.accepts_terms)
    return { ok: false, error: "Debés aceptar los términos y condiciones." }
  if (data.dni.replace(/\D/g, "").length < 7)
    return { ok: false, error: "DNI inválido." }
  if (data.email && !data.email.includes("@"))
    return { ok: false, error: "Email inválido." }
  if (data.password.length < 8)
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." }
  if (data.license_plate.replace(/\s/g, "").length < 6)
    return { ok: false, error: "Patente inválida." }

  // Rate limit antes del signUp
  const { allowed, retryAfter } = await checkRateLimit("register", {
    maxRequests:   3,
    windowMinutes: 60,
  })
  if (!allowed)
    return { ok: false, error: `Demasiados intentos de registro. Intentá de nuevo en ${retryAfter} minutos.` }

  // Crear usuario en Supabase Auth
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email:    data.email,
    password: data.password,
    options:  {
      captchaToken,
      data: { first_name: data.first_name, last_name: data.last_name },
    },
  })

  if (authError) {
    if (authError.message.includes("already registered"))
      return { ok: false, error: "Este email ya está registrado." }
    return { ok: false, error: authError.message }
  }

  if (!authData?.user)
    return { ok: false, error: "Error al crear el usuario. Intentá de nuevo." }

  // Insert solo con columnas que SIEMPRE existen en el schema base
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
    lead_source:       (["taller","repuestos","digital","qr"].includes(data.lead_source ?? "")
                         ? data.lead_source : "direct") as LeadSource,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (admin as any).from("participants").insert(participantRow)

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id)
    if (profileError.code === "23505") {
      if (profileError.message.includes("dni"))           return { ok: false, error: "Este DNI ya está registrado." }
      if (profileError.message.includes("email"))         return { ok: false, error: "Este email ya está registrado." }
      if (profileError.message.includes("license_plate")) return { ok: false, error: "Esta patente ya está registrada." }
    }
    return { ok: false, error: "Error al guardar tus datos. Intentá de nuevo." }
  }

  // Asignar rol participant
  const roleRow: UserRoleInsert = { user_id: authData.user.id, role: "participant" as UserRole }
  const { error: roleError } = await admin.from("user_roles").insert(roleRow)

  if (roleError) {
    await Promise.all([
      admin.from("participants").delete().eq("user_id", authData.user.id),
      admin.auth.admin.deleteUser(authData.user.id),
    ])
    return { ok: false, error: "Error al completar el registro. Intentá de nuevo." }
  }

  // Marcar como empleado si corresponde — no bloquea el registro si la columna no existe todavía
  const isEmployee = /^empleadoparis@\d{7,8}\.com$/i.test(data.email)
  if (isEmployee) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from("participants")
      .update({ is_employee: true })
      .eq("user_id", authData.user.id)
      .then(() => {}) // silently ignore if column doesn't exist
  }

  return { ok: true }
}
