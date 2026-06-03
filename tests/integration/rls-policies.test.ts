import { describe, it, expect, beforeAll } from "vitest"
import { createAnonClient } from "../helpers/supabase"

// Estos tests verifican que las RLS policies bloqueen acceso
// no autorizado. El cliente anon NO tiene sesión activa.

let anon: ReturnType<typeof createAnonClient>

beforeAll(() => {
  anon = createAnonClient()
})

// -----------------------------------------------------------------
describe("RLS: tabla participants — acceso anónimo", () => {
  it("un usuario sin sesión NO puede leer participants", async () => {
    const { data, error } = await anon.from("participants").select("*")
    // RLS debe bloquear → 0 rows o error de permisos
    const blocked = (data?.length === 0) || error !== null
    expect(blocked).toBe(true)
  })

  it("un usuario sin sesión NO puede insertar en participants", async () => {
    const { error } = await anon.from("participants").insert({
      user_id:       "00000000-0000-0000-0000-000000000000",
      first_name:    "Test",
      last_name:     "RLS",
      dni:           "99999999",
      phone:         "1111111111",
      email:         "rls-test@noemail.com",
      license_plate: "ZZZ999",
      accepts_terms: true,
    })
    expect(error).not.toBeNull()
  })
})

// -----------------------------------------------------------------
describe("RLS: tabla user_roles — acceso anónimo", () => {
  it("un usuario sin sesión NO puede leer user_roles", async () => {
    const { data, error } = await anon.from("user_roles").select("*")
    const blocked = (data?.length === 0) || error !== null
    expect(blocked).toBe(true)
  })
})

// -----------------------------------------------------------------
describe("RLS: tabla predictions — acceso anónimo", () => {
  it("un usuario sin sesión NO puede leer predictions", async () => {
    const { data, error } = await anon.from("predictions").select("*")
    const blocked = (data?.length === 0) || error !== null
    expect(blocked).toBe(true)
  })

  it("un usuario sin sesión NO puede insertar predictions", async () => {
    const { error } = await anon.from("predictions").insert({
      participant_id:   "00000000-0000-0000-0000-000000000000",
      match_id:         "00000000-0000-0000-0000-000000000000",
      predicted_score1: 1,
      predicted_score2: 0,
    })
    expect(error).not.toBeNull()
  })
})

// -----------------------------------------------------------------
describe("RLS: tabla matches — acceso anónimo", () => {
  it("los partidos son públicos (lectura OK sin sesión)", async () => {
    // Las matches deben ser visibles para el ranking y landing públicos
    const { error } = await anon.from("matches").select("id, team1, team2")
    // No debe haber error — las matches son públicas
    expect(error).toBeNull()
  })
})

// -----------------------------------------------------------------
describe("RLS: tabla prizes — acceso anónimo", () => {
  it("los premios son de solo lectura para usuarios anónimos", async () => {
    const { error: readError } = await anon.from("prizes").select("id, title")
    // Lectura pública permitida (se muestra en landing)
    expect(readError).toBeNull()

    // Escritura debe estar bloqueada
    const { error: writeError } = await anon.from("prizes").insert({
      title: "Premio test RLS",
      stage: "group",
    })
    expect(writeError).not.toBeNull()
  })
})
