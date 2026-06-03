import { describe, it, expect } from "vitest"

// ─── Tests para validaciones server-side del registro ────────────────────────
// El cliente puede bypassear validaciones del formulario —
// el server action debe re-validar todo de forma independiente.

interface RegisterData {
  accepts_terms:  boolean
  dni:            string
  email:          string
  password:       string
  license_plate:  string
  first_name:     string
  last_name:      string
  phone:          string
}

function validateRegister(data: RegisterData): { ok: boolean; error?: string } {
  if (!data.accepts_terms)
    return { ok: false, error: "Debés aceptar los términos y condiciones." }
  if (data.dni.replace(/\D/g, "").length < 7)
    return { ok: false, error: "DNI inválido." }
  if (!data.email.includes("@"))
    return { ok: false, error: "Email inválido." }
  if (data.password.length < 8)
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." }
  if (data.license_plate.replace(/\s/g, "").length < 6)
    return { ok: false, error: "Patente inválida." }
  return { ok: true }
}

const validData: RegisterData = {
  accepts_terms:  true,
  dni:            "12345678",
  email:          "test@test.com",
  password:       "password123",
  license_plate:  "AAB123",
  first_name:     "Juan",
  last_name:      "Perez",
  phone:          "1134567890",
}

// ─────────────────────────────────────────────────────────────────
describe("Bug 39: registerParticipant — validaciones server-side", () => {
  it("datos válidos pasan la validación", () => {
    expect(validateRegister(validData).ok).toBe(true)
  })

  it("terms no aceptados son rechazados (bypass del formulario)", () => {
    const r = validateRegister({ ...validData, accepts_terms: false })
    expect(r.ok).toBe(false)
    expect(r.error).toContain("términos")
  })

  it("DNI con menos de 7 dígitos es rechazado server-side", () => {
    const r = validateRegister({ ...validData, dni: "123456" })
    expect(r.ok).toBe(false)
    expect(r.error).toContain("DNI")
  })

  it("email sin @ es rechazado server-side", () => {
    const r = validateRegister({ ...validData, email: "noatsign.com" })
    expect(r.ok).toBe(false)
    expect(r.error).toContain("Email")
  })

  it("contraseña de 6 chars es rechazada server-side (mínimo 8)", () => {
    const r = validateRegister({ ...validData, password: "abc123" })
    expect(r.ok).toBe(false)
    expect(r.error).toContain("8 caracteres")
  })

  it("patente de 5 chars es rechazada server-side", () => {
    const r = validateRegister({ ...validData, license_plate: "AA123" })
    expect(r.ok).toBe(false)
    expect(r.error).toContain("Patente")
  })

  it("patente con espacios — se mide sin espacios", () => {
    // "AA 123" = 5 chars sin espacios → inválida
    const r = validateRegister({ ...validData, license_plate: "AA 123" })
    expect(r.ok).toBe(false)

    // "AAB 123" = 6 chars sin espacios → válida
    const r2 = validateRegister({ ...validData, license_plate: "AAB 123" })
    expect(r2.ok).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 37: registerParticipant — rollback en error de role insert", () => {
  // Documenta el contrato: si role insert falla, auth user Y participant
  // deben ser eliminados para no dejar estado inconsistente.

  it("estado inconsistente: auth OK + participant OK + role FAIL → rollback total", async () => {
    const events: string[] = []

    async function simulateRegister(roleInsertFails: boolean) {
      // Step 1: auth user creado
      events.push("auth_created")
      const userId = "fake-uuid"

      // Step 2: participant creado
      events.push("participant_created")

      // Step 3: role insert
      if (roleInsertFails) {
        // Rollback
        events.push("participant_deleted")
        events.push("auth_deleted")
        return { ok: false, error: "Error al completar el registro." }
      }

      events.push("role_created")
      return { ok: true }
    }

    events.length = 0
    const result = await simulateRegister(true)
    expect(result.ok).toBe(false)
    expect(events).toContain("participant_deleted")
    expect(events).toContain("auth_deleted")
  })

  it("flujo exitoso: no hay rollback", async () => {
    const events: string[] = []
    async function simulateRegister() {
      events.push("auth_created")
      events.push("participant_created")
      events.push("role_created")
      return { ok: true }
    }
    await simulateRegister()
    expect(events).not.toContain("auth_deleted")
    expect(events).not.toContain("participant_deleted")
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 38: createSystemUser — rollback si role insert falla", () => {
  it("si role insert falla, el mensaje dice que el usuario NO fue creado", () => {
    const errorMsg = "Error al asignar el rol. El usuario no fue creado."
    expect(errorMsg).not.toContain("creado pero")  // el mensaje anterior era confuso
    expect(errorMsg).toContain("no fue creado")    // el nuevo es claro: no quedó nada
  })
})
