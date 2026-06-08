import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { LandingClient } from "@/components/prode/landing-client"
import type { RankingRow } from "@/components/prode/ranking-table"
import type { Metadata } from "next"

export const revalidate = 30

export const metadata: Metadata = {
  title: 'Prode Chevrolet Grupo Paris | Mundial 2026',
  description: 'El prode oficial del Mundial 2026 de Chevrolet Grupo Paris. Registrate gratis, hacé tus pronósticos partido a partido y ganá premios en cada etapa. Solo para clientes Grupo Paris — San Juan, Argentina.',
  alternates: { canonical: '/' },
}

export interface LandingPrize {
  id: string
  title: string
  description: string | null
  stage: string
  prize_type: string
  status: "available" | "pending" | "delivered"
  image_url: string | null
}

export interface LandingMatch {
  id: string
  team1: string
  team2: string
  team1_flag: string
  team2_flag: string
  match_date: string
  group_name: string | null
  stage: string
  predictions_locked: boolean
  is_finished: boolean
  formatted_date: string
  formatted_time: string
}

export default async function ProdePage() {
  const supabase = await createClient()

  const [
    { data: ranking },
    { data: prizes },
    { data: matches },
    { data: nzMatches },
  ] = await Promise.all([
    supabase
      .from("ranking_view")
      .select("participant_id, first_name, last_name, total_points, correct_exact, ranking_position")
      .order("ranking_position", { ascending: true })
      .limit(8) as unknown as Promise<{ data: RankingRow[] | null }>,

    supabase
      .from("prizes")
      .select("id, title, description, stage, prize_type, status, image_url")
      .order("created_at", { ascending: true }) as unknown as Promise<{ data: LandingPrize[] | null }>,

    supabase
      .from("matches")
      .select("id, team1, team2, team1_flag, team2_flag, match_date, group_name, stage, predictions_locked, is_finished")
      .eq("is_finished", false)
      .eq("predictions_locked", false)
      .order("match_date", { ascending: true })
      .limit(6) as unknown as Promise<{ data: LandingMatch[] | null }>,

    supabase
      .from("matches")
      .select("id, team1, team2")
      .or("team1.ilike.%Nueva Zelanda%,team1.ilike.%New Zealand%,team2.ilike.%Nueva Zelanda%,team2.ilike.%New Zealand%") as unknown as Promise<{ data: { id: string; team1: string; team2: string }[] | null }>,
  ])

  const painManiaFanIds = new Set<string>()
  if (nzMatches?.length) {
    const { data: nzPreds } = await supabase
      .from("predictions")
      .select("participant_id, predicted_score1, predicted_score2, match_id")
      .in("match_id", nzMatches.map(m => m.id))
    for (const pred of nzPreds ?? []) {
      const match = nzMatches.find(m => m.id === pred.match_id)
      if (!match) continue
      const nzIsTeam1 = /new zealand|nueva zelanda/i.test(match.team1)
      const nzWins = nzIsTeam1
        ? pred.predicted_score1 > pred.predicted_score2
        : pred.predicted_score2 > pred.predicted_score1
      if (nzWins) painManiaFanIds.add(pred.participant_id)
    }
  }

  const rankingRows = (ranking ?? []).map(r => ({
    ...r,
    is_pain_mania_fan: painManiaFanIds.has(r.participant_id),
  }))

  const tz = "America/Argentina/Buenos_Aires"
  const upcomingMatches = (matches ?? []).map((m) => ({
    ...m,
    formatted_date: new Date(m.match_date).toLocaleDateString("es-AR", { day: "2-digit", month: "short", timeZone: tz }),
    formatted_time: new Date(m.match_date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: tz }),
  }))

  return (
    <Suspense>
      <LandingClient
        rankingRows={rankingRows}
        prizes={prizes ?? []}
        upcomingMatches={upcomingMatches}
      />
    </Suspense>
  )
}
