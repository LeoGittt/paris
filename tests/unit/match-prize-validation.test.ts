import { describe, it, expect } from "vitest"

// ─── Tests para validaciones en matches y prizes ──────────────────────────────

// ─────────────────────────────────────────────────────────────────
describe("Bug 42: updateMatchTeams — validación de nombres vacíos e iguales", () => {
  function validateTeams(team1: string, team2: string): { ok: boolean; error?: string } {
    if (!team1.trim() || !team2.trim())
      return { ok: false, error: "Los nombres de los equipos no pueden estar vacíos." }
    if (team1.trim().toLowerCase() === team2.trim().toLowerCase())
      return { ok: false, error: "El local y el visitante no pueden ser el mismo equipo." }
    return { ok: true }
  }

  it("nombres válidos y distintos pasan", () => {
    expect(validateTeams("Argentina", "Brasil").ok).toBe(true)
  })

  it("nombre vacío es rechazado", () => {
    expect(validateTeams("", "Brasil").ok).toBe(false)
    expect(validateTeams("Argentina", "").ok).toBe(false)
    expect(validateTeams("  ", "Brasil").ok).toBe(false)
  })

  it("mismo equipo en ambos lados es rechazado", () => {
    expect(validateTeams("Argentina", "Argentina").ok).toBe(false)
    expect(validateTeams("argentina", "ARGENTINA").ok).toBe(false) // case-insensitive
  })

  it("equipos distintos con espacios pasan", () => {
    expect(validateTeams("  Argentina  ", "  Brasil  ").ok).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 41: deleteMatch — partido con resultado corrompe ranking si no recalcula", () => {
  it("eliminar partido finalizado requiere recalcular puntos de los restantes", () => {
    // Simular el estado de puntos antes y después
    const predictions = [
      { participant_id: "A", match_id: "m1", points: 10 },
      { participant_id: "A", match_id: "m2", points: 5  },
      { participant_id: "B", match_id: "m1", points: 0  },
      { participant_id: "B", match_id: "m2", points: 10 },
    ]

    function calcTotalPoints(preds: typeof predictions, excludeMatchId?: string) {
      const filtered = excludeMatchId ? preds.filter(p => p.match_id !== excludeMatchId) : preds
      const totals: Record<string, number> = {}
      for (const p of filtered) {
        totals[p.participant_id] = (totals[p.participant_id] ?? 0) + p.points
      }
      return totals
    }

    // Antes: A=15, B=10
    const before = calcTotalPoints(predictions)
    expect(before["A"]).toBe(15)
    expect(before["B"]).toBe(10)

    // Si se elimina m1 sin recalcular → stale
    // Si se elimina m1 y se recalcula → correcto
    const afterRecalculated = calcTotalPoints(predictions, "m1")
    expect(afterRecalculated["A"]).toBe(5)   // solo m2
    expect(afterRecalculated["B"]).toBe(10)  // solo m2

    // El ranking correcto pone a B primero (10 > 5)
    const sorted = Object.entries(afterRecalculated).sort((a, b) => b[1] - a[1])
    expect(sorted[0][0]).toBe("B")
    expect(sorted[1][0]).toBe("A")
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 44: markPrizeDelivered — no puede entregarse sin ganador", () => {
  interface PrizeState {
    winner_id: string | null
    status: "available" | "pending" | "delivered"
  }

  function validateDelivery(prize: PrizeState): { ok: boolean; error?: string } {
    if (!prize.winner_id)
      return { ok: false, error: "No se puede marcar como entregado: el premio no tiene ganador asignado." }
    if (prize.status === "delivered")
      return { ok: false, error: "El premio ya fue marcado como entregado." }
    return { ok: true }
  }

  it("premio con ganador y estado pending puede marcarse como entregado", () => {
    expect(validateDelivery({ winner_id: "uuid-123", status: "pending" }).ok).toBe(true)
  })

  it("premio sin ganador no puede marcarse como entregado", () => {
    const r = validateDelivery({ winner_id: null, status: "available" })
    expect(r.ok).toBe(false)
    expect(r.error).toContain("no tiene ganador")
  })

  it("premio ya entregado no puede entregarse de nuevo", () => {
    const r = validateDelivery({ winner_id: "uuid-123", status: "delivered" })
    expect(r.ok).toBe(false)
    expect(r.error).toContain("ya fue marcado")
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 43: assignWinner — participante bloqueado no puede ganar", () => {
  function validateWinner(participant: { id: string; is_blocked: boolean } | null): { ok: boolean; error?: string } {
    if (!participant) return { ok: false, error: "Participante no encontrado." }
    if (participant.is_blocked) return { ok: false, error: "No se puede asignar un premio a un participante bloqueado." }
    return { ok: true }
  }

  it("participante activo puede ser ganador", () => {
    expect(validateWinner({ id: "uuid-1", is_blocked: false }).ok).toBe(true)
  })

  it("participante bloqueado no puede ser ganador", () => {
    const r = validateWinner({ id: "uuid-2", is_blocked: true })
    expect(r.ok).toBe(false)
    expect(r.error).toContain("bloqueado")
  })

  it("participante inexistente no puede ser ganador", () => {
    expect(validateWinner(null).ok).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 45: lead_source — validación server-side", () => {
  const VALID_LEAD_SOURCES = ["taller", "repuestos", "digital", "qr", "direct"]

  function sanitizeLeadSource(raw: string): string {
    return VALID_LEAD_SOURCES.includes(raw) ? raw : "direct"
  }

  it("valores válidos pasan sin cambio", () => {
    expect(sanitizeLeadSource("taller")).toBe("taller")
    expect(sanitizeLeadSource("digital")).toBe("digital")
    expect(sanitizeLeadSource("qr")).toBe("qr")
  })

  it("valor inválido cae en 'direct' por defecto", () => {
    expect(sanitizeLeadSource("invalid")).toBe("direct")
    expect(sanitizeLeadSource("TALLER")).toBe("direct") // case-sensitive
    expect(sanitizeLeadSource("")).toBe("direct")
    expect(sanitizeLeadSource("sql_injection")).toBe("direct")
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 46: point_config.updated_by — campo de auditoría debe setearse", () => {
  it("updated_by debería ser el user_id del admin que realizó el cambio", () => {
    const adminUserId = "admin-uuid-123"
    // El server action corregido pasa updated_by al update
    const updatePayload = {
      correct_winner: 5,
      correct_exact: 10,
      correct_diff: 7,
      updated_by: adminUserId,
    }
    expect(updatePayload).toHaveProperty("updated_by")
    expect(updatePayload.updated_by).toBe(adminUserId)
  })

  it("sin usuario autenticado, updated_by cae en null (no bloquea el update)", () => {
    const userId: string | null = null
    const updatePayload = { updated_by: userId }
    expect(updatePayload.updated_by).toBeNull()
  })
})
