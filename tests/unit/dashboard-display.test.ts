import { describe, it, expect } from "vitest"

// ─── Lógica de display del dashboard extraída de app/dashboard/page.tsx ──────


// ─── Mapeo resultado → display ────────────────────────────────────────────────

type PredResult = "correct_exact" | "correct_winner" | "correct_diff" | "wrong" | "pending"

interface ResultDisplay {
  label: string
  isPositive: boolean | null  // null = pendiente (neutral)
}

function getResultDisplay(result: PredResult, pointsEarned: number): ResultDisplay {
  const map: Record<PredResult, ResultDisplay> = {
    correct_exact:  { label: `+${pointsEarned}pts`, isPositive: true  },
    correct_winner: { label: `+${pointsEarned}pts`, isPositive: true  },
    correct_diff:   { label: `+${pointsEarned}pts`, isPositive: true  },
    wrong:          { label: "0pts",                isPositive: false },
    pending:        { label: "Pendiente",           isPositive: null  },
  }
  return map[result] ?? { label: "Pendiente", isPositive: null }
}

// ─── Formateo de fechas de partidos ───────────────────────────────────────────

function formatMatchDate(isoDate: string, tz = "America/Argentina/Buenos_Aires") {
  const date = new Date(isoDate)
  return {
    date: date.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "short", timeZone: tz }),
    time: date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: tz }),
  }
}

// ─── Formateo de posición en ranking ─────────────────────────────────────────

function formatRankingPosition(pos: number | null): string {
  return pos ? `#${pos}` : "—"
}

// ─── Lógica de stats fallback ─────────────────────────────────────────────────

interface RawStats {
  total_points?: number
  ranking_position?: number | null
  predictions_count?: number
  correct_exact?: number
  correct_winner?: number
}

interface ParticipantBase {
  total_points: number
  ranking_position: number | null
}

function resolveStats(statsRows: RawStats[] | null | undefined, participant: ParticipantBase): RawStats {
  return statsRows?.[0] ?? {
    total_points:     participant.total_points,
    ranking_position: participant.ranking_position,
    predictions_count: 0,
    correct_exact: 0,
    correct_winner: 0,
  }
}

// ─── Normalización del nombre de bienvenida ───────────────────────────────────

function formatWelcomeName(firstName: string): string {
  return String(firstName).toUpperCase()
}


// =============================================================================
describe("getResultDisplay — mapeo de resultado a label y color", () => {

  it("correct_exact con 10 puntos → '+10pts', positivo", () => {
    const d = getResultDisplay("correct_exact", 10)
    expect(d.label).toBe("+10pts")
    expect(d.isPositive).toBe(true)
  })

  it("correct_winner con 5 puntos → '+5pts', positivo", () => {
    const d = getResultDisplay("correct_winner", 5)
    expect(d.label).toBe("+5pts")
    expect(d.isPositive).toBe(true)
  })

  it("correct_diff con 2 puntos → '+2pts', positivo", () => {
    const d = getResultDisplay("correct_diff", 2)
    expect(d.label).toBe("+2pts")
    expect(d.isPositive).toBe(true)
  })

  it("wrong → '0pts', negativo (sin importar points_earned)", () => {
    const d = getResultDisplay("wrong", 0)
    expect(d.label).toBe("0pts")
    expect(d.isPositive).toBe(false)
  })

  it("wrong con points_earned!=0 sigue mostrando '0pts' (el 0 es fijo)", () => {
    const d = getResultDisplay("wrong", 5) // no debería ocurrir pero lo defendemos
    expect(d.label).toBe("0pts")
  })

  it("pending → 'Pendiente', isPositive null (neutro)", () => {
    const d = getResultDisplay("pending", 0)
    expect(d.label).toBe("Pendiente")
    expect(d.isPositive).toBeNull()
  })

  it("resultado desconocido → fallback a 'Pendiente'", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = getResultDisplay("unknown_result" as any, 0)
    expect(d.label).toBe("Pendiente")
    expect(d.isPositive).toBeNull()
  })

  it("todos los resultados positivos usan el valor real de pointsEarned", () => {
    expect(getResultDisplay("correct_exact",  10).label).toBe("+10pts")
    expect(getResultDisplay("correct_winner",  5).label).toBe("+5pts")
    expect(getResultDisplay("correct_diff",    2).label).toBe("+2pts")
  })
})


// =============================================================================
describe("formatRankingPosition — display de posición en ranking", () => {

  it("posición 1 → '#1'", () => {
    expect(formatRankingPosition(1)).toBe("#1")
  })

  it("posición 50 → '#50'", () => {
    expect(formatRankingPosition(50)).toBe("#50")
  })

  it("posición null → '—' (sin ranking todavía)", () => {
    expect(formatRankingPosition(null)).toBe("—")
  })

  it("posición 0 → '—' (0 es falsy, tratado como sin posición)", () => {
    expect(formatRankingPosition(0)).toBe("—")
  })
})


// =============================================================================
describe("resolveStats — fallback cuando get_participant_stats no retorna datos", () => {

  const participant: ParticipantBase = { total_points: 42, ranking_position: 7 }

  it("con statsRows vacío usa datos del participante como fallback", () => {
    const s = resolveStats([], participant)
    expect(s.total_points).toBe(42)
    expect(s.ranking_position).toBe(7)
    expect(s.predictions_count).toBe(0)
    expect(s.correct_exact).toBe(0)
    expect(s.correct_winner).toBe(0)
  })

  it("con statsRows null usa datos del participante", () => {
    const s = resolveStats(null, participant)
    expect(s.total_points).toBe(42)
  })

  it("con statsRows undefined usa datos del participante", () => {
    const s = resolveStats(undefined, participant)
    expect(s.total_points).toBe(42)
  })

  it("con statsRows con datos usa los datos de la RPC", () => {
    const rpcData = { total_points: 99, ranking_position: 1, predictions_count: 30, correct_exact: 5, correct_winner: 8 }
    const s = resolveStats([rpcData], participant)
    expect(s.total_points).toBe(99)
    expect(s.ranking_position).toBe(1)
    expect(s.predictions_count).toBe(30)
  })

  it("predictions_count de fallback es 0 (no hay pronósticos)", () => {
    const s = resolveStats(null, participant)
    expect(s.predictions_count).toBe(0)
  })
})


// =============================================================================
describe("formatWelcomeName — nombre de bienvenida en mayúsculas", () => {

  it("nombre normal → mayúsculas", () => {
    expect(formatWelcomeName("Juan")).toBe("JUAN")
  })

  it("nombre ya en mayúsculas no cambia", () => {
    expect(formatWelcomeName("CARLOS")).toBe("CARLOS")
  })

  it("nombre en minúsculas → mayúsculas", () => {
    expect(formatWelcomeName("maria")).toBe("MARIA")
  })

  it("nombre con acentos → mayúsculas", () => {
    expect(formatWelcomeName("José")).toBe("JOSÉ")
  })

  it("nombre con espacios → respeta los espacios", () => {
    expect(formatWelcomeName("Juan Carlos")).toBe("JUAN CARLOS")
  })
})


// =============================================================================
describe("formatMatchDate — formateo de fecha/hora de partidos (tz Argentina)", () => {

  it("devuelve objeto con date y time", () => {
    const result = formatMatchDate("2026-06-14T20:00:00Z")
    expect(result).toHaveProperty("date")
    expect(result).toHaveProperty("time")
  })

  it("date es string no vacía", () => {
    const { date } = formatMatchDate("2026-06-14T20:00:00Z")
    expect(typeof date).toBe("string")
    expect(date.length).toBeGreaterThan(0)
  })

  it("time tiene formato HH:MM", () => {
    const { time } = formatMatchDate("2026-06-14T20:00:00Z")
    expect(/\d{1,2}:\d{2}/.test(time)).toBe(true)
  })

  it("fecha UTC se convierte a hora argentina (UTC-3, distinta de UTC)", () => {
    // 20:00 UTC → 17:00 ART. Solo verificamos que la conversión ocurrió
    // (el resultado no es la hora UTC literal "20:00")
    const { time } = formatMatchDate("2026-06-14T20:00:00Z")
    expect(time).not.toContain("20:00")  // no debe quedar en UTC
    expect(/\d{1,2}[:h]\d{2}/.test(time)).toBe(true)
  })

  it("fecha inválida no rompe — devuelve 'Invalid Date' en lugar de throw", () => {
    // No debe tirar excepción — el display degradará graciosamente
    expect(() => formatMatchDate("not-a-date")).not.toThrow()
  })
})


// =============================================================================
describe("revalidate — páginas con cache ISR correctamente configuradas", () => {
  const { readFileSync } = require("fs")

  it("landing page (app/page.tsx) tiene revalidate", () => {
    const content = readFileSync("app/page.tsx", "utf-8")
    expect(content).toContain("revalidate")
  })

  it("landing page tiene revalidate <= 60 (no más de 1 minuto sin actualizar)", () => {
    const content = readFileSync("app/page.tsx", "utf-8") as string
    const match = content.match(/revalidate\s*=\s*(\d+)/)
    const seconds = match ? parseInt(match[1]) : Infinity
    expect(seconds).toBeLessThanOrEqual(60)
  })

  it("ranking page (app/ranking/page.tsx) tiene revalidate", () => {
    const content = readFileSync("app/ranking/page.tsx", "utf-8")
    expect(content).toContain("revalidate")
  })

  it("ranking page tiene revalidate <= 60", () => {
    const content = readFileSync("app/ranking/page.tsx", "utf-8") as string
    const match = content.match(/revalidate\s*=\s*(\d+)/)
    const seconds = match ? parseInt(match[1]) : Infinity
    expect(seconds).toBeLessThanOrEqual(60)
  })
})
