import { createClient } from "@/lib/supabase/server"
import { MatchesAdmin } from "@/components/admin/matches-admin"

export default async function AdminPartidosPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>
}) {
  const { stage = "group" } = await searchParams
  const supabase = await createClient()

  const { data: rawMatches } = await supabase
    .from("matches")
    .select("*")
    .order("match_date", { ascending: true }) as { data: Omit<MatchAdminRow, "formatted_date" | "formatted_time">[] | null }

  const tz = "America/Argentina/Buenos_Aires"
  const matches: MatchAdminRow[] = (rawMatches ?? []).map((m) => ({
    ...m,
    formatted_date: new Date(m.match_date).toLocaleDateString("es-AR", { day: "2-digit", month: "short", timeZone: tz }),
    formatted_time: new Date(m.match_date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: tz }),
  }))

  return (
    <div className="space-y-6">
      <div>
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Administración</p>
        <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none">PARTIDOS</h1>
      </div>
      <MatchesAdmin matches={matches} activeStage={stage} />
    </div>
  )
}

export interface MatchAdminRow {
  id: string
  team1: string
  team2: string
  team1_flag: string
  team2_flag: string
  match_date: string
  stage: string
  group_name: string | null
  venue: string | null
  score1: number | null
  score2: number | null
  is_finished: boolean
  predictions_locked: boolean
  formatted_date: string
  formatted_time: string
}
