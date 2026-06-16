import { describe, it, expect } from "vitest"
import { createAdminClient } from "../helpers/supabase"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const admin = createAdminClient() as any
const TEST_IP = "test-rate-limit-ip"

describe("Rate limiting — función SQL en Supabase", () => {
  it("check_rate_limit existe y retorna boolean", async () => {
    const { data, error } = await admin.rpc("check_rate_limit", {
      p_key:            `${TEST_IP}:test`,
      p_max_requests:   5,
      p_window_minutes: 1,
    })
    expect(error).toBeNull()
    expect(typeof data).toBe("boolean")
  })

  it("primeras N requests son permitidas", async () => {
    const key = `${TEST_IP}:allowed-${Date.now()}`
    for (let i = 0; i < 3; i++) {
      const { data } = await admin.rpc("check_rate_limit", {
        p_key: key, p_max_requests: 3, p_window_minutes: 5,
      })
      expect(data).toBe(true)
    }
  })

  it("request N+1 es bloqueada dentro de la misma ventana", async () => {
    const key = `${TEST_IP}:blocked-${Date.now()}`
    for (let i = 0; i < 3; i++) {
      await admin.rpc("check_rate_limit", { p_key: key, p_max_requests: 3, p_window_minutes: 5 })
    }
    const { data } = await admin.rpc("check_rate_limit", {
      p_key: key, p_max_requests: 3, p_window_minutes: 5,
    })
    expect(data).toBe(false)
  })

  it("IPs distintas tienen contadores independientes", async () => {
    const ts   = Date.now()
    const key1 = `ip-a-${ts}:action`
    const key2 = `ip-b-${ts}:action`

    for (let i = 0; i < 3; i++) {
      await admin.rpc("check_rate_limit", { p_key: key1, p_max_requests: 3, p_window_minutes: 5 })
    }
    // key1 lleno → bloqueado
    const { data: blocked } = await admin.rpc("check_rate_limit", {
      p_key: key1, p_max_requests: 3, p_window_minutes: 5,
    })
    expect(blocked).toBe(false)

    // key2 limpio → permitido
    const { data: allowed } = await admin.rpc("check_rate_limit", {
      p_key: key2, p_max_requests: 3, p_window_minutes: 5,
    })
    expect(allowed).toBe(true)
  })

  it("cleanup_old_rate_limits existe y ejecuta sin error", async () => {
    const { error } = await admin.rpc("cleanup_old_rate_limits" as never)
    expect(error).toBeNull()
  })
})
