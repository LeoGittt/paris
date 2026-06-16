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
  const pageNum  = Math.max(1, parseInt(page) || 1)
  const rangeFrom = (pageNum - 1) * pageSize
  const rangeTo   = rangeFrom + pageSize - 1

  let query = supabase
    .from("participants")
    .select("id, first_name, last_name, dni, email, phone, city, license_plate, car_brand, car_model, car_year, lead_source, is_blocked, total_points, ranking_position, created_at", { count: "exact" })
    .eq("is_employee", false)
    .order("created_at", { ascending: false })
    .range(rangeFrom, rangeTo)

  const safeQ = q.replace(/[%_,.()"']/g, "").trim()
  if (safeQ) {
    query = query.or(
      `first_name.ilike.%${safeQ}%,last_name.ilike.%${safeQ}%,dni.ilike.%${safeQ}%,email.ilike.%${safeQ}%,phone.ilike.%${safeQ}%,license_plate.ilike.%${safeQ}%`
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
        page={pageNum}
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
  car_year: number | null
  lead_source: string
  is_blocked: boolean
  total_points: number
  ranking_position: number | null
  created_at: string
}
