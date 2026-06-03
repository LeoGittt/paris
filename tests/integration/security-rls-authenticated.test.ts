import { describe, it, expect, beforeAll, afterAll } from "vitest"
import {
  createAdminClient,
  createAuthenticatedClient,
  createTestParticipant,
  deleteTestUser,
} from "../helpers/supabase"

// ─── Estos tests verifican aislamiento de datos entre participantes ───────────
// Participante A no debe poder ver ni modificar datos de Participante B.
// Se usan dos usuarios reales con sesión activa (JWT válido).

const admin = createAdminClient()
const TP    = "__sec_rls__"
const ts    = Date.now()

let userA: { userId: string; participantId: string }
let userB: { userId: string; participantId: string }
let clientA: Awaited<ReturnType<typeof createAuthenticatedClient>>
let clientB: Awaited<ReturnType<typeof createAuthenticatedClient>>

// Partido de prueba para tests de pronósticos
let testMatchId: string

beforeAll(async () => {
  // Crear dos participantes de prueba
  userA = await createTestParticipant({
    email:         `${TP}a${ts}@test.com`,
    password:      "passA-123!",
    dni:           `1${ts}`.slice(0, 8),
    license_plate: `A${ts.toString().slice(-6)}`,
  })
  userB = await createTestParticipant({
    email:         `${TP}b${ts}@test.com`,
    password:      "passB-123!",
    dni:           `2${ts}`.slice(0, 8),
    license_plate: `B${ts.toString().slice(-6)}`,
  })

  // Iniciar sesión como ambos usuarios
  clientA = await createAuthenticatedClient(`${TP}a${ts}@test.com`, "passA-123!")
  clientB = await createAuthenticatedClient(`${TP}b${ts}@test.com`, "passB-123!")

  // Crear un partido de prueba (no bloqueado para poder pronosticar)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: match } = await (admin as any).from("matches").insert({
    team1:              `${TP}TeamX`,
    team2:              `${TP}TeamY`,
    team1_flag:         "🏳️",
    team2_flag:         "🏳️",
    match_date:         new Date(Date.now() + 86400000).toISOString(),
    stage:              "group",
    predictions_locked: false,
    is_finished:        false,
  }).select("id").single()
  testMatchId = match?.id ?? ""
})

afterAll(async () => {
  if (testMatchId) {
    await admin.from("predictions").delete().eq("match_id", testMatchId)
    await admin.from("matches").delete().eq("id", testMatchId)
  }
  await deleteTestUser(userA.userId)
  await deleteTestUser(userB.userId)
})

// -----------------------------------------------------------------
describe("RLS: aislamiento de perfiles de participantes", () => {
  it("participante A puede leer SU propio perfil", async () => {
    const { data, error } = await clientA
      .from("participants")
      .select("id, first_name")
      .eq("id", userA.participantId)
      .single()

    expect(error).toBeNull()
    expect(data?.id).toBe(userA.participantId)
  })

  it("participante A NO puede leer el perfil de participante B", async () => {
    const { data, error } = await clientA
      .from("participants")
      .select("id, email")
      .eq("id", userB.participantId)
      .single()

    // RLS debe filtrar → no data, o error de permisos
    const blocked = data === null || error !== null
    expect(blocked).toBe(true)
  })

  it("SELECT * desde participante A devuelve solo SU registro (no toda la tabla)", async () => {
    const { data } = await clientA.from("participants").select("id")
    // RLS filtra — solo debe ver su propio registro
    expect(data?.length).toBeLessThanOrEqual(1)
    if (data && data.length === 1) {
      expect(data[0].id).toBe(userA.participantId)
    }
  })

  it("participante A NO puede actualizar el perfil de participante B", async () => {
    const { error } = await clientA
      .from("participants")
      .update({ first_name: "Hacked" })
      .eq("id", userB.participantId)

    // RLS bloquea el update — 0 rows afectadas o error
    // (Supabase devuelve 200 con 0 rows en lugar de error en updates filtrados por RLS)
    const { data: check } = await admin
      .from("participants")
      .select("first_name")
      .eq("id", userB.participantId)
      .single()

    expect(check?.first_name).not.toBe("Hacked")
  })
})

// -----------------------------------------------------------------
describe("RLS: aislamiento de pronósticos", () => {
  it("participante A puede crear su propio pronóstico", async () => {
    const { error } = await clientA.from("predictions").insert({
      participant_id:   userA.participantId,
      match_id:         testMatchId,
      predicted_score1: 1,
      predicted_score2: 0,
    })
    expect(error).toBeNull()
  })

  it("participante A puede ver SUS pronósticos", async () => {
    const { data, error } = await clientA
      .from("predictions")
      .select("participant_id")
      .eq("match_id", testMatchId)

    expect(error).toBeNull()
    // Solo sus propios pronósticos
    data?.forEach(p => expect(p.participant_id).toBe(userA.participantId))
  })

  it("participante A NO puede ver los pronósticos de participante B", async () => {
    // B primero crea un pronóstico
    await clientB.from("predictions").insert({
      participant_id:   userB.participantId,
      match_id:         testMatchId,
      predicted_score1: 2,
      predicted_score2: 2,
    })

    // A intenta leer todas las predictions del partido
    const { data } = await clientA
      .from("predictions")
      .select("participant_id")
      .eq("match_id", testMatchId)

    // A solo debe ver la suya, nunca la de B
    const seesB = data?.some(p => p.participant_id === userB.participantId)
    expect(seesB).toBe(false)
  })

  it("participante A NO puede insertar un pronóstico con participant_id de B (suplantación)", async () => {
    const { error } = await clientA.from("predictions").insert({
      participant_id:   userB.participantId, // ← intentando suplantar a B
      match_id:         testMatchId,
      predicted_score1: 3,
      predicted_score2: 0,
    })
    // RLS debe rechazar — participant_id no coincide con auth.uid()
    expect(error).not.toBeNull()
  })
})

// -----------------------------------------------------------------
describe("RLS: participantes NO pueden modificar partidos", () => {
  it("participante autenticado NO puede crear un partido", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (clientA as any).from("matches").insert({
      team1:      `${TP}MalTeam1`,
      team2:      `${TP}MalTeam2`,
      team1_flag: "🏳️",
      team2_flag: "🏳️",
      match_date: new Date().toISOString(),
      stage:      "group",
    })
    expect(error).not.toBeNull()
  })

  it("participante autenticado NO puede editar un partido", async () => {
    const { error } = await clientA
      .from("matches")
      .update({ team1: "Hacked Team" })
      .eq("id", testMatchId)

    const { data } = await admin.from("matches").select("team1").eq("id", testMatchId).single()
    expect(data?.team1).toBe(`${TP}TeamX`) // no cambió
    // error puede ser null (0 rows) o not null (denied) — lo importante es que no cambió
    void error
  })

  it("participante autenticado NO puede eliminar un partido", async () => {
    const { error } = await clientA.from("matches").delete().eq("id", testMatchId)
    // Verificar que el partido sigue existiendo
    const { data } = await admin.from("matches").select("id").eq("id", testMatchId).single()
    expect(data?.id).toBe(testMatchId)
    void error
  })
})

// -----------------------------------------------------------------
describe("RLS: participantes NO pueden modificar config de puntos", () => {
  it("participante NO puede cambiar los puntos por pronóstico exacto", async () => {
    // Obtener el valor actual
    const { data: before } = await admin.from("point_config").select("id, correct_exact").limit(1).single()
    const originalValue = before?.correct_exact ?? 10

    await clientA
      .from("point_config")
      .update({ correct_exact: 999 })
      .eq("id", before?.id ?? "")

    const { data: after } = await admin.from("point_config").select("correct_exact").limit(1).single()
    expect(after?.correct_exact).toBe(originalValue) // no cambió
  })
})

// -----------------------------------------------------------------
describe("RLS: participantes NO pueden ver roles de otros usuarios", () => {
  it("participante A solo ve su propio rol", async () => {
    const { data } = await clientA.from("user_roles").select("user_id, role")
    // RLS filtra — solo su propio registro
    data?.forEach(r => expect(r.user_id).toBe(userA.userId))
  })

  it("participante A NO puede asignarse rol admin", async () => {
    const { error } = await clientA.from("user_roles").insert({
      user_id: userA.userId,
      role:    "admin",
    })
    expect(error).not.toBeNull()
  })
})

// -----------------------------------------------------------------
describe("RLS: pronósticos con partido bloqueado", () => {
  it("no se puede insertar pronóstico cuando el partido está bloqueado (RLS en DB)", async () => {
    // Bloquear el partido
    await admin.from("matches").update({ predictions_locked: true }).eq("id", testMatchId)

    const { error } = await clientA.from("predictions").insert({
      participant_id:   userA.participantId,
      match_id:         testMatchId,
      predicted_score1: 0,
      predicted_score2: 0,
    })

    // La policy "participant: crear pronóstico" verifica predictions_locked = false
    expect(error).not.toBeNull()

    // Restaurar
    await admin.from("matches").update({ predictions_locked: false }).eq("id", testMatchId)
  })
})
