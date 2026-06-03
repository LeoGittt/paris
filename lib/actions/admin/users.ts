"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import type { Database, UserRole } from "@/lib/supabase/types"

// Cliente con service_role para operaciones de admin en auth.users
function getAdminClient() {
  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type UserActionResult = { ok: true } | { ok: false; error: string }

export async function createSystemUser(
  email: string,
  password: string,
  role: UserRole
): Promise<UserActionResult> {
  const admin = getAdminClient()

  // Crear usuario en auth
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    if (error.message.includes("already")) return { ok: false, error: "Ese email ya está registrado." }
    return { ok: false, error: error.message }
  }

  // Asignar rol
  const { error: roleError } = await admin
    .from("user_roles")
    .insert({ user_id: data.user.id, role })

  if (roleError) return { ok: false, error: "Usuario creado pero error al asignar rol." }

  revalidatePath("/admin/configuracion")
  return { ok: true }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<UserActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("user_roles")
    .update({ role })
    .eq("user_id", userId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/configuracion")
  return { ok: true }
}

export async function deleteSystemUser(userId: string): Promise<UserActionResult> {
  const admin = getAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/configuracion")
  return { ok: true }
}

export async function toggleUserEnabled(userId: string, banned: boolean): Promise<UserActionResult> {
  const admin = getAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: banned ? "876600h" : "none", // ~100 años o desbanear
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/configuracion")
  return { ok: true }
}
