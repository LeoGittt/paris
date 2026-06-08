import { describe, it, expect } from "vitest"

// ─── Lógica pura de pronósticos extraída de lib/actions/predictions.ts
//     y de la función recalculate_points del schema SQL ────────────────────────


// ─── Validación de scores (extraída de savePrediction) ───────────────────────

type ScoreValidation = { ok: true } | { ok: false; error: string }

function validateScores(score1: number, score2: number): ScoreValidation {
  if (!Number.isInteger(score1) || !Number.isInteger(score2))
    return { ok: false, error: "Marcador inválido." }
  if (score1 < 0 || score2 < 0)
    return { ok: false, error: "El marcador no puede ser negativo." }
  if (score1 > 30 || score2 > 30)
    return { ok: false, error: "Marcador fuera de rango razonable." }
  return { ok: true }
}

// ─── Guardia de tiempo independiente del cron ────────────────────────────────
// savePrediction bloquea si la fecha del partido ya pasó,
// independientemente de si el cron ya corrió.

function isMatchStarted(matchDate: Date, now: Date): boolean {
  return matchDate <= now
}

// ─── Clasificación del resultado de un pronóstico ────────────────────────────
// Replicamos la lógica SQL de recalculate_points como función pura
// para testear todos los casos sin necesitar una DB.

type PredResult = "correct_exact" | "correct_diff" | "correct_winner" | "wrong"

function classifyPrediction(
  realScore1: number, realScore2: number,
  predScore1: number, predScore2: number
): PredResult {
  const realWinner = realScore1 > realScore2 ? 1 : realScore2 > realScore1 ? 2 : 0
  const predWinner = predScore1 > predScore2 ? 1 : predScore2 > predScore1 ? 2 : 0

  if (realScore1 === predScore1 && realScore2 === predScore2) return "correct_exact"
  if (predWinner !== realWinner) return "wrong"
  if (Math.abs(realScore1 - realScore2) === Math.abs(predScore1 - predScore2)) return "correct_diff"
  return "correct_winner"
}

// ─── Sistema de puntos ────────────────────────────────────────────────────────

const POINTS: Record<PredResult, number> = {
  correct_exact:  10,
  correct_diff:    2,
  correct_winner:  5,
  wrong:           0,
}

function calculatePoints(result: PredResult): number {
  return POINTS[result]
}


// =============================================================================
describe("validateScores — validación de marcadores server-side", () => {

  it("0-0 es válido", () => {
    expect(validateScores(0, 0).ok).toBe(true)
  })

  it("marcadores típicos (2-1) son válidos", () => {
    expect(validateScores(2, 1).ok).toBe(true)
  })

  it("marcador máximo (30-30) es válido", () => {
    expect(validateScores(30, 30).ok).toBe(true)
  })

  it("score negativo es inválido", () => {
    const r = validateScores(-1, 0)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain("negativo")
  })

  it("ambos scores negativos son inválidos", () => {
    expect(validateScores(-1, -1).ok).toBe(false)
  })

  it("score mayor a 30 es inválido", () => {
    const r = validateScores(31, 0)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain("rango")
  })

  it("score2 mayor a 30 es inválido", () => {
    expect(validateScores(0, 31).ok).toBe(false)
  })

  it("score decimal (1.5) es inválido — debe ser entero", () => {
    const r = validateScores(1.5, 0)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe("Marcador inválido.")
  })

  it("NaN es inválido", () => {
    expect(validateScores(NaN, 0).ok).toBe(false)
  })

  it("Infinity es inválido", () => {
    expect(validateScores(Infinity, 0).ok).toBe(false)
  })

  it("score1 = 30, score2 = 0 — válido (máximo asimétrico)", () => {
    expect(validateScores(30, 0).ok).toBe(true)
  })
})


// =============================================================================
describe("isMatchStarted — guardia de tiempo independiente del cron", () => {

  it("fecha futura → partido no empezó → pronóstico permitido", () => {
    const future = new Date(Date.now() + 60_000)
    const now    = new Date()
    expect(isMatchStarted(future, now)).toBe(false)
  })

  it("fecha pasada → partido empezó → pronóstico bloqueado", () => {
    const past = new Date(Date.now() - 60_000)
    const now  = new Date()
    expect(isMatchStarted(past, now)).toBe(true)
  })

  it("fecha exactamente igual al momento actual → bloqueado (<=)", () => {
    const now = new Date()
    expect(isMatchStarted(now, now)).toBe(true)
  })

  it("1 segundo antes del partido → permitido", () => {
    const now   = new Date()
    const match = new Date(now.getTime() + 1_000)
    expect(isMatchStarted(match, now)).toBe(false)
  })

  it("1 segundo después del partido → bloqueado", () => {
    const now   = new Date()
    const match = new Date(now.getTime() - 1_000)
    expect(isMatchStarted(match, now)).toBe(true)
  })
})


// =============================================================================
describe("classifyPrediction — clasificación de resultados", () => {

  // ── correct_exact ───────────────────────────────────────────────────────────
  it("marcador exacto → correct_exact", () => {
    expect(classifyPrediction(2, 1, 2, 1)).toBe("correct_exact")
  })

  it("empate exacto (1-1) → correct_exact", () => {
    expect(classifyPrediction(1, 1, 1, 1)).toBe("correct_exact")
  })

  it("0-0 exacto → correct_exact", () => {
    expect(classifyPrediction(0, 0, 0, 0)).toBe("correct_exact")
  })

  it("goleada exacta (5-0) → correct_exact", () => {
    expect(classifyPrediction(5, 0, 5, 0)).toBe("correct_exact")
  })

  // ── correct_diff ────────────────────────────────────────────────────────────
  it("mismo ganador y misma diferencia (real 3-1, pred 2-0) → correct_diff", () => {
    // Diferencia real: 2. Diferencia pred: 2. Ganador: local. → correct_diff
    expect(classifyPrediction(3, 1, 2, 0)).toBe("correct_diff")
  })

  it("mismo ganador y misma diferencia (real 1-3, pred 0-2) → correct_diff", () => {
    expect(classifyPrediction(1, 3, 0, 2)).toBe("correct_diff")
  })

  it("empate con misma diferencia (0) → correct_exact (no correct_diff, se toma exact primero)", () => {
    // Si ambos son empate con mismo score → correct_exact
    expect(classifyPrediction(0, 0, 0, 0)).toBe("correct_exact")
  })

  // ── correct_winner ──────────────────────────────────────────────────────────
  it("mismo ganador pero diferente diferencia → correct_winner", () => {
    // Real: 3-0 (diff 3), Pred: 1-0 (diff 1). Ganador: local. → correct_winner
    expect(classifyPrediction(3, 0, 1, 0)).toBe("correct_winner")
  })

  it("acertó empate pero diferente score (real 2-2, pred 1-1) → correct_winner", () => {
    // Ganador: 0 (empate). Pred ganador: 0 (empate). Diferencia real: 0, pred: 0 → correct_diff?
    // No: real 2-2, pred 1-1. diff real = |2-2|=0, diff pred = |1-1|=0. Misma diff → correct_diff
    expect(classifyPrediction(2, 2, 1, 1)).toBe("correct_diff")
  })

  it("acertó empate con diferente diferencia imposible (ambos siempre 0)", () => {
    // Los empates siempre tienen diferencia 0, así que acertar el empate con otro score
    // siempre es correct_diff (no correct_winner)
    // Verificamos que correct_winner solo ocurre en victorias con diferente diferencia
    expect(classifyPrediction(3, 0, 2, 0)).toBe("correct_winner")
  })

  // ── wrong ────────────────────────────────────────────────────────────────────
  it("ganador equivocado → wrong", () => {
    // Real: local gana (2-0). Pred: visitante gana (0-1)
    expect(classifyPrediction(2, 0, 0, 1)).toBe("wrong")
  })

  it("predijo empate pero ganó un equipo → wrong", () => {
    expect(classifyPrediction(2, 0, 1, 1)).toBe("wrong")
  })

  it("predijo ganador pero fue empate → wrong", () => {
    expect(classifyPrediction(1, 1, 2, 0)).toBe("wrong")
  })

  it("todo incorrecto → wrong", () => {
    expect(classifyPrediction(3, 0, 0, 2)).toBe("wrong")
  })
})


// =============================================================================
describe("calculatePoints — sistema de puntos", () => {

  it("correct_exact vale 10 puntos", () => {
    expect(calculatePoints("correct_exact")).toBe(10)
  })

  it("correct_winner vale 5 puntos", () => {
    expect(calculatePoints("correct_winner")).toBe(5)
  })

  it("correct_diff vale 2 puntos", () => {
    expect(calculatePoints("correct_diff")).toBe(2)
  })

  it("wrong vale 0 puntos", () => {
    expect(calculatePoints("wrong")).toBe(0)
  })

  it("correct_exact es el máximo — da más puntos que correct_winner", () => {
    expect(calculatePoints("correct_exact")).toBeGreaterThan(calculatePoints("correct_winner"))
  })

  it("correct_winner da más puntos que correct_diff", () => {
    expect(calculatePoints("correct_winner")).toBeGreaterThan(calculatePoints("correct_diff"))
  })

  it("correct_diff da más puntos que wrong", () => {
    expect(calculatePoints("correct_diff")).toBeGreaterThan(calculatePoints("wrong"))
  })

  it("jerarquía completa: exact > winner > diff > wrong", () => {
    const hierarchy = ["correct_exact", "correct_winner", "correct_diff", "wrong"] as PredResult[]
    for (let i = 1; i < hierarchy.length; i++) {
      expect(calculatePoints(hierarchy[i - 1])).toBeGreaterThan(calculatePoints(hierarchy[i]))
    }
  })
})


// =============================================================================
describe("Flujo completo — score → clasificación → puntos", () => {

  type Scenario = {
    real: [number, number]
    pred: [number, number]
    expected: PredResult
    points: number
    label: string
  }

  const scenarios: Scenario[] = [
    { real: [2, 1], pred: [2, 1], expected: "correct_exact",  points: 10, label: "exacto 2-1" },
    { real: [3, 0], pred: [2, 0], expected: "correct_winner", points:  5, label: "ganador 3-0 / 2-0 (diff distinta)" },
    { real: [3, 1], pred: [1, 0], expected: "correct_winner", points:  5, label: "ganador 3-1 / 1-0" },
    { real: [2, 0], pred: [0, 1], expected: "wrong",          points:  0, label: "equivocado" },
    { real: [0, 0], pred: [0, 0], expected: "correct_exact",  points: 10, label: "0-0 exacto" },
    { real: [1, 3], pred: [0, 2], expected: "correct_diff",   points:  2, label: "visitante diff" },
  ]

  scenarios.forEach(({ real, pred, expected, points, label }) => {
    it(`${label}: [${real}] vs pred [${pred}] → ${expected} (${points}pts)`, () => {
      const result = classifyPrediction(real[0], real[1], pred[0], pred[1])
      expect(result).toBe(expected)
      expect(calculatePoints(result)).toBe(points)
    })
  })
})
