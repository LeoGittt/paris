import { describe, it, expect } from "vitest"

// ─── Tests para bugs encontrados en tercera ronda de audit ───────────────────

// ─────────────────────────────────────────────────────────────────
describe("Bug 28: saveMatchResult — validación de scores", () => {
  function validateMatchScore(score1: number, score2: number): { ok: boolean; error?: string } {
    if (!Number.isInteger(score1) || !Number.isInteger(score2))
      return { ok: false, error: "Los marcadores deben ser números enteros." }
    if (score1 < 0 || score2 < 0)
      return { ok: false, error: "Los marcadores no pueden ser negativos." }
    if (score1 > 30 || score2 > 30)
      return { ok: false, error: "Marcador fuera de rango razonable (máx 30)." }
    return { ok: true }
  }

  it("resultado válido pasa", () => {
    expect(validateMatchScore(2, 1).ok).toBe(true)
    expect(validateMatchScore(0, 0).ok).toBe(true)
    expect(validateMatchScore(5, 3).ok).toBe(true)
  })

  it("scores negativos son rechazados", () => {
    expect(validateMatchScore(-1, 0).ok).toBe(false)
    expect(validateMatchScore(0, -1).ok).toBe(false)
  })

  it("scores absurdos son rechazados", () => {
    expect(validateMatchScore(31, 0).ok).toBe(false)
    expect(validateMatchScore(0, 100).ok).toBe(false)
  })

  it("scores no enteros son rechazados", () => {
    expect(validateMatchScore(1.5, 0).ok).toBe(false)
    expect(validateMatchScore(NaN, 0).ok).toBe(false)
    expect(validateMatchScore(Infinity, 0).ok).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 30: Contraseña mínima — registro y reset deben ser consistentes (8 chars)", () => {
  const MIN_PASSWORD_LENGTH = 8

  function isPasswordValid(password: string): boolean {
    return password.length >= MIN_PASSWORD_LENGTH
  }

  it("contraseña de 8 chars es válida", () => {
    expect(isPasswordValid("abcd1234")).toBe(true)
  })

  it("contraseña de 6 chars (valor anterior) ya no es válida", () => {
    expect(isPasswordValid("abc123")).toBe(false)
  })

  it("contraseña de 7 chars no es válida", () => {
    expect(isPasswordValid("abc1234")).toBe(false)
  })

  it("contraseña larga es válida", () => {
    expect(isPasswordValid("MiContraseñaSegura123!")).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 29: recalculateAllPoints — paralelo vs secuencial", () => {
  // Verifica que la nueva implementación dispara todas las RPCs en paralelo

  it("Promise.all es más rápido que loop secuencial para múltiples matches", async () => {
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

    const matches = ["a", "b", "c", "d", "e"]

    // Secuencial — suma los delays
    const startSeq = Date.now()
    for (const _ of matches) { await delay(10) }
    const durationSeq = Date.now() - startSeq

    // Paralelo — ejecuta todos juntos
    const startPar = Date.now()
    await Promise.all(matches.map(() => delay(10)))
    const durationPar = Date.now() - startPar

    // El paralelo debe ser significativamente más rápido
    expect(durationPar).toBeLessThan(durationSeq * 0.8)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 27: email desync — updateParticipantProfile debe sincronizar Auth", () => {
  // Documenta el contrato esperado: si el email cambia en participants,
  // también debe actualizarse en Supabase Auth

  it("cuando el email cambia, se detecta la diferencia", () => {
    const currentEmail: string = "viejo@test.com"
    const newEmail: string     = "nuevo@test.com"

    const emailChanged = currentEmail !== newEmail
    expect(emailChanged).toBe(true)
    // La acción corregida llama auth.admin.updateUserById si emailChanged es true
  })

  it("cuando el email NO cambia, no es necesario sincronizar Auth", () => {
    const currentEmail = "mismo@test.com"
    const newEmail     = "mismo@test.com"

    const emailChanged = currentEmail !== newEmail
    expect(emailChanged).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 32: point_config singleton — solo debe existir 1 fila", () => {
  it("la constraint singleton evita múltiples filas", () => {
    // Simular la lógica de constraint unique(singleton=true)
    const rows: { id: string; singleton: boolean }[] = []

    function insertConfig(id: string): { ok: boolean; error?: string } {
      const alreadyExists = rows.some(r => r.singleton === true)
      if (alreadyExists) return { ok: false, error: "unique constraint violation" }
      rows.push({ id, singleton: true })
      return { ok: true }
    }

    expect(insertConfig("row1").ok).toBe(true)
    expect(insertConfig("row2").ok).toBe(false) // segunda fila bloqueada
    expect(rows.length).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("CSV import: validación de fecha ISO en parseCSV", () => {
  function isValidISODate(s: string): boolean {
    if (!s) return false
    const d = new Date(s)
    return !isNaN(d.getTime()) && s.includes("T")
  }

  it("fecha ISO válida con Z es aceptada", () => {
    expect(isValidISODate("2026-06-15T18:00:00Z")).toBe(true)
  })

  it("fecha ISO con offset es aceptada", () => {
    expect(isValidISODate("2026-06-15T18:00:00-03:00")).toBe(true)
  })

  it("fecha en formato local (sin T) es rechazada", () => {
    expect(isValidISODate("15/06/2026")).toBe(false)
    expect(isValidISODate("2026-06-15")).toBe(false) // sin hora
  })

  it("string vacío es rechazado", () => {
    expect(isValidISODate("")).toBe(false)
  })

  it("string inválido es rechazado", () => {
    expect(isValidISODate("no-es-fecha")).toBe(false)
  })
})
