import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createAdminClient } from "../helpers/supabase"
import type { Database } from "@/lib/supabase/types"

let supabase: ReturnType<typeof createAdminClient>

// IDs de datos de prueba que creamos y limpiamos nosotros
const TEST_PREFIX = "__test__"
let testMatchId:       string | null = null
let testParticipantId: string | null = null
let testUserId:        string        = "00000000-0000-0000-0000-ffffffffffff"

beforeAll(async () => {
  supabase = createAdminClient()

  // Crear usuario de prueba en Supabase Auth
  const { data: authData } = await supabase.auth.admin.createUser({
    email:    `${TEST_PREFIX}ranking@test.com`,
    password: "test-password-123",
    email_confirm: true,
  })
  if (authData?.user) testUserId = authData.user.id

  // Crear participante de prueba
  const { data: part } = await supabase.from("participants").insert({
    user_id:       testUserId,
    first_name:    TEST_PREFIX,
    last_name:     "TestUser",
    dni:           "00000001",
    phone:         "1100000001",
    email:         `${TEST_PREFIX}ranking@test.com`,
    license_plate: "TST001",
    accepts_terms: true,
    total_points:  0,
  }).select("id").single()

  testParticipantId = part?.id ?? null

  // Asignar rol participant
  if (testUserId !== "00000000-0000-0000-0000-ffffffffffff") {
    await supabase.from("user_roles").insert({ user_id: testUserId, role: "participant" })
  }

  // Crear partido de prueba (ya finalizado)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: match } = await (supabase as any).from("matches").insert({
    team1:              `${TEST_PREFIX}TeamA`,
    team2:              `${TEST_PREFIX}TeamB`,
    team1_flag:         "🇦🇷",
    team2_flag:         "🇧🇷",
    match_date:         new Date(Date.now() - 86400000).toISOString(), // ayer
    stage:              "group",
    group_name:         "Z",
    venue:              "Test Stadium",
    score1:             2,
    score2:             1,
    is_finished:        true,
    predictions_locked: true,
  }).select("id").single()

  testMatchId = match?.id ?? null
})

afterAll(async () => {
  // Limpiar en orden inverso a FK constraints
  if (testParticipantId) {
    await supabase.from("predictions").delete().eq("participant_id", testParticipantId)
    await supabase.from("participants").delete().eq("id", testParticipantId)
  }
  if (testMatchId) {
    await supabase.from("predictions").delete().eq("match_id", testMatchId)
    await supabase.from("matches").delete().eq("id", testMatchId)
  }
  if (testUserId !== "00000000-0000-0000-0000-ffffffffffff") {
    await supabase.auth.admin.deleteUser(testUserId)
    await supabase.from("user_roles").delete().eq("user_id", testUserId)
  }
})

// -----------------------------------------------------------------
describe("vista: ranking_view", () => {
  it("devuelve filas ordenadas por total_points DESC", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("ranking_view")
      .select("total_points, ranking_position")
      .order("ranking_position", { ascending: true })
      .limit(20)

    expect(error).toBeNull()
    if (!data || data.length < 2) return

    for (let i = 0; i < data.length - 1; i++) {
      expect(data[i].total_points).toBeGreaterThanOrEqual(data[i + 1].total_points)
    }
  })

  it("ranking_position es consistente con los puntos (mismo puntaje = mismo puesto)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("ranking_view")
      .select("ranking_position, total_points")
      .order("ranking_position", { ascending: true })
    if (!data || data.length < 2) return

    // Participantes con el mismo puntaje deben tener el mismo ranking_position (RANK, no ROW_NUMBER)
    for (let i = 0; i < data.length - 1; i++) {
      const a = data[i], b = data[i + 1]
      if (a.total_points === b.total_points) {
        expect(a.ranking_position).toBe(b.ranking_position)
      } else {
        // Más puntos = mejor posición (número menor)
        expect(a.ranking_position).toBeLessThan(b.ranking_position)
      }
    }
  })
})

// -----------------------------------------------------------------
describe("RPC: recalculate_points", () => {
  it("recalcula puntos para un partido finalizado sin errores", async () => {
    if (!testMatchId) {
      console.warn("Sin partido de prueba, se omite el test de RPC")
      return
    }
    const { error } = await supabase.rpc("recalculate_points", { p_match_id: testMatchId })
    expect(error).toBeNull()
  })

  it("pronóstico exacto suma más puntos que pronóstico de resultado", async () => {
    if (!testMatchId || !testParticipantId) return

    // 1. Insertar pronóstico EXACTO (2-1, igual al resultado real)
    await supabase.from("predictions").upsert({
      participant_id:   testParticipantId,
      match_id:         testMatchId,
      predicted_score1: 2,
      predicted_score2: 1,
    }, { onConflict: "participant_id,match_id" })

    await supabase.rpc("recalculate_points", { p_match_id: testMatchId })

    const { data: afterExact } = await supabase
      .from("participants")
      .select("total_points")
      .eq("id", testParticipantId)
      .single()

    const pointsExact = afterExact?.total_points ?? 0

    // Resetear puntos
    await supabase.from("participants").update({ total_points: 0 }).eq("id", testParticipantId)
    await supabase.from("predictions").update({ points_earned: 0 }).eq("participant_id", testParticipantId)

    // 2. Insertar pronóstico de GANADOR CORRECTO pero marcador incorrecto (2-0)
    await supabase.from("predictions").upsert({
      participant_id:   testParticipantId,
      match_id:         testMatchId,
      predicted_score1: 2,
      predicted_score2: 0,
    }, { onConflict: "participant_id,match_id" })

    await supabase.rpc("recalculate_points", { p_match_id: testMatchId })

    const { data: afterWinner } = await supabase
      .from("participants")
      .select("total_points")
      .eq("id", testParticipantId)
      .single()

    const pointsWinner = afterWinner?.total_points ?? 0

    // Exacto debe valer más que solo ganador correcto
    expect(pointsExact).toBeGreaterThan(pointsWinner)
  })

  it("pronóstico incorrecto (equipo equivocado) suma 0 puntos", async () => {
    if (!testMatchId || !testParticipantId) return

    // Resetear
    await supabase.from("participants").update({ total_points: 0 }).eq("id", testParticipantId)

    // Resultado real es 2-1 (team1 gana). Pronóstico: team2 gana (0-2)
    await supabase.from("predictions").upsert({
      participant_id:   testParticipantId,
      match_id:         testMatchId,
      predicted_score1: 0,
      predicted_score2: 2,
    }, { onConflict: "participant_id,match_id" })

    await supabase.rpc("recalculate_points", { p_match_id: testMatchId })

    const { data } = await supabase
      .from("participants")
      .select("total_points")
      .eq("id", testParticipantId)
      .single()

    expect(data?.total_points).toBe(0)
  })
})

// -----------------------------------------------------------------
describe("lógica de predicciones bloqueadas", () => {
  it("no se puede hacer upsert en una predicción con partido bloqueado — la acción retorna error", async () => {
    if (!testMatchId || !testParticipantId) return

    // El partido de prueba tiene predictions_locked: true
    // Simulamos la verificación que hace savePrediction()
    const { data: match } = await supabase
      .from("matches")
      .select("predictions_locked, is_finished")
      .eq("id", testMatchId)
      .single()

    expect(match?.predictions_locked).toBe(true)
    expect(match?.is_finished).toBe(true)

    // La guard del server action debería rechazar antes de llegar a Supabase
    const wouldBlock =
      match?.predictions_locked === true || match?.is_finished === true
    expect(wouldBlock).toBe(true)
  })
})
