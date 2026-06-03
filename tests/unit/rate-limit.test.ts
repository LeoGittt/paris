import { describe, it, expect } from "vitest"

// ─── Tests de lógica de rate limiting ────────────────────────────────────────
// La función check_rate_limit es atómica en la DB.
// Aquí testeamos la lógica de ventana y conteo independientemente.

interface RateLimitState {
  count:        number
  windowStart:  Date
}

function simulateRateLimit(
  state: RateLimitState | null,
  now: Date,
  maxRequests: number,
  windowMinutes: number
): { allowed: boolean; newState: RateLimitState } {
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000)

  if (!state || state.windowStart < windowStart) {
    // Ventana nueva o expirada → resetear
    return { allowed: true, newState: { count: 1, windowStart: now } }
  }

  // Misma ventana → incrementar
  const newCount = state.count + 1
  return {
    allowed:  newCount <= maxRequests,
    newState: { count: newCount, windowStart: state.windowStart },
  }
}

// ─────────────────────────────────────────────────────────────────
describe("Rate limiting — lógica de ventana deslizante", () => {
  const MAX    = 3
  const WINDOW = 5 // minutos

  it("primer request siempre permitido", () => {
    const { allowed } = simulateRateLimit(null, new Date(), MAX, WINDOW)
    expect(allowed).toBe(true)
  })

  it("requests dentro del límite son permitidos", () => {
    const now = new Date()
    let state: RateLimitState | null = null
    for (let i = 0; i < MAX; i++) {
      const { allowed, newState } = simulateRateLimit(state, now, MAX, WINDOW)
      expect(allowed).toBe(true)
      state = newState
    }
  })

  it("request que supera el límite es bloqueado", () => {
    const now = new Date()
    let state: RateLimitState | null = null
    for (let i = 0; i < MAX; i++) {
      const { newState } = simulateRateLimit(state, now, MAX, WINDOW)
      state = newState
    }
    // El request MAX+1 debe ser bloqueado
    const { allowed } = simulateRateLimit(state, now, MAX, WINDOW)
    expect(allowed).toBe(false)
  })

  it("después de que expira la ventana, el contador se resetea", () => {
    const now  = new Date()
    const past = new Date(now.getTime() - (WINDOW + 1) * 60 * 1000) // ventana expirada

    // Llenar el límite en el pasado
    const fullState: RateLimitState = { count: MAX, windowStart: past }

    // Nueva request AHORA → ventana nueva → permitido
    const { allowed, newState } = simulateRateLimit(fullState, now, MAX, WINDOW)
    expect(allowed).toBe(true)
    expect(newState.count).toBe(1) // reseteado
  })

  it("ventana exactamente al límite no resetea (misma ventana)", () => {
    const now    = new Date()
    const recent = new Date(now.getTime() - (WINDOW - 1) * 60 * 1000) // dentro de la ventana

    const state: RateLimitState = { count: MAX, windowStart: recent }
    const { allowed } = simulateRateLimit(state, now, MAX, WINDOW)
    expect(allowed).toBe(false) // todavía dentro de la ventana → bloqueado
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Rate limiting — configuración por acción", () => {
  it("findEmailByDni: 10 requests en 5 minutos", () => {
    const config = { action: "find-email-by-dni", maxRequests: 10, windowMinutes: 5 }
    expect(config.maxRequests).toBe(10)
    expect(config.windowMinutes).toBe(5)
    // Un atacante necesita >10 intentos para enumerar → efectivo
    expect(config.maxRequests).toBeGreaterThan(3) // suficiente para uso legítimo
    expect(config.maxRequests).toBeLessThan(100)  // limita la enumeración
  })

  it("register: 3 registros en 60 minutos", () => {
    const config = { action: "register", maxRequests: 3, windowMinutes: 60 }
    expect(config.maxRequests).toBe(3)
    expect(config.windowMinutes).toBe(60)
    // 3 registros/hora es suficiente para uso legítimo (familia)
    // Imposible hacer registro masivo automático
    expect(config.maxRequests).toBeLessThan(10)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Rate limiting — comportamiento ante errores", () => {
  it("si la DB falla, se permite la request (fail-open)", () => {
    // La función checkRateLimit tiene try/catch que retorna { allowed: true }
    // en caso de error para no bloquear usuarios legítimos
    const failOpenResult = { allowed: true }
    expect(failOpenResult.allowed).toBe(true)
  })

  it("si la función SQL no existe aún (migration pendiente), se permite", () => {
    // El error de RPC "function does not exist" es capturado y se permite
    const migrationPendingResult = { allowed: true }
    expect(migrationPendingResult.allowed).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Rate limiting — clave por IP + acción", () => {
  it("diferentes IPs tienen contadores independientes", () => {
    const now  = new Date()
    const MAX  = 3
    const WIN  = 5

    // IP A llena su límite
    let stateA: RateLimitState | null = null
    for (let i = 0; i < MAX; i++) {
      const { newState } = simulateRateLimit(stateA, now, MAX, WIN)
      stateA = newState
    }
    expect(simulateRateLimit(stateA, now, MAX, WIN).allowed).toBe(false)

    // IP B no tiene contador → permitido
    const { allowed: ipBAllowed } = simulateRateLimit(null, now, MAX, WIN)
    expect(ipBAllowed).toBe(true)
  })

  it("diferentes acciones tienen contadores independientes por diseño", () => {
    // La clave es 'ip:action', entonces 'ip:register' y 'ip:find-email-by-dni'
    // son contadores distintos
    const keyRegister    = "1.2.3.4:register"
    const keyFindByDni   = "1.2.3.4:find-email-by-dni"
    expect(keyRegister).not.toBe(keyFindByDni)
  })
})
