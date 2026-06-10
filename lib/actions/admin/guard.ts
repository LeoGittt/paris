"use server"

import { createClient } from "@/lib/supabase/server"

export async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "No autenticado." }

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single() as { data: { role: string } | null }

  if (data?.role !== "admin") return { ok: false, error: "No autorizado." }
  return { ok: true }
}
