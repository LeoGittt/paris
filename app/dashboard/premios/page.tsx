import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Gift, CheckCircle2, Clock, Trophy } from "lucide-react"

// Solo permite URLs HTTPS absolutas — evita cargar recursos arbitrarios
function isSafeImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "https:"
  } catch {
    return false
  }
}

const STATUS_CONFIG = {
  available: { label: "Disponible",  color: "#4ade80", icon: Gift },
  pending:   { label: "Pendiente",   color: "#c3871e", icon: Clock },
  delivered: { label: "Entregado",   color: "#7ab0e8", icon: CheckCircle2 },
}

export default async function PremiosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: participant } = await supabase
    .from("participants")
    .select("id, first_name, total_points, ranking_position")
    .eq("user_id", user.id)
    .single() as { data: { id: string; first_name: string; total_points: number; ranking_position: number | null } | null }

  if (!participant) redirect("/")

  const { data: prizes } = await supabase
    .from("prizes")
    .select("*")
    .order("created_at", { ascending: true }) as { data: PrizeRow[] | null }

  const myPrizes = (prizes ?? []).filter(p => p.winner_id === participant.id)

  const grouped = (prizes ?? []).reduce<Record<string, PrizeRow[]>>((acc, p) => {
    if (!acc[p.stage]) acc[p.stage] = []
    acc[p.stage].push(p)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      <div>
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Lo que podés ganar</p>
        <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none">PREMIOS</h1>
      </div>

      {/* Mis premios ganados */}
      {myPrizes.length > 0 && (
        <div className="bg-[#c3871e]/10 border border-[#c3871e]/25 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-[#c3871e]" />
            <p className="text-[#c3871e] font-black uppercase text-sm tracking-wide">¡Ganaste!</p>
          </div>
          <div className="space-y-3">
            {myPrizes.map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <Gift className="w-4 h-4 text-[#c3871e] shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">{p.title}</p>
                  <p className="text-white/40 text-[11px]">{p.stage} · {STATUS_CONFIG[p.status].label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20">
          <Gift className="w-10 h-10 text-white/15 mx-auto mb-4" />
          <p className="text-white/25 text-base font-medium">Los premios se publicarán pronto</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([stage, stagePrizes]) => (
            <div key={stage} className="space-y-3">
              <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.3em] px-1">{stage}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stagePrizes.map(prize => {
                  const cfg = STATUS_CONFIG[prize.status]
                  const isWinner = prize.winner_id === participant.id
                  return (
                    <div
                      key={prize.id}
                      className={`bg-[#0b2440] rounded-2xl overflow-hidden transition-all ${
                        isWinner
                          ? "border-2 border-[#c3871e]/50 shadow-lg shadow-[#c3871e]/10"
                          : "border border-white/8"
                      }`}
                    >
                      {prize.image_url && isSafeImageUrl(prize.image_url) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={prize.image_url} alt={prize.title} className="w-full h-32 object-cover" />
                      )}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-white font-black text-sm uppercase tracking-wide leading-tight flex-1">
                            {prize.title}
                          </h3>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                            <span className="text-[10px] font-black uppercase" style={{ color: cfg.color }}>
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                        {prize.description && (
                          <p className="text-white/35 text-xs font-medium leading-relaxed">{prize.description}</p>
                        )}
                        {isWinner && (
                          <div className="mt-3 bg-[#c3871e]/10 border border-[#c3871e]/25 rounded-xl px-3 py-2 text-center">
                            <p className="text-[#c3871e] text-[11px] font-black uppercase tracking-wide">🏆 ¡Es tuyo!</p>
                          </div>
                        )}
                        {prize.winner_id && !isWinner && (
                          <p className="text-white/20 text-[11px] font-medium mt-2">Premio asignado</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface PrizeRow {
  id: string
  title: string
  description: string | null
  stage: string
  prize_type: string
  status: "available" | "pending" | "delivered"
  winner_id: string | null
  delivered_at: string | null
  image_url: string | null
  created_at: string
}
