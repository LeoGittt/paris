import { createClient } from "@/lib/supabase/server"
import { ParticipantsTable } from "@/components/admin/participants-table"

export default async function AdminParticipantesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; from?: string; to?: string }>
}) {
  const { q = "", page = "1", from: dateFrom = "", to: dateTo = "" } = await searchParams
  const supabase = await createClient()
  const pageSize = 20
  const rangeFrom = (parseInt(page) - 1) * pageSize
  const rangeTo   = rangeFrom + pageSize - 1

  let query = supabase
    .from("participants")
    .select("id, first_name, last_name, dni, email, phone, city, license_plate, car_brand, car_model, lead_source, is_blocked, total_points, ranking_position, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(rangeFrom, rangeTo)

  if (q.trim()) {
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,dni.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,license_plate.ilike.%${q}%`
    )
  }
  if (dateFrom) query = query.gte("created_at", dateFrom)
  if (dateTo)   query = query.lte("created_at", dateTo + "T23:59:59Z")

  const { data: participants, count } = await query as {
    data: ParticipantRow[] | null
    count: number | null
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Administración</p>
        <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none">PARTICIPANTES</h1>
      </div>
      <ParticipantsTable
        participants={participants ?? []}
        total={count ?? 0}
        page={parseInt(page)}
        pageSize={pageSize}
        query={q}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </div>
  )
}

export interface ParticipantRow {
  id: string
  first_name: string
  last_name: string
  dni: string
  email: string
  phone: string
  city: string
  license_plate: string
  car_brand: string
  car_model: string
  lead_source: string
  is_blocked: boolean
  total_points: number
  ranking_position: number | null
  created_at: string
}
