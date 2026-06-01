"use client"

const prizes = [
  {
    rank: "01",
    label: "Gran Premio",
    title: "Viaje al Mundial 2026",
    details: "Pasajes + Hotel + Entradas a partidos",
    value: "USD 15.000",
    featured: true,
  },
  {
    rank: "02",
    label: "Segundo Premio",
    title: "Experiencia VIP",
    details: "Test drive exclusivo + Kit Chevrolet Premium",
    value: "USD 2.000",
    featured: false,
  },
  {
    rank: "03",
    label: "Tercer Premio",
    title: "Service Premium",
    details: "Mantenimiento completo durante 1 año",
    value: "USD 800",
    featured: false,
  },
  {
    rank: "—",
    label: "Premios Semanales",
    title: "Merchandising",
    details: "Productos exclusivos Chevrolet cada semana",
    value: "USD 150",
    featured: false,
  },
]

export function PrizesSection() {
  const [main, ...rest] = prizes

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* ── Premio principal — ocupa 2 columnas en desktop ── */}
      <div className="lg:col-span-2 group relative rounded-2xl overflow-hidden bg-[#0b2440] border border-[#c3871e]/25 hover:border-[#c3871e]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#c3871e]/10">

        {/* Línea dorada superior */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-transparent via-[#c3871e] to-transparent" />

        <div className="p-7 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center">

          {/* Número grande */}
          <div className="shrink-0">
            <span
              className="block font-black leading-none text-[#c3871e]/15 group-hover:text-[#c3871e]/25 transition-colors"
              style={{ fontSize: "clamp(5rem, 12vw, 9rem)", fontFamily: "'ChevySans', sans-serif" }}
            >
              {main.rank}
            </span>
          </div>

          {/* Contenido */}
          <div className="flex-1">
            <span
              className="text-[#c3871e] text-[11px] font-black uppercase tracking-[0.3em] block mb-3"
              style={{ fontFamily: "'ChevySans', sans-serif" }}
            >
              {main.label}
            </span>
            <h3
              className="text-white font-black uppercase leading-tight mb-2"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontFamily: "'ChevySans', sans-serif" }}
            >
              {main.title}
            </h3>
            <p className="text-white/45 text-sm font-medium mb-6 leading-relaxed">
              {main.details}
            </p>
            <div className="inline-flex items-baseline gap-1.5 bg-[#c3871e]/10 border border-[#c3871e]/20 rounded-xl px-5 py-2.5">
              <span className="text-white/40 text-xs font-medium">Valor estimado</span>
              <span
                className="text-[#c3871e] font-black text-xl"
                style={{ fontFamily: "'ChevySans', sans-serif" }}
              >
                {main.value}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Premios secundarios — columna derecha ── */}
      <div className="flex flex-col gap-4">
        {rest.map((prize, i) => (
          <div
            key={i}
            className="group relative rounded-xl bg-[#0b2440] border border-white/6 hover:border-white/14 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
          >
            {/* Línea azul superior */}
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-[#054a9d]/50 to-transparent" />

            <div className="p-5 flex items-center gap-4">
              {/* Número */}
              <span
                className="shrink-0 font-black text-4xl text-[#054a9d]/20 group-hover:text-[#054a9d]/40 transition-colors leading-none w-10 text-right tabular-nums"
                style={{ fontFamily: "'ChevySans', sans-serif" }}
              >
                {prize.rank}
              </span>

              <div className="w-px h-10 bg-white/6 shrink-0" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.25em] block mb-0.5">
                  {prize.label}
                </span>
                <p className="text-white font-black text-sm uppercase truncate" style={{ fontFamily: "'ChevySans', sans-serif" }}>
                  {prize.title}
                </p>
                <p className="text-white/35 text-[11px] font-medium mt-0.5 leading-snug">
                  {prize.details}
                </p>
              </div>

              {/* Valor */}
              <span
                className="shrink-0 text-[#7ab0e8] font-black text-sm tabular-nums"
                style={{ fontFamily: "'ChevySans', sans-serif" }}
              >
                {prize.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
