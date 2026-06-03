import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { PointsConfig } from "@/components/admin/points-config"
import { SystemUsersManager } from "@/components/admin/system-users"
import type { Database } from "@/lib/supabase/types"

export default async function AdminConfiguracionPage() {
  const supabase = await createClient()

  // Config de puntos
  const { data: config } = await supabase
    .from("point_config")
    .select("*")
    .single() as { data: { id: string; correct_winner: number; correct_exact: number; correct_diff: number } | null }

  // Usuarios del sistema (admin + callcenter) usando service_role
  const admin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: roles } = await admin
    .from("user_roles")
    .select("user_id, role")
    .in("role", ["admin", "callcenter"]) as { data: { user_id: string; role: string }[] | null }

  // Obtener datos de auth.users para cada user_id
  const systemUsers: SystemUser[] = []
  for (const r of roles ?? []) {
    const { data: { user } } = await admin.auth.admin.getUserById(r.user_id)
    if (user) {
      systemUsers.push({
        user_id:    user.id,
        email:      user.email ?? "",
        role:       r.role as "admin" | "callcenter",
        banned:     !!user.banned_until,
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at ?? null,
      })
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Administración</p>
        <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none">CONFIGURACIÓN</h1>
      </div>

      {/* Usuarios del sistema */}
      <section className="space-y-4">
        <div>
          <h2 className="text-white font-black uppercase text-xl tracking-wide">Usuarios del sistema</h2>
          <p className="text-white/30 text-sm mt-1">Administradores y operadores de Call Center</p>
        </div>
        <SystemUsersManager users={systemUsers} />
      </section>

      <div className="h-px bg-white/6" />

      {/* Config puntos */}
      <section className="space-y-4">
        <div>
          <h2 className="text-white font-black uppercase text-xl tracking-wide">Sistema de puntos</h2>
          <p className="text-white/30 text-sm mt-1">Configurable sin intervención del desarrollador</p>
        </div>
        <PointsConfig config={config} />
      </section>
    </div>
  )
}

export interface SystemUser {
  user_id: string
  email: string
  role: "admin" | "callcenter"
  banned: boolean
  created_at: string
  last_sign_in: string | null
}
