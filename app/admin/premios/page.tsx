import { createClient } from "@/lib/supabase/server"
import { PrizesAdmin } from "@/components/admin/prizes-admin"

export default async function AdminPremiosPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [{ data: prizes }, { data: participants }] = await Promise.all([
    supabase.from("prizes").select("*").order("created_at", { ascending: false }),
    db.from("participants").select("id, first_name, last_name, total_points, ranking_position")
      .eq("is_blocked", false).eq("is_employee", false).order("total_points", { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Administración</p>
        <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none">PREMIOS</h1>
      </div>
      <PrizesAdmin prizes={prizes ?? []} participants={participants ?? []} />
    </div>
  )
}
