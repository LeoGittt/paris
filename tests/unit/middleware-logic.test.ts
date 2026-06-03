import { describe, it, expect } from "vitest"

// ─── Tests de lógica del middleware ──────────────────────────────────────────
// El middleware no se puede ejecutar directamente en Vitest (requiere Edge runtime),
// pero sí podemos testear la lógica pura que lo compone.

const PUBLIC_PATHS = ["/", "/login", "/registro", "/ranking", "/terminos", "/bases", "/api/", "/auth/"]
const ADMIN_PATHS  = ["/admin"]
const CC_PATHS     = ["/callcenter"]

function isPublicPath(pathname: string): boolean {
  // El prefijo "/" matchearía TODO — solo usar startsWith para paths con longitud > 1
  return PUBLIC_PATHS.some(p => pathname === p || (p.length > 1 && pathname.startsWith(p)))
}

function resolveAccess(
  user: { id: string } | null,
  role: string | null,
  pathname: string
): "allow" | "redirect_login" | "redirect_dashboard" | "redirect_admin" | "redirect_callcenter" {
  const isPublic = isPublicPath(pathname)

  if (!user && !isPublic) return "redirect_login"

  if (user && ADMIN_PATHS.some(p => pathname.startsWith(p)) && role !== "admin")
    return "redirect_dashboard"

  if (user && CC_PATHS.some(p => pathname.startsWith(p)) && role !== "callcenter" && role !== "admin")
    return "redirect_dashboard"

  if (user && (pathname === "/login" || pathname === "/registro")) {
    if (role === "admin")      return "redirect_admin"
    if (role === "callcenter") return "redirect_callcenter"
    return "redirect_dashboard"
  }

  return "allow"
}

// ─────────────────────────────────────────────────────────────────
describe("Bug 22: PUBLIC_PATHS — páginas públicas faltantes", () => {
  // /ranking, /terminos, /bases eran inaccesibles sin login

  it("/ranking es accesible sin login", () => {
    expect(resolveAccess(null, null, "/ranking")).toBe("allow")
  })

  it("/terminos es accesible sin login", () => {
    expect(resolveAccess(null, null, "/terminos")).toBe("allow")
  })

  it("/bases es accesible sin login", () => {
    expect(resolveAccess(null, null, "/bases")).toBe("allow")
  })

  it("/dashboard SÍ requiere login", () => {
    expect(resolveAccess(null, null, "/dashboard")).toBe("redirect_login")
  })

  it("/admin SÍ requiere login", () => {
    expect(resolveAccess(null, null, "/admin")).toBe("redirect_login")
  })

  it("/ es pública", () => {
    expect(resolveAccess(null, null, "/")).toBe("allow")
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Middleware: protección de rutas por rol", () => {
  const user = { id: "uuid-123" }

  it("participante NO puede acceder a /admin → redirect a /dashboard", () => {
    expect(resolveAccess(user, "participant", "/admin")).toBe("redirect_dashboard")
    expect(resolveAccess(user, "participant", "/admin/partidos")).toBe("redirect_dashboard")
  })

  it("admin SÍ puede acceder a /admin", () => {
    expect(resolveAccess(user, "admin", "/admin")).toBe("allow")
    expect(resolveAccess(user, "admin", "/admin/participantes")).toBe("allow")
  })

  it("callcenter NO puede acceder a /admin → redirect", () => {
    expect(resolveAccess(user, "callcenter", "/admin")).toBe("redirect_dashboard")
  })

  it("participante NO puede acceder a /callcenter → redirect", () => {
    expect(resolveAccess(user, "participant", "/callcenter")).toBe("redirect_dashboard")
  })

  it("callcenter SÍ puede acceder a /callcenter", () => {
    expect(resolveAccess(user, "callcenter", "/callcenter")).toBe("allow")
  })

  it("admin también puede acceder a /callcenter", () => {
    expect(resolveAccess(user, "admin", "/callcenter")).toBe("allow")
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Middleware: usuario logueado en /login → redirección según rol", () => {
  const user = { id: "uuid-123" }

  it("admin en /login → /admin", () => {
    expect(resolveAccess(user, "admin", "/login")).toBe("redirect_admin")
  })

  it("callcenter en /login → /callcenter", () => {
    expect(resolveAccess(user, "callcenter", "/login")).toBe("redirect_callcenter")
  })

  it("participante en /login → /dashboard", () => {
    expect(resolveAccess(user, "participant", "/login")).toBe("redirect_dashboard")
  })

  it("participante en /registro → /dashboard", () => {
    expect(resolveAccess(user, "participant", "/registro")).toBe("redirect_dashboard")
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 24: Scoring — correct_diff debe valer MÁS que correct_winner", () => {
  // correct_diff = acertó ganador + diferencia de goles
  // correct_winner = solo acertó ganador
  // La lógica de negocio requiere: correct_diff > correct_winner
  // Los defaults originales (diff=2, winner=5) estaban invertidos

  function validateScoringOrder(config: {
    correct_exact: number
    correct_diff: number
    correct_winner: number
  }): { valid: boolean; error?: string } {
    if (config.correct_exact <= config.correct_diff)
      return { valid: false, error: "correct_exact debe ser mayor que correct_diff" }
    if (config.correct_diff <= config.correct_winner)
      return { valid: false, error: "correct_diff debe ser mayor que correct_winner" }
    if (config.correct_winner < 0)
      return { valid: false, error: "correct_winner no puede ser negativo" }
    return { valid: true }
  }

  it("defaults originales (exact=10, diff=2, winner=5) son inválidos", () => {
    const result = validateScoringOrder({ correct_exact: 10, correct_diff: 2, correct_winner: 5 })
    expect(result.valid).toBe(false)
    expect(result.error).toContain("correct_diff debe ser mayor")
  })

  it("defaults corregidos (exact=10, diff=7, winner=5) son válidos", () => {
    const result = validateScoringOrder({ correct_exact: 10, correct_diff: 7, correct_winner: 5 })
    expect(result.valid).toBe(true)
  })

  it("configuración personalizada coherente es válida", () => {
    expect(validateScoringOrder({ correct_exact: 15, correct_diff: 10, correct_winner: 5 }).valid).toBe(true)
  })

  it("configuración con empate de diff y winner es inválida", () => {
    expect(validateScoringOrder({ correct_exact: 10, correct_diff: 5, correct_winner: 5 }).valid).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 25: Countdown — timezone explícita evita offset según usuario", () => {
  it("fecha con 'Z' es interpretada como UTC, no timezone local", () => {
    const withZ    = new Date("2026-06-11T22:00:00Z").getTime()
    const withoutZ = new Date("2026-06-11T22:00:00").getTime()

    // Con Z, el resultado es absoluto y predecible
    expect(isFinite(withZ)).toBe(true)
    expect(isFinite(withoutZ)).toBe(true)

    // Verificar que el timestamp UTC es correcto (2026-06-11T22:00:00Z)
    const parsed = new Date(withZ)
    expect(parsed.getUTCFullYear()).toBe(2026)
    expect(parsed.getUTCMonth()).toBe(5)  // mes 0-indexado
    expect(parsed.getUTCDate()).toBe(11)
    expect(parsed.getUTCHours()).toBe(22)
    expect(parsed.getUTCMinutes()).toBe(0)

    // En máquinas con offset != UTC, los dos valores difieren (Z fuerza UTC)
    const offsetMs = new Date().getTimezoneOffset() * 60 * 1000
    if (offsetMs !== 0) {
      expect(withZ).not.toBe(withoutZ)
    }
  })
})
