import { describe, it, expect, beforeAll } from "vitest"
import { createAdminClient } from "../helpers/supabase"

// Los tests de integración usan el cliente admin (service_role)
// para tener visibilidad completa de la DB sin depender de RLS.

let supabase: ReturnType<typeof createAdminClient>

beforeAll(() => {
  supabase = createAdminClient()
})

// -----------------------------------------------------------------
describe("tabla: matches", () => {
  it("puede leer la lista de partidos", async () => {
    const { data, error } = await supabase.from("matches").select("*")
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  it("cada partido tiene los campos obligatorios", async () => {
    const { data } = await supabase.from("matches").select("*").limit(1)
    if (!data || data.length === 0) return // sin partidos no hay nada que verificar
    const match = data[0]
    expect(match).toHaveProperty("id")
    expect(match).toHaveProperty("team1")
    expect(match).toHaveProperty("team2")
    expect(match).toHaveProperty("match_date")
    expect(match).toHaveProperty("stage")
    expect(match).toHaveProperty("is_finished")
    expect(match).toHaveProperty("predictions_locked")
  })

  it("filtra por stage correctamente", async () => {
    const { data, error } = await supabase
      .from("matches")
      .select("id, stage")
      .eq("stage", "group")
    expect(error).toBeNull()
    data?.forEach(m => expect(m.stage).toBe("group"))
  })

  it("los partidos finalizados tienen score1 y score2 no nulos", async () => {
    const { data } = await supabase
      .from("matches")
      .select("id, score1, score2, is_finished")
      .eq("is_finished", true)
    data?.forEach(m => {
      expect(m.score1).not.toBeNull()
      expect(m.score2).not.toBeNull()
    })
  })
})

// -----------------------------------------------------------------
describe("tabla: participants", () => {
  it("puede leer participantes", async () => {
    const { data, error } = await supabase.from("participants").select("*")
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  it("cada participante tiene email y dni únicos (no hay duplicados)", async () => {
    const { data } = await supabase.from("participants").select("email, dni")
    if (!data || data.length < 2) return
    const emails = data.map(p => p.email)
    const dnis   = data.map(p => p.dni)
    expect(new Set(emails).size).toBe(emails.length)
    expect(new Set(dnis).size).toBe(dnis.length)
  })

  it("total_points es >= 0 para todos los participantes", async () => {
    const { data } = await supabase.from("participants").select("id, total_points")
    data?.forEach(p => expect(p.total_points).toBeGreaterThanOrEqual(0))
  })
})

// -----------------------------------------------------------------
describe("tabla: predictions", () => {
  it("puede leer predicciones", async () => {
    const { data, error } = await supabase.from("predictions").select("*")
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  it("los scores predichos son >= 0", async () => {
    const { data } = await supabase.from("predictions").select("predicted_score1, predicted_score2")
    data?.forEach(p => {
      expect(p.predicted_score1).toBeGreaterThanOrEqual(0)
      expect(p.predicted_score2).toBeGreaterThanOrEqual(0)
    })
  })
})

// -----------------------------------------------------------------
describe("tabla: point_config", () => {
  it("existe al menos una configuración de puntos", async () => {
    const { data, error } = await supabase.from("point_config").select("*")
    expect(error).toBeNull()
    expect(data).not.toBeNull()
    // Si ya fue configurado, debe haber exactamente una fila
    if (data && data.length > 0) {
      expect(data.length).toBe(1)
    }
  })
})

// -----------------------------------------------------------------
describe("tabla: user_roles", () => {
  it("puede leer roles", async () => {
    const { data, error } = await supabase.from("user_roles").select("role")
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  it("todos los roles son valores válidos del enum", async () => {
    const valid = new Set(["participant", "admin", "callcenter"])
    const { data } = await supabase.from("user_roles").select("role")
    data?.forEach(r => expect(valid.has(r.role)).toBe(true))
  })
})
