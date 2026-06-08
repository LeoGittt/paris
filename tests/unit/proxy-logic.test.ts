import { describe, it, expect } from "vitest"

// ─── Lógica pura del proxy (middleware) extraída de proxy.ts ─────────────────
// Testea el routing de acceso: rutas públicas, protegidas, roles.
// Sin deps de Next.js — todo lógica pura.


// ─── Constantes y funciones extraídas de proxy.ts ────────────────────────────

const PUBLIC_PATHS = ["/", "/login", "/registro", "/ranking", "/terminos", "/bases", "/api/", "/auth/"]
const ADMIN_PATHS  = ["/admin"]
const CC_PATHS     = ["/callcenter"]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p =>
    pathname === p || (p.length > 1 && pathname.startsWith(p))
  )
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some(p => pathname.startsWith(p))
}

function isCcPath(pathname: string): boolean {
  return CC_PATHS.some(p => pathname.startsWith(p))
}

function needsRoleCheck(user: boolean, pathname: string): boolean {
  return user && (
    isAdminPath(pathname) ||
    isCcPath(pathname)    ||
    pathname === "/login" ||
    pathname === "/registro"
  )
}

type Role = "admin" | "callcenter" | "participant" | null

function getRedirectForAuthenticatedUser(
  role: Role,
  pathname: string
): string | null {
  // Acceso a admin sin rol admin → redirigir a dashboard
  if (isAdminPath(pathname) && role !== "admin") return "/dashboard"
  // Acceso a callcenter sin rol callcenter/admin → redirigir a dashboard
  if (isCcPath(pathname) && role !== "callcenter" && role !== "admin") return "/dashboard"
  // Usuario autenticado en login/registro → redirigir según rol
  if (pathname === "/login" || pathname === "/registro") {
    if (role === "admin")      return "/admin"
    if (role === "callcenter") return "/callcenter"
    return "/dashboard"
  }
  return null
}


// =============================================================================
describe("isPublicPath — rutas que no requieren autenticación", () => {

  // ── Rutas exactas ────────────────────────────────────────────────────────────
  it("'/' es público (match exacto)", () => {
    expect(isPublicPath("/")).toBe(true)
  })

  it("'/login' es público", () => {
    expect(isPublicPath("/login")).toBe(true)
  })

  it("'/registro' es público", () => {
    expect(isPublicPath("/registro")).toBe(true)
  })

  it("'/ranking' es público", () => {
    expect(isPublicPath("/ranking")).toBe(true)
  })

  it("'/terminos' es público", () => {
    expect(isPublicPath("/terminos")).toBe(true)
  })

  it("'/bases' es público", () => {
    expect(isPublicPath("/bases")).toBe(true)
  })

  // ── Rutas por prefijo ─────────────────────────────────────────────────────────
  it("'/api/cron/lock-matches' es público (empieza con /api/)", () => {
    expect(isPublicPath("/api/cron/lock-matches")).toBe(true)
  })

  it("'/api/v1/metrics' es público", () => {
    expect(isPublicPath("/api/v1/metrics")).toBe(true)
  })

  it("'/auth/callback' es público (empieza con /auth/)", () => {
    expect(isPublicPath("/auth/callback")).toBe(true)
  })

  it("'/auth/reset-password' es público", () => {
    expect(isPublicPath("/auth/reset-password")).toBe(true)
  })

  // ── Rutas protegidas ─────────────────────────────────────────────────────────
  it("'/dashboard' NO es público", () => {
    expect(isPublicPath("/dashboard")).toBe(false)
  })

  it("'/dashboard/pronosticos' NO es público", () => {
    expect(isPublicPath("/dashboard/pronosticos")).toBe(false)
  })

  it("'/admin' NO es público", () => {
    expect(isPublicPath("/admin")).toBe(false)
  })

  it("'/admin/participantes' NO es público", () => {
    expect(isPublicPath("/admin/participantes")).toBe(false)
  })

  it("'/callcenter' NO es público", () => {
    expect(isPublicPath("/callcenter")).toBe(false)
  })

  // ── El crítico: '/' no debe hacer que todo empiece con '/' sea público ────────
  it("'/dashboard' NO matchea '/' (p.length > 1 guard)", () => {
    // Sin la guarda `p.length > 1`, cualquier ruta empezaría con "/" y sería pública
    expect(isPublicPath("/dashboard")).toBe(false)
    expect(isPublicPath("/admin/secret")).toBe(false)
  })
})


// =============================================================================
describe("isAdminPath y isCcPath — rutas de roles especiales", () => {

  it("'/admin' es admin path", () => {
    expect(isAdminPath("/admin")).toBe(true)
  })

  it("'/admin/participantes' es admin path", () => {
    expect(isAdminPath("/admin/participantes")).toBe(true)
  })

  it("'/dashboard' NO es admin path", () => {
    expect(isAdminPath("/dashboard")).toBe(false)
  })

  it("'/callcenter' es callcenter path", () => {
    expect(isCcPath("/callcenter")).toBe(true)
  })

  it("'/callcenter/search' es callcenter path", () => {
    expect(isCcPath("/callcenter/search")).toBe(true)
  })

  it("'/admin' NO es callcenter path", () => {
    expect(isCcPath("/admin")).toBe(false)
  })
})


// =============================================================================
describe("needsRoleCheck — cuándo leer el rol desde la DB", () => {

  it("usuario en /admin → necesita rol", () => {
    expect(needsRoleCheck(true, "/admin")).toBe(true)
  })

  it("usuario en /callcenter → necesita rol", () => {
    expect(needsRoleCheck(true, "/callcenter")).toBe(true)
  })

  it("usuario en /login → necesita rol (para redirigir)", () => {
    expect(needsRoleCheck(true, "/login")).toBe(true)
  })

  it("usuario en /registro → necesita rol", () => {
    expect(needsRoleCheck(true, "/registro")).toBe(true)
  })

  it("usuario en /dashboard → NO necesita rol", () => {
    expect(needsRoleCheck(true, "/dashboard")).toBe(false)
  })

  it("usuario en /dashboard/pronosticos → NO necesita rol", () => {
    expect(needsRoleCheck(true, "/dashboard/pronosticos")).toBe(false)
  })

  it("sin usuario en /admin → NO necesita rol (ruta protegida → redirect a login antes)", () => {
    expect(needsRoleCheck(false, "/admin")).toBe(false)
  })
})


// =============================================================================
describe("getRedirectForAuthenticatedUser — redirecciones post-autenticación", () => {

  // ── Admin accediendo a su área ────────────────────────────────────────────────
  it("admin en /admin → no redirige (acceso permitido)", () => {
    expect(getRedirectForAuthenticatedUser("admin", "/admin")).toBeNull()
  })

  it("admin en /admin/participantes → no redirige", () => {
    expect(getRedirectForAuthenticatedUser("admin", "/admin/participantes")).toBeNull()
  })

  // ── Participant intentando acceder a admin ────────────────────────────────────
  it("participant en /admin → redirige a /dashboard", () => {
    expect(getRedirectForAuthenticatedUser("participant", "/admin")).toBe("/dashboard")
  })

  it("null role en /admin → redirige a /dashboard", () => {
    expect(getRedirectForAuthenticatedUser(null, "/admin")).toBe("/dashboard")
  })

  // ── Callcenter ────────────────────────────────────────────────────────────────
  it("callcenter en /callcenter → no redirige", () => {
    expect(getRedirectForAuthenticatedUser("callcenter", "/callcenter")).toBeNull()
  })

  it("admin en /callcenter → no redirige (admin tiene acceso también)", () => {
    expect(getRedirectForAuthenticatedUser("admin", "/callcenter")).toBeNull()
  })

  it("participant en /callcenter → redirige a /dashboard", () => {
    expect(getRedirectForAuthenticatedUser("participant", "/callcenter")).toBe("/dashboard")
  })

  // ── Login con sesión activa ───────────────────────────────────────────────────
  it("admin autenticado en /login → redirige a /admin", () => {
    expect(getRedirectForAuthenticatedUser("admin", "/login")).toBe("/admin")
  })

  it("callcenter autenticado en /login → redirige a /callcenter", () => {
    expect(getRedirectForAuthenticatedUser("callcenter", "/login")).toBe("/callcenter")
  })

  it("participant autenticado en /login → redirige a /dashboard", () => {
    expect(getRedirectForAuthenticatedUser("participant", "/login")).toBe("/dashboard")
  })

  it("null role en /login → redirige a /dashboard (fallback seguro)", () => {
    expect(getRedirectForAuthenticatedUser(null, "/login")).toBe("/dashboard")
  })

  it("admin en /registro → redirige a /admin", () => {
    expect(getRedirectForAuthenticatedUser("admin", "/registro")).toBe("/admin")
  })

  // ── Rutas normales del dashboard → sin redirect ───────────────────────────────
  it("participant en /dashboard → sin redirect", () => {
    expect(getRedirectForAuthenticatedUser("participant", "/dashboard")).toBeNull()
  })

  it("admin en /dashboard → sin redirect (puede acceder al dashboard también)", () => {
    expect(getRedirectForAuthenticatedUser("admin", "/dashboard")).toBeNull()
  })
})


// =============================================================================
describe("next.config.mjs — configuración de performance e imágenes", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: any

  try {
    // Importamos sincrónicamente como texto para no ejecutar el módulo ESM
    const { readFileSync } = require("fs")
    const raw = readFileSync("next.config.mjs", "utf-8")
    config = { raw }
  } catch {
    config = { raw: "" }
  }

  it("no tiene 'unoptimized: true' — las imágenes deben estar optimizadas", () => {
    expect(config.raw).not.toContain("unoptimized: true")
  })

  it("tiene formato AVIF configurado para mejor compresión", () => {
    expect(config.raw).toContain("avif")
  })

  it("tiene formato WebP configurado como fallback", () => {
    expect(config.raw).toContain("webp")
  })

  it("tiene cache headers para assets estáticos de Next.js", () => {
    expect(config.raw).toContain("_next/static")
    expect(config.raw).toContain("immutable")
  })

  it("tiene cache headers para imágenes públicas", () => {
    expect(config.raw).toContain("stale-while-revalidate")
  })

  it("tiene flagcdn.com en remotePatterns", () => {
    expect(config.raw).toContain("flagcdn.com")
  })
})
