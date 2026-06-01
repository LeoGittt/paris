"use client"

const mockRanking = [
  { position: 1, name: "Juan Pérez",       points: 450, correct: 28, exact: 12 },
  { position: 2, name: "María García",      points: 420, correct: 26, exact: 10 },
  { position: 3, name: "Carlos López",      points: 395, correct: 25, exact:  9 },
  { position: 4, name: "Ana Martínez",      points: 380, correct: 24, exact:  8 },
  { position: 5, name: "Roberto Sánchez",   points: 365, correct: 23, exact:  8 },
  { position: 6, name: "Laura Fernández",   points: 350, correct: 22, exact:  7 },
  { position: 7, name: "Diego Rodríguez",   points: 340, correct: 21, exact:  7 },
  { position: 8, name: "Valentina Torres",  points: 325, correct: 20, exact:  6 },
]

const MAX_PTS = mockRanking[0].points

const top3Config: Record<number, {
  label: string
  color: string
  bg: string
  border: string
  ring: string
  size: string
  order: string
}> = {
  1: { label: "1°", color: "#c3871e", bg: "rgba(195,135,30,0.12)", border: "rgba(195,135,30,0.40)", ring: "rgba(195,135,30,0.25)", size: "w-16 h-16 text-xl", order: "order-2" },
  2: { label: "2°", color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.30)", ring: "rgba(148,163,184,0.15)", size: "w-13 h-13 text-lg", order: "order-1" },
  3: { label: "3°", color: "#cd7c3a", bg: "rgba(205,124,58,0.08)",  border: "rgba(205,124,58,0.30)",  ring: "rgba(205,124,58,0.15)",  size: "w-12 h-12 text-base", order: "order-3" },
}

const initials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

/* ── Podio card ─────────────────────────────────────── */
function PodiumCard({ player }: { player: typeof mockRanking[0] }) {
  const cfg = top3Config[player.position]
  const pct = Math.round((player.points / MAX_PTS) * 100)

  return (
    <div className={`${cfg.order} flex flex-col items-center gap-2`}>

      {/* Posición badge */}
      <span
        className="text-[11px] font-black uppercase tracking-wider mb-1"
        style={{ color: cfg.color, fontFamily: "'ChevySans', sans-serif" }}
      >
        {cfg.label} LUGAR
      </span>

      {/* Avatar */}
      <div
        className={`${cfg.size} rounded-2xl flex items-center justify-center font-black text-white relative`}
        style={{ background: cfg.bg, border: `2px solid ${cfg.border}`, boxShadow: `0 0 20px ${cfg.ring}`, fontFamily: "'ChevySans', sans-serif" }}
      >
        {initials(player.name)}
        {/* Corona para el 1° */}
        {player.position === 1 && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg select-none">👑</span>
        )}
      </div>

      {/* Nombre */}
      <p
        className="text-white font-black text-sm text-center leading-tight max-w-22.5"
        style={{ fontFamily: "'ChevySans', sans-serif" }}
      >
        {player.name.split(" ")[0]}<br />
        <span className="text-white/40 font-medium text-[11px]">{player.name.split(" ").slice(1).join(" ")}</span>
      </p>

      {/* Puntos */}
      <p
        className="font-black text-2xl tabular-nums"
        style={{ color: cfg.color, fontFamily: "'ChevySans', sans-serif" }}
      >
        {player.points}
        <span className="text-[11px] font-bold ml-1 text-white/30">pts</span>
      </p>

      {/* Barra de progreso */}
      <div className="w-full h-1.5 bg-white/6 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: cfg.color }}
        />
      </div>
    </div>
  )
}

/* ── Componente principal ───────────────────────────── */
export function RankingTable() {
  const podium = [mockRanking[1], mockRanking[0], mockRanking[2]] // orden visual: 2-1-3
  const rest   = mockRanking.slice(3)

  return (
    <div className="space-y-4">

      {/* ── Podio top 3 ── */}
      <div className="rounded-2xl bg-[#0b2440] border border-white/8 px-6 pt-8 pb-6">
        <p
          className="text-center text-white/25 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          style={{ fontFamily: "'ChevySans', sans-serif" }}
        >
          Top 3
        </p>

        {/* Podio con alturas visuales */}
        <div className="flex items-end justify-center gap-4 md:gap-8 mb-6">
          {podium.map(p => (
            <PodiumCard key={p.position} player={p} />
          ))}
        </div>

        {/* Bases del podio */}
        <div className="flex items-end justify-center gap-4 md:gap-8">
          {/* 2° */}
          <div className="flex-1 max-w-22.5 h-10 rounded-t-lg flex items-center justify-center"
               style={{ background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.15)" }}>
            <span className="text-[#94a3b8]/60 font-black text-xs">2°</span>
          </div>
          {/* 1° — más alto */}
          <div className="flex-1 max-w-22.5 h-16 rounded-t-lg flex items-center justify-center"
               style={{ background: "rgba(195,135,30,0.10)", border: "1px solid rgba(195,135,30,0.20)" }}>
            <span className="text-[#c3871e]/60 font-black text-xs">1°</span>
          </div>
          {/* 3° */}
          <div className="flex-1 max-w-22.5 h-7 rounded-t-lg flex items-center justify-center"
               style={{ background: "rgba(205,124,58,0.08)", border: "1px solid rgba(205,124,58,0.15)" }}>
            <span className="text-[#cd7c3a]/60 font-black text-xs">3°</span>
          </div>
        </div>
      </div>

      {/* ── Lista posiciones 4–8 ── */}
      <div className="rounded-2xl bg-[#0b2440] border border-white/8 overflow-hidden">

        {/* Header */}
        <div className="grid grid-cols-12 px-5 py-3 bg-[#06192c]/50 border-b border-white/6">
          {[
            { l: "#",        c: "col-span-1 text-center" },
            { l: "Jugador",  c: "col-span-5" },
            { l: "Puntos",   c: "col-span-3 text-center" },
            { l: "Exactos",  c: "col-span-3 text-center" },
          ].map(h => (
            <div key={h.l} className={`${h.c} text-white/20 text-[9px] font-black uppercase tracking-[0.25em]`}
                 style={{ fontFamily: "'ChevySans', sans-serif" }}>
              {h.l}
            </div>
          ))}
        </div>

        <div className="divide-y divide-white/4">
          {rest.map((p, i) => {
            const pct = Math.round((p.points / MAX_PTS) * 100)
            return (
              <div
                key={p.position}
                className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-white/3 transition-colors group"
              >
                {/* # */}
                <div className="col-span-1 text-center">
                  <span className="text-white/20 text-sm font-black" style={{ fontFamily: "'ChevySans', sans-serif" }}>
                    {p.position}
                  </span>
                </div>

                {/* Jugador */}
                <div className="col-span-5 flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black text-white/40"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'ChevySans', sans-serif" }}
                  >
                    {initials(p.name)}
                  </div>
                  <span
                    className="text-white/55 group-hover:text-white/80 text-sm font-bold truncate transition-colors"
                    style={{ fontFamily: "'ChevySans', sans-serif" }}
                  >
                    {p.name}
                  </span>
                </div>

                {/* Puntos con barra */}
                <div className="col-span-3 flex flex-col items-center gap-1.5">
                  <span
                    className="text-white/70 font-black text-base tabular-nums"
                    style={{ fontFamily: "'ChevySans', sans-serif" }}
                  >
                    {p.points}
                  </span>
                  <div className="w-full h-1 bg-white/6 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#054a9d]/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Exactos */}
                <div className="col-span-3 text-center">
                  <span
                    className="inline-flex items-center gap-1 text-emerald-400/70 font-black text-sm tabular-nums"
                    style={{ fontFamily: "'ChevySans', sans-serif" }}
                  >
                    {p.exact}
                    <span className="text-emerald-400/30 text-[9px] font-bold">✓</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-white/6 bg-[#06192c]/30 text-center">
          <button
            className="text-[#7ab0e8] hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
            style={{ fontFamily: "'ChevySans', sans-serif" }}
          >
            Ver ranking completo →
          </button>
        </div>
      </div>

    </div>
  )
}
