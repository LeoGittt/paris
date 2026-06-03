"use client"

import type { LandingPrize } from "@/app/page"

const MOCK_PRIZES: LandingPrize[] = [
  { id: "1", title: "Gran Premio",      description: "Pasajes + Hotel + Entradas a partidos",        stage: "Final",          prize_type: "final",   status: "available" },
  { id: "2", title: "Experiencia VIP",  description: "Test drive exclusivo + Kit Chevrolet Premium", stage: "Semifinal",      prize_type: "stage",   status: "available" },
  { id: "3", title: "Service Premium",  description: "Mantenimiento completo durante 1 año",          stage: "Cuartos",        prize_type: "stage",   status: "available" },
  { id: "4", title: "Merchandising",    description: "Productos exclusivos Chevrolet cada semana",    stage: "Fase de Grupos", prize_type: "weekly",  status: "available" },
]

interface Props { prizes?: LandingPrize[] }

export function PrizesSection({ prizes }: Props) {
  const data = prizes && prizes.length > 0 ? prizes : MOCK_PRIZES
  const [main, ...rest] = data

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* Premio principal */}
      <div className="lg:col-span-2 group relative rounded-2xl overflow-hidden bg-[#0b2440] border border-[#c3871e]/25 hover:border-[#c3871e]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#c3871e]/10">
        <div className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-transparent via-[#c3871e] to-transparent" />
        <div className="p-7 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="shrink-0">
            <span className="block font-black leading-none text-[#c3871e]/15 group-hover:text-[#c3871e]/25 transition-colors"
              style={{ fontSize: "clamp(5rem, 12vw, 9rem)", fontFamily: "'ChevySans', sans-serif" }}>
              01
            </span>
          </div>
          <div className="flex-1">
            <span className="text-[#c3871e] text-[11px] font-black uppercase tracking-[0.3em] block mb-3"
              style={{ fontFamily: "'ChevySans', sans-serif" }}>
              {main.stage}
            </span>
            <h3 className="text-white font-black uppercase leading-tight mb-2"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontFamily: "'ChevySans', sans-serif" }}>
              {main.title}
            </h3>
            {main.description && (
              <p className="text-white/45 text-sm font-medium mb-6 leading-relaxed">{main.description}</p>
            )}
            <div className="inline-flex items-center bg-[#c3871e]/10 border border-[#c3871e]/20 rounded-xl px-5 py-2.5">
              <span className="text-[#c3871e] font-black text-sm uppercase tracking-wide"
                style={{ fontFamily: "'ChevySans', sans-serif" }}>
                Premio Principal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Premios secundarios */}
      <div className="flex flex-col gap-4">
        {rest.slice(0, 3).map((prize, i) => (
          <div key={prize.id}
            className="group relative rounded-xl bg-[#0b2440] border border-white/6 hover:border-white/14 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-[#054a9d]/50 to-transparent" />
            <div className="p-5 flex items-center gap-4">
              <span className="shrink-0 font-black text-4xl text-[#054a9d]/20 group-hover:text-[#054a9d]/40 transition-colors leading-none w-10 text-right tabular-nums"
                style={{ fontFamily: "'ChevySans', sans-serif" }}>
                0{i + 2}
              </span>
              <div className="w-px h-10 bg-white/6 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.25em] block mb-0.5">
                  {prize.stage}
                </span>
                <p className="text-white font-black text-sm uppercase truncate" style={{ fontFamily: "'ChevySans', sans-serif" }}>
                  {prize.title}
                </p>
                {prize.description && (
                  <p className="text-white/35 text-[11px] font-medium mt-0.5 leading-snug">{prize.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="flex-1 flex items-center justify-center bg-[#0b2440] border border-white/6 rounded-xl p-6 text-center">
            <p className="text-white/20 text-sm">Los premios se anunciarán pronto</p>
          </div>
        )}
      </div>
    </div>
  )
}
