"use client"

export interface RankingRow {
  participant_id: string
  first_name: string
  last_name: string
  total_points: number
  correct_exact: number
  ranking_position: number
}

interface Props {
  rows: RankingRow[]
}

const initials = (f: string, l: string) =>
  `${f[0] ?? ""}${l[0] ?? ""}`.toUpperCase()

const top3Config: Record<number, {
  label: string; color: string; bg: string; border: string; ring: string; size: string; order: string
}> = {
  1: { label: "1°", color: "#c3871e", bg: "rgba(195,135,30,0.12)", border: "rgba(195,135,30,0.40)", ring: "rgba(195,135,30,0.25)", size: "w-16 h-16 text-xl", order: "order-2" },
  2: { label: "2°", color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.30)", ring: "rgba(148,163,184,0.15)", size: "w-13 h-13 text-lg", order: "order-1" },
  3: { label: "3°", color: "#cd7c3a", bg: "rgba(205,124,58,0.08)",  border: "rgba(205,124,58,0.30)",  ring: "rgba(205,124,58,0.15)",  size: "w-12 h-12 text-base", order: "order-3" },
}

function PodiumCard({ player, MAX_PTS }: { player: RankingRow; MAX_PTS: number }) {
  const cfg = top3Config[player.ranking_position]
  const pct = MAX_PTS > 0 ? Math.round((player.total_points / MAX_PTS) * 100) : 0

  return (
    <div className={`${cfg.order} flex flex-col items-center gap-2`}>
      <span className="text-[11px] font-black uppercase tracking-wider mb-1" style={{ color: cfg.color, fontFamily: "'ChevySans', sans-serif" }}>
        {cfg.label} LUGAR
      </span>
      <div className={`${cfg.size} rounded-2xl flex items-center justify-center font-black text-white relative`}
           style={{ background: cfg.bg, border: `2px solid ${cfg.border}`, boxShadow: `0 0 20px ${cfg.ring}`, fontFamily: "'ChevySans', sans-serif" }}>
        {initials(player.first_name, player.last_name)}
        {player.ranking_position === 1 && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg select-none">👑</span>
        )}
      </div>
      <p className="text-white font-black text-sm text-center leading-tight max-w-22.5" style={{ fontFamily: "'ChevySans', sans-serif" }}>
        {player.first_name}<br />
        <span className="text-white/40 font-medium text-[11px]">{player.last_name}</span>
      </p>
      <p className="font-black text-2xl tabular-nums" style={{ color: cfg.color, fontFamily: "'ChevySans', sans-serif" }}>
        {player.total_points}<span className="text-[11px] font-bold ml-1 text-white/30">pts</span>
      </p>
      <div className="w-full h-1.5 bg-white/6 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: cfg.color }} />
      </div>
    </div>
  )
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

  const top3   = rows.filter(r => r.ranking_position <= 3)
  const rest   = rows.filter(r => r.ranking_position > 3)
  const MAX_PTS = rows[0]?.total_points ?? 1

  const podium = [
    top3.find(r => r.ranking_position === 2),
    top3.find(r => r.ranking_position === 1),
    top3.find(r => r.ranking_position === 3),
  ].filter(Boolean) as RankingRow[]

  return (
    <div className="space-y-4">
      {top3.length > 0 && (
        <div className="rounded-2xl bg-[#0b2440] border border-white/8 px-6 pt-8 pb-6">
          <p className="text-center text-white/25 text-[10px] font-black uppercase tracking-[0.3em] mb-8" style={{ fontFamily: "'ChevySans', sans-serif" }}>
            Top 3
          </p>
          <div className="flex items-end justify-center gap-4 md:gap-8 mb-6">
            {podium.map(p => <PodiumCard key={p.participant_id} player={p} MAX_PTS={MAX_PTS} />)}
          </div>
          <div className="flex items-end justify-center gap-4 md:gap-8">
            <div className="flex-1 max-w-22.5 h-10 rounded-t-lg flex items-center justify-center"
                 style={{ background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.15)" }}>
              <span className="text-[#94a3b8]/60 font-black text-xs">2°</span>
            </div>
            <div className="flex-1 max-w-22.5 h-16 rounded-t-lg flex items-center justify-center"
                 style={{ background: "rgba(195,135,30,0.10)", border: "1px solid rgba(195,135,30,0.20)" }}>
              <span className="text-[#c3871e]/60 font-black text-xs">1°</span>
            </div>
            <div className="flex-1 max-w-22.5 h-7 rounded-t-lg flex items-center justify-center"
                 style={{ background: "rgba(205,124,58,0.08)", border: "1px solid rgba(205,124,58,0.15)" }}>
              <span className="text-[#cd7c3a]/60 font-black text-xs">3°</span>
            </div>
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div className="rounded-2xl bg-[#0b2440] border border-white/8 overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 bg-[#06192c]/50 border-b border-white/6">
            {[
              { l: "#",       c: "col-span-1 text-center" },
              { l: "Jugador", c: "col-span-5" },
              { l: "Puntos",  c: "col-span-3 text-center" },
              { l: "Exactos", c: "col-span-3 text-center" },
            ].map(h => (
              <div key={h.l} className={`${h.c} text-white/20 text-[9px] font-black uppercase tracking-[0.25em]`} style={{ fontFamily: "'ChevySans', sans-serif" }}>
                {h.l}
              </div>
            ))}
          </div>
          <div className="divide-y divide-white/4">
            {rest.map(p => {
              const pct = MAX_PTS > 0 ? Math.round((p.total_points / MAX_PTS) * 100) : 0
              return (
                <div key={p.participant_id} className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-white/3 transition-colors group">
                  <div className="col-span-1 text-center">
                    <span className="text-white/20 text-sm font-black" style={{ fontFamily: "'ChevySans', sans-serif" }}>{p.ranking_position}</span>
                  </div>
                  <div className="col-span-5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black text-white/40"
                         style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'ChevySans', sans-serif" }}>
                      {initials(p.first_name, p.last_name)}
                    </div>
                    <span className="text-white/55 group-hover:text-white/80 text-sm font-bold truncate transition-colors" style={{ fontFamily: "'ChevySans', sans-serif" }}>
                      {p.first_name} {p.last_name}
                    </span>
                  </div>
                  <div className="col-span-3 flex flex-col items-center gap-1.5">
                    <span className="text-white/70 font-black text-base tabular-nums" style={{ fontFamily: "'ChevySans', sans-serif" }}>{p.total_points}</span>
                    <div className="w-full h-1 bg-white/6 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#054a9d]/70" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="col-span-3 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-400/70 font-black text-sm tabular-nums" style={{ fontFamily: "'ChevySans', sans-serif" }}>
                      {p.correct_exact}
                      <span className="text-emerald-400/30 text-[9px] font-bold">✓</span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="px-5 py-3.5 border-t border-white/6 bg-[#06192c]/30 text-center">
            <a href="/login" className="text-[#7ab0e8] hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-colors" style={{ fontFamily: "'ChevySans', sans-serif" }}>
              Ver ranking completo →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
