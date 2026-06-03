"use server"

import { createClient as createAdminClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

// Usa service_role para insertar sin depender de la sesión del cliente
export async function logAccess(userId: string) {
  try {
    const admin = createAdminClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from("access_logs").insert({ user_id: userId })
  } catch {
    // No bloquear el login si el tracking falla
  }
}
