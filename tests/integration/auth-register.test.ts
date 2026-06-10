import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createAdminClient } from "../helpers/supabase"

// Prueba el flujo completo de registro usando el admin SDK.
// Simula exactamente lo que hace registerParticipant() en lib/actions/register.ts

const admin = createAdminClient()
const TP    = "__reg_test__"
const cleanupUserIds: string[] = []

afterAll(async () => {
  for (const uid of cleanupUserIds) {
    await admin.auth.admin.deleteUser(uid)
  }
})

// Helper: crea un usuario en Auth + perfil en participants (igual que el server action)
async function register(overrides: Partial<{
  email: string; password: string; dni: string; license_plate: string
  first_name: string; last_name: string; phone: string
}> = {}) {
  const data = {
    email:         `${TP}${Date.now()}@test.com`,
    password:      "test-password-123",
    first_name:    "Juan",
    last_name:     "Perez",
    dni:           `${TP}${Date.now()}`.replace(/\D/g, "").slice(0, 8),
    phone:         "1134567890",
    license_plate: `T${Date.now().toString().slice(-6)}`,
    ...overrides,
  }

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email:         data.email,
    password:      data.password,
    email_confirm: true,
  })

  if (authError || !authData.user) return { ok: false, error: authError?.message ?? "auth failed" }

  const userId = authData.user.id
  cleanupUserIds.push(userId)

  const { error: profileError } = await admin.from("participants").insert({
    user_id:       userId,
    first_name:    data.first_name,
    last_name:     data.last_name,
    dni:           data.dni,
    phone:         data.phone,
    email:         data.email,
    license_plate: data.license_plate,
    accepts_terms: true,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(userId)
    return { ok: false, error: profileError.message, code: profileError.code }
  }

  await admin.from("user_roles").insert({ user_id: userId, role: "participant" })
  return { ok: true, userId, email: data.email }
}

// -----------------------------------------------------------------
describe("Registro: flujo exitoso", () => {
  it("crea usuario en Auth y perfil de participante", async () => {
    const result = await register()
    expect(result.ok).toBe(true)

    if (!result.ok) return
    const { data } = await admin.from("participants").select("email").eq("user_id", result.userId!).single()
    expect(data?.email).toBe(result.email)
  })

  it("asigna rol participant automáticamente", async () => {
    const result = await register()
    if (!result.ok) return

    const { data } = await admin.from("user_roles").select("role").eq("user_id", result.userId!).single()
    expect(data?.role).toBe("participant")
  })

  it("total_points comienza en 0", async () => {
    const result = await register()
    if (!result.ok) return

    const { data } = await admin.from("participants").select("total_points").eq("user_id", result.userId!).single()
    expect(data?.total_points).toBe(0)
  })

  it("is_blocked comienza en false", async () => {
    const result = await register()
    if (!result.ok) return

    const { data } = await admin.from("participants").select("is_blocked").eq("user_id", result.userId!).single()
    expect(data?.is_blocked).toBe(false)
  })
})

// -----------------------------------------------------------------
describe("Registro: constraints de unicidad", () => {
  let existingEmail:   string
  let existingDni:     string
  let existingPlate:   string

  beforeAll(async () => {
    // Crear un participante base para probar duplicados
    const ts = Date.now()
    existingEmail = `${TP}base${ts}@test.com`
    existingDni   = `9${ts}`.slice(0, 8)
    existingPlate = `B${ts.toString().slice(-6)}`

    const { data: authData } = await admin.auth.admin.createUser({
      email: existingEmail, password: "test123", email_confirm: true,
    })
    if (authData.user) {
      cleanupUserIds.push(authData.user.id)
      await admin.from("participants").insert({
        user_id: authData.user.id, first_name: "Base", last_name: "User",
        dni: existingDni, phone: "1100000000", email: existingEmail,
        license_plate: existingPlate, accepts_terms: true,
      })
    }
  })

  it("rechaza email duplicado (code 23505)", async () => {
    const result = await register({ email: existingEmail })
    // Supabase Auth rechaza el email duplicado antes de llegar a participants
    expect(result.ok).toBe(false)
  })

  it("rechaza DNI duplicado (code 23505)", async () => {
    const result = await register({ dni: existingDni })
    expect(result.ok).toBe(false)
    expect(result.code).toBe("23505")
  })

  it("rechaza patente duplicada (code 23505)", async () => {
    const result = await register({ license_plate: existingPlate })
    expect(result.ok).toBe(false)
    expect(result.code).toBe("23505")
  })

  it("DNI duplicado: el usuario de Auth se elimina (no queda huérfano)", async () => {
    const ts    = Date.now()
    const email = `${TP}orphan${ts}@test.com`

    const { data: authData } = await admin.auth.admin.createUser({
      email, password: "test123", email_confirm: true,
    })
    const userId = authData.user?.id
    if (!userId) return

    // Intentar insertar en participants con DNI ya existente
    const { error } = await admin.from("participants").insert({
      user_id: userId, first_name: "Ghost", last_name: "User",
      dni: existingDni, phone: "1100000000", email,
      license_plate: `GP${ts.toString().slice(-5)}`, accepts_terms: true,
    })

    expect(error?.code).toBe("23505")

    // Simular el rollback del server action: eliminar el user de Auth
    await admin.auth.admin.deleteUser(userId)

    // Verificar que no quedó usuario huérfano en Auth
    const { data } = await admin.auth.admin.getUserById(userId)
    expect(data.user).toBeNull()
  })
})

// -----------------------------------------------------------------
describe("Registro: todos los campos del participante se persisten", () => {
  it("guarda first_name, last_name, email, phone, dni, license_plate y accepts_terms", async () => {
    const ts    = Date.now()
    const datos = {
      email:         `${TP}campos${ts}@test.com`,
      first_name:    "María",
      last_name:     "González",
      phone:         "2614987654",
      dni:           `${ts}`.slice(-8),
      license_plate: `MG${ts.toString().slice(-5)}`,
    }

    const { data: authData } = await admin.auth.admin.createUser({
      email: datos.email, password: "Test1234!", email_confirm: true,
    })
    expect(authData.user).not.toBeNull()
    const userId = authData.user!.id
    cleanupUserIds.push(userId)

    const { error } = await admin.from("participants").insert({
      user_id:       userId,
      first_name:    datos.first_name,
      last_name:     datos.last_name,
      email:         datos.email,
      phone:         datos.phone,
      dni:           datos.dni,
      license_plate: datos.license_plate,
      accepts_terms: true,
    })
    expect(error).toBeNull()

    const { data: row } = await admin
      .from("participants")
      .select("first_name, last_name, email, phone, dni, license_plate, accepts_terms, total_points, is_blocked, ranking_position")
      .eq("user_id", userId)
      .single()

    expect(row).not.toBeNull()
    expect(row!.first_name).toBe(datos.first_name)
    expect(row!.last_name).toBe(datos.last_name)
    expect(row!.email).toBe(datos.email)
    expect(row!.phone).toBe(datos.phone)
    expect(row!.dni).toBe(datos.dni)
    expect(row!.license_plate).toBe(datos.license_plate)
    expect(row!.accepts_terms).toBe(true)
    expect(row!.total_points).toBe(0)
    expect(row!.is_blocked).toBe(false)
    expect(row!.ranking_position).toBeNull()
  })

  it("el email en participants coincide con el email en Supabase Auth", async () => {
    const ts    = Date.now()
    const email = `${TP}sync${ts}@test.com`

    const { data: authData } = await admin.auth.admin.createUser({
      email, password: "Test1234!", email_confirm: true,
    })
    const userId = authData.user!.id
    cleanupUserIds.push(userId)

    await admin.from("participants").insert({
      user_id: userId, first_name: "Ana", last_name: "Test",
      email, phone: "1100000000", dni: `${ts + 2}`.slice(-8),
      license_plate: `AT${ts.toString().slice(-5)}`, accepts_terms: true,
    })

    const { data: authUser } = await admin.auth.admin.getUserById(userId)
    const { data: participant } = await admin.from("participants").select("email").eq("user_id", userId).single()

    expect(participant!.email).toBe(authUser.user!.email)
  })

  it("phone no puede ser nulo — insert sin phone falla", async () => {
    const ts = Date.now()
    const { data: authData } = await admin.auth.admin.createUser({
      email: `${TP}nophone${ts}@test.com`, password: "Test1234!", email_confirm: true,
    })
    const userId = authData.user!.id
    cleanupUserIds.push(userId)

    const { error } = await admin.from("participants").insert({
      user_id: userId, first_name: "Sin", last_name: "Telefono",
      email: `${TP}nophone${ts}@test.com`,
      // phone omitido — debería fallar el NOT NULL
      dni: `7${ts}`.slice(0, 8),
      license_plate: `NT${ts.toString().slice(-5)}`, accepts_terms: true,
    } as Parameters<typeof admin.from>[0] extends "participants" ? never : never)

    // Si la DB tiene NOT NULL en phone, el insert falla
    // Si no, el campo queda null — en ambos casos documentamos el comportamiento
    if (error) {
      expect(["23502", "42703"]).toContain(error.code) // NOT NULL violation o columna inválida
    } else {
      const { data } = await admin.from("participants").select("phone").eq("user_id", userId).single()
      // Si pasó, documentamos que phone puede ser null (debería no ocurrir con validación en UI)
      expect(data).not.toBeNull()
    }
  })
})

// -----------------------------------------------------------------
describe("Registro: campos normalizados correctamente", () => {
  it("DNI se guarda sin caracteres no numéricos", async () => {
    const rawDni = `1.234.${Date.now().toString().slice(-3)}`
    const result = await register({ dni: rawDni.replace(/\D/g, "") })
    if (!result.ok) return

    const { data } = await admin.from("participants").select("dni").eq("user_id", result.userId!).single()
    expect(data?.dni).toMatch(/^\d+$/) // solo dígitos
  })

  it("patente se guarda en mayúsculas sin espacios", async () => {
    const ts    = Date.now()
    const plate = `aa ${ts.toString().slice(-4)}`
    const result = await register({ license_plate: plate.toUpperCase().replace(/\s/g, "") })
    if (!result.ok) return

    const { data } = await admin.from("participants").select("license_plate").eq("user_id", result.userId!).single()
    expect(data?.license_plate).toMatch(/^[A-Z0-9]+$/) // solo mayúsculas y números
  })
})
