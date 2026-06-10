import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"

// ─── Tests Pain Manía — votación ─────────────────────────────────────────────
// Cubre:
//  1. Lógica de conteo y porcentajes
//  2. Valores válidos de voto
//  3. Estructura del Server Action
//  4. Migración SQL correcta
//  5. Texto del modal (sin "ni en pedo", con "No anota")


// ─── Lógica extraída del componente PainManiaVote ────────────────────────────

function calcPct(si: number, no: number) {
  const total = si + no
  if (total === 0) return { si: 50, no: 50, total: 0 }
  const pctSi = Math.round((si / total) * 100)
  return { si: pctSi, no: 100 - pctSi, total }
}

const VALID_VOTES = ["si", "no"] as const
type Vote = typeof VALID_VOTES[number]

function isValidVote(v: unknown): v is Vote {
  return v === "si" || v === "no"
}

// Simula la lógica de localStorage anti-duplicados
function canVote(stored: string | null): boolean {
  return stored !== "si" && stored !== "no"
}


// =============================================================================
describe("calcPct — cálculo de porcentajes de votación", () => {

  it("sin votos devuelve 50/50", () => {
    const r = calcPct(0, 0)
    expect(r.si).toBe(50)
    expect(r.no).toBe(50)
    expect(r.total).toBe(0)
  })

  it("todos votan sí → 100% / 0%", () => {
    const r = calcPct(100, 0)
    expect(r.si).toBe(100)
    expect(r.no).toBe(0)
  })

  it("todos votan no → 0% / 100%", () => {
    const r = calcPct(0, 100)
    expect(r.si).toBe(0)
    expect(r.no).toBe(100)
  })

  it("distribución exacta 50/50", () => {
    const r = calcPct(50, 50)
    expect(r.si).toBe(50)
    expect(r.no).toBe(50)
  })

  it("si + no siempre suma 100", () => {
    for (const [si, no] of [[1, 3], [7, 2], [99, 1], [33, 67]]) {
      const r = calcPct(si, no)
      expect(r.si + r.no).toBe(100)
    }
  })

  it("conteo total es la suma", () => {
    const r = calcPct(8241, 1423)
    expect(r.total).toBe(9664)
  })

  it("redondea correctamente (no flota en decimales)", () => {
    const r = calcPct(1, 3)
    expect(Number.isInteger(r.si)).toBe(true)
    expect(Number.isInteger(r.no)).toBe(true)
  })
})


// =============================================================================
describe("isValidVote — validación de valor de voto", () => {

  it("'si' es válido", () => {
    expect(isValidVote("si")).toBe(true)
  })

  it("'no' es válido", () => {
    expect(isValidVote("no")).toBe(true)
  })

  it("string arbitrario no es válido", () => {
    expect(isValidVote("maybe")).toBe(false)
  })

  it("cadena vacía no es válida", () => {
    expect(isValidVote("")).toBe(false)
  })

  it("null no es válido", () => {
    expect(isValidVote(null)).toBe(false)
  })

  it("undefined no es válido", () => {
    expect(isValidVote(undefined)).toBe(false)
  })

  it("número no es válido", () => {
    expect(isValidVote(1)).toBe(false)
  })
})


// =============================================================================
describe("canVote — anti-duplicados con localStorage", () => {

  it("null (sin voto previo) → puede votar", () => {
    expect(canVote(null)).toBe(true)
  })

  it("'si' guardado → no puede votar de nuevo", () => {
    expect(canVote("si")).toBe(false)
  })

  it("'no' guardado → no puede votar de nuevo", () => {
    expect(canVote("no")).toBe(false)
  })

  it("valor inválido en localStorage → puede votar (dato corrupto)", () => {
    expect(canVote("maybe")).toBe(true)
    expect(canVote("")).toBe(true)
  })
})


// =============================================================================
describe("Server Action — estructura del archivo pain-mania.ts", () => {

  let content: string

  try {
    content = readFileSync("lib/actions/pain-mania.ts", "utf-8")
  } catch {
    content = ""
  }

  it("tiene directiva 'use server'", () => {
    expect(content).toContain('"use server"')
  })

  it("exporta getPainManiaCounts", () => {
    expect(content).toContain("export async function getPainManiaCounts")
  })

  it("exporta castPainManiaVote", () => {
    expect(content).toContain("export async function castPainManiaVote")
  })

  it("castPainManiaVote acepta vote: 'si' | 'no'", () => {
    expect(content).toContain('"si" | "no"')
  })

  it("consulta la tabla pain_mania_votes", () => {
    expect(content).toContain("pain_mania_votes")
  })

  it("usa count exact para no traer filas completas", () => {
    expect(content).toContain('count: "exact"')
  })

  it("devuelve { si, no } con fallback a 0", () => {
    expect(content).toContain("si ?? 0")
    expect(content).toContain("no ?? 0")
  })
})


// =============================================================================
describe("Migración SQL — 014_pain_mania_votes.sql", () => {

  let sql: string

  try {
    sql = readFileSync("supabase/migrations/014_pain_mania_votes.sql", "utf-8")
  } catch {
    sql = ""
  }

  it("crea la tabla pain_mania_votes", () => {
    expect(sql).toContain("pain_mania_votes")
  })

  it("vote tiene check constraint con 'si' y 'no'", () => {
    expect(sql).toContain("'si'")
    expect(sql).toContain("'no'")
  })

  it("habilita RLS", () => {
    expect(sql).toContain("enable row level security")
  })

  it("política de insert para anon", () => {
    expect(sql).toContain("for insert")
    expect(sql).toContain("anon")
  })

  it("política de select para anon", () => {
    expect(sql).toContain("for select")
  })

  it("tiene created_at con default now()", () => {
    expect(sql).toContain("created_at")
    expect(sql).toContain("now()")
  })
})


// =============================================================================
describe("Modal Pain Manía — texto y contenido del componente", () => {

  let content: string

  try {
    content = readFileSync("components/prode/landing-client.tsx", "utf-8")
  } catch {
    content = ""
  }

  it("no contiene 'ni en pedo' (texto eliminado)", () => {
    expect(content.toLowerCase()).not.toContain("ni en pedo")
  })

  it("contiene 'No anota' como opción negativa", () => {
    expect(content).toContain("No anota")
  })

  it("contiene '¿Anotará Tim Payne en el Mundial?'", () => {
    expect(content).toContain("¿Anotará Tim Payne en el Mundial?")
  })

  it("importa castPainManiaVote desde la action", () => {
    expect(content).toContain("castPainManiaVote")
  })

  it("importa getPainManiaCounts desde la action", () => {
    expect(content).toContain("getPainManiaCounts")
  })

  it("usa localStorage para anti-duplicados", () => {
    expect(content).toContain("pain-mania-vote")
  })

  it("muestra la foto de Tim Payne", () => {
    expect(content).toContain("tim-payne")
  })
})
