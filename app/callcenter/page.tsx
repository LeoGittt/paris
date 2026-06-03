import { createClient } from "@/lib/supabase/server"
import { CallCenterSearch } from "@/components/callcenter/search"

export default async function CallCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = "" } = await searchParams
  const supabase = await createClient()

  let participants: ParticipantCC[] = []
  let prizesMap:     Record<string, PrizeCC[]>  = {}
  let lastActivityMap: Record<string, string | null> = {}

  // Sanitizar: eliminar caracteres especiales de la sintaxis PostgREST
  const safeQ = q.replace(/[%_,.()"']/g, "").trim()

  if (safeQ.length >= 2) {
    const { data } = await supabase
      .from("participants")
      .select(`
        id, first_name, last_name, dni, email, phone,
        city, license_plate, car_brand, car_model,
        total_points, ranking_position, is_blocked, created_at,
        lead_source
      `)
      .or(`first_name.ilike.%${safeQ}%,last_name.ilike.%${safeQ}%,dni.ilike.%${safeQ}%,email.ilike.%${safeQ}%,phone.ilike.%${safeQ}%,license_plate.ilike.%${safeQ}%`)
      .limit(10) as { data: ParticipantCC[] | null }

    participants = data ?? []

    if (participants.length > 0) {
      const ids = participants.map(p => p.id)

      // Premios ganados y última actividad en paralelo
      const [{ data: prizes }, { data: lastPredictions }] = await Promise.all([
        supabase
          .from("prizes")
          .select("id, title, stage, status, winner_id")
          .in("winner_id", ids) as unknown as Promise<{ data: PrizeCC[] | null }>,

        supabase
          .from("predictions")
          .select("participant_id, submitted_at")
          .in("participant_id", ids)
          .order("submitted_at", { ascending: false }) as unknown as Promise<{ data: { participant_id: string; submitted_at: string }[] | null }>,
      ])

      // Agrupar premios por participante
      for (const prize of prizes ?? []) {
        if (!prize.winner_id) continue
        if (!prizesMap[prize.winner_id]) prizesMap[prize.winner_id] = []
        prizesMap[prize.winner_id].push(prize)
      }

      // Última predicción por participante (ya viene ordenado desc, tomar la primera de cada uno)
      for (const pred of lastPredictions ?? []) {
        if (!lastActivityMap[pred.participant_id]) {
          lastActivityMap[pred.participant_id] = pred.submitted_at
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Consulta de cliente</p>
        <h1 className="text-white font-black uppercase text-3xl md:text-4xl leading-none">BUSCAR PARTICIPANTE</h1>
      </div>
      <CallCenterSearch
        participants={participants}
        query={q}
        prizesMap={prizesMap}
        lastActivityMap={lastActivityMap}
      />
    </div>
  )
}

export interface PrizeCC {
  id: string
  title: string
  stage: string
  status: "available" | "pending" | "delivered"
  winner_id: string | null
}

export interface ParticipantCC {
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
  total_points: number
  ranking_position: number | null
  is_blocked: boolean
  created_at: string
  lead_source: string
}
