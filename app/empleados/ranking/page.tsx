import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EmployeeRankingClient } from "@/components/empleados/employee-ranking-client"

export const revalidate = 30

export interface EmployeeRow {
  participant_id: string
  first_name: string
  last_name: string
  total_points: number
  avatar_url: string | null
  correct_exact: number
  correct_winner: number
  correct_diff: number
  predictions_count: number
  ranking_position: number
}

export default async function EmpleadosRankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [{ data: rows }, { data: me }] = await Promise.all([
    db
      .from("employee_ranking_view")
      .select("participant_id, first_name, last_name, total_points, avatar_url, correct_exact, correct_winner, correct_diff, predictions_count, ranking_position")
      .order("ranking_position", { ascending: true }) as Promise<{ data: EmployeeRow[] | null }>,

    supabase
      .from("participants")
      .select("id, avatar_url")
      .eq("user_id", user.id)
      .single() as unknown as Promise<{ data: { id: string; avatar_url: string | null } | null }>,
  ])

  return (
    <EmployeeRankingClient
      rows={rows ?? []}
      myParticipantId={me?.id ?? ""}
      myAvatarUrl={me?.avatar_url ?? null}
    />
  )
}
