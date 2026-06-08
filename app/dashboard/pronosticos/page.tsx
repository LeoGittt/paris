import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PredictionsClient } from "@/components/dashboard/predictions-client"

export default async function PronosticosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: participant } = await supabase
    .from("participants")
    .select("id")
    .eq("user_id", user.id)
    .single() as { data: { id: string } | null }

  if (!participant) redirect("/")

  // Solo partidos de Argentina por el momento
  const { data: rawMatches } = await supabase
    .from("matches")
    .select(`
      id, team1, team2, team1_flag, team2_flag,
      match_date, stage, group_name, venue,
      score1, score2, is_finished, predictions_locked
    `)
    .or("team1.ilike.%argentina%,team2.ilike.%argentina%")
    .order("match_date", { ascending: true }) as { data: Omit<MatchRow, "formatted_date" | "formatted_time">[] | null }

  const tz = "America/Argentina/Buenos_Aires"
  const matches: MatchRow[] = (rawMatches ?? []).map((m) => ({
    ...m,
    formatted_date: new Date(m.match_date).toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "short", timeZone: tz }),
    formatted_time: new Date(m.match_date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: tz }),
  }))

  // Pronósticos existentes del participante
  const { data: predictions } = await supabase
    .from("predictions")
    .select("id, match_id, predicted_score1, predicted_score2, points_earned, result")
    .eq("participant_id", participant.id) as { data: PredictionRow[] | null }

  const predsByMatch = Object.fromEntries(
    (predictions ?? []).map(p => [p.match_id, p])
  )

  return (
    <div className="space-y-6">
      <div>
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Mis predicciones</p>
        <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none">PRONÓSTICOS</h1>
      </div>
      <PredictionsClient
        matches={matches ?? []}
        predsByMatch={predsByMatch}
        participantId={participant.id}
      />
    </div>
  )
}

export interface MatchRow {
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

export interface PredictionRow {
  id: string
  match_id: string
  predicted_score1: number
  predicted_score2: number
  points_earned: number
  result: string
}
