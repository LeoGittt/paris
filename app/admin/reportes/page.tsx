import { createClient } from "@/lib/supabase/server"
import { ReportGenerator } from "@/components/admin/report-generator"

export default async function AdminReportesPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [
    { data: participants },
    { data: ranking },
    { data: prizes },
    { data: predictions },
    { data: snapshots },
  ] = await Promise.all([
    db
      .from("participants")
      .select("first_name, last_name, dni, email, phone, city, license_plate, car_brand, car_model, lead_source, total_points, ranking_position, is_blocked, created_at")
      .eq("is_employee", false)
      .order("created_at", { ascending: false }) as unknown as Promise<{ data: ReportParticipant[] | null }>,

    supabase
      .from("ranking_view")
      .select("first_name, last_name, total_points, correct_exact, correct_winner, ranking_position")
      .order("ranking_position", { ascending: true })
      .limit(50) as unknown as Promise<{ data: ReportRanking[] | null }>,

    supabase
      .from("prizes")
      .select("title, description, stage, prize_type, status, delivered_at")
      .order("created_at", { ascending: true }) as unknown as Promise<{ data: ReportPrize[] | null }>,

    db.from("metrics_predictions").select("*").single() as Promise<{ data: ReportPredictions | null }>,

    db
      .from("report_snapshots")
      .select("id, type, period_label, created_at, data")
      .order("created_at", { ascending: false })
      .limit(20) as Promise<{ data: ReportSnapshot[] | null }>,
  ])

  return (
    <div className="space-y-8">
      <div>
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Análisis</p>
        <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none">REPORTES</h1>
      </div>

      <ReportGenerator
        participants={participants ?? []}
        ranking={ranking ?? []}
        prizes={prizes ?? []}
        predictions={predictions}
        snapshots={snapshots ?? []}
      />
    </div>
  )
}

export interface ReportParticipant {
  first_name: string; last_name: string; dni: string; email: string; phone: string
  city: string; license_plate: string; car_brand: string; car_model: string
  lead_source: string; total_points: number; ranking_position: number | null
  is_blocked: boolean; created_at: string
}
export interface ReportRanking {
  first_name: string; last_name: string; total_points: number
  correct_exact: number; correct_winner: number; ranking_position: number
}
export interface ReportPrize {
  title: string; description: string | null; stage: string
  prize_type: string; status: string; delivered_at: string | null
}
export interface ReportPredictions {
  participants_with_predictions: number; total_predictions: number
  total_exact: number; total_winner: number; total_wrong: number; total_pending: number
}
export interface ReportSnapshot {
  id: string; type: string; period_label: string; created_at: string; data: Record<string, unknown>
}
