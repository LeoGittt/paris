import { createClient } from "@/lib/supabase/server"
import { MetricsDashboard } from "@/components/admin/metrics-dashboard"

export const revalidate = 60 // refresca cada 60 segundos

export default async function AdminMetricasPage() {
  const supabase = await createClient()

  // Las vistas de métricas son dinámicas (creadas vía metrics.sql) — usamos el cliente sin tipos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [
    { data: overview },
    { data: daily },
    { data: cities },
    { data: predictions },
    { data: topParticipants },
    { data: accessOverview },
    { data: accessDaily },
  ] = await Promise.all([
    db.from("metrics_overview").select("*").single()           as Promise<{ data: MetricsOverview | null }>,
    db.from("metrics_daily").select("*")                       as Promise<{ data: DailyRow[] | null }>,
    db.from("metrics_by_city").select("*")                     as Promise<{ data: CityRow[] | null }>,
    db.from("metrics_predictions").select("*").single()        as Promise<{ data: PredictionsMetrics | null }>,
    supabase.from("participants")
      .select("first_name, last_name, total_points, ranking_position, city, lead_source, created_at")
      .eq("is_blocked", false)
      .order("total_points", { ascending: false })
      .limit(10) as unknown as Promise<{ data: TopParticipant[] | null }>,
    db.from("metrics_access_overview").select("*").single()    as Promise<{ data: AccessOverview | null }>,
    db.from("metrics_access_daily").select("*")                as Promise<{ data: AccessDailyRow[] | null }>,
  ])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Marketing & BDC</p>
        <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none">MÉTRICAS</h1>
      </div>
      <MetricsDashboard
        overview={overview}
        daily={daily ?? []}
        cities={cities ?? []}
        predictions={predictions}
        topParticipants={topParticipants ?? []}
        accessOverview={accessOverview}
        accessDaily={accessDaily ?? []}
      />
    </div>
  )
}

export interface MetricsOverview {
  total_participants: number
  active_participants: number
  new_today: number
  new_this_week: number
  new_this_month: number
  from_taller: number
  from_repuestos: number
  from_digital: number
  from_qr: number
  from_direct: number
}

export interface DailyRow     { day: string; registrations: number }
export interface CityRow      { city: string; total: number }
export interface AccessOverview {
  total_logins: number; unique_users: number
  logins_today: number; logins_this_week: number; logins_this_month: number
}
export interface AccessDailyRow { day: string; total_logins: number; unique_users: number }
export interface PredictionsMetrics {
  participants_with_predictions: number
  total_predictions: number
  total_exact: number
  total_winner: number
  total_wrong: number
  total_pending: number
}
export interface TopParticipant {
  first_name: string; last_name: string; total_points: number
  ranking_position: number | null; city: string; lead_source: string; created_at: string
}
