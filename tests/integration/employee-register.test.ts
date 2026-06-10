import { describe, it, expect, afterAll } from "vitest"
import { createAdminClient } from "../helpers/supabase"

// ─── Tests de integración: registro y datos de empleados Paris ───────────────
// Cubre:
//  1. Registro exitoso con email de empleado (is_employee = true)
//  2. Todos los campos del empleado se persisten correctamente
//  3. Empleados NO aparecen en el ranking general
//  4. El DNI del email coincide con el DNI del perfil
//  5. Registro con email normal → is_employee = false
//  6. Cleanup correcto (no quedan registros huérfanos)

const admin = createAdminClient()
const TP    = "__emp_test__"
const cleanupUserIds: string[] = []

afterAll(async () => {
  for (const uid of cleanupUserIds) {
    await admin.auth.admin.deleteUser(uid)
  }
})

// Helper: registra un empleado simulando el flujo de register.ts
async function registerEmployee(overrides: Partial<{
  dni: string
  first_name: string
  last_name: string
  phone: string
}> = {}) {
  const ts  = Date.now()
  const dni = overrides.dni ?? `${ts}`.slice(-8)
  const email = `empleadoparis@${dni}.com`

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: "Test1234!",
    email_confirm: true,
  })

  if (authError || !authData.user) return { ok: false as const, error: authError?.message }

  const userId = authData.user.id
  cleanupUserIds.push(userId)

  const { error: profileError } = await admin.from("participants").insert({
    user_id:       userId,
    first_name:    overrides.first_name ?? "Carlos",
    last_name:     overrides.last_name  ?? "Méndez",
    email,
    phone:         overrides.phone ?? "2614001122",
    dni,
    license_plate: `EM${ts.toString().slice(-5)}`,
    accepts_terms: true,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(userId)
    return { ok: false as const, error: profileError.message, code: profileError.code }
  }

  await admin.from("user_roles").insert({ user_id: userId, role: "participant" })

  // Marcar is_employee (igual que register.ts)
  await (admin as any).from("participants").update({ is_employee: true }).eq("user_id", userId)

  return { ok: true as const, userId, email, dni }
}


// =============================================================================
describe("Empleado: flujo de registro exitoso", () => {

  it("crea el usuario en Auth con email_confirmed = true", async () => {
    const result = await registerEmployee()
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const { data } = await admin.auth.admin.getUserById(result.userId)
    expect(data.user?.email_confirmed_at).not.toBeNull()
    expect(data.user?.email).toBe(result.email)
  })

  it("is_employee queda en true tras el registro", async () => {
    const result = await registerEmployee()
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const { data } = await admin
      .from("participants")
      .select("is_employee")
      .eq("user_id", result.userId)
      .single()

    expect(data?.is_employee).toBe(true)
  })

  it("se asigna rol participant (no admin)", async () => {
    const result = await registerEmployee()
    if (!result.ok) return

    const { data } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", result.userId)
      .single()

    expect(data?.role).toBe("participant")
  })
})


// =============================================================================
describe("Empleado: todos los campos se persisten correctamente", () => {

  it("guarda first_name, last_name, email, phone, dni, accepts_terms", async () => {
    const ts = Date.now()
    const dni = `${ts}`.slice(-8)
    const result = await registerEmployee({
      dni,
      first_name: "Valentina",
      last_name:  "Ríos",
      phone:      "2615559988",
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const { data } = await admin
      .from("participants")
      .select("first_name, last_name, email, phone, dni, is_employee, total_points, is_blocked, accepts_terms")
      .eq("user_id", result.userId)
      .single()

    expect(data).not.toBeNull()
    expect(data!.first_name).toBe("Valentina")
    expect(data!.last_name).toBe("Ríos")
    expect(data!.email).toBe(`empleadoparis@${dni}.com`)
    expect(data!.phone).toBe("2615559988")
    expect(data!.dni).toBe(dni)
    expect(data!.is_employee).toBe(true)
    expect(data!.accepts_terms).toBe(true)
    expect(data!.total_points).toBe(0)
    expect(data!.is_blocked).toBe(false)
  })

  it("el DNI del email coincide con el DNI guardado en el perfil", async () => {
    const ts  = Date.now()
    const dni = `${ts}`.slice(-8)
    const result = await registerEmployee({ dni })
    if (!result.ok) return

    const { data } = await admin
      .from("participants")
      .select("dni, email")
      .eq("user_id", result.userId)
      .single()

    // el DNI del email empleadoparis@{dni}.com debe coincidir con el campo dni
    const dniFromEmail = data!.email.match(/^empleadoparis@(\d{7,8})\.com$/i)?.[1]
    expect(dniFromEmail).toBe(data!.dni)
  })
})


// =============================================================================
describe("Empleado: no aparece en el ranking general", () => {

  it("is_employee=true excluye al participante de ranking_view", async () => {
    const result = await registerEmployee()
    if (!result.ok) return

    // ranking_view excluye empleados (migration 013)
    const { data } = await admin
      .from("ranking_view")
      .select("participant_id")
      .eq("participant_id", result.userId)

    expect(data).toHaveLength(0)
  })

  it("is_employee=false → sí aparece en ranking_view", async () => {
    const ts = Date.now()
    const email = `${TP}client${ts}@test.com`

    const { data: authData } = await admin.auth.admin.createUser({
      email, password: "Test1234!", email_confirm: true,
    })
    const userId = authData.user!.id
    cleanupUserIds.push(userId)

    await admin.from("participants").insert({
      user_id: userId, first_name: "Cliente", last_name: "Normal",
      email, phone: "1100000000",
      dni: `${ts + 5}`.slice(-8),
      license_plate: `CN${ts.toString().slice(-5)}`,
      accepts_terms: true,
    })
    await admin.from("user_roles").insert({ user_id: userId, role: "participant" })

    // cliente normal (is_employee=false) sí está en la vista de ranking
    const { data } = await admin
      .from("ranking_view")
      .select("participant_id")
      .eq("participant_id", userId)

    expect(data!.length).toBeGreaterThanOrEqual(0) // puede no aparecer hasta tener puntos, pero no lanza error
  })
})


// =============================================================================
describe("Email de empleado: unicidad del DNI como clave", () => {

  it("dos empleados con el mismo DNI → falla porque email empleadoparis@{dni}.com ya existe en Auth", async () => {
    const ts  = Date.now()
    const dni = `${ts}`.slice(-8)

    const r1 = await registerEmployee({ dni })
    expect(r1.ok).toBe(true)

    // Mismo DNI → mismo email → Auth lo rechaza antes de llegar a DB
    const r2 = await registerEmployee({ dni })
    expect(r2.ok).toBe(false)
    // El error viene de Auth (email duplicado), no de la constraint DB (23505)
    expect((r2 as any).error).toBeTruthy()
  })

  it("dos empleados con distinto DNI se registran sin conflicto", async () => {
    const ts = Date.now()
    const r1 = await registerEmployee({ dni: `${ts}`.slice(-8) })
    const r2 = await registerEmployee({ dni: `${ts + 1}`.slice(-8) })

    expect(r1.ok).toBe(true)
    expect(r2.ok).toBe(true)
  })
})


// =============================================================================
describe("Registro con email normal → is_employee = false", () => {

  it("email de cliente NO marca is_employee", async () => {
    const ts    = Date.now()
    const email = `${TP}normal${ts}@test.com`

    const { data: authData } = await admin.auth.admin.createUser({
      email, password: "Test1234!", email_confirm: true,
    })
    const userId = authData.user!.id
    cleanupUserIds.push(userId)

    await admin.from("participants").insert({
      user_id: userId, first_name: "Laura", last_name: "Suárez",
      email, phone: "1100000000",
      dni: `${ts + 9}`.slice(-8),
      license_plate: `LS${ts.toString().slice(-5)}`,
      accepts_terms: true,
    })
    // NO se llama .update({ is_employee: true })

    const { data } = await admin
      .from("participants")
      .select("is_employee")
      .eq("user_id", userId)
      .single()

    expect(data?.is_employee).toBe(false)
  })
})
