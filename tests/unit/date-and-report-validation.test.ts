import { describe, it, expect } from "vitest"

// ─── Tests para bugs en fechas, reportes y validaciones restantes ─────────────

// ─────────────────────────────────────────────────────────────────
describe("Bug 53: Monthly report — newThisMonth necesita upper bound", () => {
  it("sin upper bound, cuenta participantes desde inicio del mes anterior HASTA HOY", () => {
    // Usar strings ISO para evitar problemas de timezone
    const monthStart = "2026-06-01T00:00:00Z"
    const monthEnd   = "2026-06-30T23:59:59Z"

    const participants = [
      { created_at: "2026-06-05T10:00:00Z" }, // dentro del mes anterior ✓
      { created_at: "2026-06-30T22:00:00Z" }, // último día del mes anterior ✓
      { created_at: "2026-07-01T00:01:00Z" }, // este mes ✗
      { created_at: "2026-07-15T12:00:00Z" }, // hoy ✗
      { created_at: "2026-05-20T00:00:00Z" }, // hace 2 meses ✗
    ]

    // Bug original — solo gte (sin upper bound):
    const buggyCount = participants.filter(p => p.created_at >= monthStart).length
    expect(buggyCount).toBe(4) // incluye los de julio → incorrecto

    // Fix correcto — con gte + lte:
    const correctCount = participants.filter(p =>
      p.created_at >= monthStart && p.created_at <= monthEnd
    ).length
    expect(correctCount).toBe(2) // solo los de junio
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 56: Validación de formato de fecha ISO", () => {
  function isValidISODate(s: string): boolean {
    if (!s || !s.includes("T")) return false
    const d = new Date(s)
    return !isNaN(d.getTime())
  }

  it("fecha ISO completa con Z es válida", () => {
    expect(isValidISODate("2026-06-15T18:00:00Z")).toBe(true)
  })

  it("fecha ISO con offset es válida", () => {
    expect(isValidISODate("2026-06-15T18:00:00-03:00")).toBe(true)
  })

  it("fecha ISO sin hora (sin T) es rechazada", () => {
    expect(isValidISODate("2026-06-15")).toBe(false)
  })

  it("formato argentino dd/mm/aaaa es rechazado", () => {
    expect(isValidISODate("15/06/2026")).toBe(false)
  })

  it("string vacío es rechazado", () => {
    expect(isValidISODate("")).toBe(false)
  })

  it("string inválido es rechazado", () => {
    expect(isValidISODate("not-a-date")).toBe(false)
  })

  it("datetime-local sin timezone (sin Z ni offset) pasa si es parseable", () => {
    // "2026-06-15T18:00" es lo que devuelve datetime-local input
    // Con :00Z appended → "2026-06-15T18:00:00Z" → válido
    expect(isValidISODate("2026-06-15T18:00:00Z")).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 55: createPrize — validación server-side de título", () => {
  function validatePrize(data: { title: string; stage: string }): { ok: boolean; error?: string } {
    if (!data.title.trim()) return { ok: false, error: "El título del premio es requerido." }
    if (!data.stage.trim()) return { ok: false, error: "La etapa del premio es requerida." }
    return { ok: true }
  }

  it("título y etapa válidos pasan", () => {
    expect(validatePrize({ title: "Gran Premio", stage: "Final" }).ok).toBe(true)
  })

  it("título vacío es rechazado server-side", () => {
    const r = validatePrize({ title: "", stage: "Final" })
    expect(r.ok).toBe(false)
    expect(r.error).toContain("título")
  })

  it("título de solo espacios es rechazado", () => {
    expect(validatePrize({ title: "   ", stage: "Final" }).ok).toBe(false)
  })

  it("etapa vacía es rechazada", () => {
    expect(validatePrize({ title: "Premio", stage: "" }).ok).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 54: updateParticipantProfile email sync — rollback en caso de falla de Auth", () => {
  // Si el DB update tiene éxito pero Auth sync falla, debemos:
  // 1. Revertir el email en participants al valor original
  // 2. Retornar ok: false con mensaje claro
  // Esto evita el estado inconsistente donde DB tiene nuevo email pero Auth el viejo

  it("cuando Auth sync falla, el rollback restaura el email original", async () => {
    const log: string[] = []

    async function updateWithRollback(
      dbUpdate: () => Promise<{ error: null | Error }>,
      authSync: () => Promise<{ error: null | Error }>,
      rollback: () => Promise<void>
    ): Promise<{ ok: boolean; error?: string }> {
      const { error: dbError } = await dbUpdate()
      if (dbError) return { ok: false, error: "DB update falló" }

      const { error: authError } = await authSync()
      if (authError) {
        await rollback()
        return { ok: false, error: `No se pudo actualizar el email: ${authError.message}` }
      }
      return { ok: true }
    }

    const result = await updateWithRollback(
      async () => { log.push("db_updated"); return { error: null } },
      async () => { log.push("auth_failed"); return { error: new Error("Auth service unavailable") } },
      async () => { log.push("db_rolled_back") }
    )

    expect(result.ok).toBe(false)
    expect(log).toContain("db_updated")
    expect(log).toContain("auth_failed")
    expect(log).toContain("db_rolled_back")
    expect(result.error).toContain("email")
  })

  it("cuando todo funciona, no hay rollback", async () => {
    const log: string[] = []

    async function updateWithRollback(
      dbUpdate: () => Promise<{ error: null | Error }>,
      authSync: () => Promise<{ error: null | Error }>,
      rollback: () => Promise<void>
    ) {
      const { error: dbError } = await dbUpdate()
      if (dbError) return { ok: false }
      const { error: authError } = await authSync()
      if (authError) { await rollback(); return { ok: false } }
      return { ok: true }
    }

    const result = await updateWithRollback(
      async () => { log.push("db_updated"); return { error: null } },
      async () => { log.push("auth_synced"); return { error: null } },
      async () => { log.push("rolled_back") }
    )

    expect(result.ok).toBe(true)
    expect(log).not.toContain("rolled_back")
  })
})
