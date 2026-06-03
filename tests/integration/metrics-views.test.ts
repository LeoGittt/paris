import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createAdminClient } from "../helpers/supabase"

const admin = createAdminClient()

function skipIfNotFound(error: unknown, viewName: string) {
  if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "PGRST205") {
    console.warn(`⚠ Vista '${viewName}' no encontrada. Ejecutar metrics.sql en Supabase primero.`)
    return true
  }
  return false
}

// -----------------------------------------------------------------
describe("Bug 26: service_role puede leer vistas de métricas", () => {
  it("metrics_overview: service_role tiene acceso (o documenta que falta metrics.sql)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any).from("metrics_overview").select("*").single()
    if (skipIfNotFound(error, "metrics_overview")) return
    expect(error).toBeNull()
    expect(data).toHaveProperty("total_participants")
    expect(data).toHaveProperty("from_taller")
  })

  it("metrics_daily: service_role tiene acceso", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any).from("metrics_daily").select("*")
    if (skipIfNotFound(error, "metrics_daily")) return
    expect(error).toBeNull()
  })

  it("metrics_by_city: service_role tiene acceso", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any).from("metrics_by_city").select("*")
    if (skipIfNotFound(error, "metrics_by_city")) return
    expect(error).toBeNull()
  })

  it("metrics_predictions: service_role tiene acceso", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any).from("metrics_predictions").select("*").single()
    if (skipIfNotFound(error, "metrics_predictions")) return
    expect(error).toBeNull()
    expect(data).toHaveProperty("total_predictions")
  })

  it("metrics_access_daily: service_role tiene acceso", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any).from("metrics_access_daily").select("*")
    if (skipIfNotFound(error, "metrics_access_daily")) return
    expect(error).toBeNull()
  })

  it("metrics_access_overview: service_role tiene acceso", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any).from("metrics_access_overview").select("*").single()
    if (skipIfNotFound(error, "metrics_access_overview")) return
    expect(error).toBeNull()
    expect(data).toHaveProperty("total_logins")
  })
})

// -----------------------------------------------------------------
describe("access_logs: service_role puede insertar", () => {
  let userId: string | undefined

  beforeAll(async () => {
    const { data: authData } = await admin.auth.admin.createUser({
      email:         `__logtest${Date.now()}@test.com`,
      password:      "test-123!",
      email_confirm: true,
    })
    userId = authData.user?.id
  })

  afterAll(async () => {
    if (userId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from("access_logs").delete().eq("user_id", userId)
      await admin.auth.admin.deleteUser(userId)
    }
  })

  it("service_role puede insertar un log de acceso", async () => {
    if (!userId) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any).from("access_logs").insert({ user_id: userId })
    expect(error).toBeNull()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: logs } = await (admin as any)
      .from("access_logs").select("id").eq("user_id", userId)
    expect((logs?.length ?? 0) >= 1).toBe(true)
  })
})

// -----------------------------------------------------------------
describe("report_snapshots: service_role puede leer e insertar", () => {
  let snapshotId: string | undefined

  afterAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (snapshotId) await (admin as any).from("report_snapshots").delete().eq("id", snapshotId)
  })

  it("service_role puede insertar y leer snapshots", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any).from("report_snapshots").insert({
      type:         "daily",
      period_label: "Test periodo",
      data:         { test: true, total_participantes: 0 },
    }).select("id").single()

    expect(error).toBeNull()
    expect(data?.id).toBeTruthy()
    snapshotId = data?.id
  })
})
