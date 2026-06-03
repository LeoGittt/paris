import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createClient } from "@supabase/supabase-js"
import { createAdminClient } from "../helpers/supabase"
import type { Database } from "@/lib/supabase/types"

const admin = createAdminClient()
const TP    = "__login_test__"

const TEST_EMAIL    = `${TP}user@test.com`
const TEST_PASSWORD = "ValidPass123!"
let testUserId: string

function anonClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

beforeAll(async () => {
  // Crear usuario de prueba para los tests de login
  const { data } = await admin.auth.admin.createUser({
    email:         TEST_EMAIL,
    password:      TEST_PASSWORD,
    email_confirm: true,
  })
  testUserId = data.user?.id ?? ""
})

afterAll(async () => {
  if (testUserId) await admin.auth.admin.deleteUser(testUserId)
})

// -----------------------------------------------------------------
describe("Login: credenciales correctas", () => {
  it("retorna sesión con access_token", async () => {
    const client = anonClient()
    const { data, error } = await client.auth.signInWithPassword({
      email:    TEST_EMAIL,
      password: TEST_PASSWORD,
    })
    expect(error).toBeNull()
    expect(data.session?.access_token).toBeTruthy()
    expect(data.user?.email).toBe(TEST_EMAIL)
  })

  it("el token tiene user_id correcto", async () => {
    const client = anonClient()
    const { data } = await client.auth.signInWithPassword({
      email:    TEST_EMAIL,
      password: TEST_PASSWORD,
    })
    expect(data.user?.id).toBe(testUserId)
  })

  it("después del login el usuario puede cerrar sesión", async () => {
    const client = anonClient()
    await client.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD })
    const { error } = await client.auth.signOut()
    expect(error).toBeNull()

    const { data: session } = await client.auth.getSession()
    expect(session.session).toBeNull()
  })
})

// -----------------------------------------------------------------
describe("Login: credenciales incorrectas", () => {
  it("contraseña incorrecta retorna error", async () => {
    const client = anonClient()
    const { data, error } = await client.auth.signInWithPassword({
      email:    TEST_EMAIL,
      password: "WrongPassword999!",
    })
    expect(error).not.toBeNull()
    expect(data.session).toBeNull()
  })

  it("email inexistente retorna error", async () => {
    const client = anonClient()
    const { data, error } = await client.auth.signInWithPassword({
      email:    "nobody@noemail.invalid",
      password: TEST_PASSWORD,
    })
    expect(error).not.toBeNull()
    expect(data.session).toBeNull()
  })

  it("email vacío retorna error", async () => {
    const client = anonClient()
    const { data, error } = await client.auth.signInWithPassword({
      email:    "",
      password: TEST_PASSWORD,
    })
    expect(error).not.toBeNull()
    expect(data.session).toBeNull()
  })

  it("password vacío retorna error", async () => {
    const client = anonClient()
    const { data, error } = await client.auth.signInWithPassword({
      email:    TEST_EMAIL,
      password: "",
    })
    expect(error).not.toBeNull()
    expect(data.session).toBeNull()
  })

  it("no confunde email con mayúsculas/minúsculas (case-insensitive)", async () => {
    const client = anonClient()
    const { data, error } = await client.auth.signInWithPassword({
      email:    TEST_EMAIL.toUpperCase(),
      password: TEST_PASSWORD,
    })
    // Supabase normaliza emails a minúsculas — debería funcionar igual
    expect(error).toBeNull()
    expect(data.session).not.toBeNull()
  })
})

// -----------------------------------------------------------------
describe("Login: recuperar sesión", () => {
  it("sin login previo la sesión es null", async () => {
    const client = anonClient()
    const { data } = await client.auth.getSession()
    expect(data.session).toBeNull()
  })

  it("con login activo getSession devuelve la sesión", async () => {
    const client = anonClient()
    await client.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD })
    const { data } = await client.auth.getSession()
    expect(data.session?.access_token).toBeTruthy()
  })
})

// -----------------------------------------------------------------
describe("Login: usuario bloqueado", () => {
  it("usuario bloqueado puede hacer login (el bloqueo se verifica en la app, no en Auth)", async () => {
    // Marcar como bloqueado en participants
    await admin.from("participants")
      .update({ is_blocked: true })
      .eq("user_id", testUserId)

    const client = anonClient()
    const { data, error } = await client.auth.signInWithPassword({
      email:    TEST_EMAIL,
      password: TEST_PASSWORD,
    })

    // Auth no sabe del is_blocked — la app debe chequearlo después del login
    expect(error).toBeNull()
    expect(data.session).not.toBeNull()

    // Restaurar
    await admin.from("participants")
      .update({ is_blocked: false })
      .eq("user_id", testUserId)
  })
})
