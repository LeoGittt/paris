import { describe, it, expect, beforeAll } from "vitest"
import { createAdminClient, createTestParticipant } from "../helpers/supabase"

const admin = createAdminClient()
const TP    = "__admin_ops__"

// DNI y patente únicos por cada llamada — evita colisiones entre corridas paralelas
function uniqueDni()               { return String(Math.floor(10000000 + Math.random() * 89999999)) }
function uniquePlate(prefix = "X") { return `${prefix}${Math.floor(100000 + Math.random() * 899999)}` }
function uniqueEmail(tag: string)  { return `${TP}${tag}${Date.now()}${Math.floor(Math.random() * 9999)}@test.com` }

// -----------------------------------------------------------------
describe("Admin: eliminar participante completo", () => {
  it("eliminar auth user hace cascade sobre participant y user_roles", async () => {
    const { userId, participantId } = await createTestParticipant({
      email:         uniqueEmail("del"),
      password:      "test-123!",
      dni:           uniqueDni(),
      license_plate: uniquePlate("G"),
    })

    const { data: before } = await admin
      .from("participants").select("id").eq("id", participantId).single()
    expect(before?.id).toBe(participantId)

    const { error } = await admin.auth.admin.deleteUser(userId)
    expect(error).toBeNull()

    const { data: afterPart } = await admin
      .from("participants").select("id").eq("id", participantId).single()
    expect(afterPart).toBeNull()

    const { data: afterRole } = await admin
      .from("user_roles").select("id").eq("user_id", userId)
    expect(afterRole?.length ?? 0).toBe(0)
  })
})

// -----------------------------------------------------------------
describe("Admin: bloquear / desbloquear participante", () => {
  let testUserId:        string
  let testParticipantId: string

  beforeAll(async () => {
    const part = await createTestParticipant({
      email:         uniqueEmail("block"),
      password:      "test-123!",
      dni:           uniqueDni(),
      license_plate: uniquePlate("H"),
    })
    testUserId        = part.userId
    testParticipantId = part.participantId
  })

  it("bloquear setea is_blocked = true", async () => {
    const { error } = await admin
      .from("participants")
      .update({ is_blocked: true })
      .eq("id", testParticipantId)

    expect(error).toBeNull()

    const { data } = await admin
      .from("participants").select("is_blocked").eq("id", testParticipantId).single()
    expect(data?.is_blocked).toBe(true)
  })

  it("desbloquear setea is_blocked = false", async () => {
    await admin.from("participants").update({ is_blocked: false }).eq("id", testParticipantId)

    const { data } = await admin
      .from("participants").select("is_blocked").eq("id", testParticipantId).single()
    expect(data?.is_blocked).toBe(false)

    await admin.auth.admin.deleteUser(testUserId)
  })
})

// -----------------------------------------------------------------
describe("Admin: asignar y entregar premios", () => {
  let prizeId:       string
  let participantId: string
  let userId:        string

  beforeAll(async () => {
    const { data: prize } = await admin.from("prizes").insert({
      title: `${TP}Premio${Date.now()}`, stage: "group", prize_type: "principal",
    }).select("id").single()
    prizeId = prize?.id ?? ""

    const part = await createTestParticipant({
      email:         uniqueEmail("winner"),
      password:      "test-123!",
      dni:           uniqueDni(),
      license_plate: uniquePlate("I"),
    })
    participantId = part.participantId
    userId        = part.userId
  })

  it("asignar ganador cambia status a pending y setea winner_id", async () => {
    const { error } = await admin.from("prizes")
      .update({ winner_id: participantId, status: "pending" })
      .eq("id", prizeId)

    expect(error).toBeNull()

    const { data } = await admin.from("prizes").select("status, winner_id").eq("id", prizeId).single()
    expect(data?.status).toBe("pending")
    expect(data?.winner_id).toBe(participantId)
  })

  it("marcar entregado cambia status a delivered y setea delivered_at", async () => {
    const { error } = await admin.from("prizes")
      .update({ status: "delivered", delivered_at: new Date().toISOString() })
      .eq("id", prizeId)

    expect(error).toBeNull()

    const { data } = await admin.from("prizes").select("status, delivered_at").eq("id", prizeId).single()
    expect(data?.status).toBe("delivered")
    expect(data?.delivered_at).not.toBeNull()

    await admin.from("prizes").delete().eq("id", prizeId)
    await admin.auth.admin.deleteUser(userId)
  })
})

// -----------------------------------------------------------------
describe("Admin: configuración de puntos", () => {
  it("puede leer la configuración de puntos actual", async () => {
    const { data, error } = await admin.from("point_config").select("*")
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  it("si existe config, los valores son positivos y correctExact >= correctWinner", async () => {
    const { data } = await admin
      .from("point_config")
      .select("correct_winner, correct_exact, correct_diff")
      .limit(1)
    if (!data || data.length === 0) return
    expect(data[0].correct_winner).toBeGreaterThan(0)
    expect(data[0].correct_exact).toBeGreaterThan(0)
    expect(data[0].correct_diff).toBeGreaterThanOrEqual(0)
    expect(data[0].correct_exact).toBeGreaterThanOrEqual(data[0].correct_winner)
  })
})

// -----------------------------------------------------------------
describe("DB functions: get_participant_stats y lock_started_matches", () => {
  let statUserId:        string
  let statParticipantId: string

  beforeAll(async () => {
    const part = await createTestParticipant({
      email:         uniqueEmail("stats"),
      password:      "test-123!",
      dni:           uniqueDni(),
      license_plate: uniquePlate("J"),
    })
    statParticipantId = part.participantId
    statUserId        = part.userId
  })

  it("get_participant_stats retorna estructura correcta", async () => {
    const { data, error } = await admin.rpc("get_participant_stats", {
      p_participant_id: statParticipantId,
    })
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
    if (data && data.length > 0) {
      const stats = data[0]
      expect(stats).toHaveProperty("total_points")
      expect(stats).toHaveProperty("ranking_position")
      expect(stats).toHaveProperty("predictions_count")
      expect(stats).toHaveProperty("correct_exact")
      expect(stats).toHaveProperty("correct_winner")
    }
  })

  it("lock_started_matches no falla en ejecución", async () => {
    const { error } = await admin.rpc("lock_started_matches" as never)
    expect(error).toBeNull()

    await admin.auth.admin.deleteUser(statUserId)
  })
})
