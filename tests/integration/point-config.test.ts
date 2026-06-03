import { describe, it, expect, beforeAll } from "vitest"
import { createAdminClient, createAuthenticatedClient, createTestParticipant, deleteTestUser } from "../helpers/supabase"

const admin = createAdminClient()
const TP    = "__pointcfg__"

function uniqueDni()              { return String(Math.floor(10000000 + Math.random() * 89999999)) }
function uniquePlate(p = "P")     { return `${p}${Math.floor(100000 + Math.random() * 899999)}` }
function uniqueEmail(tag: string) { return `${TP}${tag}${Date.now()}${Math.floor(Math.random() * 999)}@test.com` }

// ─────────────────────────────────────────────────────────────────
describe("point_config: acceso y mutación", () => {
  it("cualquier usuario autenticado puede leer point_config (política pública)", async () => {
    const email    = uniqueEmail("reader")
    const { userId } = await createTestParticipant({ email, password: "test-123!", dni: uniqueDni(), license_plate: uniquePlate() })
    const client   = await createAuthenticatedClient(email, "test-123!")

    const { data, error } = await client.from("point_config").select("correct_winner, correct_exact, correct_diff")
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)

    await deleteTestUser(userId)
  })

  it("participante normal NO puede modificar point_config", async () => {
    const email    = uniqueEmail("notadmin")
    const { userId } = await createTestParticipant({ email, password: "test-123!", dni: uniqueDni(), license_plate: uniquePlate("Q") })
    const client   = await createAuthenticatedClient(email, "test-123!")

    const { data: cfg } = await client.from("point_config").select("id, correct_exact").limit(1).single()
    if (!cfg) { await deleteTestUser(userId); return }

    await client.from("point_config").update({ correct_exact: 999 }).eq("id", cfg.id)

    // Verificar que no cambió
    const { data: after } = await admin.from("point_config").select("correct_exact").eq("id", cfg.id).single()
    expect(after?.correct_exact).not.toBe(999)

    await deleteTestUser(userId)
  })

  it("si existe configuración, correct_exact >= correct_winner", async () => {
    const { data } = await admin
      .from("point_config")
      .select("correct_winner, correct_exact")
      .limit(1)
      .single()

    if (!data) return // sin config aún

    expect(data.correct_exact).toBeGreaterThanOrEqual(data.correct_winner)
  })

  it("service_role puede actualizar point_config directamente", async () => {
    const { data: before } = await admin.from("point_config").select("id, correct_diff").limit(1).single()
    if (!before) return

    const original = before.correct_diff

    const { error } = await admin
      .from("point_config")
      .update({ correct_diff: original })  // mismo valor — solo verifica que funciona
      .eq("id", before.id)

    expect(error).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 9: N+1 en configuracion — validar que todos los system users tienen datos", () => {
  it("puede leer todos los roles admin/callcenter de una sola query", async () => {
    const { data, error } = await admin
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["admin", "callcenter"])

    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)

    // Cada rol tiene user_id válido
    data?.forEach(r => {
      expect(r.user_id).toBeTruthy()
      expect(["admin", "callcenter"]).toContain(r.role)
    })
  })

  it("getUserById en paralelo devuelve los mismos users que la query de roles", async () => {
    const { data: roles } = await admin
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["admin", "callcenter"])
      .limit(5)

    if (!roles || roles.length === 0) return

    // Simula el Promise.all corregido
    const results = await Promise.all(
      roles.map(r => admin.auth.admin.getUserById(r.user_id))
    )

    const users = results.map(r => r.data?.user).filter(Boolean)
    expect(users.length).toBe(roles.length)
    users.forEach(u => expect(u?.id).toBeTruthy())
  })
})
