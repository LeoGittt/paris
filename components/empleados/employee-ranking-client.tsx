"use client"

import Image from "next/image"
import { AvatarUpload } from "./avatar-upload"
import type { EmployeeRow } from "@/app/empleados/ranking/page"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Trophy {
  emoji: string
  label: string
  color: string
  bg: string
}

// ─── Lógica de trofeos ────────────────────────────────────────────────────────

function getTrophies(row: EmployeeRow, all: EmployeeRow[]): Trophy[] {
  const t: Trophy[] = []

  if (row.ranking_position === 1)
    t.push({ emoji: "🥇", label: "Campeón Paris",  color: "#e8a832", bg: "rgba(232,168,50,0.15)"  })
  if (row.ranking_position === 2)
    t.push({ emoji: "🥈", label: "Subcampeón",     color: "#94a3b8", bg: "rgba(148,163,184,0.12)" })
  if (row.ranking_position === 3)
    t.push({ emoji: "🥉", label: "Top 3 Paris",    color: "#cd7c3a", bg: "rgba(205,124,58,0.12)"  })

  const maxExact = Math.max(...all.map(r => r.correct_exact))
  if (maxExact > 0 && row.correct_exact === maxExact)
    t.push({ emoji: "🎯", label: "Francotirador", color: "#f472b6", bg: "rgba(244,114,182,0.12)" })

  const maxPreds = Math.max(...all.map(r => r.predictions_count))
  if (maxPreds > 0 && row.predictions_count === maxPreds)
    t.push({ emoji: "🔥", label: "Más Activo",    color: "#fb923c", bg: "rgba(251,146,60,0.12)"  })

  const maxWinner = Math.max(...all.map(r => r.correct_winner))
  if (maxWinner > 0 && row.correct_winner === maxWinner)
    t.push({ emoji: "💡", label: "Adivinador",    color: "#a3e635", bg: "rgba(163,230,53,0.12)"  })

  t.push({ emoji: "⚽", label: "Prode Paris",    color: "#7ab0e8", bg: "rgba(122,176,232,0.10)" })
  return t
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

// ─── Estilos por posición ─────────────────────────────────────────────────────

const POS_CONFIG: Record<number, {
  ringColor: string
  textColor: string
  glow: string
  gradient: string
  border: string
  size: number
  label: string
}> = {
  1: {
    ringColor: "#c3871e",
    textColor: "#e8a832",
    glow:      "0 0 40px rgba(195,135,30,0.30), 0 0 80px rgba(195,135,30,0.10)",
    gradient:  "linear-gradient(135deg, rgba(195,135,30,0.12) 0%, rgba(195,135,30,0.04) 100%)",
    border:    "rgba(195,135,30,0.35)",
    size:      88,
    label:     "1°",
  },
  2: {
    ringColor: "#94a3b8",
    textColor: "#94a3b8",
    glow:      "0 0 30px rgba(148,163,184,0.18)",
    gradient:  "linear-gradient(135deg, rgba(148,163,184,0.08) 0%, rgba(148,163,184,0.03) 100%)",
    border:    "rgba(148,163,184,0.25)",
    size:      76,
    label:     "2°",
  },
  3: {
    ringColor: "#cd7c3a",
    textColor: "#cd7c3a",
    glow:      "0 0 24px rgba(205,124,58,0.18)",
    gradient:  "linear-gradient(135deg, rgba(205,124,58,0.08) 0%, rgba(205,124,58,0.03) 100%)",
    border:    "rgba(205,124,58,0.25)",
    size:      72,
    label:     "3°",
  },
}

// ─── Componente de avatar estático (no editable) ──────────────────────────────

function AvatarStatic({ url, inits, size, ringColor }: {
  url: string | null
  inits: string
  size: number
  ringColor: string
}) {
  return (
    <div
      className="relative shrink-0 rounded-full overflow-hidden"
      style={{
        width: size, height: size,
        border: `2.5px solid ${ringColor}`,
        boxShadow: `0 0 12px ${ringColor}55`,
      }}
    >
      {url ? (
        <Image src={url} alt={inits} fill className="object-cover" sizes={`${size}px`} />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center select-none"
          style={{
            background: `linear-gradient(135deg, ${ringColor}30 0%, ${ringColor}10 100%)`,
            fontSize: size * 0.32,
          }}
        >
          <span className="font-black" style={{ color: ringColor }}>{inits}</span>
        </div>
      )}
    </div>
  )
}

// ─── Tarjeta del podio (top 3) ────────────────────────────────────────────────

function PodiumCard({ row, all, isMe, myAvatarUrl, maxPts }: {
  row: EmployeeRow
  all: EmployeeRow[]
  isMe: boolean
  myAvatarUrl: string | null
  maxPts: number
}) {
  const cfg     = POS_CONFIG[row.ranking_position]
  const trophies = getTrophies(row, all)
  const inits   = initials(row.first_name, row.last_name)
  const pct     = maxPts > 0 ? Math.round((row.total_points / maxPts) * 100) : 0
  const avatarUrl = isMe ? myAvatarUrl : row.avatar_url

  return (
    <div
      className="relative rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center pt-8 pb-6 px-5"
      style={{
        background: cfg.gradient,
        border: `1px solid ${cfg.border}`,
        boxShadow: cfg.glow,
      }}
    >
      {/* Corona para el 1° */}
      {row.ranking_position === 1 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-2xl select-none animate-bounce" style={{ animationDuration: "2s" }}>
          👑
        </div>
      )}

      {/* Badge de posición */}
      <div
        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black"
        style={{ background: `${cfg.ringColor}20`, border: `1px solid ${cfg.ringColor}40`, color: cfg.textColor }}
      >
        {cfg.label}
      </div>

      {/* "Vos" badge */}
      {isMe && (
        <div className="absolute top-3 left-3 bg-[#054a9d] rounded-full px-2 py-0.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/90">Vos</span>
        </div>
      )}

      {/* Avatar */}
      <div className="mb-4 mt-2">
        {isMe ? (
          <AvatarUpload
            currentUrl={myAvatarUrl}
            initials={inits}
            size={cfg.size}
            ringColor={cfg.ringColor}
          />
        ) : (
          <AvatarStatic url={avatarUrl} inits={inits} size={cfg.size} ringColor={cfg.ringColor} />
        )}
      </div>

      {/* Nombre */}
      <p className="text-white font-black text-base leading-tight mb-1">
        {row.first_name}<br />
        <span className="text-white/50 font-medium text-sm">{row.last_name}</span>
      </p>

      {/* Puntos */}
      <p className="font-black text-4xl tabular-nums my-3 leading-none" style={{ color: cfg.textColor }}>
        {row.total_points}
        <span className="text-sm font-bold ml-1" style={{ color: `${cfg.textColor}70` }}>pts</span>
      </p>

      {/* Barra de progreso */}
      <div className="w-full h-1.5 bg-white/6 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cfg.ringColor}80, ${cfg.ringColor})` }}
        />
      </div>

      {/* Trofeos */}
      <div className="flex flex-wrap gap-1 justify-center">
        {trophies.map(tr => (
          <span
            key={tr.label}
            title={tr.label}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide"
            style={{ background: tr.bg, color: tr.color, border: `1px solid ${tr.color}30` }}
          >
            {tr.emoji} {tr.label}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/6 w-full justify-center">
        <div className="text-center">
          <p className="text-white/60 font-black text-sm tabular-nums">{row.predictions_count}</p>
          <p className="text-white/20 text-[9px] font-bold uppercase tracking-wide">pronós.</p>
        </div>
        <div className="w-px h-6 bg-white/8" />
        <div className="text-center">
          <p className="text-emerald-400/70 font-black text-sm tabular-nums">{row.correct_exact}</p>
          <p className="text-white/20 text-[9px] font-bold uppercase tracking-wide">exactos</p>
        </div>
        <div className="w-px h-6 bg-white/8" />
        <div className="text-center">
          <p className="text-[#7ab0e8]/70 font-black text-sm tabular-nums">{row.correct_winner}</p>
          <p className="text-white/20 text-[9px] font-bold uppercase tracking-wide">ganador</p>
        </div>
      </div>
    </div>
  )
}

// ─── Fila de la lista general (4+) ───────────────────────────────────────────

function RankingRow({ row, all, isMe, myAvatarUrl, maxPts }: {
  row: EmployeeRow
  all: EmployeeRow[]
  isMe: boolean
  myAvatarUrl: string | null
  maxPts: number
}) {
  const trophies  = getTrophies(row, all)
  const inits     = initials(row.first_name, row.last_name)
  const pct       = maxPts > 0 ? Math.round((row.total_points / maxPts) * 100) : 0
  const avatarUrl = isMe ? myAvatarUrl : row.avatar_url

  return (
    <div
      className={`group flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 ${
        isMe
          ? "bg-[#054a9d]/12 border border-[#054a9d]/40 shadow-[0_0_20px_rgba(5,74,157,0.15)]"
          : "bg-[#0b2440] border border-white/6 hover:border-white/14"
      }`}
    >
      {/* Posición */}
      <div className="w-8 text-center shrink-0">
        <span className="text-white/20 font-black text-lg tabular-nums" style={{ fontFeatureSettings: "'tnum'" }}>
          {row.ranking_position}
        </span>
      </div>

      {/* Avatar */}
      {isMe ? (
        <AvatarUpload
          currentUrl={myAvatarUrl}
          initials={inits}
          size={52}
          ringColor="#054a9d"
        />
      ) : (
        <AvatarStatic
          url={avatarUrl}
          inits={inits}
          size={52}
          ringColor="rgba(255,255,255,0.15)"
        />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <p className={`font-black text-sm leading-none truncate ${isMe ? "text-white" : "text-white/80"}`}>
            {row.first_name} {row.last_name}
          </p>
          {isMe && (
            <span className="text-[8px] font-black uppercase tracking-widest bg-[#054a9d] text-white/90 px-1.5 py-0.5 rounded-full shrink-0">
              Vos
            </span>
          )}
        </div>

        {/* Trofeos */}
        <div className="flex flex-wrap gap-1 mb-2">
          {trophies.map(tr => (
            <span
              key={tr.label}
              title={tr.label}
              className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide"
              style={{ background: tr.bg, color: tr.color, border: `1px solid ${tr.color}25` }}
            >
              {tr.emoji}
              <span className="hidden sm:inline">{tr.label}</span>
            </span>
          ))}
        </div>

        {/* Barra de progreso */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-white/6 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#054a9d]/70 group-hover:bg-[#1558b8]/80 transition-colors"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-white/20 text-[9px] font-bold tabular-nums shrink-0">{pct}%</span>
        </div>
      </div>

      {/* Puntos */}
      <div className="text-right shrink-0 ml-2">
        <p className={`font-black text-xl tabular-nums leading-none ${isMe ? "text-white" : "text-white/70"}`}>
          {row.total_points}
        </p>
        <p className="text-white/20 text-[9px] font-bold uppercase tracking-wider mt-0.5">pts</p>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  rows: EmployeeRow[]
  myParticipantId: string
  myAvatarUrl: string | null
}

export function EmployeeRankingClient({ rows, myParticipantId, myAvatarUrl }: Props) {
  const maxPts = rows[0]?.total_points ?? 1
  const total  = rows.length
  const top3   = rows.filter(r => r.ranking_position <= 3)
  const rest   = rows.filter(r => r.ranking_position > 3)

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-7xl mb-6 select-none">⚽</div>
        <h2 className="text-white font-black uppercase text-3xl mb-3">Todavía no hay equipo</h2>
        <p className="text-white/30 text-sm leading-relaxed max-w-xs">
          Registrate con el email{" "}
          <span className="text-[#c3871e] font-bold">empleadoparis@TuDNI.com</span>{" "}
          para unirte al ranking interno.
        </p>
      </div>
    )
  }

  return (
    <div>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="relative mb-12 pb-10 border-b border-white/6">
        {/* Línea dorada decorativa */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #c3871e60, transparent)" }} />

        <p className="text-[#c3871e] text-[11px] font-black uppercase tracking-[0.35em] mb-3">
          · Ranking Interno ·
        </p>

        <h1 className="font-black uppercase leading-[0.85] mb-4 select-none"
          style={{ fontSize: "clamp(3.5rem,10vw,6rem)" }}>
          <span className="text-white">EQUIPO</span>
          <br />
          <span style={{
            background: "linear-gradient(135deg, #fbbf24 0%, #c3871e 45%, #9a6815 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip: "text",
          }}>
            PARIS
          </span>
        </h1>

        <p className="text-white/30 text-sm font-medium">
          {total} empleado{total !== 1 ? "s" : ""} compitiendo
          <span className="mx-2 text-white/10">·</span>
          Mundial FIFA 2026
        </p>
      </div>

      {/* ── PODIO ───────────────────────────────────────────────────────────── */}
      {top3.length > 0 && (
        <div className="mb-12">
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
            — Podio —
          </p>

          {/* Grid podio: en desktop orden 2-1-3 (clásico), en mobile lista */}
          <div className="hidden md:grid md:grid-cols-3 gap-5 items-end">
            {/* 2° lugar (izquierda) */}
            {top3.find(r => r.ranking_position === 2) && (
              <div className="mt-8">
                <PodiumCard
                  row={top3.find(r => r.ranking_position === 2)!}
                  all={rows}
                  isMe={top3.find(r => r.ranking_position === 2)!.participant_id === myParticipantId}
                  myAvatarUrl={myAvatarUrl}
                  maxPts={maxPts}
                />
              </div>
            )}

            {/* 1° lugar (centro, más alto) */}
            {top3.find(r => r.ranking_position === 1) && (
              <PodiumCard
                row={top3.find(r => r.ranking_position === 1)!}
                all={rows}
                isMe={top3.find(r => r.ranking_position === 1)!.participant_id === myParticipantId}
                myAvatarUrl={myAvatarUrl}
                maxPts={maxPts}
              />
            )}

            {/* 3° lugar (derecha) */}
            {top3.find(r => r.ranking_position === 3) && (
              <div className="mt-14">
                <PodiumCard
                  row={top3.find(r => r.ranking_position === 3)!}
                  all={rows}
                  isMe={top3.find(r => r.ranking_position === 3)!.participant_id === myParticipantId}
                  myAvatarUrl={myAvatarUrl}
                  maxPts={maxPts}
                />
              </div>
            )}
          </div>

          {/* Mobile: lista vertical */}
          <div className="md:hidden space-y-4">
            {top3.map(row => (
              <PodiumCard
                key={row.participant_id}
                row={row}
                all={rows}
                isMe={row.participant_id === myParticipantId}
                myAvatarUrl={myAvatarUrl}
                maxPts={maxPts}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── CLASIFICACIÓN GENERAL ────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <div className="mb-10">
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-5">
            — Clasificación —
          </p>
          <div className="space-y-2.5">
            {rest.map(row => (
              <RankingRow
                key={row.participant_id}
                row={row}
                all={rows}
                isMe={row.participant_id === myParticipantId}
                myAvatarUrl={myAvatarUrl}
                maxPts={maxPts}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── LEYENDA DE INSIGNIAS ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/6 bg-[#0b2440]/40 p-5">
        <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
          Insignias
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {[
            { emoji: "🥇", label: "Campeón Paris",  color: "#e8a832", bg: "rgba(232,168,50,0.12)"  },
            { emoji: "🥈", label: "Subcampeón",     color: "#94a3b8", bg: "rgba(148,163,184,0.10)" },
            { emoji: "🥉", label: "Top 3 Paris",    color: "#cd7c3a", bg: "rgba(205,124,58,0.10)"  },
            { emoji: "🎯", label: "Francotirador",  color: "#f472b6", bg: "rgba(244,114,182,0.10)" },
            { emoji: "🔥", label: "Más Activo",     color: "#fb923c", bg: "rgba(251,146,60,0.10)"  },
            { emoji: "💡", label: "Adivinador",     color: "#a3e635", bg: "rgba(163,230,53,0.10)"  },
          ].map(t => (
            <div
              key={t.label}
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: t.bg, border: `1px solid ${t.color}20` }}
            >
              <span className="text-base select-none">{t.emoji}</span>
              <span className="font-bold text-[11px]" style={{ color: t.color }}>{t.label}</span>
            </div>
          ))}
        </div>

        <p className="text-white/15 text-[10px] font-medium text-center mt-4">
          Tocá tu avatar para cambiar la foto de perfil 📸
        </p>
      </div>

    </div>
  )
}
