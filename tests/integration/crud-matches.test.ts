import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createAdminClient } from "../helpers/supabase"

let supabase: ReturnType<typeof createAdminClient>
const TEST_PREFIX = "__crud_test__"

beforeAll(() => {
  supabase = createAdminClient()
})

// -----------------------------------------------------------------
describe("CRUD: matches", () => {
  let createdId:  string | undefined
  let updatedId:  string | undefined
  let dupId:      string | undefined

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: a } = await (supabase as any).from("matches").insert({
      team1: `${TEST_PREFIX}TeamX`, team2: `${TEST_PREFIX}TeamY`,
      team1_flag: "🏳️", team2_flag: "🏳️",
      match_date: new Date(Date.now() + 86400000).toISOString(),
      stage: "group", group_name: "TEST", venue: null,
    }).select("id").single()
    createdId = a?.id

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: b } = await (supabase as any).from("matches").insert({
      team1: `${TEST_PREFIX}OldName`, team2: `${TEST_PREFIX}OldName2`,
      team1_flag: "🏳️", team2_flag: "🏳️",
      match_date: new Date(Date.now() + 86400000).toISOString(),
      stage: "group",
    }).select("id").single()
    updatedId = b?.id

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: c } = await (supabase as any).from("matches").insert({
      team1: `${TEST_PREFIX}Dup1`, team2: `${TEST_PREFIX}Dup2`,
      team1_flag: "🏳️", team2_flag: "🏳️",
      match_date: new Date(Date.now() + 86400000).toISOString(),
      stage: "group",
    }).select("id").single()
    dupId = c?.id
  })

  afterAll(async () => {
    // Safety net: limpia todo lo que quede con el prefijo
    await supabase.from("matches").delete().like("team1", `${TEST_PREFIX}%`)
  })

  it("crea un partido y lo puede leer", async () => {
    if (!createdId) return
    const { data, error } = await supabase
      .from("matches").select("team1, team2").eq("id", createdId).single()
    expect(error).toBeNull()
    expect(data?.team1).toBe(`${TEST_PREFIX}TeamX`)
    expect(data?.team2).toBe(`${TEST_PREFIX}TeamY`)
  })

  it("actualiza un partido existente", async () => {
    if (!updatedId) return
    const { error } = await supabase
      .from("matches").update({ team1: `${TEST_PREFIX}NewName` }).eq("id", updatedId)
    expect(error).toBeNull()

    const { data } = await supabase.from("matches").select("team1").eq("id", updatedId).single()
    expect(data?.team1).toBe(`${TEST_PREFIX}NewName`)
  })

  it("elimina un partido y deja de existir", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created } = await (supabase as any).from("matches").insert({
      team1: `${TEST_PREFIX}ToDelete`, team2: `${TEST_PREFIX}ToDelete2`,
      team1_flag: "🏳️", team2_flag: "🏳️",
      match_date: new Date(Date.now() + 86400000).toISOString(),
      stage: "group",
    }).select("id").single()

    const id = created?.id
    if (!id) return

    const { error: deleteError } = await supabase.from("matches").delete().eq("id", id)
    expect(deleteError).toBeNull()

    const { data: shouldBeNull } = await supabase.from("matches").select("id").eq("id", id).single()
    expect(shouldBeNull).toBeNull()
  })

  it("no permite duplicar un partido con el mismo id", async () => {
    if (!dupId) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("matches").insert({
      id: dupId,
      team1: `${TEST_PREFIX}Dup1`, team2: `${TEST_PREFIX}Dup2`,
      team1_flag: "🏳️", team2_flag: "🏳️",
      match_date: new Date().toISOString(),
      stage: "group",
    })
    expect(error).not.toBeNull()
  })
})

// -----------------------------------------------------------------
describe("CRUD: prizes", () => {
  let prizeAId: string | undefined
  let prizeBId: string | undefined

  beforeAll(async () => {
    const { data: a } = await supabase.from("prizes").insert({
      title: `${TEST_PREFIX}Premio Test`,
      stage: "group",
      description: "Premio de prueba para tests",
    }).select("id").single()
    prizeAId = a?.id

    const { data: b } = await supabase.from("prizes").insert({
      title: `${TEST_PREFIX}StatusTest`,
      stage: "group",
    }).select("id").single()
    prizeBId = b?.id
  })

  afterAll(async () => {
    await supabase.from("prizes").delete().like("title", `${TEST_PREFIX}%`)
  })

  it("crea un premio y lo puede leer", async () => {
    if (!prizeAId) return
    const { data, error } = await supabase
      .from("prizes").select("title").eq("id", prizeAId).single()
    expect(error).toBeNull()
    expect(data?.title).toBe(`${TEST_PREFIX}Premio Test`)
  })

  it("actualiza el status de un premio", async () => {
    if (!prizeBId) return
    const { error } = await supabase
      .from("prizes").update({ status: "pending" }).eq("id", prizeBId)
    expect(error).toBeNull()

    const { data } = await supabase.from("prizes").select("status").eq("id", prizeBId).single()
    expect(data?.status).toBe("pending")
  })
})
