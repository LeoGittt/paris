"use client"

import { useState } from "react"
import Image from "next/image"
import { Countdown } from "@/components/prode/countdown"
import { MatchCard } from "@/components/prode/match-card"
import { RankingTable } from "@/components/prode/ranking-table"
import { PrizesSection } from "@/components/prode/prizes-section"
import { RegistrationForm } from "@/components/prode/registration-form"
import { ChevronDown, Menu, X, ArrowRight, CheckCircle2 } from "lucide-react"
import { groupStageMatches } from "@/lib/matches-data"

/* ─── Primeros 6 partidos reales ────────────────────── */
const upcomingMatches = groupStageMatches.slice(0, 6).map(m => ({
  team1: m.team1,
  team2: m.team2,
  date:  m.date,
  time:  m.time + " hs",
  stage: m.group ?? m.stage,
}))

const steps = [
  { number: "01", title: "Registrate",   description: "Ingresá tus datos y creá tu cuenta gratuita para unirte al prode oficial de Chevrolet Grupo Paris." },
  { number: "02", title: "Predecí",      description: "Seleccioná el resultado de cada partido antes del pitido inicial y sumá puntos por cada acierto." },
  { number: "03", title: "Ganá",         description: "Escalá el ranking y ganá premios increíbles en cada fase, desde grupos hasta la gran final." },
]

const navItems = [
  { id: "como-funciona", label: "Cómo Funciona" },
  { id: "premios",       label: "Premios" },
  { id: "prode",         label: "Partidos" },
  { id: "ranking",       label: "Ranking" },
]

/* ─── Logo ──────────────────────────────────────────── */
function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className="relative shrink-0"
        style={{ width: compact ? 56 : 72, height: compact ? 24 : 30 }}
      >
        <Image
          src="/bowtie.png"
          alt=""
          fill
          className="object-contain"
          style={{ mixBlendMode: "screen" }}
          priority
        />
      </div>
      <div className="w-px bg-white/30 self-stretch" />
      <div className="leading-none">
        <p
          className={`font-bold text-white/70 uppercase tracking-[0.2em] ${compact ? "text-[9px]" : "text-[11px]"}`}
          style={{ fontFamily: "'ChevySans', sans-serif" }}
        >
          CHEVROLET
        </p>
        <p
          className={`font-black text-white uppercase tracking-wide leading-tight ${compact ? "text-[15px]" : "text-[20px]"}`}
          style={{ fontFamily: "'ChevySans', sans-serif" }}
        >
          GRUPO PARIS
        </p>
      </div>
    </div>
  )
}

/* ─── Section label ─────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-0.5 bg-[#c3871e]" />
      <span
        className="text-[#c3871e] text-[11px] font-black uppercase tracking-[0.3em]"
        style={{ fontFamily: "'ChevySans', sans-serif" }}
      >
        {children}
      </span>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────── */
export default function ProdePage() {
  const [showModal, setShowModal]     = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setMobileOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#06192c] overflow-x-hidden" style={{ fontFamily: "'ChevySans', sans-serif" }}>

      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#06192c]/85 backdrop-blur-xl border-b border-white/8">
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between h-16 md:h-20">
          <Logo compact />

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(n => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="px-4 py-2 text-[13px] text-white/55 hover:text-white hover:bg-white/6 rounded-lg transition-all font-medium tracking-wide"
              >
                {n.label}
              </button>
            ))}
            <div className="w-px h-5 bg-white/15 mx-3" />
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#054a9d] hover:bg-[#1558b8] text-white font-black text-[13px] tracking-wide px-5 h-9 rounded-lg shadow-lg shadow-[#054a9d]/30 transition-colors"
            >
              Participar
            </button>
          </nav>

          <button
            className="md:hidden p-2 text-white/60 hover:text-white hover:bg-white/8 rounded-lg transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/8 bg-[#06192c] px-5 py-3 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
            {navItems.map(n => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="text-white/55 hover:text-white hover:bg-white/6 text-left py-2.5 px-3 rounded-lg text-[13px] font-medium transition-all"
              >
                {n.label}
              </button>
            ))}
            <button
              onClick={() => { setShowModal(true); setMobileOpen(false) }}
              className="bg-[#054a9d] text-white font-black text-[13px] py-3 rounded-lg mt-2 tracking-wide"
            >
              Participar
            </button>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden"
               style={{ height: "100svh", minHeight: "600px", maxHeight: "960px" }}>

        {/* Foto —
            mobile:  encuadra desde arriba para ver al hincha completo
            desktop: centra la imagen
        */}
        <Image
          src="/hero-final.png"
          alt="Prode Chevrolet Grupo Paris — Mundial 2026"
          fill
          className="object-cover object-[center_10%] md:object-[center_20%]"
          priority
          quality={95}
        />

        {/* Overlay mobile: dim uniforme para que el texto centrado sea legible */}
        <div className="absolute inset-0 bg-[#020e1f]/55 md:hidden" />
        <div className="absolute inset-0 bg-linear-to-t
          from-[#020e1f] from-0%
          via-transparent via-50%
          to-transparent
          md:hidden" />

        {/* Overlay desktop: dim general + fade inferior */}
        <div className="absolute inset-0 bg-[#020e1f]/40 hidden md:block" />
        <div className="absolute bottom-0 inset-x-0 h-48
                        bg-linear-to-t from-[#06192c] to-transparent
                        hidden md:block" />

        {/* Contenido */}
        <div className="absolute inset-0 flex flex-col
                        justify-center pb-0 px-5
                        md:justify-center md:items-center md:pb-0 md:px-10
                        pt-20">

          <div className="w-full md:max-w-3xl md:text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-3
                            bg-[#054a9d]/20 border border-[#054a9d]/50 backdrop-blur-md
                            rounded-2xl px-4 py-2 mb-4 md:mb-6">
              {/* Banderas */}
              <div className="flex items-center gap-1.5 text-base leading-none select-none">
                <span title="USA">🇺🇸</span>
                <span title="México">🇲🇽</span>
                <span title="Canadá">🇨🇦</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              {/* Texto */}
              <span
                className="text-white font-black text-[11px] md:text-[12px] tracking-[0.18em] uppercase"
                style={{ fontFamily: "'ChevySans', sans-serif" }}
              >
                FIFA World Cup 2026
              </span>
            </div>

            {/* Título —
                mobile:  ~3.2rem, 2 líneas (PRODE / MUNDIAL 2026)
                desktop: ~6rem, 3 líneas
            */}
            <h1 className="font-black text-white uppercase leading-[0.88] tracking-tight mb-3 md:mb-5
                           text-[3.2rem] md:text-[6rem]"
                style={{ fontFamily: "'ChevySans', sans-serif" }}>
              PRODE<br />
              <span className="gradient-text">MUNDIAL</span>
              <span className="md:hidden"> 2026</span>
              <span className="hidden md:block">
                <br />2026
              </span>
            </h1>

            {/* Bajada — solo desktop, en mobile ocupa espacio valioso */}
            <p className="hidden md:block text-white/65 text-lg leading-relaxed mb-7 font-medium">
              Predecí los resultados, sumá puntos y ganá premios increíbles
              con Chevrolet Grupo Paris.
            </p>

            {/* Countdown */}
            <div className="mb-5 md:mb-8">
              <p className="text-white/35 text-[9px] uppercase tracking-[0.3em] font-bold mb-2.5">
                El mundial comienza en
              </p>
              <Countdown />
            </div>

            {/* CTAs —
                mobile:  fila side-by-side, altura compacta
                desktop: fila centrada, más alta
            */}
            <div className="flex flex-row gap-2.5 md:gap-3 md:justify-center">
              <button
                onClick={() => setShowModal(true)}
                className="group flex-1 md:flex-none inline-flex items-center justify-center gap-2
                           bg-[#054a9d] hover:bg-[#1558b8] active:bg-[#0e3f87]
                           text-white font-black uppercase tracking-wide
                           px-5 md:px-8 h-11 md:h-13 rounded-xl text-[13px] md:text-[15px]
                           shadow-xl shadow-[#054a9d]/40
                           transition-all duration-200 active:scale-[0.97]"
              >
                Participar
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo("como-funciona")}
                className="flex-1 md:flex-none inline-flex items-center justify-center
                           bg-white/10 hover:bg-white/18 backdrop-blur-sm border border-white/20
                           text-white font-bold uppercase tracking-wide
                           px-5 md:px-8 h-11 md:h-13 rounded-xl text-[13px] md:text-[15px]
                           transition-all duration-200"
              >
                Cómo Funciona
              </button>
            </div>

          </div>
        </div>

        {/* Scroll hint — solo desktop */}
        <button
          onClick={() => scrollTo("como-funciona")}
          className="absolute right-8 bottom-10 hidden lg:flex flex-col items-center gap-2
                     text-white/25 hover:text-white/60 transition-colors"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold [writing-mode:vertical-rl]">Scroll</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
        </button>
      </section>

      {/* ══════════════════════════════════════
          BANNER OFICIAL
      ══════════════════════════════════════ */}
      <div className="bg-[#06192c] py-0">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-10 md:py-14">
          <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            <Image
              src="/banner-prode.png"
              alt="Prode Grupo Paris 2026 — Viví el mundial. Ganá premios."
              width={1200}
              height={300}
              className="w-full h-auto object-cover"
              quality={95}
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          CÓMO FUNCIONA
      ══════════════════════════════════════ */}
      <section id="como-funciona" className="py-24 md:py-32 bg-[#040f1c] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-[#c3871e]/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-5 md:px-10">

          {/* Header */}
          <div className="text-center mb-16 md:mb-20">
            <SectionLabel>Paso a paso</SectionLabel>
            <h2 className="font-black text-white uppercase leading-none text-5xl md:text-7xl mb-5">
              CÓMO FUNCIONA
            </h2>
            <p className="text-white/45 text-base md:text-lg max-w-md mx-auto leading-relaxed font-medium">
              Participá gratis, predecí resultados y competí por premios en cada etapa del torneo.
            </p>
          </div>

          {/* Steps — 3 columnas con número flotante y card */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

            {/* Línea conectora — solo desktop */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-linear-to-r from-[#054a9d]/30 via-[#054a9d]/50 to-[#054a9d]/30 z-0" />

            {[
              { number: "01", title: "Registrate", description: "Ingresá tus datos y creá tu cuenta gratuita para unirte al prode oficial de Chevrolet Grupo Paris.", color: "#054a9d" },
              { number: "02", title: "Predecí",    description: "Seleccioná el resultado de cada partido antes del pitido inicial y sumá puntos por cada acierto.",  color: "#c3871e" },
              { number: "03", title: "Ganá",       description: "Escalá el ranking y llevate premios increíbles en cada fase, desde grupos hasta la gran final.",     color: "#054a9d" },
            ].map((step, i) => (
              <div key={i} className="group flex flex-col items-center text-center">

                {/* Círculo numerado */}
                <div
                  className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 bg-[#040f1c]"
                  style={{ border: `2px solid ${step.color}50` }}
                >
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle, ${step.color}20 0%, transparent 70%)` }}
                  />
                  <span
                    className="relative font-black text-3xl tabular-nums leading-none"
                    style={{ color: step.color, fontFamily: "'ChevySans', sans-serif" }}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Card */}
                <div className="w-full flex-1 bg-[#0b2440] border border-white/6 rounded-2xl px-6 pt-6 pb-8 transition-all duration-300 group-hover:border-white/14 group-hover:-translate-y-1">
                  <div className="w-8 h-0.5 mx-auto mb-5 rounded-full" style={{ backgroundColor: step.color }} />
                  <h3 className="font-black text-white uppercase text-2xl tracking-wide mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Sistema de puntos */}
          <div className="rounded-2xl border border-white/8 bg-[#0b2440]/60 overflow-hidden">
            <div className="px-6 py-3.5 border-b border-white/6 text-center">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">
                Sistema de puntuación
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/6">
              {[
                { pts: "10", unit: "pts", label: "Resultado exacto",    sub: "Marcador correcto",   color: "#4ade80" },
                { pts: "5",  unit: "pts", label: "Ganador o empate",     sub: "Resultado correcto",  color: "#7ab0e8" },
                { pts: "2",  unit: "pts", label: "Diferencia de goles",  sub: "Spread exacto",       color: "#c3871e" },
              ].map(p => (
                <div key={p.label} className="flex items-center gap-4 px-7 py-5 hover:bg-white/3 transition-colors">
                  <div
                    className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${p.color}12`, border: `1px solid ${p.color}25` }}
                  >
                    <span
                      className="font-black text-xl leading-none"
                      style={{ color: p.color, fontFamily: "'ChevySans', sans-serif" }}
                    >
                      {p.pts}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-black text-sm uppercase tracking-wide">{p.label}</p>
                    <p className="text-white/30 text-xs font-medium mt-0.5">{p.sub}</p>
                  </div>
                  <span
                    className="text-[10px] font-black uppercase tracking-widest shrink-0"
                    style={{ color: p.color }}
                  >
                    {p.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          PREMIOS
      ══════════════════════════════════════ */}
      <section id="premios" className="py-24 md:py-32 bg-[#06192c] relative overflow-hidden">
        {/* Gold accent line top */}
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-[#c3871e]/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="text-center mb-14">
            <SectionLabel>Lo que podés ganar</SectionLabel>
            <h2 className="font-black text-white uppercase leading-none text-5xl md:text-7xl mb-4">
              PREMIOS
            </h2>
            <p className="text-white/50 text-base md:text-lg max-w-md mx-auto leading-relaxed font-medium">
              Mientras más acertás, más ganás. Premios en cada etapa.
            </p>
          </div>
          <PrizesSection />
        </div>
      </section>

      {/* ══════════════════════════════════════
          PARTIDOS
      ══════════════════════════════════════ */}
      <section id="prode" className="py-24 md:py-32 bg-[#040f1c]">
        <div className="absolute inset-x-0 h-px bg-linear-to-r from-transparent via-[#054a9d]/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <SectionLabel>Fase de Grupos</SectionLabel>
              <h2 className="font-black text-white uppercase leading-none text-5xl md:text-7xl">
                PRÓXIMOS<br />PARTIDOS
              </h2>
            </div>
            <p className="text-white/45 text-sm leading-relaxed max-w-xs md:text-right font-medium">
              Completá tus predicciones antes del pitido inicial de cada partido.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {upcomingMatches.map((match, i) => (
              <MatchCard key={i} {...match} />
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowModal(true)}
              className="group inline-flex items-center gap-2 bg-[#054a9d] hover:bg-[#1558b8] text-white font-black uppercase tracking-wide px-10 h-14 rounded-xl text-[15px] shadow-xl shadow-[#054a9d]/30 transition-all hover:scale-[1.02]"
            >
              Registrate para Participar
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          RANKING
      ══════════════════════════════════════ */}
      <section id="ranking" className="py-24 md:py-32 bg-[#06192c]">
        <div className="absolute inset-x-0 h-px bg-linear-to-r from-transparent via-[#c3871e]/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="text-center mb-14">
            <SectionLabel>Tabla de posiciones</SectionLabel>
            <h2 className="font-black text-white uppercase leading-none text-5xl md:text-7xl mb-4">
              RANKING
            </h2>
            <p className="text-white/50 text-base md:text-lg max-w-md mx-auto font-medium">
              Los mejores pronosticadores compiten por el gran premio.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <RankingTable />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA FINAL — segunda foto de fondo
      ══════════════════════════════════════ */}
      <section className="relative py-36 md:py-48 overflow-hidden">
        <Image
          src="/hero-mundial.png"
          alt=""
          fill
          className="object-cover object-center"
          quality={85}
        />
        <div className="absolute inset-0 bg-[#040f1c]/80" />
        <div className="absolute inset-0 bg-linear-to-t from-[#040f1c] via-transparent to-[#040f1c]/60" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 text-center">
          <div className="flex justify-center mb-8">
            <div className="relative" style={{ width: 100, height: 42 }}>
              <Image src="/bowtie.png" alt="Chevrolet" fill className="object-contain" style={{ mixBlendMode: "screen" }} />
            </div>
          </div>

          <h2
            className="font-black text-white uppercase leading-none mb-6"
            style={{ fontSize: "clamp(2.8rem, 8vw, 6rem)" }}
          >
            ¿LISTO PARA<br />
            <span className="gradient-text">JUGAR?</span>
          </h2>
          <p className="text-white/60 text-base md:text-xl mb-10 max-w-lg mx-auto leading-relaxed font-medium">
            Registrate ahora y sé parte de la mejor experiencia del
            Mundial 2026 con Chevrolet Grupo Paris.
          </p>

          {/* Trust points */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {["Participación gratuita", "Premios en cada fase", "Solo para clientes Grupo Paris"].map(t => (
              <div key={t} className="flex items-center gap-2 text-white/60 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#c3871e] shrink-0" />
                {t}
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="group inline-flex items-center gap-3 bg-[#054a9d] hover:bg-[#1558b8] text-white font-black uppercase tracking-wide px-14 h-16 rounded-xl text-lg shadow-2xl shadow-[#054a9d]/50 transition-all hover:scale-[1.02]"
          >
            Participar Ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="bg-[#020b15] border-t border-white/6">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

            {/* Col 1 — Marca + redes */}
            <div>
              <div className="mb-5"><Logo compact /></div>
              <p className="text-white/35 text-sm leading-relaxed font-medium mb-6">
                El prode oficial del Mundial 2026 de Chevrolet Grupo Paris.
              </p>
              <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Seguinos</p>
              <div className="flex items-center gap-3">
                <a href="https://www.instagram.com/parischevroletsanjuan/" target="_blank" rel="noopener noreferrer"
                  className="group w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/4 hover:bg-[#E1306C]/15 hover:border-[#E1306C]/40 transition-all"
                  aria-label="Instagram Grupo Paris">
                  <svg className="w-4 h-4 text-white/40 group-hover:text-[#E1306C] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://wa.me/5492645000000" target="_blank" rel="noopener noreferrer"
                  className="group w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/4 hover:bg-[#25D366]/15 hover:border-[#25D366]/40 transition-all"
                  aria-label="WhatsApp Grupo Paris">
                  <svg className="w-4 h-4 text-white/40 group-hover:text-[#25D366] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/GrupoParis" target="_blank" rel="noopener noreferrer"
                  className="group w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/4 hover:bg-[#1877F2]/15 hover:border-[#1877F2]/40 transition-all"
                  aria-label="Facebook Grupo Paris">
                  <svg className="w-4 h-4 text-white/40 group-hover:text-[#1877F2] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Col 2 — Navegación */}
            <div>
              <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.3em] mb-5">Navegación</p>
              <nav className="flex flex-col gap-2.5">
                {navItems.map(n => (
                  <button key={n.id} onClick={() => scrollTo(n.id)}
                    className="text-white/35 hover:text-white/80 text-sm text-left font-medium transition-colors">
                    {n.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Col 3 — Legal */}
            <div>
              <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.3em] mb-5">Legal</p>
              <nav className="flex flex-col gap-2.5">
                {["Términos y Condiciones", "Política de Privacidad", "Contacto"].map(l => (
                  <a key={l} href="#" className="text-white/35 hover:text-white/80 text-sm font-medium transition-colors">{l}</a>
                ))}
              </nav>
            </div>

            {/* Col 4 — Mapa */}
            <div>
              <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.3em] mb-5">Dónde estamos</p>
              <a href="https://share.google/5qZ3mlDd847Gr1pqg" target="_blank" rel="noopener noreferrer"
                 className="block rounded-xl overflow-hidden border border-white/8 hover:border-white/20 transition-colors aspect-video w-full group relative">
                <iframe
                  src="https://maps.google.com/maps?q=Chevrolet+Paris+San+Juan+Argentina&output=embed&z=15"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)", pointerEvents: "none" }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Chevrolet Grupo Paris — San Juan"
                />
                <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-[#020b15]/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    Ver en Google Maps →
                  </span>
                </div>
              </a>
              <p className="text-white/25 text-[10px] font-medium mt-2">San Juan, Argentina</p>
            </div>

          </div>

          <div className="pt-8 border-t border-white/6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-white/20 text-xs font-medium">© 2026 Chevrolet Grupo Paris. Todos los derechos reservados.</p>
            <p className="text-white/20 text-xs font-medium">Mundial FIFA 2026 · USA · México · Canadá</p>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════
          MODAL
      ══════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020b15]/92 backdrop-blur-xl" onClick={() => setShowModal(false)} />

          <div className="relative w-full max-w-md animate-in zoom-in-95 fade-in duration-200">
            {/* Gold top accent */}
            <div className="absolute top-0 left-10 right-10 h-px bg-linear-to-r from-transparent via-[#c3871e]/70 to-transparent" />

            <div className="relative bg-[#0b2440] border border-white/10 rounded-2xl p-7 md:p-9 shadow-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white/30 hover:text-white/80 p-1.5 hover:bg-white/8 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-7">
                <div className="flex justify-center mb-5">
                  <div className="relative" style={{ width: 140, height: 60 }}>
                    <Image src="/bowtie.png" alt="Chevrolet" fill className="object-contain" style={{ mixBlendMode: "screen" }} />
                  </div>
                </div>
                <h3 className="font-black text-white uppercase text-3xl mb-1.5">UNITE AL PRODE</h3>
                <p className="text-white/45 text-sm font-medium">Completá tus datos para participar</p>
              </div>

              <RegistrationForm onClose={() => setShowModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
