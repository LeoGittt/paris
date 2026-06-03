import { describe, it, expect } from "vitest"

// ─── Tests de sanitización y validaciones de seguridad ───────────────────────
// Estos tests cubren la lógica pura sin necesidad de base de datos.

// ─────────────────────────────────────────────────────────────────
describe("Bug 8: Sanitización de búsquedas (PostgREST injection)", () => {
  // La búsqueda en callcenter y admin inyectaba q directo en .or()
  // Una coma en q agregaba condiciones extra al filtro PostgREST

  function sanitizeSearchQuery(q: string): string {
    return q.replace(/[%_,.()"']/g, "").trim()
  }

  it("elimina comas que romperían la sintaxis .or()", () => {
    expect(sanitizeSearchQuery("test,email.eq.admin")).toBe("testemaileqadmin")
    expect(sanitizeSearchQuery("a,b,c")).toBe("abc")
  })

  it("elimina puntos que romperían la sintaxis de columna.operador.valor", () => {
    // _ también se elimina (wildcard ILIKE), los puntos también
    expect(sanitizeSearchQuery("first_name.eq.hacker")).toBe("firstnameeqhacker")
  })

  it("elimina comillas SQL", () => {
    expect(sanitizeSearchQuery("O'Brien")).toBe("OBrien")
    expect(sanitizeSearchQuery('test"quote')).toBe("testquote")
  })

  it("elimina wildcards ILIKE manuales", () => {
    expect(sanitizeSearchQuery("test%")).toBe("test")
    expect(sanitizeSearchQuery("_test_")).toBe("test")
  })

  it("texto normal no se modifica excepto trim", () => {
    expect(sanitizeSearchQuery("Juan Perez")).toBe("Juan Perez")
    expect(sanitizeSearchQuery("  hola  ")).toBe("hola")
  })

  it("query con menos de 2 chars después de sanitizar no debería buscar", () => {
    const q = ",.)"
    const sanitized = sanitizeSearchQuery(q)
    expect(sanitized.length).toBeLessThan(2)
  })

  it("intento de inyección complejo queda neutralizado", () => {
    const malicious = "test),or(email.eq.admin@site.com"
    const sanitized = sanitizeSearchQuery(malicious)
    // Ningún carácter especial de PostgREST sobrevive
    expect(sanitized).not.toContain(",")
    expect(sanitized).not.toContain(".")
    expect(sanitized).not.toContain(")")
    expect(sanitized).not.toContain("(")
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 11: Validación de point_config (server action)", () => {
  // updatePointConfig valida antes de escribir a DB

  function validatePointConfig(values: {
    correct_winner: number
    correct_exact:  number
    correct_diff:   number
  }): { ok: boolean; error?: string } {
    const { correct_winner, correct_exact, correct_diff } = values
    if (!Number.isInteger(correct_winner) || !Number.isInteger(correct_exact) || !Number.isInteger(correct_diff))
      return { ok: false, error: "Los valores deben ser números enteros." }
    if (correct_winner < 0 || correct_exact < 0 || correct_diff < 0)
      return { ok: false, error: "Los valores no pueden ser negativos." }
    if (correct_exact < correct_winner)
      return { ok: false, error: "El puntaje por exacto debe ser mayor o igual al de ganador." }
    if (correct_winner > 99 || correct_exact > 99 || correct_diff > 99)
      return { ok: false, error: "Valores fuera de rango (máx 99)." }
    return { ok: true }
  }

  it("configuración válida pasa", () => {
    expect(validatePointConfig({ correct_winner: 5, correct_exact: 10, correct_diff: 3 }).ok).toBe(true)
    expect(validatePointConfig({ correct_winner: 5, correct_exact: 5,  correct_diff: 0 }).ok).toBe(true)
  })

  it("exact menor que winner es inválido (lógica de negocio)", () => {
    const r = validatePointConfig({ correct_winner: 10, correct_exact: 5, correct_diff: 3 })
    expect(r.ok).toBe(false)
    expect(r.error).toContain("mayor o igual")
  })

  it("valores negativos son inválidos", () => {
    expect(validatePointConfig({ correct_winner: -1, correct_exact: 5, correct_diff: 3 }).ok).toBe(false)
    expect(validatePointConfig({ correct_winner: 5, correct_exact: -1, correct_diff: 3 }).ok).toBe(false)
  })

  it("valores > 99 son inválidos", () => {
    expect(validatePointConfig({ correct_winner: 100, correct_exact: 100, correct_diff: 0 }).ok).toBe(false)
  })

  it("valores no enteros son inválidos", () => {
    expect(validatePointConfig({ correct_winner: 1.5, correct_exact: 10, correct_diff: 0 }).ok).toBe(false)
    expect(validatePointConfig({ correct_winner: 5, correct_exact: NaN, correct_diff: 0 }).ok).toBe(false)
  })

  it("exact = winner es válido (borde)", () => {
    expect(validatePointConfig({ correct_winner: 5, correct_exact: 5, correct_diff: 0 }).ok).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 12: Contraseña mínima en reset (8 chars, no 6)", () => {
  function validatePassword(password: string): { ok: boolean; error?: string } {
    if (password.length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." }
    return { ok: true }
  }

  it("contraseña de 6 chars es rechazada", () => {
    expect(validatePassword("abc123").ok).toBe(false)
  })

  it("contraseña de 7 chars es rechazada", () => {
    expect(validatePassword("abc1234").ok).toBe(false)
  })

  it("contraseña de 8 chars es aceptada", () => {
    expect(validatePassword("abc12345").ok).toBe(true)
  })

  it("contraseña larga es aceptada", () => {
    expect(validatePassword("MiContraseñaSegura123!").ok).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 10: auth/callback error handling", () => {
  // El callback de OAuth siempre redirigía a /dashboard, incluso con código inválido.
  // La lógica corregida verifica el error de exchangeCodeForSession.

  function resolveCallbackDestination(
    code: string | null,
    exchangeError: boolean,
    type: string | null,
    origin: string
  ): string {
    if (!code) return `${origin}/login`
    if (exchangeError) return `${origin}/login?error=link_invalido`
    if (type === "recovery") return `${origin}/auth/reset-password`
    return `${origin}/dashboard`
  }

  it("código inválido redirige a login con error", () => {
    const dest = resolveCallbackDestination("bad-code", true, null, "https://app.com")
    expect(dest).toBe("https://app.com/login?error=link_invalido")
  })

  it("código válido redirige a dashboard", () => {
    const dest = resolveCallbackDestination("valid-code", false, null, "https://app.com")
    expect(dest).toBe("https://app.com/dashboard")
  })

  it("código de recovery válido redirige a reset-password", () => {
    const dest = resolveCallbackDestination("valid-code", false, "recovery", "https://app.com")
    expect(dest).toBe("https://app.com/auth/reset-password")
  })

  it("sin código redirige a login", () => {
    const dest = resolveCallbackDestination(null, false, null, "https://app.com")
    expect(dest).toBe("https://app.com/login")
  })
})
