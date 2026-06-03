import { describe, it, expect, beforeAll } from "vitest"
import { createAdminClient, createTestParticipant, deleteTestUser } from "../helpers/supabase"

const admin = createAdminClient()
const TP    = "__integrity__"
const ts    = Date.now()

let testMatchId:       string
let testParticipantId: string
let testUserId:        string

beforeAll(async () => {
  const part = await createTestParticipant({
    email:         `${TP}${ts}@test.com`,
    password:      "test-123!",
    dni:           `3${ts}`.slice(0, 8),
    license_plate: `C${ts.toString().slice(-6)}`,
  })
  testParticipantId = part.participantId
  testUserId        = part.userId

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: match } = await (admin as any).from("matches").insert({
    team1: `${TP}IntTeam1`, team2: `${TP}IntTeam2`,
    team1_flag: "🏳️", team2_flag: "🏳️",
    match_date: new Date(Date.now() + 86400000).toISOString(),
    stage: "group", predictions_locked: false, is_finished: false,
  }).select("id").single()
  testMatchId = match?.id ?? ""
})

// afterAll limpia todo a través de cascade (deleteUser → participant → predictions)
import { afterAll } from "vitest"
afterAll(async () => {
  if (testMatchId) {
    await admin.from("predictions").delete().eq("match_id", testMatchId)
    await admin.from("matches").delete().eq("id", testMatchId)
  }
  await deleteTestUser(testUserId)
})

// -----------------------------------------------------------------
describe("Constraints: unicidad en participants", () => {
  it("DNI duplicado viola constraint unique (23505)", async () => {
    const { data: original } = await admin
      .from("participants").select("dni").eq("id", testParticipantId).single()

    const { data: authData } = await admin.auth.admin.createUser({
      email: `${TP}dni_dup${ts}@test.com`, password: "test123", email_confirm: true,
    })
    const uid = authData.user?.id
    if (!uid) return

    const { error } = await admin.from("participants").insert({
      user_id: uid, first_name: "Dup", last_name: "DNI",
      dni: original!.dni, // mismo DNI
      phone: "1100000000", email: `${TP}dni_dup${ts}@test.com`,
      license_plate: `DD${ts.toString().slice(-4)}`, accepts_terms: true,
    })
    await admin.auth.admin.deleteUser(uid)

    expect(error?.code).toBe("23505")
    expect(error?.message).toContain("dni")
  })

  it("license_plate duplicada viola constraint unique (23505)", async () => {
    const { data: original } = await admin
      .from("participants").select("license_plate").eq("id", testParticipantId).single()

    const { data: authData } = await admin.auth.admin.createUser({
      email: `${TP}plate_dup${ts}@test.com`, password: "test123", email_confirm: true,
    })
    const uid = authData.user?.id
    if (!uid) return

    const { error } = await admin.from("participants").insert({
      user_id: uid, first_name: "Dup", last_name: "Plate",
      dni: `4${ts}`.slice(0, 8), phone: "1100000000",
      email: `${TP}plate_dup${ts}@test.com`,
      license_plate: original!.license_plate, // misma patente
      accepts_terms: true,
    })
    await admin.auth.admin.deleteUser(uid)

    expect(error?.code).toBe("23505")
    expect(error?.message).toContain("license_plate")
  })

  it("un user_id solo puede tener un rol (unique en user_roles)", async () => {
    // Ya tiene rol 'participant', intentar insertar otro
    const { error } = await admin.from("user_roles").insert({
      user_id: testUserId,
      role:    "callcenter",
    })
    expect(error?.code).toBe("23505")
  })
})

// -----------------------------------------------------------------
describe("FK Constraints: integridad referencial", () => {
  it("prediction requiere participant_id válido", async () => {
    const { error } = await admin.from("predictions").insert({
      participant_id:   "00000000-0000-0000-0000-000000000000", // no existe
      match_id:         testMatchId,
      predicted_score1: 1,
      predicted_score2: 0,
    })
    expect(error?.code).toBe("23503") // foreign key violation
  })

  it("prediction requiere match_id válido", async () => {
    const { error } = await admin.from("predictions").insert({
      participant_id:   testParticipantId,
      match_id:         "00000000-0000-0000-0000-000000000000", // no existe
      predicted_score1: 1,
      predicted_score2: 0,
    })
    expect(error?.code).toBe("23503")
  })

  it("eliminar un partido elimina en cascada sus predictions", async () => {
    // Crear partido y prediction de prueba
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tempMatch } = await (admin as any).from("matches").insert({
      team1: `${TP}CascadeTeam1`, team2: `${TP}CascadeTeam2`,
      team1_flag: "🏳️", team2_flag: "🏳️",
      match_date: new Date(Date.now() + 86400000).toISOString(),
      stage: "group",
    }).select("id").single()

    const matchId = tempMatch?.id
    if (!matchId) return

    await admin.from("predictions").insert({
      participant_id:   testParticipantId,
      match_id:         matchId,
      predicted_score1: 1,
      predicted_score2: 0,
    })

    // Verificar que la prediction existe
    const { data: before } = await admin.from("predictions").select("id").eq("match_id", matchId)
    expect(before?.length).toBeGreaterThan(0)

    // Eliminar el partido
    await admin.from("matches").delete().eq("id", matchId)

    // La prediction debe haberse eliminado por cascade
    const { data: after } = await admin.from("predictions").select("id").eq("match_id", matchId)
    expect(after?.length ?? 0).toBe(0)
  })

  it("eliminar usuario elimina en cascada participant y predictions", async () => {
    // Crear usuario temporal con predicción
    const tempPart = await createTestParticipant({
      email:         `${TP}cascade_user${ts}@test.com`,
      password:      "test-123!",
      dni:           `5${ts}`.slice(0, 8),
      license_plate: `E${ts.toString().slice(-6)}`,
    })

    await admin.from("predictions").insert({
      participant_id:   tempPart.participantId,
      match_id:         testMatchId,
      predicted_score1: 2,
      predicted_score2: 1,
    })

    // Eliminar el usuario
    await deleteTestUser(tempPart.userId)

    // participant ya no existe
    const { data: p } = await admin
      .from("participants").select("id").eq("id", tempPart.participantId).single()
    expect(p).toBeNull()

    // predictions también fueron eliminadas en cascade
    const { data: preds } = await admin
      .from("predictions").select("id").eq("participant_id", tempPart.participantId)
    expect(preds?.length ?? 0).toBe(0)
  })
})

// -----------------------------------------------------------------
describe("Upsert: predictions sin duplicados", () => {
  it("upsert con mismo participant+match actualiza en lugar de duplicar", async () => {
    // Primer insert
    await admin.from("predictions").upsert({
      participant_id:   testParticipantId,
      match_id:         testMatchId,
      predicted_score1: 1,
      predicted_score2: 0,
    }, { onConflict: "participant_id,match_id" })

    // Segundo upsert con distinto marcador
    await admin.from("predictions").upsert({
      participant_id:   testParticipantId,
      match_id:         testMatchId,
      predicted_score1: 3,
      predicted_score2: 1,
    }, { onConflict: "participant_id,match_id" })

    // Solo debe existir UN registro
    const { data } = await admin.from("predictions")
      .select("predicted_score1, predicted_score2")
      .eq("participant_id", testParticipantId)
      .eq("match_id", testMatchId)

    expect(data?.length).toBe(1)
    expect(data?.[0].predicted_score1).toBe(3) // el último valor
    expect(data?.[0].predicted_score2).toBe(1)
  })
})

// -----------------------------------------------------------------
describe("Campos NOT NULL: no se pueden omitir campos requeridos", () => {
  it("participants: first_name NOT NULL", async () => {
    const { data: authData } = await admin.auth.admin.createUser({
      email: `${TP}notnull${ts}@test.com`, password: "test123", email_confirm: true,
    })
    const uid = authData.user?.id
    if (!uid) return

    const { error } = await admin.from("participants").insert({
      user_id:       uid,
      first_name:    null as unknown as string, // forzar null
      last_name:     "Test",
      dni:           `6${ts}`.slice(0, 8),
      phone:         "1100000000",
      email:         `${TP}notnull${ts}@test.com`,
      license_plate: `F${ts.toString().slice(-6)}`,
      accepts_terms: true,
    })
    await admin.auth.admin.deleteUser(uid)

    expect(error).not.toBeNull()
  })

  it("matches: team1 NOT NULL", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any).from("matches").insert({
      team1:      null, // NOT NULL debe fallar
      team2:      "TeamB",
      match_date: new Date().toISOString(),
      stage:      "group",
    })
    expect(error).not.toBeNull()
  })
})
