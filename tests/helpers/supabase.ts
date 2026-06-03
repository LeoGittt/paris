import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

function getEnv() {
  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !serviceKey)
    throw new Error("Faltan variables de entorno SUPABASE en .env.local")
  return { url, anonKey, serviceKey }
}

// Cliente con service_role — bypasea RLS, para setup/teardown en tests
export function createAdminClient() {
  const { url, serviceKey } = getEnv()
  return createClient<Database>(url, serviceKey)
}

// Cliente con anon key — sujeto a RLS, simula usuario no autenticado
export function createAnonClient() {
  const { url, anonKey } = getEnv()
  return createClient<Database>(url, anonKey)
}

// Cliente autenticado como un usuario real — sujeto a RLS con auth.uid() activo
// Requiere que el usuario ya exista en Supabase Auth
export async function createAuthenticatedClient(email: string, password: string) {
  const { url, anonKey } = getEnv()
  const temp = createClient<Database>(url, anonKey)
  const { data, error } = await temp.auth.signInWithPassword({ email, password })
  if (error || !data.session) throw new Error(`Login fallido para ${email}: ${error?.message}`)
  return createClient<Database>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
  })
}

// Crea un usuario de prueba completo (auth + participant + role) y devuelve su ID
export async function createTestParticipant(opts: {
  email:         string
  password:      string
  dni:           string
  license_plate: string
  first_name?:   string
  last_name?:    string
}) {
  const admin = createAdminClient()
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email:         opts.email,
    password:      opts.password,
    email_confirm: true,
  })
  if (authErr || !authData.user) throw new Error(`No se pudo crear usuario: ${authErr?.message}`)

  const userId = authData.user.id

  const { data: part, error: partErr } = await admin.from("participants").insert({
    user_id:       userId,
    first_name:    opts.first_name ?? "Test",
    last_name:     opts.last_name  ?? "User",
    dni:           opts.dni,
    phone:         "1100000000",
    email:         opts.email,
    license_plate: opts.license_plate,
    accepts_terms: true,
    total_points:  0,
  }).select("id").single()

  if (partErr || !part) throw new Error(`No se pudo crear participant: ${partErr?.message}`)

  await admin.from("user_roles").insert({ user_id: userId, role: "participant" })

  return { userId, participantId: part.id }
}

// Elimina un usuario de prueba completo (cascadea participant y user_roles)
export async function deleteTestUser(userId: string) {
  const admin = createAdminClient()
  await admin.auth.admin.deleteUser(userId) // cascade elimina participant y user_roles
}
