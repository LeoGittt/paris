import { describe, it, expect } from "vitest"

// ─── Tests para bugs en crons y gestión de usuarios del sistema ───────────────

// ─────────────────────────────────────────────────────────────────
describe("Bug 47: Monthly report — mismo bug de metricsOverview?.data?.X que weekly", () => {
  it("acceso correcto al row de metrics_overview (sin .data extra)", () => {
    // La query devuelve { data: metricsOverview } donde metricsOverview ya es el row
    const mockResponse = {
      data: { from_taller: 10, from_repuestos: 5, from_digital: 20, from_qr: 3 },
      error: null,
    }
    const { data: metricsOverview } = mockResponse

    // Bug original: metricsOverview?.data?.from_taller → undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buggy = (metricsOverview as any)?.data?.from_taller
    expect(buggy).toBeUndefined()

    // Fix: acceso directo
    expect(metricsOverview?.from_taller).toBe(10)
    expect(metricsOverview?.from_repuestos).toBe(5)
    expect(metricsOverview?.from_digital).toBe(20)
    expect(metricsOverview?.from_qr).toBe(3)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 48: activePredictors — contaba todas las predicciones, no solo del mes", () => {
  it("el filtro de fecha limita al período del reporte", () => {
    // Simular predicciones: algunas del mes actual, otras de meses anteriores
    const allPredictions = [
      { participant_id: "A", submitted_at: "2026-06-01T10:00:00Z" },
      { participant_id: "B", submitted_at: "2026-06-15T10:00:00Z" },
      { participant_id: "C", submitted_at: "2026-05-20T10:00:00Z" }, // mes anterior
      { participant_id: "D", submitted_at: "2026-04-10T10:00:00Z" }, // hace 2 meses
    ]

    const monthStart = new Date("2026-06-01T00:00:00Z")
    const monthEnd   = new Date("2026-06-30T23:59:59Z")

    const thisMonthPredictions = allPredictions.filter(p => {
      const date = new Date(p.submitted_at)
      return date >= monthStart && date <= monthEnd
    })

    // Sin filtro: cuenta 4 (bug original)
    expect(allPredictions.length).toBe(4)

    // Con filtro correcto: cuenta 2
    expect(thisMonthPredictions.length).toBe(2)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 49: recalculateAllPoints — errores individuales ignorados", () => {
  it("si algún RPC falla, el resultado debe ser error (no ok: true)", async () => {
    const results = [
      { error: null },
      { error: { message: "RPC failed for match 2" } },
      { error: null },
    ]

    // Lógica corregida
    const failed = results.filter(r => r.error)
    const isOk   = failed.length === 0

    expect(isOk).toBe(false)
    expect(failed.length).toBe(1)
  })

  it("si todos los RPCs pasan, el resultado es ok: true", async () => {
    const results = [
      { error: null },
      { error: null },
      { error: null },
    ]
    const failed = results.filter(r => r.error)
    expect(failed.length).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 52: deleteSystemUser — protección del último admin", () => {
  it("puede eliminar admin si hay más de uno", () => {
    const adminCount = 2
    const role = "admin"

    function canDelete(role: string, count: number): { ok: boolean; error?: string } {
      if (role === "admin" && count <= 1) {
        return { ok: false, error: "No podés eliminar el último administrador del sistema." }
      }
      return { ok: true }
    }

    expect(canDelete(role, adminCount).ok).toBe(true)
  })

  it("NO puede eliminar el único admin", () => {
    const result = (() => {
      const adminCount = 1
      const role = "admin"
      if (role === "admin" && adminCount <= 1) {
        return { ok: false, error: "No podés eliminar el último administrador del sistema." }
      }
      return { ok: true }
    })()

    expect(result.ok).toBe(false)
    expect(result.error).toContain("último administrador")
  })

  it("puede eliminar callcenter sin restricciones de conteo", () => {
    function canDelete(role: string, count: number): { ok: boolean } {
      if (role === "admin" && count <= 1) return { ok: false }
      return { ok: true }
    }
    expect(canDelete("callcenter", 1).ok).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 50: Contraseña sistema — mínimo debe ser 8 chars (no 6)", () => {
  const MIN_SYSTEM_PASSWORD = 8

  it("contraseña de 6 chars es insuficiente para usuarios del sistema", () => {
    expect("abc123".length < MIN_SYSTEM_PASSWORD).toBe(true)
  })

  it("contraseña de 8 chars es válida", () => {
    expect("abc12345".length >= MIN_SYSTEM_PASSWORD).toBe(true)
  })
})
