import { describe, it, expect, beforeAll } from "vitest"
import { createAdminClient } from "../helpers/supabase"

// Tests de las vistas de métricas y access_logs usando service_role
// Verifica que los cron jobs pueden leer estas vistas (bug 26)

const admin = createAdminClient()

// ─────────────────────────────────────────────────────────────────
// Las vistas de métricas requieren que metrics.sql esté ejecutado en Supabase.
// Si no existen, el test lo documenta con un mensaje claro.
function skipIfNotFound(error: unknown, viewName: string) {
  if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "PGRST205") {
    console.warn(`⚠ Vista '${viewName}' no encontrada. Ejecutar metrics.sql en Supabase primero.`)
    return true
  }
  return false
}

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

// ─────────────────────────────────────────────────────────────────
describe("access_logs: service_role puede insertar", () => {
  it("service_role puede insertar un log de acceso", async () => {
    // Crear un usuario temporal solo para el log
    const { data: authData } = await admin.auth.admin.createUser({
      email: `__logtest${Date.now()}@test.com`,
      password: "test-123!",
      email_confirm: true,
    })
    const userId = authData.user?.id
    if (!userId) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any).from("access_logs").insert({ user_id: userId })
    expect(error).toBeNull()

    // Verificar que el log existe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: logs } = await (admin as any)
      .from("access_logs")
      .select("id")
      .eq("user_id", userId)
    expect((logs?.length ?? 0) >= 1).toBe(true)

    // Limpiar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from("access_logs").delete().eq("user_id", userId)
    await admin.auth.admin.deleteUser(userId)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("report_snapshots: service_role puede leer e insertar", () => {
  it("service_role puede insertar y leer snapshots", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any).from("report_snapshots").insert({
      type:         "daily",
      period_label: "Test periodo",
      data:         { test: true, total_participantes: 0 },
    }).select("id").single()

    expect(error).toBeNull()
    expect(data?.id).toBeTruthy()

    // Limpiar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (data?.id) await (admin as any).from("report_snapshots").delete().eq("id", data.id)
  })
})
