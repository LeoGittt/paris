import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: participant } = await supabase
    .from("participants")
    .select("id, total_points, ranking_position")
    .eq("user_id", user.id)
    .single() as { data: { id: string; total_points: number; ranking_position: number | null } | null }

  if (!participant) redirect("/")

  const { data: ranking } = await supabase
    .from("ranking_view")
    .select("participant_id, first_name, last_name, total_points, correct_exact, correct_winner, ranking_position")
    .order("ranking_position", { ascending: true })
    .limit(50) as { data: RankingRow[] | null }

  const rows = ranking ?? []
  const myPos = participant.ranking_position
  const myId  = participant.id

  const top3 = rows.slice(0, 3)
  const rest  = rows.slice(3)

  return (
    <div className="space-y-8">
      <div>
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Tabla de posiciones</p>
        <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none">RANKING</h1>
      </div>

      {/* Mi posición */}
      {myPos && (
        <div className="bg-[#054a9d]/15 border border-[#054a9d]/30 rounded-2xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em]">Tu posición actual</p>
            <p className="text-white font-black text-2xl mt-0.5">#{myPos}</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em]">Tus puntos</p>
            <p className="text-[#c3871e] font-black text-2xl mt-0.5">{participant.total_points} pts</p>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/25 text-base font-medium">El ranking se publicará cuando comiencen los partidos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top 3 podio */}
          {top3.length > 0 && (
            <div className="bg-[#0b2440] border border-white/8 rounded-2xl p-6">
              <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] text-center mb-6">Top 3</p>
              <div className="flex items-end justify-center gap-4 md:gap-8">
                {[top3[1], top3[0], top3[2]].filter(Boolean).map(p => {
                  const cfg = podiumConfig[p.ranking_position as 1|2|3]
                  const isMe = p.participant_id === myId
                  return (
                    <div key={p.participant_id} className={`flex flex-col items-center gap-2 ${cfg.order}`}>
                      <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: cfg.color }}>
                        {p.ranking_position}° LUGAR
                      </span>
                      <div
                        className={`rounded-2xl flex items-center justify-center font-black text-white relative ${cfg.size}`}
                        style={{ background: cfg.bg, border: `2px solid ${cfg.border}`, boxShadow: `0 0 20px ${cfg.ring}` }}
                      >
                        {p.ranking_position === 1 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">👑</span>}
                        {initials(p.first_name, p.last_name)}
                        {isMe && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#054a9d] rounded-full border-2 border-[#0b2440] text-[7px] flex items-center justify-center text-white font-black">
                            Yo
                          </span>
                        )}
                      </div>
                      <p className="text-white font-black text-sm text-center leading-tight">
                        {p.first_name}<br />
                        <span className="text-white/35 font-medium text-[11px]">{p.last_name}</span>
                      </p>
                      <p className="font-black text-xl tabular-nums" style={{ color: cfg.color }}>
                        {p.total_points}<span className="text-[10px] text-white/25 ml-1">pts</span>
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tabla posiciones 4+ */}
          {rest.length > 0 && (
            <div className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 px-5 py-3 bg-[#06192c]/50 border-b border-white/6">
                {[
                  { l: "#",       c: "col-span-1 text-center" },
                  { l: "Jugador", c: "col-span-5" },
                  { l: "Puntos",  c: "col-span-3 text-center" },
                  { l: "Exactos", c: "col-span-3 text-center" },
                ].map(h => (
                  <div key={h.l} className={`${h.c} text-white/20 text-[9px] font-black uppercase tracking-[0.25em]`}>
                    {h.l}
                  </div>
                ))}
              </div>
              <div className="divide-y divide-white/4">
                {rest.map(p => {
                  const isMe = p.participant_id === myId
                  return (
                    <div
                      key={p.participant_id}
                      className={`grid grid-cols-12 items-center px-5 py-3.5 transition-colors ${
                        isMe ? "bg-[#054a9d]/10 border-l-2 border-[#054a9d]" : "hover:bg-white/3"
                      }`}
                    >
                      <div className="col-span-1 text-center">
                        <span className="text-white/30 text-sm font-black">{p.ranking_position}</span>
                      </div>
                      <div className="col-span-5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black text-white/40"
                             style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          {initials(p.first_name, p.last_name)}
                        </div>
                        <span className="text-white/60 text-sm font-bold truncate">
                          {p.first_name} {p.last_name}
                          {isMe && <span className="text-[#7ab0e8] text-[10px] ml-1">(vos)</span>}
                        </span>
                      </div>
                      <div className="col-span-3 text-center">
                        <span className="text-white/70 font-black text-base tabular-nums">{p.total_points}</span>
                      </div>
                      <div className="col-span-3 text-center">
                        <span className="text-emerald-400/70 font-black text-sm tabular-nums">{p.correct_exact}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="px-5 py-3 border-t border-white/6 text-center">
                <p className="text-white/20 text-[11px] font-medium">Mostrando top 50 participantes</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const initials = (f: string, l: string) =>
  `${f[0] ?? ""}${l[0] ?? ""}`.toUpperCase()

const podiumConfig: Record<1|2|3, { color: string; bg: string; border: string; ring: string; size: string; order: string }> = {
  1: { color: "#c3871e", bg: "rgba(195,135,30,0.12)", border: "rgba(195,135,30,0.40)", ring: "rgba(195,135,30,0.25)", size: "w-16 h-16 text-xl", order: "order-2" },
  2: { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.30)", ring: "rgba(148,163,184,0.15)", size: "w-13 h-13 text-lg", order: "order-1" },
  3: { color: "#cd7c3a", bg: "rgba(205,124,58,0.08)",  border: "rgba(205,124,58,0.30)",  ring: "rgba(205,124,58,0.15)",  size: "w-12 h-12 text-base", order: "order-3" },
}

interface RankingRow {
  participant_id: string
  first_name: string
  last_name: string
  total_points: number
  correct_exact: number
  correct_winner: number
  ranking_position: number
}
