import { describe, it, expect } from "vitest"

// ─── Validaciones server-side extraídas de lib/actions/register.ts ───────────
// El cliente puede bypassear las validaciones del formulario.
// Estas funciones se ejecutan en el servidor ANTES de tocar Supabase.


// ─── Lógica extraída ─────────────────────────────────────────────────────────

type RegisterData = {
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

type ValidationResult = { ok: true } | { ok: false; error: string }

function validateRegistration(data: RegisterData): ValidationResult {
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
  return { ok: true }
}

const VALID_LEAD_SOURCES = ["taller", "repuestos", "digital", "qr"] as const

function normalizeLeadSource(raw: string | undefined): string {
  return VALID_LEAD_SOURCES.includes(raw as typeof VALID_LEAD_SOURCES[number])
    ? raw!
    : "direct"
}

function normalizeDniForStorage(raw: string): string {
  return raw.replace(/\D/g, "")
}

function normalizePlateForStorage(raw: string): string {
  return raw.toUpperCase().replace(/\s/g, "")
}

const BASE: RegisterData = {
  first_name:        "Juan",
  last_name:         "Perez",
  dni:               "12345678",
  phone:             "2645000000",
  email:             "juan@test.com",
  password:          "password123",
  license_plate:     "ABC123",
  car_brand:         "Chevrolet",
  car_model:         "Onix",
  city:              "San Juan",
  accepts_terms:     true,
  accepts_marketing: false,
}


// =============================================================================
describe("validateRegistration — validaciones server-side", () => {

  it("datos completos y válidos retornan ok: true", () => {
    expect(validateRegistration(BASE).ok).toBe(true)
  })

  // ── accepts_terms ───────────────────────────────────────────────────────────
  it("sin aceptar términos → error", () => {
    const r = validateRegistration({ ...BASE, accepts_terms: false })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain("términos")
  })

  // ── DNI ────────────────────────────────────────────────────────────────────
  it("DNI con 6 dígitos es inválido", () => {
    const r = validateRegistration({ ...BASE, dni: "123456" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe("DNI inválido.")
  })

  it("DNI con 7 dígitos es válido (mínimo)", () => {
    expect(validateRegistration({ ...BASE, dni: "1234567" }).ok).toBe(true)
  })

  it("DNI con puntos y guiones se valida correctamente (12.345.678)", () => {
    expect(validateRegistration({ ...BASE, dni: "12.345.678" }).ok).toBe(true)
  })

  it("DNI con letras se normaliza y si queda < 7 dígitos falla", () => {
    const r = validateRegistration({ ...BASE, dni: "ABC123" })
    expect(r.ok).toBe(false)
  })

  // ── email ──────────────────────────────────────────────────────────────────
  it("email sin @ es inválido", () => {
    const r = validateRegistration({ ...BASE, email: "juantest.com" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe("Email inválido.")
  })

  it("email con @ es válido", () => {
    expect(validateRegistration({ ...BASE, email: "a@b.com" }).ok).toBe(true)
  })

  // ── password ───────────────────────────────────────────────────────────────
  it("contraseña de 7 chars es inválida", () => {
    const r = validateRegistration({ ...BASE, password: "1234567" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain("8 caracteres")
  })

  it("contraseña de 8 chars es válida (mínimo)", () => {
    expect(validateRegistration({ ...BASE, password: "12345678" }).ok).toBe(true)
  })

  it("contraseña muy larga es válida", () => {
    expect(validateRegistration({ ...BASE, password: "a".repeat(100) }).ok).toBe(true)
  })

  // ── license_plate ──────────────────────────────────────────────────────────
  it("patente con 5 chars es inválida", () => {
    const r = validateRegistration({ ...BASE, license_plate: "AB123" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe("Patente inválida.")
  })

  it("patente con 6 chars es válida (formato viejo)", () => {
    expect(validateRegistration({ ...BASE, license_plate: "ABC123" }).ok).toBe(true)
  })

  it("patente con espacios cuenta los chars sin espacios", () => {
    // "AB 123 CD" → "AB123CD" → 7 chars → válida
    expect(validateRegistration({ ...BASE, license_plate: "AB 123 CD" }).ok).toBe(true)
  })

  it("patente con solo espacios es inválida", () => {
    const r = validateRegistration({ ...BASE, license_plate: "     " })
    expect(r.ok).toBe(false)
  })

  // ── orden de validaciones ──────────────────────────────────────────────────
  it("accepts_terms se valida primero (short-circuit)", () => {
    const r = validateRegistration({
      ...BASE,
      accepts_terms: false,
      email: "not-an-email",
      password: "short",
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain("términos") // el primer error es accepts_terms
  })
})


// =============================================================================
describe("normalizeLeadSource — fuente de origen del registro", () => {

  it("'taller' es válido", () => {
    expect(normalizeLeadSource("taller")).toBe("taller")
  })

  it("'repuestos' es válido", () => {
    expect(normalizeLeadSource("repuestos")).toBe("repuestos")
  })

  it("'digital' es válido", () => {
    expect(normalizeLeadSource("digital")).toBe("digital")
  })

  it("'qr' es válido", () => {
    expect(normalizeLeadSource("qr")).toBe("qr")
  })

  it("valor desconocido cae a 'direct'", () => {
    expect(normalizeLeadSource("social_media")).toBe("direct")
    expect(normalizeLeadSource("whatsapp")).toBe("direct")
    expect(normalizeLeadSource("random")).toBe("direct")
  })

  it("undefined cae a 'direct'", () => {
    expect(normalizeLeadSource(undefined)).toBe("direct")
  })

  it("cadena vacía cae a 'direct'", () => {
    expect(normalizeLeadSource("")).toBe("direct")
  })

  it("valor en mayúsculas NO es válido (case sensitive)", () => {
    expect(normalizeLeadSource("TALLER")).toBe("direct")
    expect(normalizeLeadSource("Digital")).toBe("direct")
  })

  it("todos los valores válidos son exactamente 4", () => {
    expect(VALID_LEAD_SOURCES).toHaveLength(4)
  })
})


// =============================================================================
describe("normalizeDniForStorage — transformación antes de guardar en DB", () => {

  it("DNI con puntos queda solo con dígitos", () => {
    expect(normalizeDniForStorage("12.345.678")).toBe("12345678")
  })

  it("DNI con guiones queda solo con dígitos", () => {
    expect(normalizeDniForStorage("12-345-678")).toBe("12345678")
  })

  it("DNI ya limpio no cambia", () => {
    expect(normalizeDniForStorage("12345678")).toBe("12345678")
  })

  it("DNI con espacios queda limpio", () => {
    expect(normalizeDniForStorage("12 345 678")).toBe("12345678")
  })

  it("DNI de 7 dígitos se guarda correctamente (mínimo legal argentino)", () => {
    expect(normalizeDniForStorage("1.234.567")).toBe("1234567")
  })
})


// =============================================================================
describe("normalizePlateForStorage — transformación antes de guardar en DB", () => {

  it("convierte a mayúsculas", () => {
    expect(normalizePlateForStorage("abc123")).toBe("ABC123")
  })

  it("elimina espacios internos", () => {
    expect(normalizePlateForStorage("AB 123 CD")).toBe("AB123CD")
  })

  it("formato Mercosur con espacios → sin espacios en mayúsculas", () => {
    expect(normalizePlateForStorage("aa 123 bb")).toBe("AA123BB")
  })

  it("formato viejo ya limpio no cambia (excepto mayúsculas)", () => {
    expect(normalizePlateForStorage("aab123")).toBe("AAB123")
  })

  it("idempotente — aplicar dos veces da el mismo resultado", () => {
    const once  = normalizePlateForStorage("abc 123")
    const twice = normalizePlateForStorage(once)
    expect(once).toBe(twice)
  })
})
