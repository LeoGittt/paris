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

  if (roleError) {
    // Rollback: eliminar el usuario de Auth para no dejar cuentas huérfanas sin rol
    await admin.auth.admin.deleteUser(data.user.id)
    return { ok: false, error: "Error al asignar el rol. El usuario no fue creado." }
  }

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
  const admin    = getAdminClient()
  const supabase = await createClient()

  // Verificar que no sea el último admin del sistema
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single() as { data: { role: string } | null }

  if (roleData?.role === "admin") {
    const { count } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin") as { count: number | null }

    if ((count ?? 0) <= 1) {
      return { ok: false, error: "No podés eliminar el último administrador del sistema." }
    }
  }

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
