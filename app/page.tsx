import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { LandingClient } from "@/components/prode/landing-client"
import type { RankingRow } from "@/components/prode/ranking-table"
import type { Metadata } from "next"

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
  ] = await Promise.all([
    supabase
      .from("ranking_view")
      .select("participant_id, first_name, last_name, total_points, correct_exact, ranking_position")
      .order("ranking_position", { ascending: true })
      .limit(8) as unknown as Promise<{ data: RankingRow[] | null }>,

    supabase
      .from("prizes")
      .select("id, title, description, stage, prize_type, status")
      .order("created_at", { ascending: true }) as unknown as Promise<{ data: LandingPrize[] | null }>,

    supabase
      .from("matches")
      .select("id, team1, team2, team1_flag, team2_flag, match_date, group_name, stage, predictions_locked, is_finished")
      .eq("is_finished", false)
      .eq("predictions_locked", false)
      .order("match_date", { ascending: true })
      .limit(6) as unknown as Promise<{ data: LandingMatch[] | null }>,
  ])

  const tz = "America/Argentina/Buenos_Aires"
  const upcomingMatches = (matches ?? []).map((m) => ({
    ...m,
    formatted_date: new Date(m.match_date).toLocaleDateString("es-AR", { day: "2-digit", month: "short", timeZone: tz }),
    formatted_time: new Date(m.match_date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: tz }),
  }))

  return (
    <Suspense>
      <LandingClient
        rankingRows={ranking ?? []}
        prizes={prizes ?? []}
        upcomingMatches={upcomingMatches}
      />
    </Suspense>
  )
}
