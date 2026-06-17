"use client"

export interface RankingRow {
  participant_id: string
  first_name: string
  last_name: string
  total_points: number
  correct_exact: number
  ranking_position: number
  is_pain_mania_fan?: boolean
}

interface Props {
  rows: RankingRow[]
}

const initials = (f: string, l: string) =>
  `${f[0] ?? ""}${l[0] ?? ""}`.toUpperCase()

const MEDAL: Record<number, { emoji: string; color: string; glow: string; bg: string; border: string }> = {
  1: { emoji: "🥇", color: "#f0c040", glow: "0 0 24px rgba(240,192,64,0.25)", bg: "rgba(240,192,64,0.07)", border: "rgba(240,192,64,0.25)" },
  2: { emoji: "🥈", color: "#b0bec5", glow: "0 0 18px rgba(176,190,197,0.15)", bg: "rgba(176,190,197,0.05)", border: "rgba(176,190,197,0.18)" },
  3: { emoji: "🥉", color: "#cd7c3a", glow: "0 0 18px rgba(205,124,58,0.15)", bg: "rgba(205,124,58,0.06)", border: "rgba(205,124,58,0.20)" },
}

export function RankingTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl bg-[#0b2440] border border-white/8 px-6 py-16 text-center">
        <p className="text-white/25 text-sm font-medium" style={{ fontFamily: "'ChevySans', sans-serif" }}>
          El ranking se publicará cuando comiencen los partidos
        </p>
      </div>
    )
  }

  const top5    = rows.slice(0, 5)
  const MAX_PTS = rows[0]?.total_points ?? 1

  return (
    <div className="rounded-2xl overflow-hidden border border-white/8" style={{ background: "linear-gradient(180deg, #0d2745 0%, #091e35 100%)" }}>

      {/* Header */}
      <div className="grid grid-cols-12 px-5 py-3 border-b border-white/6" style={{ background: "rgba(0,0,0,0.2)" }}>
        {[
          { l: "Pos",     c: "col-span-1 text-center" },
          { l: "Jugador", c: "col-span-6" },
          { l: "Pts",     c: "col-span-3 text-right" },
          { l: "Exactos", c: "col-span-2 text-right" },
        ].map(h => (
          <div key={h.l} className={`${h.c} text-white/20 text-[9px] font-black uppercase tracking-[0.25em]`}
               style={{ fontFamily: "'ChevySans', sans-serif" }}>
            {h.l}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/4">
        {top5.map((p, i) => {
          const medal  = MEDAL[p.ranking_position]
          const pct    = MAX_PTS > 0 ? (p.total_points / MAX_PTS) * 100 : 0
          const isTop3 = p.ranking_position <= 3

          return (
            <div
              key={p.participant_id}
              className="grid grid-cols-12 items-center px-5 py-4 transition-colors hover:bg-white/3 group relative"
              style={isTop3 ? { background: medal.bg } : {}}
            >
              {/* Borde izquierdo de color para top 3 */}
              {isTop3 && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r" style={{ background: medal.color, opacity: 0.6 }} />
              )}

              {/* Posición */}
              <div className="col-span-1 flex justify-center">
                {isTop3 ? (
                  <span className="text-xl leading-none select-none">{medal.emoji}</span>
                ) : (
                  <span className="text-white/25 text-sm font-black tabular-nums" style={{ fontFamily: "'ChevySans', sans-serif" }}>
                    {p.ranking_position}
                  </span>
                )}
              </div>

              {/* Avatar + nombre */}
              <div className="col-span-6 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-[11px] font-black relative"
                  style={{
                    background: isTop3 ? medal.bg : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${isTop3 ? medal.border : "rgba(255,255,255,0.08)"}`,
                    boxShadow: isTop3 ? medal.glow : "none",
                    color: isTop3 ? medal.color : "rgba(255,255,255,0.35)",
                    fontFamily: "'ChevySans', sans-serif",
                  }}
                >
                  {initials(p.first_name, p.last_name)}
                </div>
                <div className="min-w-0">
                  <p
                    className="font-black text-sm leading-tight truncate transition-colors group-hover:text-white"
                    style={{ color: isTop3 ? medal.color : "rgba(255,255,255,0.65)", fontFamily: "'ChevySans', sans-serif" }}
                  >
                    {p.first_name} {p.last_name}
                  </p>
                  {/* Barra de progreso bajo el nombre */}
                  <div className="mt-1 w-full h-1 bg-white/6 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: isTop3 ? medal.color : "rgba(5,74,157,0.7)" }}
                    />
                  </div>
                </div>
              </div>

              {/* Puntos */}
              <div className="col-span-3 text-right pr-2">
                <span
                  className="font-black tabular-nums"
                  style={{
                    fontSize: isTop3 ? "1.25rem" : "1rem",
                    color: isTop3 ? medal.color : "rgba(255,255,255,0.7)",
                    fontFamily: "'ChevySans', sans-serif",
                  }}
                >
                  {p.total_points}
                </span>
                <span className="text-white/20 text-[10px] ml-1">pts</span>
              </div>

              {/* Exactos */}
              <div className="col-span-2 text-right">
                <span className="text-emerald-400/70 font-black text-sm tabular-nums" style={{ fontFamily: "'ChevySans', sans-serif" }}>
                  {p.correct_exact}
                  <span className="text-emerald-400/30 text-[9px] ml-0.5">✓</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/6 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.15)" }}>
        <span className="text-white/20 text-[10px] font-medium">Top 5 · actualizado en tiempo real</span>
        <a
          href="/ranking"
          className="text-[#7ab0e8] hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
          style={{ fontFamily: "'ChevySans', sans-serif" }}
        >
          Ver completo →
        </a>
      </div>
    </div>
  )
}
