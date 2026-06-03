import { headers } from "next/headers"
import { createClient } from "@supabase/supabase-js"

// Obtiene la IP real del cliente respetando proxies de Vercel
export async function getClientIp(): Promise<string> {
  const h = await headers()
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  )
}

// Verifica el rate limit usando Supabase como store atómico.
// Retorna { allowed: true } o { allowed: false, retryAfter: number }
export async function checkRateLimit(
  action: string,
  opts: { maxRequests: number; windowMinutes: number }
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const ip  = await getClientIp()
    const key = `${ip}:${action}`

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await admin.rpc("check_rate_limit", {
      p_key:            key,
      p_max_requests:   opts.maxRequests,
      p_window_minutes: opts.windowMinutes,
    })

    if (error) {
      // Si la función no existe aún (migration no ejecutada), permitir
      console.warn("[rate-limit] check_rate_limit RPC error:", error.message)
      return { allowed: true }
    }

    return data === true
      ? { allowed: true }
      : { allowed: false, retryAfter: opts.windowMinutes }

  } catch {
    // En caso de error inesperado, permitir para no bloquear usuarios legítimos
    return { allowed: true }
  }
}
