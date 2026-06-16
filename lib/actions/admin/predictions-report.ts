"use server"

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { requireAdmin } from "./guard"

export interface PredictionReportRow {
  participant_name: string
  participant_dni:  string
  participant_email: string
  team1:            string
  team2:            string
  match_date:       string
  stage:            string
  predicted_score1: number
  predicted_score2: number
  real_score1:      number | null
  real_score2:      number | null
  result:           string
  points_earned:    number
}

export async function getPredictionsReport(): Promise<
  { ok: true; rows: PredictionReportRow[] } | { ok: false; error: string }
> {
  const guard = await requireAdmin()
  if (!guard.ok) return guard

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await admin
    .from("predictions")
    .select(`
      predicted_score1,
      predicted_score2,
      points_earned,
      result,
      participants ( first_name, last_name, dni, email, is_employee ),
      matches      ( team1, team2, match_date, stage, score1, score2, is_finished )
    `)
    .order("participants(last_name)", { ascending: true })

  if (error) return { ok: false, error: error.message }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: PredictionReportRow[] = (data ?? []).flatMap((row: any) => {
    const p = Array.isArray(row.participants) ? row.participants[0] : row.participants
    const m = Array.isArray(row.matches)      ? row.matches[0]      : row.matches
    if (!p || !m || p.is_employee) return []
    return [{
      participant_name:  `${p.first_name} ${p.last_name}`,
      participant_dni:   p.dni,
      participant_email: p.email,
      team1:             m.team1,
      team2:             m.team2,
      match_date:        m.match_date,
      stage:             m.stage,
      predicted_score1:  row.predicted_score1,
      predicted_score2:  row.predicted_score2,
      real_score1:       m.is_finished ? m.score1 : null,
      real_score2:       m.is_finished ? m.score2 : null,
      result:            row.result,
      points_earned:     row.points_earned,
    }]
  })

  return { ok: true, rows }
}
