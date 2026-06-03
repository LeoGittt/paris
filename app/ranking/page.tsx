import { createClient } from "@/lib/supabase/server"
import type { RankingRow } from "@/components/prode/ranking-table"

export const revalidate = 60

export default async function PublicRankingPage() {
  const supabase = await createClient()

  const [{ data: ranking }, { data: lastUpdated }] = await Promise.all([
    supabase
      .from("ranking_view")
      .select("participant_id, first_name, last_name, total_points, correct_exact, ranking_position")
      .order("ranking_position", { ascending: true })
      .limit(50) as unknown as Promise<{ data: RankingRow[] | null }>,

    supabase
      .from("participants")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1) as unknown as Promise<{ data: { updated_at: string }[] | null }>,
  ])

  const rows = ranking ?? []
  const updatedAt = lastUpdated?.[0]?.updated_at ?? null

  return (
    <div className="min-h-screen bg-[#06192c]" style={{ fontFamily: "'ChevySans', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-5 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#c3871e] text-[11px] font-black uppercase tracking-[0.3em] mb-3">Tabla de posiciones</p>
          <h1 className="text-white font-black uppercase text-5xl md:text-7xl leading-none mb-4">RANKING</h1>
          <p className="text-white/35 text-sm font-medium">
            Top 50 participantes · Prode Grupo Paris 2026
          </p>
          {updatedAt && (
            <p className="text-white/20 text-[11px] font-medium mt-2">
              Última actualización: {new Date(updatedAt).toLocaleString("es-AR", {
                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
              })}
            </p>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-20 bg-[#0b2440] border border-white/8 rounded-2xl">
            <p className="text-white/25 text-base font-medium">El ranking se publicará cuando comiencen los partidos</p>
          </div>
        ) : (
          <div className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
            {/* Header tabla */}
            <div className="grid grid-cols-12 px-5 py-3 bg-[#06192c]/50 border-b border-white/6">
              {[
                { l: "#",       c: "col-span-1 text-center" },
                { l: "Jugador", c: "col-span-7" },
                { l: "Pts",     c: "col-span-2 text-center" },
                { l: "Exactos", c: "col-span-2 text-center" },
              ].map(h => (
                <div key={h.l} className={`${h.c} text-white/20 text-[9px] font-black uppercase tracking-[0.25em]`}>{h.l}</div>
              ))}
            </div>

            <div className="divide-y divide-white/4">
              {rows.map(p => {
                const pos = p.ranking_position
                const medalColor =
                  pos === 1 ? "#c3871e" :
                  pos === 2 ? "#94a3b8" :
                  pos === 3 ? "#cd7c3a" : null

                return (
                  <div key={p.participant_id} className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-white/3 transition-colors">
                    <div className="col-span-1 text-center">
                      {medalColor ? (
                        <span className="font-black text-sm" style={{ color: medalColor }}>{pos}</span>
                      ) : (
                        <span className="text-white/25 text-sm font-black">{pos}</span>
                      )}
                    </div>
                    <div className="col-span-7 flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black"
                        style={{
                          background: medalColor ? `${medalColor}15` : "rgba(255,255,255,0.04)",
                          border: `1px solid ${medalColor ? `${medalColor}30` : "rgba(255,255,255,0.08)"}`,
                          color: medalColor ?? "rgba(255,255,255,0.4)",
                        }}
                      >
                        {p.first_name[0]}{p.last_name[0]}
                      </div>
                      <span className="text-white/70 text-sm font-bold truncate">
                        {p.first_name} {p.last_name}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="font-black text-base tabular-nums" style={{ color: medalColor ?? "rgba(255,255,255,0.7)" }}>
                        {p.total_points}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-emerald-400/70 font-black text-sm tabular-nums">{p.correct_exact}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="px-5 py-4 border-t border-white/6 flex items-center justify-between">
              <p className="text-white/20 text-[11px] font-medium">Mostrando top {rows.length} participantes</p>
              <a href="/" className="text-[#7ab0e8] text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors">
                ← Volver al inicio
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
