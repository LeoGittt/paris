import { describe, it, expect, beforeAll } from "vitest"
import { createAdminClient } from "../helpers/supabase"

let supabase: ReturnType<typeof createAdminClient>
const TEST_PREFIX = "__crud_test__"

beforeAll(() => {
  supabase = createAdminClient()
})

// -----------------------------------------------------------------
// Test de ciclo de vida completo de un partido de prueba.
// Cada test crea su propio recurso y lo limpia al final.
// -----------------------------------------------------------------

describe("CRUD: matches", () => {
  it("crea un partido y lo puede leer", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from("matches").insert({
      team1:       `${TEST_PREFIX}TeamX`,
      team2:       `${TEST_PREFIX}TeamY`,
      team1_flag:  "🏳️",
      team2_flag:  "🏳️",
      match_date:  new Date(Date.now() + 86400000).toISOString(),
      stage:       "group",
      group_name:  "TEST",
      venue:       null,
    }).select("id, team1, team2").single()

    expect(error).toBeNull()
    expect(data?.team1).toBe(`${TEST_PREFIX}TeamX`)
    expect(data?.team2).toBe(`${TEST_PREFIX}TeamY`)

    // Limpiar
    if (data?.id) await supabase.from("matches").delete().eq("id", data.id)
  })

  it("actualiza un partido existente", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created } = await (supabase as any).from("matches").insert({
      team1: `${TEST_PREFIX}OldName`,
      team2: `${TEST_PREFIX}OldName2`,
      team1_flag:  "🏳️",
      team2_flag:  "🏳️",
      match_date:  new Date(Date.now() + 86400000).toISOString(),
      stage:       "group",
    }).select("id").single()

    const id = created?.id
    if (!id) return

    const { error: updateError } = await supabase
      .from("matches")
      .update({ team1: `${TEST_PREFIX}NewName` })
      .eq("id", id)

    expect(updateError).toBeNull()

    const { data: updated } = await supabase
      .from("matches")
      .select("team1")
      .eq("id", id)
      .single()

    expect(updated?.team1).toBe(`${TEST_PREFIX}NewName`)

    // Limpiar
    await supabase.from("matches").delete().eq("id", id)
  })

  it("elimina un partido y deja de existir", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created } = await (supabase as any).from("matches").insert({
      team1: `${TEST_PREFIX}ToDelete`,
      team2: `${TEST_PREFIX}ToDelete2`,
      team1_flag: "🏳️",
      team2_flag: "🏳️",
      match_date: new Date(Date.now() + 86400000).toISOString(),
      stage:      "group",
    }).select("id").single()

    const id = created?.id
    if (!id) return

    const { error: deleteError } = await supabase.from("matches").delete().eq("id", id)
    expect(deleteError).toBeNull()

    const { data: shouldBeNull } = await supabase
      .from("matches")
      .select("id")
      .eq("id", id)
      .single()

    expect(shouldBeNull).toBeNull()
  })

  it("no permite duplicar un partido con el mismo id", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: first } = await (supabase as any).from("matches").insert({
      team1: `${TEST_PREFIX}Dup1`,
      team2: `${TEST_PREFIX}Dup2`,
      team1_flag: "🏳️",
      team2_flag: "🏳️",
      match_date: new Date(Date.now() + 86400000).toISOString(),
      stage:      "group",
    }).select("id").single()

    const id = first?.id
    if (!id) return

    // Intentar insertar con mismo id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("matches").insert({
      id,
      team1: `${TEST_PREFIX}Dup1`,
      team2: `${TEST_PREFIX}Dup2`,
      team1_flag: "🏳️",
      team2_flag: "🏳️",
      match_date: new Date().toISOString(),
      stage:      "group",
    })

    expect(error).not.toBeNull() // duplicate PK

    // Limpiar
    await supabase.from("matches").delete().eq("id", id)
  })
})

// -----------------------------------------------------------------
describe("CRUD: prizes", () => {
  it("crea un premio y lo puede leer", async () => {
    const { data, error } = await supabase.from("prizes").insert({
      title:       `${TEST_PREFIX}Premio Test`,
      stage:       "group",
      description: "Premio de prueba para tests",
    }).select("id, title").single()

    expect(error).toBeNull()
    expect(data?.title).toBe(`${TEST_PREFIX}Premio Test`)

    if (data?.id) await supabase.from("prizes").delete().eq("id", data.id)
  })

  it("actualiza el status de un premio", async () => {
    const { data: created } = await supabase.from("prizes").insert({
      title: `${TEST_PREFIX}StatusTest`,
      stage: "group",
    }).select("id").single()

    const id = created?.id
    if (!id) return

    const { error } = await supabase
      .from("prizes")
      .update({ status: "pending" })
      .eq("id", id)

    expect(error).toBeNull()

    const { data } = await supabase.from("prizes").select("status").eq("id", id).single()
    expect(data?.status).toBe("pending")

    await supabase.from("prizes").delete().eq("id", id)
  })
})
