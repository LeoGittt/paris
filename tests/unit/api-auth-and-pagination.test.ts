import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"

// ─── Lógica de autenticación y paginación de la API v1 ───────────────────────
// Extraído de app/api/v1/participants/route.ts, metrics/route.ts
// y app/api/cron/lock-matches/route.ts


// ─── authenticated() — extraído de las rutas API v1 ─────────────────────────

function authenticated(
  headers: { get: (key: string) => string | null },
  apiSecretKey: string | undefined
): boolean {
  const key = headers.get("x-api-key") ?? headers.get("authorization")?.replace("Bearer ", "")
  return !!apiSecretKey && key === apiSecretKey
}

// ─── Paginación — extraído de /api/v1/participants ───────────────────────────

function parsePaginationParams(pageRaw: string | null, limitRaw: string | null) {
  const rawPage  = parseInt(pageRaw  ?? "1")
  const rawLimit = parseInt(limitRaw ?? "50")
  const page  = Math.max(1, Number.isNaN(rawPage)  ? 1  : rawPage)
  const limit = Math.min(100, Math.max(1, Number.isNaN(rawLimit) ? 50 : rawLimit))
  const from  = (page - 1) * limit
  return { page, limit, from, to: from + limit - 1 }
}

function calcTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit)
}

// ─── Cron authorization — extraído de lock-matches/route.ts ─────────────────

function isCronAuthorized(
  authHeader: string | null,
  cronSecret: string | undefined
): boolean {
  return !(!cronSecret || authHeader !== `Bearer ${cronSecret}`)
}

// ─── findEmailByDni — lógica de DNI extraída ─────────────────────────────────

function normalizeDniForLookup(raw: string): string | null {
  const dni = raw.replace(/\D/g, "")
  if (dni.length < 7) return null
  return dni
}


// =============================================================================
describe("authenticated() — API v1 authentication", () => {

  const makeHeaders = (vals: Record<string, string>) => ({
    get: (key: string) => vals[key] ?? null,
  })

  it("x-api-key correcto → autenticado", () => {
    const h = makeHeaders({ "x-api-key": "secret123" })
    expect(authenticated(h, "secret123")).toBe(true)
  })

  it("Authorization: Bearer correcto → autenticado", () => {
    const h = makeHeaders({ "authorization": "Bearer secret123" })
    expect(authenticated(h, "secret123")).toBe(true)
  })

  it("x-api-key incorrecto → no autenticado", () => {
    const h = makeHeaders({ "x-api-key": "wrong" })
    expect(authenticated(h, "secret123")).toBe(false)
  })

  it("sin cabecera → no autenticado", () => {
    const h = makeHeaders({})
    expect(authenticated(h, "secret123")).toBe(false)
  })

  it("API_SECRET_KEY no configurado (undefined) → siempre deniega", () => {
    const h = makeHeaders({ "x-api-key": "anything" })
    expect(authenticated(h, undefined)).toBe(false)
  })

  it("API_SECRET_KEY vacío ('') → siempre deniega", () => {
    const h = makeHeaders({ "x-api-key": "" })
    expect(authenticated(h, "")).toBe(false)
  })

  it("x-api-key tiene precedencia sobre Authorization", () => {
    // Si ambas cabeceras están, x-api-key se usa primero
    const h = makeHeaders({ "x-api-key": "correct", "authorization": "Bearer wrong" })
    expect(authenticated(h, "correct")).toBe(true)
  })

  it("Bearer con espacios extra NO matchea", () => {
    const h = makeHeaders({ "authorization": "Bearer  secret123" }) // doble espacio
    expect(authenticated(h, "secret123")).toBe(false)
  })

  it("clave vacía en cabecera con secret configurado → deniega", () => {
    const h = makeHeaders({ "x-api-key": "" })
    expect(authenticated(h, "secret123")).toBe(false)
  })
})


// =============================================================================
describe("parsePaginationParams — paginación de /api/v1/participants", () => {

  it("valores por defecto: page=1, limit=50", () => {
    const { page, limit } = parsePaginationParams(null, null)
    expect(page).toBe(1)
    expect(limit).toBe(50)
  })

  it("page=2, limit=25 → from=25, to=49", () => {
    const { page, limit, from, to } = parsePaginationParams("2", "25")
    expect(page).toBe(2)
    expect(limit).toBe(25)
    expect(from).toBe(25)
    expect(to).toBe(49)
  })

  it("page=1, limit=100 → from=0, to=99", () => {
    const { from, to } = parsePaginationParams("1", "100")
    expect(from).toBe(0)
    expect(to).toBe(99)
  })

  it("page < 1 se clampea a 1", () => {
    expect(parsePaginationParams("0", null).page).toBe(1)
    expect(parsePaginationParams("-5", null).page).toBe(1)
  })

  it("page NaN se clampea a 1", () => {
    expect(parsePaginationParams("abc", null).page).toBe(1)
  })

  it("limit > 100 se clampea a 100 (protege contra overfetch)", () => {
    expect(parsePaginationParams(null, "999").limit).toBe(100)
    expect(parsePaginationParams(null, "101").limit).toBe(100)
  })

  it("limit < 1 se clampea a 1", () => {
    expect(parsePaginationParams(null, "0").limit).toBe(1)
    expect(parsePaginationParams(null, "-10").limit).toBe(1)
  })

  it("limit NaN se clampea a 50 (default)", () => {
    expect(parsePaginationParams(null, "abc").limit).toBe(50)
  })

  it("from es siempre >= 0", () => {
    const scenarios = [["1", "50"], ["-1", "50"], ["0", "50"], ["abc", "abc"]]
    scenarios.forEach(([p, l]) => {
      expect(parsePaginationParams(p, l).from).toBeGreaterThanOrEqual(0)
    })
  })

  it("to >= from siempre", () => {
    const { from, to } = parsePaginationParams("3", "10")
    expect(to).toBeGreaterThanOrEqual(from)
  })

  it("rango es exactamente limit-1 de ancho", () => {
    const { from, to, limit } = parsePaginationParams("3", "10")
    expect(to - from).toBe(limit - 1)
  })
})


// =============================================================================
describe("calcTotalPages — cálculo de páginas totales", () => {

  it("100 registros, limit 50 → 2 páginas", () => {
    expect(calcTotalPages(100, 50)).toBe(2)
  })

  it("101 registros, limit 50 → 3 páginas (redondea arriba)", () => {
    expect(calcTotalPages(101, 50)).toBe(3)
  })

  it("50 registros, limit 50 → 1 página exacta", () => {
    expect(calcTotalPages(50, 50)).toBe(1)
  })

  it("0 registros → 0 páginas", () => {
    expect(calcTotalPages(0, 50)).toBe(0)
  })

  it("1 registro, limit 100 → 1 página", () => {
    expect(calcTotalPages(1, 100)).toBe(1)
  })
})


// =============================================================================
describe("isCronAuthorized — seguridad del endpoint /api/cron/lock-matches", () => {

  it("CRON_SECRET correcto en header → autorizado", () => {
    expect(isCronAuthorized("Bearer mysecret", "mysecret")).toBe(true)
  })

  it("CRON_SECRET incorrecto → no autorizado", () => {
    expect(isCronAuthorized("Bearer wrong", "mysecret")).toBe(false)
  })

  it("sin header Authorization → no autorizado", () => {
    expect(isCronAuthorized(null, "mysecret")).toBe(false)
  })

  it("CRON_SECRET no configurado (undefined) → siempre deniega", () => {
    expect(isCronAuthorized("Bearer anything", undefined)).toBe(false)
  })

  it("CRON_SECRET vacío ('') → siempre deniega (!!'' === false)", () => {
    expect(isCronAuthorized("Bearer ", "")).toBe(false)
  })

  it("header sin 'Bearer ' prefix → no autorizado", () => {
    // Debe ser exactamente "Bearer <secret>"
    expect(isCronAuthorized("mysecret", "mysecret")).toBe(false)
  })

  it("Bearer con secret vacío y secret vacío → deniega (protección contra vacíos)", () => {
    expect(isCronAuthorized("Bearer ", "")).toBe(false)
  })

  it("secret con caracteres especiales funciona correctamente", () => {
    const secret = "my$uper!S3cr3t_key-2026"
    expect(isCronAuthorized(`Bearer ${secret}`, secret)).toBe(true)
  })
})


// =============================================================================
describe("normalizeDniForLookup — findEmailByDni", () => {

  it("DNI de 7 dígitos es válido (mínimo)", () => {
    expect(normalizeDniForLookup("1234567")).toBe("1234567")
  })

  it("DNI de 8 dígitos con puntos → normaliza", () => {
    expect(normalizeDniForLookup("12.345.678")).toBe("12345678")
  })

  it("DNI menor a 7 dígitos → null (no hace query a DB)", () => {
    expect(normalizeDniForLookup("123456")).toBeNull()
    expect(normalizeDniForLookup("1")).toBeNull()
    expect(normalizeDniForLookup("")).toBeNull()
  })

  it("solo letras → null", () => {
    expect(normalizeDniForLookup("abcdefg")).toBeNull()
  })

  it("mezcla de letras y números con suficientes dígitos", () => {
    // "1a2b3c4d5e6f7" → "1234567" → 7 dígitos → válido
    expect(normalizeDniForLookup("1a2b3c4d5e6f7")).toBe("1234567")
  })

  it("enumeración masiva: DNI de 6 dígitos no llega a la DB", () => {
    // Protección contra fuerza bruta: DNIs cortos se rechazan antes del query
    expect(normalizeDniForLookup("000000")).toBeNull()
    expect(normalizeDniForLookup("999999")).toBeNull()
  })
})


// =============================================================================
describe("vercel.json — estructura de crons", () => {

  let vercel: { crons: { path: string; schedule: string }[] }

  try {
    vercel = JSON.parse(readFileSync("vercel.json", "utf-8"))
  } catch {
    vercel = { crons: [] }
  }

  const EXPECTED_CRONS = [
    "/api/cron/lock-matches",
    "/api/cron/weekly-report",
    "/api/cron/monthly-report",
    "/api/cron/daily-report",
  ]

  EXPECTED_CRONS.forEach(path => {
    it(`cron ${path} existe en vercel.json`, () => {
      const paths = vercel.crons.map(c => c.path)
      expect(paths).toContain(path)
    })
  })

  it("todos los crons tienen schedule definido y no vacío", () => {
    vercel.crons.forEach(c => {
      expect(c.schedule).toBeTruthy()
      expect(typeof c.schedule).toBe("string")
    })
  })

  it("schedules tienen formato cron válido (5 campos)", () => {
    vercel.crons.forEach(c => {
      const fields = c.schedule.trim().split(/\s+/)
      expect(fields.length).toBe(5)
    })
  })

  it("no hay crons duplicados (paths únicos)", () => {
    const paths  = vercel.crons.map(c => c.path)
    const unique = new Set(paths)
    expect(unique.size).toBe(paths.length)
  })
})
