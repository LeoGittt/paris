"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Countdown } from "@/components/prode/countdown"
import { MatchCard } from "@/components/prode/match-card"
import { RankingTable, type RankingRow } from "@/components/prode/ranking-table"
import { PrizesSection } from "@/components/prode/prizes-section"
import { RegistrationForm } from "@/components/prode/registration-form"
import { ChevronDown, Menu, X, ArrowRight, CheckCircle2 } from "lucide-react"
import { Flag } from "@/components/ui/flag"
import type { LandingPrize, LandingMatch } from "@/app/page"

const navItems = [
  { id: "como-funciona", label: "Cómo Funciona" },
  { id: "premios",       label: "Premios" },
  { id: "prode",         label: "Partidos" },
  { id: "ranking",       label: "Ranking" },
]

function Logo({ compact = false }: { compact?: boolean }) {
  const w = compact ? 200 : 260
  const h = compact ? 56 : 72
  return (
    <Link href="/" className="relative select-none shrink-0 block overflow-hidden" style={{ width: w, height: h }}>
      <Image src="/logo-paris.png" alt="Chevrolet Grupo Paris" fill className="object-cover" style={{ objectPosition: "50% 52%" }} priority />
    </Link>
  )
}

function PainManiaCounter() {
  const [n, setN] = useState(4_000)
  const rafRef = useRef(0)
  useEffect(() => {
    const from = 4_000
    const to = 5_200_000
    const duration = 1800
    const start = Date.now()
    const tick = () => {
      const t = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setN(Math.round(from + (to - from) * ease))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])
  return <>{n.toLocaleString("es-AR")}</>
}

function PainManiaVote() {
  const [vote, setVote] = useState<"si" | "no" | null>(null)
  const [counts, setCounts] = useState<{ si: number; no: number } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("pain-mania-vote")
    if (saved === "si" || saved === "no") setVote(saved)
    import("@/lib/actions/pain-mania").then(({ getPainManiaCounts }) =>
      getPainManiaCounts().then(setCounts)
    )
  }, [])

  const handleVote = async (v: "si" | "no") => {
    if (vote || loading) return
    setLoading(true)
    localStorage.setItem("pain-mania-vote", v)
    setVote(v)
    const { castPainManiaVote } = await import("@/lib/actions/pain-mania")
    const updated = await castPainManiaVote(v)
    setCounts(updated)
    setLoading(false)
  }

  const total = (counts?.si ?? 0) + (counts?.no ?? 0)
  const pctSi = total > 0 ? Math.round(((counts?.si ?? 0) / total) * 100) : 50
  const pctNo = 100 - pctSi

  return (
    <div className="bg-[#06192c] border border-white/8 rounded-xl p-4">
      <p className="text-white/50 text-[10px] uppercase tracking-[0.25em] font-bold mb-3 text-center">
        ⚽ ¿Anotará Tim Payne en el Mundial?
      </p>
      {!vote ? (
        <div className="flex gap-2">
          <button
            onClick={() => handleVote("si")}
            disabled={loading}
            className="flex-1 h-10 rounded-xl font-black uppercase text-[13px] text-white bg-emerald-600/80 hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            ⚽ Sí, anota
          </button>
          <button
            onClick={() => handleVote("no")}
            disabled={loading}
            className="flex-1 h-10 rounded-xl font-black uppercase text-[13px] text-white bg-red-700/70 hover:bg-red-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            ❌ No anota
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[11px] font-bold mb-1">
              <span className="text-emerald-400">⚽ Sí, anota</span>
              <span className="text-emerald-400">{pctSi}%</span>
            </div>
            <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pctSi}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-bold mb-1">
              <span className="text-red-400">❌ No anota</span>
              <span className="text-red-400">{pctNo}%</span>
            </div>
            <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full transition-all duration-700" style={{ width: `${pctNo}%` }} />
            </div>
          </div>
          <p className="text-white/20 text-[10px] text-center pt-1">
            {total.toLocaleString("es-AR")} votos · vos votaste{" "}
            <span className={vote === "si" ? "text-emerald-400" : "text-red-400"}>
              {vote === "si" ? "sí" : "no"}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-0.5 bg-[#c3871e]" />
      <span className="text-[#c3871e] text-[11px] font-black uppercase tracking-[0.3em]" style={{ fontFamily: "'ChevySans', sans-serif" }}>{children}</span>
    </div>
  )
}

function LandingMatchCard({ match }: { match: LandingMatch }) {
  const dateStr = match.formatted_date
  const timeStr = match.formatted_time

  return (
    <div className="group relative rounded-2xl bg-[#0b2440] border border-white/8 group-hover:border-white/16 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30">
      <div className="flex justify-center pt-3.5 pb-0 px-4">
        <span className="text-[#7ab0e8] text-[10px] font-black uppercase tracking-[0.25em]"
          style={{ fontFamily: "'ChevySans', sans-serif" }}>
          {match.group_name ?? match.stage}
        </span>
      </div>
      <div className="flex items-center justify-center gap-3 px-4 py-2">
        <span className="text-white/35 text-[10px] font-medium">{dateStr}</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span className="text-[#c3871e] text-[10px] font-bold">{timeStr} hs</span>
      </div>
      <div className="h-px mx-4 bg-white/6" />
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex-1 flex flex-col items-center gap-2">
          <Flag emoji={match.team1_flag} size={44} />
          <span className="text-white font-black text-xs tracking-wide text-center leading-tight"
            style={{ fontFamily: "'ChevySans', sans-serif" }}>
            {match.team1}
          </span>
        </div>
        <span className="text-white/20 font-black text-lg px-2">VS</span>
        <div className="flex-1 flex flex-col items-center gap-2">
          <Flag emoji={match.team2_flag} size={44} />
          <span className="text-white font-black text-xs tracking-wide text-center leading-tight"
            style={{ fontFamily: "'ChevySans', sans-serif" }}>
            {match.team2}
          </span>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-0.5 bg-linear-to-r from-transparent via-[#054a9d]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

interface Props {
  rankingRows: RankingRow[]
  prizes: LandingPrize[]
  upcomingMatches: LandingMatch[]
}

export function LandingClient({ rankingRows, prizes, upcomingMatches }: Props) {
  const [showModal, setShowModal]       = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [showPainMania, setShowPainMania] = useState(false)
  const searchParams = useSearchParams()
  const leadSource   = searchParams.get("source") ?? undefined

  useEffect(() => {
    if (searchParams.get("registro") === "1") setShowModal(true)
  }, [searchParams])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setMobileOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#06192c] overflow-x-hidden" style={{ fontFamily: "'ChevySans', sans-serif" }}>

      {/* HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#06192c]/85 backdrop-blur-xl border-b border-white/8">
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between h-16 md:h-20">
          <Logo compact />
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(n => (
              <button key={n.id} onClick={() => scrollTo(n.id)}
                className="px-4 py-2 text-[13px] text-white/55 hover:text-white hover:bg-white/6 rounded-lg transition-all font-medium tracking-wide">
                {n.label}
              </button>
            ))}
            <div className="w-px h-5 bg-white/15 mx-3" />
            <a href="/login"
              className="px-4 py-2 text-[13px] text-white/40 hover:text-white/70 rounded-lg transition-all font-medium tracking-wide">
              Ingresar
            </a>
            <button onClick={() => setShowModal(true)}
              className="bg-[#054a9d] hover:bg-[#1558b8] text-white font-black text-[13px] tracking-wide px-5 h-9 rounded-lg shadow-lg shadow-[#054a9d]/30 transition-colors">
              Participar
            </button>
          </nav>
          <div className="md:hidden flex items-center gap-2">
            <Link href="/login"
              className="px-3 py-1.5 text-[12px] font-black uppercase tracking-wide text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-all">
              Iniciar sesión
            </Link>
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/8 rounded-lg transition-all" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-white/8 bg-[#06192c] px-5 py-3 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
            {navItems.map(n => (
              <button key={n.id} onClick={() => scrollTo(n.id)}
                className="text-white/55 hover:text-white hover:bg-white/6 text-left py-2.5 px-3 rounded-lg text-[13px] font-medium transition-all">
                {n.label}
              </button>
            ))}
            <a href="/login"
              className="text-white/40 hover:text-white/70 text-center py-2.5 px-3 rounded-lg text-[13px] font-medium transition-all">
              Ya tengo cuenta — Ingresar
            </a>
            <button onClick={() => { setShowModal(true); setMobileOpen(false) }}
              className="bg-[#054a9d] text-white font-black text-[13px] py-3 rounded-lg mt-1 tracking-wide">
              Participar
            </button>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative w-full overflow-hidden" style={{ height: "100svh", minHeight: "620px", maxHeight: "1000px" }}>

        {/* Imagen de fondo */}
        <Image src="/hero-final.png" alt="Prode Chevrolet Grupo Paris — Mundial 2026" fill
          className="object-cover object-[center_15%] md:object-center" priority quality={95} />

        {/* Capas de gradiente — mobile */}
        <div className="absolute inset-0 md:hidden" style={{
          background: "linear-gradient(180deg, rgba(2,10,24,0.65) 0%, rgba(2,10,24,0.15) 40%, rgba(2,10,24,0.7) 70%, rgba(6,25,44,1) 100%)"
        }} />

        {/* Capas de gradiente — desktop */}
        <div className="absolute inset-0 hidden md:block" style={{
          background: "linear-gradient(105deg, rgba(2,10,24,0.92) 0%, rgba(2,10,24,0.75) 35%, rgba(2,10,24,0.25) 65%, rgba(2,10,24,0.05) 100%)"
        }} />
        <div className="absolute bottom-0 inset-x-0 hidden md:block" style={{ height: "35%", background: "linear-gradient(to top, #06192c, transparent)" }} />

        {/* Contenido */}
        <div className="absolute inset-0 flex flex-col justify-end md:justify-center px-5 md:px-14 lg:px-20 pb-10 md:pb-0 pt-20">
          <div className="w-full md:max-w-2xl">

            {/* Badge */}
            <div className="flex items-center gap-2.5 mb-5 md:mb-7">
              <div className="flex items-center gap-0.5 bg-white/8 backdrop-blur-md border border-white/12 rounded-full px-3 py-1.5">
                <span className="text-sm leading-none">🇺🇸</span>
                <span className="text-sm leading-none">🇲🇽</span>
                <span className="text-sm leading-none">🇨🇦</span>
                <button
                  onClick={() => document.getElementById("pain-mania")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-sm leading-none cursor-default hover:scale-125 transition-transform duration-200"
                  style={{ background: "none", border: "none", padding: 0 }}
                  title="🇳🇿"
                >🇳🇿</button>
              </div>
              <div className="h-3.5 w-px bg-white/15" />
              <span className="text-white/60 text-[11px] font-black uppercase tracking-[0.22em]" style={{ fontFamily: "'ChevySans', sans-serif" }}>
                FIFA World Cup 2026
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-black text-white uppercase leading-[0.85] tracking-tighter mb-4 md:mb-5" style={{ fontFamily: "'ChevySans', sans-serif", fontSize: "clamp(3.6rem, 11vw, 7.5rem)" }}>
              PRODE<br />
              <span style={{
                background: "linear-gradient(135deg, #f5c842 0%, #e8a832 40%, #c3871e 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                MUNDIAL
              </span><br />
              <span className="text-white/90">2026</span>
            </h1>

            {/* Tagline — visible en todas las pantallas */}
            <p className="text-white/55 text-[13px] md:text-base leading-relaxed mb-6 md:mb-8 font-medium max-w-xs md:max-w-sm">
              Predecí los partidos de Argentina, sumá puntos y ganá premios con Chevrolet Grupo Paris.
            </p>

            {/* Countdown */}
            <div className="mb-7 md:mb-9">
              <p className="text-white/30 text-[9px] uppercase tracking-[0.35em] font-black mb-2" style={{ fontFamily: "'ChevySans', sans-serif" }}>
                El mundial comienza en
              </p>
              <Countdown />
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="group inline-flex items-center justify-center gap-2.5 text-white font-black uppercase tracking-[0.08em] px-7 h-13 rounded-xl text-[14px] transition-all duration-200 active:scale-[0.97] shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #1a6fd4 0%, #054a9d 60%, #033a7a 100%)",
                  boxShadow: "0 8px 32px rgba(5,74,157,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                Participar gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo("como-funciona")}
                className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/14 backdrop-blur-sm border border-white/15 text-white/80 hover:text-white font-bold uppercase tracking-[0.08em] px-6 h-13 rounded-xl text-[13px] transition-all duration-200"
              >
                Cómo funciona
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>

          </div>
        </div>

        {/* Scroll indicator — centrado abajo */}
        <button
          onClick={() => scrollTo("como-funciona")}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 text-white/25 hover:text-white/50 transition-colors group"
        >
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>

      </section>

      {/* PAIN MANÍA BANNER */}
      <section id="pain-mania" className="overflow-hidden bg-[#03080f]">
        <div className="flex flex-col md:flex-row md:min-h-[540px]">

          {/* Foto — arriba en mobile, derecha en desktop */}
          <div className="relative w-full md:w-[44%] md:order-2 overflow-hidden" style={{ minHeight: "56vw", maxHeight: "420px" }}>
            <img
              src="/tim.png"
              alt="Tim Payne — Nueva Zelanda"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#03080f] md:hidden" />
            <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-[#03080f] via-[#03080f]/20 to-transparent" />
            <div className="absolute top-4 left-4 md:left-auto md:right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10">
              <span className="text-lg leading-none">🇳🇿</span>
              <span className="text-white font-black text-[10px] tracking-[0.2em] uppercase">#PainManía</span>
            </div>
          </div>

          {/* Contenido — abajo en mobile, izquierda en desktop */}
          <div className="flex-1 md:order-1 px-6 pb-12 pt-2 md:px-14 md:py-16 flex flex-col justify-center -mt-8 md:mt-0 relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-0.5 bg-[#c3871e]" />
              <span className="text-[#c3871e] text-[10px] font-black uppercase tracking-[0.3em]">El fenómeno del Mundial</span>
            </div>
            <h2 className="font-black text-white uppercase leading-[0.85] mb-4 text-[3.4rem] md:text-[4.5rem]" style={{ fontFamily: "'ChevySans', sans-serif" }}>
              PAIN<br />
              <span style={{ background: "linear-gradient(135deg, #e8a832 0%, #c3871e 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>MANÍA</span>
            </h2>
            <div className="flex items-end gap-2 mb-4">
              <span className="font-black text-white text-[2.2rem] tabular-nums leading-none" style={{ fontFamily: "'ChevySans', sans-serif" }}>+5.000.000</span>
              <span className="text-white/35 text-[12px] font-medium mb-1">seguidores en 15 días</span>
            </div>
            <p className="text-white/45 text-[13px] leading-relaxed mb-6 max-w-xs">
              Tim Payne, defensor de Nueva Zelanda, pasó de{" "}
              <span className="text-white/80 font-bold">4.000</span> seguidores a más de{" "}
              <span className="text-[#c3871e] font-bold">5.000.000</span> en menos de 15 días.
              El jugador viral del Mundial 2026.
            </p>
            <div className="max-w-xs">
              <PainManiaVote />
            </div>
            <a
              href="https://www.instagram.com/timpayne__/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-white/25 hover:text-white/60 text-[11px] font-medium transition-colors w-fit"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @timpayne__ · Seguir en Instagram
            </a>
          </div>
        </div>
      </section>

      {/* BANNER */}
      <div className="bg-[#06192c] py-0">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-10 md:py-14">
          <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            <Image src="/banner-prode.png" alt="Prode Grupo Paris 2026 — Viví el mundial. Ganá premios." width={1200} height={300} className="w-full h-auto object-cover" quality={95} />
          </div>
        </div>
      </div>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-24 md:py-32 bg-[#040f1c] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-[#c3871e]/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="text-center mb-16 md:mb-20">
            <SectionLabel>Paso a paso</SectionLabel>
            <h2 className="font-black text-white uppercase leading-none text-5xl md:text-7xl mb-5">CÓMO FUNCIONA</h2>
            <p className="text-white/45 text-base md:text-lg max-w-md mx-auto leading-relaxed font-medium">Participá gratis, predecí resultados y competí por premios en cada etapa del torneo.</p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-linear-to-r from-[#054a9d]/30 via-[#054a9d]/50 to-[#054a9d]/30 z-0" />
            {[
              { number: "01", title: "Registrate", description: "Ingresá tus datos y creá tu cuenta gratuita para unirte al prode oficial de Chevrolet Grupo Paris.", color: "#054a9d" },
              { number: "02", title: "Predecí",    description: "Elegí el resultado de los partidos de Argentina antes del pitido inicial y sumá puntos por cada acierto.",  color: "#c3871e" },
              { number: "03", title: "Ganá",       description: "Escalá el ranking y llevate premios increíbles en cada etapa del torneo con Argentina.",     color: "#054a9d" },
            ].map((step, i) => (
              <div key={i} className="group flex flex-col items-center text-center">
                <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 bg-[#040f1c]"
                     style={{ border: `2px solid ${step.color}50` }}>
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                       style={{ background: `radial-gradient(circle, ${step.color}20 0%, transparent 70%)` }} />
                  <span className="relative font-black text-3xl tabular-nums leading-none" style={{ color: step.color, fontFamily: "'ChevySans', sans-serif" }}>{step.number}</span>
                </div>
                <div className="w-full flex-1 bg-[#0b2440] border border-white/6 rounded-2xl px-6 pt-6 pb-8 transition-all duration-300 group-hover:border-white/14 group-hover:-translate-y-1">
                  <div className="w-8 h-0.5 mx-auto mb-5 rounded-full" style={{ backgroundColor: step.color }} />
                  <h3 className="font-black text-white uppercase text-2xl tracking-wide mb-3">{step.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed font-medium">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#0b2440]/60 overflow-hidden">
            <div className="px-6 py-3.5 border-b border-white/6 text-center">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Sistema de puntuación</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/6">
              {[
                { pts: "10", unit: "pts", label: "Resultado exacto",   sub: "Marcador correcto",  color: "#4ade80" },
                { pts: "5",  unit: "pts", label: "Ganador o empate",    sub: "Resultado correcto", color: "#7ab0e8" },
                { pts: "2",  unit: "pts", label: "Diferencia de goles", sub: "Spread exacto",      color: "#c3871e" },
              ].map(p => (
                <div key={p.label} className="flex items-center gap-4 px-7 py-5 hover:bg-white/3 transition-colors">
                  <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${p.color}12`, border: `1px solid ${p.color}25` }}>
                    <span className="font-black text-xl leading-none" style={{ color: p.color, fontFamily: "'ChevySans', sans-serif" }}>{p.pts}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-black text-sm uppercase tracking-wide">{p.label}</p>
                    <p className="text-white/30 text-xs font-medium mt-0.5">{p.sub}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest shrink-0" style={{ color: p.color }}>{p.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PREMIOS */}
      <section id="premios" className="py-24 md:py-32 bg-[#06192c] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-[#c3871e]/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="text-center mb-14">
            <SectionLabel>Lo que podés ganar</SectionLabel>
            <h2 className="font-black text-white uppercase leading-none text-5xl md:text-7xl mb-4">PREMIOS</h2>
            <p className="text-white/50 text-base md:text-lg max-w-md mx-auto leading-relaxed font-medium">Mientras más acertás, más ganás. Premios en cada etapa.</p>
          </div>
          <PrizesSection prizes={prizes} />
        </div>
      </section>

      {/* PARTIDOS */}
      <section id="prode" className="py-24 md:py-32 bg-[#040f1c]">
        <div className="absolute inset-x-0 h-px bg-linear-to-r from-transparent via-[#054a9d]/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <SectionLabel>🇦🇷 Argentina · Fase de Grupos</SectionLabel>
              <h2 className="font-black text-white uppercase leading-none text-5xl md:text-7xl">PRÓXIMOS<br />PARTIDOS</h2>
            </div>
            <p className="text-white/45 text-sm leading-relaxed max-w-xs md:text-right font-medium">Completá tus predicciones de Argentina antes del pitido inicial de cada partido.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {upcomingMatches.length > 0 ? upcomingMatches.map(match => (
              <LandingMatchCard key={match.id} match={match} />
            )) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-white/25 text-base font-medium">Los partidos de Argentina se publicarán pronto</p>
              </div>
            )}
          </div>
          <div className="text-center">
            <button onClick={() => setShowModal(true)}
              className="group inline-flex items-center gap-2 bg-[#054a9d] hover:bg-[#1558b8] text-white font-black uppercase tracking-wide px-10 h-14 rounded-xl text-[15px] shadow-xl shadow-[#054a9d]/30 transition-all hover:scale-[1.02]">
              Registrate para Participar<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* RANKING */}
      <section id="ranking" className="py-24 md:py-32 bg-[#06192c]">
        <div className="absolute inset-x-0 h-px bg-linear-to-r from-transparent via-[#c3871e]/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="text-center mb-14">
            <SectionLabel>Tabla de posiciones</SectionLabel>
            <h2 className="font-black text-white uppercase leading-none text-5xl md:text-7xl mb-4">RANKING</h2>
            <p className="text-white/50 text-base md:text-lg max-w-md mx-auto font-medium">Los mejores pronosticadores compiten por el gran premio.</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <RankingTable rows={rankingRows} />
            <div className="mt-6 text-center">
              <a
                href="/ranking"
                className="inline-flex items-center gap-2 text-[#7ab0e8] hover:text-white text-sm font-black uppercase tracking-widest transition-colors"
              >
                Ver ranking completo (top 50) →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative py-36 md:py-48 overflow-hidden">
        <Image src="/hero-mundial.png" alt="" fill className="object-cover object-center" quality={85} />
        <div className="absolute inset-0 bg-[#040f1c]/80" />
        <div className="absolute inset-0 bg-linear-to-t from-[#040f1c] via-transparent to-[#040f1c]/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 text-center">
          <div className="flex justify-center mb-8">
            <div className="relative overflow-hidden" style={{ width: 280, height: 78 }}>
              <Image src="/logo-paris.png" alt="Chevrolet Grupo Paris" fill className="object-cover" style={{ objectPosition: "50% 52%" }} />
            </div>
          </div>
          <h2 className="font-black text-white uppercase leading-none mb-6" style={{ fontSize: "clamp(2.8rem, 8vw, 6rem)" }}>
            ¿LISTO PARA<br />
            <span style={{ background: "linear-gradient(135deg, #e8a832 0%, #c3871e 50%, #9a6815 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>JUGAR?</span>
          </h2>
          <p className="text-white/60 text-base md:text-xl mb-10 max-w-lg mx-auto leading-relaxed font-medium">
            Registrate ahora y sé parte de la mejor experiencia del Mundial 2026 con Chevrolet Grupo Paris.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {["Participación gratuita", "Premios en cada fase", "Solo para clientes Grupo Paris"].map(t => (
              <div key={t} className="flex items-center gap-2 text-white/60 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#c3871e] shrink-0" />{t}
              </div>
            ))}
          </div>
          <button onClick={() => setShowModal(true)}
            className="group inline-flex items-center gap-3 bg-[#054a9d] hover:bg-[#1558b8] text-white font-black uppercase tracking-wide px-14 h-16 rounded-xl text-lg shadow-2xl shadow-[#054a9d]/50 transition-all hover:scale-[1.02]">
            Participar Ahora<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-24 md:py-32 bg-[#040f1c] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-[#054a9d]/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="text-center mb-14">
            <SectionLabel>Quiénes somos</SectionLabel>
            <h2 className="font-black text-white uppercase leading-none text-5xl md:text-7xl mb-4">GRUPO PARIS</h2>
            <p className="text-white/50 text-base md:text-lg max-w-md mx-auto font-medium">El concesionario oficial Chevrolet que organiza el Prode del Mundial 2026.</p>
          </div>
          {/* Foto de la concesionaria — full width */}
          <div className="relative rounded-2xl overflow-hidden border border-white/8 group max-w-3xl mx-auto" style={{ height: 280 }}>
            <Image
              src="/concesionaria.jpg"
              alt="Chevrolet Grupo Paris — Concesionaria"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 800px"
              quality={90}
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#020b15]/80 via-[#020b15]/20 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Concesionaria oficial</p>
              <p className="text-white font-black text-xl" style={{ fontFamily: "'ChevySans', sans-serif" }}>Grupo Paris</p>
              <p className="text-white/45 text-sm font-medium mt-0.5">Chevrolet · Argentina</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#020b15] border-t border-white/6">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="mb-5"><Logo compact /></div>
              <p className="text-white/35 text-sm leading-relaxed font-medium">El prode oficial del Mundial 2026 de Chevrolet Grupo Paris.</p>
            </div>
            <div>
              <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.3em] mb-5">Navegación</p>
              <nav className="flex flex-col gap-2.5">
                {navItems.map(n => (
                  <button key={n.id} onClick={() => scrollTo(n.id)} className="text-white/35 hover:text-white/80 text-sm text-left font-medium transition-colors">{n.label}</button>
                ))}
              </nav>
            </div>
            <div>
              <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.3em] mb-5">Legal</p>
              <nav className="flex flex-col gap-2.5">
                {[
                  { label: "Términos y Condiciones", href: "/terminos" },
                  { label: "Bases y Condiciones",    href: "/bases"    },
                  { label: "Contacto",               href: "#contacto" },
                ].map(l => (
                  <a key={l.label} href={l.href} className="text-white/35 hover:text-white/80 text-sm font-medium transition-colors">{l.label}</a>
                ))}
              </nav>
            </div>
            <div>
              <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.3em] mb-5">Dónde estamos</p>
              <div className="relative rounded-xl overflow-hidden aspect-video w-full border border-white/8 group">
                <Image
                  src="/concesionaria.jpg"
                  alt="Chevrolet Grupo Paris — Concesionaria"
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="220px"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#020b15]/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2.5">
                  <p className="text-white/80 text-[10px] font-black uppercase tracking-wide">Grupo Paris</p>
                  <p className="text-white/40 text-[9px] font-medium">Concesionario oficial Chevrolet</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-white/20 text-xs font-medium">© 2026 Chevrolet Grupo Paris. Todos los derechos reservados.</p>
            <p className="text-white/20 text-xs font-medium">Mundial FIFA 2026 · USA · México · Canadá</p>
          </div>
        </div>
      </footer>

      {/* MODAL PAIN MANÍA */}
      {showPainMania && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020b15]/92 backdrop-blur-xl" onClick={() => setShowPainMania(false)} />
          <div className="relative w-full max-w-sm animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] overflow-y-auto rounded-2xl">
            <div className="bg-[#0b2440] border border-white/10 rounded-2xl shadow-2xl relative">
              <button onClick={() => setShowPainMania(false)}
                className="absolute top-4 right-4 z-10 text-white/30 hover:text-white/80 p-1.5 hover:bg-white/8 rounded-lg transition-all">
                <X className="w-4 h-4" />
              </button>

              {/* Foto */}
              <div className="relative w-full h-52 rounded-t-2xl overflow-hidden bg-[#06192c]">
                <img
                  src="https://media.mdzol.com/p/ac6912eacbf4a9b3a812c3654d83ef5c/adjuntos/373/imagenes/001/939/0001939166/760x0/631x493:651x513/tim-payne.jpg"
                  alt="Tim Payne"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none"
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0b2440] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center">
                  <span className="text-4xl select-none">🇳🇿</span>
                </div>
              </div>

              <div className="p-6 text-center">
                <h3 className="font-black text-white uppercase text-3xl leading-none mb-1" style={{ fontFamily: "'ChevySans', sans-serif" }}>
                  PAIN MANÍA
                </h3>
                <p className="text-[#c3871e] text-[10px] font-black uppercase tracking-[0.3em] mb-5">
                  El fenómeno del Mundial
                </p>

                <div className="bg-[#06192c] border border-white/8 rounded-xl px-5 py-4 mb-4">
                  <p className="text-white/25 text-[9px] uppercase tracking-[0.3em] font-bold mb-2">Seguidores en Instagram</p>
                  <p className="font-black text-4xl text-white tabular-nums" style={{ fontFamily: "'ChevySans', sans-serif" }}>
                    <PainManiaCounter />
                  </p>
                  <p className="text-white/20 text-[10px] font-medium mt-1">de 4.000 a 5.000.000+ en 15 días</p>
                </div>

                <p className="text-white/45 text-[13px] leading-relaxed mb-4 text-left">
                  Tim Payne, defensor de Nueva Zelanda, pasó de{" "}
                  <span className="text-white font-bold">4.000 seguidores</span> a más de{" "}
                  <span className="text-[#c3871e] font-bold">5.000.000</span> en menos de 15 días.
                  El jugador más viral del Mundial 2026. Hasta lo invitaron a Miami.
                </p>

                <div className="mb-4">
                  <PainManiaVote />
                </div>

                <a
                  href="https://www.instagram.com/timpayne__/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl font-black uppercase text-sm text-white transition-opacity hover:opacity-90 mb-3"
                  style={{ background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)" }}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Seguir a Tim Payne
                </a>

                <p className="text-white/15 text-[10px] font-medium">
                  Nueva Zelanda 🇳🇿 · Mundial 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020b15]/92 backdrop-blur-xl" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md animate-in zoom-in-95 fade-in duration-200">
            <div className="absolute top-0 left-10 right-10 h-px bg-linear-to-r from-transparent via-[#c3871e]/70 to-transparent" />
            <div className="relative bg-[#0b2440] border border-white/10 rounded-2xl p-7 md:p-9 shadow-2xl">
              <button onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white/30 hover:text-white/80 p-1.5 hover:bg-white/8 rounded-lg transition-all">
                <X className="w-4 h-4" />
              </button>
              <div className="text-center mb-7">
                <div className="flex justify-center mb-5">
                  <div className="relative overflow-hidden" style={{ width: 220, height: 61 }}>
                    <Image src="/logo-paris.png" alt="Chevrolet Grupo Paris" fill className="object-cover" style={{ objectPosition: "50% 52%" }} />
                  </div>
                </div>
                <h3 className="font-black text-white uppercase text-3xl mb-1.5" style={{ fontFamily: "'ChevySans', sans-serif" }}>UNITE AL PRODE</h3>
                <p className="text-white/45 text-sm font-medium">Completá tus datos para participar</p>
              </div>
              <RegistrationForm onClose={() => setShowModal(false)} leadSource={leadSource} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
