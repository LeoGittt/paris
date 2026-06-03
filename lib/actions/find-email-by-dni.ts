"use server"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"
import { checkRateLimit } from "@/lib/rate-limit"

// Usa service_role para buscar el email asociado a un DNI.
// Necesario porque los participantes no pueden leer la tabla antes de autenticarse.
export async function findEmailByDni(rawDni: string): Promise<string | null> {
  // Rate limit: máx 10 intentos por IP cada 5 minutos
  // Evita enumeración masiva de DNIs para obtener emails
  const { allowed } = await checkRateLimit("find-email-by-dni", {
    maxRequests:   10,
    windowMinutes: 5,
  })
  if (!allowed) return null  // tratar igual que "no encontrado" para no revelar el bloqueo

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
