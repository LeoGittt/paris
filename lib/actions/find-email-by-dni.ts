"use server"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

// Usa service_role para buscar el email asociado a un DNI.
// Necesario porque los participantes no pueden leer la tabla antes de autenticarse.
export async function findEmailByDni(rawDni: string): Promise<string | null> {
  const dni = rawDni.replace(/\D/g, "")
  if (dni.length < 7) return null

  const admin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await admin
    .from("participants")
    .select("email")
    .eq("dni", dni)
    .single()

  return data?.email ?? null
}
