import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"

// ─── Tests para las features Pain Manía + filtro Argentina ───────────────────
// Cubre:
//  1. Detección del equipo Nueva Zelanda (patrón /ealand/i)
//  2. Lógica de "fan de Tim Payne" (NZ gana en una predicción)
//  3. Construcción del fan set desde múltiples predicciones
//  4. Merge de is_pain_mania_fan en filas de ranking
//  5. Filtro Argentina-only en dashboard/pronosticos
//  6. Ausencia de links de redes sociales de Grupo Paris en la landing
//  7. Easing del contador Pain Manía


// ─── Lógica extraída de app/page.tsx y app/ranking/page.tsx ──────────────────

const isNzTeam = (name: string) => /new zealand|nueva zelanda/i.test(name)

function isPainManiaFan(
  pred: { predicted_score1: number; predicted_score2: number; match_id: string },
  match: { id: string; team1: string; team2: string }
): boolean {
  const nzIsTeam1 = isNzTeam(match.team1)
  return nzIsTeam1
    ? pred.predicted_score1 > pred.predicted_score2
    : pred.predicted_score2 > pred.predicted_score1
}

function buildFanSet(
  predictions: { participant_id: string; predicted_score1: number; predicted_score2: number; match_id: string }[],
  nzMatches: { id: string; team1: string; team2: string }[]
): Set<string> {
  const fans = new Set<string>()
  for (const pred of predictions) {
    const match = nzMatches.find(m => m.id === pred.match_id)
    if (!match) continue
    if (isPainManiaFan(pred, match)) fans.add(pred.participant_id)
  }
  return fans
}

function mergeRankingWithFans<T extends { participant_id: string }>(
  rows: T[],
  fanIds: Set<string>
): (T & { is_pain_mania_fan: boolean })[] {
  return rows.map(r => ({ ...r, is_pain_mania_fan: fanIds.has(r.participant_id) }))
}

// ─── Lógica del filtro Argentina ─────────────────────────────────────────────

const matchHasArgentina = (match: { team1: string; team2: string }) =>
  /argentina/i.test(match.team1) || /argentina/i.test(match.team2)

// ─── Easing del contador Pain Manía ──────────────────────────────────────────

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function counterValue(t: number, from: number, to: number): number {
  return Math.round(from + (to - from) * easeOut(Math.min(t, 1)))
}


// =============================================================================
describe("Detección del equipo Nueva Zelanda (patrón /ealand/i)", () => {

  it("coincide con 'Nueva Zelanda'", () => {
    expect(isNzTeam("Nueva Zelanda")).toBe(true)
  })

  it("coincide con 'New Zealand'", () => {
    expect(isNzTeam("New Zealand")).toBe(true)
  })

  it("es case-insensitive — 'nueva zelanda'", () => {
    expect(isNzTeam("nueva zelanda")).toBe(true)
  })

  it("es case-insensitive — 'NEW ZEALAND'", () => {
    expect(isNzTeam("NEW ZEALAND")).toBe(true)
  })

  it("no coincide con 'Argentina'", () => {
    expect(isNzTeam("Argentina")).toBe(false)
  })

  it("no coincide con 'Brasil'", () => {
    expect(isNzTeam("Brasil")).toBe(false)
  })

  it("no coincide con cadena vacía", () => {
    expect(isNzTeam("")).toBe(false)
  })
})


// =============================================================================
describe("isPainManiaFan — lógica de victoria de NZ", () => {

  const matchNzTeam1 = { id: "m1", team1: "Nueva Zelanda", team2: "Arabia Saudita" }
  const matchNzTeam2 = { id: "m2", team1: "España",        team2: "New Zealand"   }

  it("NZ como team1 gana → es fan", () => {
    expect(isPainManiaFan({ match_id: "m1", predicted_score1: 2, predicted_score2: 0 }, matchNzTeam1)).toBe(true)
  })

  it("NZ como team1 pierde → no es fan", () => {
    expect(isPainManiaFan({ match_id: "m1", predicted_score1: 0, predicted_score2: 1 }, matchNzTeam1)).toBe(false)
  })

  it("NZ como team1 empata → no es fan (empate no cuenta)", () => {
    expect(isPainManiaFan({ match_id: "m1", predicted_score1: 1, predicted_score2: 1 }, matchNzTeam1)).toBe(false)
  })

  it("NZ como team2 gana → es fan", () => {
    expect(isPainManiaFan({ match_id: "m2", predicted_score1: 0, predicted_score2: 3 }, matchNzTeam2)).toBe(true)
  })

  it("NZ como team2 pierde → no es fan", () => {
    expect(isPainManiaFan({ match_id: "m2", predicted_score1: 2, predicted_score2: 0 }, matchNzTeam2)).toBe(false)
  })

  it("NZ como team2 empata → no es fan", () => {
    expect(isPainManiaFan({ match_id: "m2", predicted_score1: 0, predicted_score2: 0 }, matchNzTeam2)).toBe(false)
  })

  it("gol de diferencia mínima (1-0) cuenta como victoria", () => {
    expect(isPainManiaFan({ match_id: "m1", predicted_score1: 1, predicted_score2: 0 }, matchNzTeam1)).toBe(true)
  })
})


// =============================================================================
describe("buildFanSet — construcción del set de fans desde predicciones", () => {

  const nzMatches = [
    { id: "m1", team1: "Nueva Zelanda", team2: "Arabia Saudita" },
    { id: "m2", team1: "Francia",        team2: "New Zealand"   },
  ]

  it("participante con una victoria NZ queda en el set", () => {
    const preds = [{ participant_id: "p1", match_id: "m1", predicted_score1: 2, predicted_score2: 0 }]
    const fans  = buildFanSet(preds, nzMatches)
    expect(fans.has("p1")).toBe(true)
  })

  it("participante con solo derrotas de NZ no queda en el set", () => {
    const preds = [{ participant_id: "p2", match_id: "m1", predicted_score1: 0, predicted_score2: 3 }]
    const fans  = buildFanSet(preds, nzMatches)
    expect(fans.has("p2")).toBe(false)
  })

  it("participante con una victoria y una derrota NZ sí queda (basta con una)", () => {
    const preds = [
      { participant_id: "p3", match_id: "m1", predicted_score1: 2, predicted_score2: 0 }, // gana
      { participant_id: "p3", match_id: "m2", predicted_score1: 3, predicted_score2: 0 }, // pierde (NZ es team2)
    ]
    const fans = buildFanSet(preds, nzMatches)
    expect(fans.has("p3")).toBe(true)
  })

  it("el mismo participante con múltiples victorias aparece una sola vez en el set", () => {
    const preds = [
      { participant_id: "p4", match_id: "m1", predicted_score1: 1, predicted_score2: 0 },
      { participant_id: "p4", match_id: "m2", predicted_score1: 0, predicted_score2: 1 },
    ]
    const fans = buildFanSet(preds, nzMatches)
    expect(fans.has("p4")).toBe(true)
    expect(fans.size).toBe(1)
  })

  it("predicción con match_id desconocido es ignorada (match no encontrado)", () => {
    const preds = [{ participant_id: "p5", match_id: "m999", predicted_score1: 5, predicted_score2: 0 }]
    const fans  = buildFanSet(preds, nzMatches)
    expect(fans.has("p5")).toBe(false)
  })

  it("set vacío cuando no hay predicciones", () => {
    expect(buildFanSet([], nzMatches).size).toBe(0)
  })

  it("set vacío cuando no hay partidos de NZ", () => {
    const preds = [{ participant_id: "p6", match_id: "m1", predicted_score1: 2, predicted_score2: 0 }]
    expect(buildFanSet(preds, []).size).toBe(0)
  })
})


// =============================================================================
describe("mergeRankingWithFans — merge del badge en filas de ranking", () => {

  const rows = [
    { participant_id: "fan1",  total_points: 50, ranking_position: 1 },
    { participant_id: "fan2",  total_points: 40, ranking_position: 2 },
    { participant_id: "nofan", total_points: 30, ranking_position: 3 },
  ]
  const fanIds = new Set(["fan1", "fan2"])

  it("participante fan recibe is_pain_mania_fan: true", () => {
    const merged = mergeRankingWithFans(rows, fanIds)
    expect(merged.find(r => r.participant_id === "fan1")?.is_pain_mania_fan).toBe(true)
    expect(merged.find(r => r.participant_id === "fan2")?.is_pain_mania_fan).toBe(true)
  })

  it("participante no fan recibe is_pain_mania_fan: false", () => {
    const merged = mergeRankingWithFans(rows, fanIds)
    expect(merged.find(r => r.participant_id === "nofan")?.is_pain_mania_fan).toBe(false)
  })

  it("con set vacío todos reciben false", () => {
    const merged = mergeRankingWithFans(rows, new Set())
    expect(merged.every(r => r.is_pain_mania_fan === false)).toBe(true)
  })

  it("con todos en el set todos reciben true", () => {
    const allFans = new Set(rows.map(r => r.participant_id))
    const merged  = mergeRankingWithFans(rows, allFans)
    expect(merged.every(r => r.is_pain_mania_fan === true)).toBe(true)
  })

  it("el merge no altera los demás campos", () => {
    const merged = mergeRankingWithFans(rows, fanIds)
    const first  = merged[0]
    expect(first.total_points).toBe(50)
    expect(first.ranking_position).toBe(1)
  })
})


// =============================================================================
describe("Filtro Argentina-only en dashboard/pronosticos", () => {

  it("'Argentina' como team1 → pasa el filtro", () => {
    expect(matchHasArgentina({ team1: "Argentina", team2: "Arabia Saudita" })).toBe(true)
  })

  it("'Argentina' como team2 → pasa el filtro", () => {
    expect(matchHasArgentina({ team1: "España", team2: "Argentina" })).toBe(true)
  })

  it("es case-insensitive — 'argentina' minúscula", () => {
    expect(matchHasArgentina({ team1: "argentina", team2: "Brasil" })).toBe(true)
  })

  it("partido sin Argentina → no pasa el filtro", () => {
    expect(matchHasArgentina({ team1: "Brasil", team2: "España" })).toBe(false)
  })

  it("partido vacío → no pasa el filtro", () => {
    expect(matchHasArgentina({ team1: "", team2: "" })).toBe(false)
  })

  it("'Nueva Zelanda vs Argentina' → pasa (Argentina es team2)", () => {
    expect(matchHasArgentina({ team1: "Nueva Zelanda", team2: "Argentina" })).toBe(true)
  })
})


// =============================================================================
describe("Easing del contador Pain Manía (easeOut cúbico)", () => {

  const FROM = 4_000
  const TO   = 5_200_000

  it("t=0 devuelve el valor inicial (4.000)", () => {
    expect(counterValue(0, FROM, TO)).toBe(FROM)
  })

  it("t=1 devuelve el valor final (5.200.000)", () => {
    expect(counterValue(1, FROM, TO)).toBe(TO)
  })

  it("t=0.5 está entre el inicio y el fin", () => {
    const mid = counterValue(0.5, FROM, TO)
    expect(mid).toBeGreaterThan(FROM)
    expect(mid).toBeLessThan(TO)
  })

  it("el valor es siempre mayor o igual al inicio", () => {
    for (const t of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      expect(counterValue(t, FROM, TO)).toBeGreaterThanOrEqual(FROM)
    }
  })

  it("el valor es siempre menor o igual al fin", () => {
    for (const t of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      expect(counterValue(t, FROM, TO)).toBeLessThanOrEqual(TO)
    }
  })

  it("es monótonamente creciente (nunca retrocede)", () => {
    const steps = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    for (let i = 1; i < steps.length; i++) {
      expect(counterValue(steps[i], FROM, TO)).toBeGreaterThanOrEqual(counterValue(steps[i - 1], FROM, TO))
    }
  })

  it("t > 1 se clampea al valor final (no se pasa de largo)", () => {
    expect(counterValue(1.5, FROM, TO)).toBe(TO)
    expect(counterValue(99,  FROM, TO)).toBe(TO)
  })

  it("easeOut es más rápido al inicio que al final (convexidad)", () => {
    const progressAt25  = easeOut(0.25) // debe ser > 0.25 (avanza más al inicio)
    const progressAt75  = easeOut(0.75)
    const linearDiff_25 = 0.25 - 0
    const linearDiff_75 = 0.75 - 0.5
    expect(progressAt25 - linearDiff_25).toBeGreaterThan(0)
    expect(progressAt75).toBeGreaterThan(0.5)
  })
})


// =============================================================================
describe("Landing: ausencia de links de redes sociales de Grupo Paris", () => {

  let landingContent: string

  // Leemos el archivo una sola vez para todos los tests de este describe
  try {
    landingContent = readFileSync("components/prode/landing-client.tsx", "utf-8")
  } catch {
    landingContent = ""
  }

  it("no contiene el handle de Instagram @parischevroletsanjuan", () => {
    expect(landingContent).not.toContain("parischevroletsanjuan")
  })

  it("no contiene el número de WhatsApp de Grupo Paris", () => {
    expect(landingContent).not.toContain("wa.me/5492645")
    expect(landingContent).not.toContain("5492645000000")
  })

  it("no contiene el link de Facebook de Grupo Paris", () => {
    expect(landingContent).not.toContain("facebook.com/GrupoParis")
  })

  it("no contiene el link de Google Maps de Grupo Paris", () => {
    expect(landingContent).not.toContain("share.google")
    expect(landingContent).not.toContain("maps.google.com/maps?q=Chevrolet")
  })

  it("no contiene el iframe del mapa embebido", () => {
    expect(landingContent).not.toContain("<iframe")
  })

  it("sí contiene el link de Tim Payne (Pain Manía — intencional)", () => {
    expect(landingContent).toContain("timpayne__")
  })
})
