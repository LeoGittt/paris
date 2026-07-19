"use client"

// Poner en false para cerrar todos los pronósticos manualmente
const PREDICTIONS_OPEN = true

// Equipos bloqueados manualmente (independiente del cron y de la DB)
const LOCKED_TEAM_PAIRS: [string, string][] = [
  ["Argentina", "Austria"],
  ["Jordania", "Argentina"],
  ["Argentina", "Cabo Verde"],
  ["Argentina", "Inglaterra"],
  ["Argentina", "Egipto"],
  ["Argentina", "Suiza"],
  ["Argentina", "España"],
]

function isManuallyLocked(team1: string, team2: string) {
  return LOCKED_TEAM_PAIRS.some(
    ([t1, t2]) => (t1 === team1 && t2 === team2) || (t1 === team2 && t2 === team1)
  )
}

import { useState, useTransition, useRef, useCallback, useEffect } from "react"
import { CheckCircle2, Clock, Lock, XCircle, ChevronDown, AlertCircle } from "lucide-react"
import { savePrediction } from "@/lib/actions/predictions"
import { Flag } from "@/components/ui/flag"
import type { MatchRow, PredictionRow } from "@/app/dashboard/pronosticos/page"

interface Props {
  matches: MatchRow[]
  predsByMatch: Record<string, PredictionRow>
  participantId: string
}

const STAGE_LABELS: Record<string, string> = {
  group:        "Fase de Grupos",
  round_of_32:  "Ronda de 32",
  round_of_16:  "Octavos de Final",
  quarterfinal: "Cuartos de Final",
  semifinal:    "Semifinales",
  third_place:  "Tercer Puesto",
  final:        "Final",
}

const RESULT_CONFIG: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  correct_exact:  { color: "#c3871e",   label: "Exacto",     icon: CheckCircle2 },
  correct_winner: { color: "#7ab0e8",   label: "Correcto",   icon: CheckCircle2 },
  correct_diff:   { color: "#4ade80",   label: "Diferencia", icon: CheckCircle2 },
  wrong:          { color: "#f87171",   label: "Incorrecto", icon: XCircle      },
  pending:        { color: "#ffffff40", label: "Pendiente",  icon: Clock        },
}

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error"

/* ─── Score stepper ──────────────────────────────────────── */
function ScoreStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-7 h-7 shrink-0 rounded-lg bg-white/6 hover:bg-white/12 active:scale-90 border border-white/8 hover:border-white/16 text-white font-black text-sm transition-all duration-100 flex items-center justify-center select-none"
      >
        –
      </button>
      <span className="text-white font-black text-2xl tabular-nums w-7 text-center select-none leading-none shrink-0">
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 shrink-0 rounded-lg bg-white/6 hover:bg-white/12 active:scale-90 border border-white/8 hover:border-white/16 text-white font-black text-sm transition-all duration-100 flex items-center justify-center select-none"
      >
        +
      </button>
    </div>
  )
}

/* ─── Save status indicator ──────────────────────────────── */
function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null

  if (status === "dirty") return (
    <span className="flex items-center gap-1.5 text-[#c3871e]/80 text-[10px] font-black uppercase tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-[#c3871e]/80 animate-pulse" />
      Sin guardar
    </span>
  )

  if (status === "saving") return (
    <span className="flex items-center gap-1.5 text-white/35 text-[10px] font-black uppercase tracking-wide">
      <svg className="animate-spin w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Guardando
    </span>
  )

  if (status === "saved") return (
    <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase tracking-wide">
      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Guardado
    </span>
  )

  return null
}

/* ─── Prediction card ────────────────────────────────────── */
function PredictionCard({
  match, prediction, participantId,
}: {
  match: MatchRow
  prediction: PredictionRow | undefined
  participantId: string
}) {
  const [s1, setS1] = useState(prediction?.predicted_score1 ?? 0)
  const [s2, setS2] = useState(prediction?.predicted_score2 ?? 0)
  const [status, setStatus]   = useState<SaveStatus>(prediction ? "saved" : "idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [, startTransition]   = useTransition()

  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLocked  = !PREDICTIONS_OPEN || match.predictions_locked || match.is_finished || new Date(match.match_date) <= new Date() || isManuallyLocked(match.team1, match.team2)
  const hasPred   = !!prediction
  const resultCfg = prediction ? (RESULT_CONFIG[prediction.result] ?? RESULT_CONFIG.pending) : null

  // Cleanup on unmount
  useEffect(() => () => {
    if (debounceRef.current)  clearTimeout(debounceRef.current)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
  }, [])

  const doSave = useCallback((score1: number, score2: number) => {
    setStatus("saving")
    setErrorMsg("")
    startTransition(async () => {
      const res = await savePrediction(participantId, match.id, score1, score2)
      if (res.ok) {
        setStatus("saved")
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
        savedTimerRef.current = setTimeout(() => setStatus("idle"), 3000)
      } else {
        setStatus("error")
        setErrorMsg(res.error)
      }
    })
  }, [participantId, match.id])

  const scheduleAutoSave = useCallback((score1: number, score2: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setStatus("dirty")
    debounceRef.current = setTimeout(() => doSave(score1, score2), 800)
  }, [doSave])

  const changeS1 = (v: number) => { setS1(v); scheduleAutoSave(v, s2) }
  const changeS2 = (v: number) => { setS2(v); scheduleAutoSave(s1, v) }

  return (
    <div className={`bg-[#0b2440] border rounded-2xl overflow-hidden transition-all duration-200 ${
      isLocked
        ? "border-white/5 opacity-70"
        : "border-white/8 hover:border-white/15 hover:shadow-lg hover:shadow-black/30"
    }`}>

      {/* Header */}
      <div className="px-5 py-3 bg-[#06192c]/60 border-b border-white/5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {match.group_name && (
            <span className="text-[10px] font-black uppercase tracking-wider text-white/30 bg-white/5 px-2 py-0.5 rounded-md shrink-0">
              {match.group_name}
            </span>
          )}
          <span className="text-white/25 text-[11px] font-medium capitalize truncate">
            {match.formatted_date} · {match.formatted_time} hs
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isLocked && <Lock className="w-3 h-3 text-white/20" />}
          {match.is_finished && resultCfg && (
            <span className="text-[10px] font-black uppercase" style={{ color: resultCfg.color }}>
              {hasPred ? `+${prediction!.points_earned}pts` : "Sin pronóstico"}
            </span>
          )}
          {!isLocked && <SaveIndicator status={status} />}
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Teams + real score */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2.5">
            <Flag emoji={match.team1_flag} size={28} />
            <span className="text-white font-black text-sm uppercase tracking-wide leading-tight">{match.team1}</span>
          </div>
          <div className="shrink-0 text-center min-w-[3rem]">
            {match.is_finished ? (
              <span className="text-white font-black text-lg tabular-nums">{match.score1} – {match.score2}</span>
            ) : (
              <span className="text-white/20 font-black text-sm">VS</span>
            )}
          </div>
          <div className="flex-1 flex items-center justify-end gap-2.5">
            <span className="text-white font-black text-sm uppercase tracking-wide leading-tight text-right">{match.team2}</span>
            <Flag emoji={match.team2_flag} size={28} />
          </div>
        </div>

        {/* Prediction input (unlocked) */}
        {!isLocked ? (
          <div className="space-y-3">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.25em] text-center">
              Tu pronóstico
            </p>
            <div className="flex items-center justify-center gap-2">
              <ScoreStepper value={s1} onChange={changeS1} />
              <span className="text-white/20 font-black text-2xl shrink-0 px-1">–</span>
              <ScoreStepper value={s2} onChange={changeS2} />
            </div>

            {/* Aviso 0 – 0 */}
            {s1 === 0 && s2 === 0 && status === "idle" && (
              <div className="flex items-center justify-between gap-3 bg-white/4 border border-white/8 rounded-xl px-3 py-2.5">
                <p className="text-white/35 text-[10px] leading-snug">
                  Sin cambios el resultado queda guardado como <span className="text-white/60 font-bold">0 – 0</span>
                </p>
                <button
                  type="button"
                  onClick={() => doSave(0, 0)}
                  className="shrink-0 text-[10px] font-black uppercase tracking-wide text-[#7ab0e8] hover:text-white bg-[#054a9d]/20 hover:bg-[#054a9d]/40 border border-[#054a9d]/30 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                >
                  Guardar 0 – 0
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <p className="text-red-400 text-[11px] font-medium leading-tight">{errorMsg}</p>
              </div>
            )}
          </div>

        ) : (
          /* Locked / finished — show saved prediction */
          <div className="text-center">
            {hasPred ? (
              <div className="space-y-1">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.25em]">Tu pronóstico</p>
                <p className="text-white font-black text-2xl tabular-nums">
                  {prediction!.predicted_score1} – {prediction!.predicted_score2}
                </p>
                {resultCfg && prediction!.result !== "pending" && (
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <resultCfg.icon className="w-3.5 h-3.5" style={{ color: resultCfg.color }} />
                    <span className="text-[11px] font-black" style={{ color: resultCfg.color }}>
                      {resultCfg.label} · +{prediction!.points_earned}pts
                    </span>
                  </div>
                )}
                {prediction!.result === "pending" && (
                  <p className="text-white/25 text-[11px] font-medium mt-1 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Esperando resultado
                  </p>
                )}
              </div>
            ) : (
              <p className="text-white/20 text-sm font-medium flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                {match.is_finished ? "No cargaste pronóstico" : "Partido bloqueado"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main client ────────────────────────────────────────── */
export function PredictionsClient({ matches, predsByMatch, participantId }: Props) {
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({ group: true })

  const grouped = matches.reduce<Record<string, MatchRow[]>>((acc, m) => {
    if (!acc[m.stage]) acc[m.stage] = []
    acc[m.stage].push(m)
    return acc
  }, {})

  const stageOrder = ["group","round_of_32","round_of_16","quarterfinal","semifinal","third_place","final"]

  const toggleStage = (stage: string) =>
    setExpandedStages(v => ({ ...v, [stage]: !v[stage] }))

  // Overall progress
  const isMatchOpen = (m: { predictions_locked: boolean; is_finished: boolean; match_date: string }) =>
    !m.predictions_locked && !m.is_finished && new Date(m.match_date) > new Date()
  const totalMatches  = matches.filter(isMatchOpen).length
  const filledMatches = matches.filter(m => isMatchOpen(m) && predsByMatch[m.id]).length

  if (!matches.length) {
    return (
      <div className="text-center py-20">
        <p className="text-white/25 text-base font-medium">El fixture aún no fue cargado</p>
        <p className="text-white/15 text-sm mt-1">Volvé cuando se publiquen los partidos</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Progress banner — solo si hay partidos abiertos */}
      {totalMatches > 0 && (
        <div className="bg-[#0b2440] border border-white/8 rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/50 text-[11px] font-black uppercase tracking-[0.25em]">
                Pronósticos cargados
              </p>
              <p className="text-white/60 text-[11px] font-black tabular-nums">
                <span className="text-white">{filledMatches}</span> / {totalMatches}
              </p>
            </div>
            <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#054a9d] rounded-full transition-all duration-500"
                style={{ width: totalMatches > 0 ? `${(filledMatches / totalMatches) * 100}%` : "0%" }}
              />
            </div>
          </div>
          {filledMatches === totalMatches && totalMatches > 0 && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-black uppercase tracking-wide shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Completo
            </div>
          )}
        </div>
      )}

      {/* Stages */}
      {stageOrder.filter(s => grouped[s]?.length).map(stage => {
        const stageMatches = grouped[stage]
        const isOpen  = expandedStages[stage] ?? false
        const open    = stageMatches.filter(isMatchOpen).length
        const filled  = stageMatches.filter(m => isMatchOpen(m) && predsByMatch[m.id]).length
        const total   = stageMatches.length

        return (
          <div key={stage} className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleStage(stage)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-white font-black uppercase text-sm tracking-wide">
                  {STAGE_LABELS[stage] ?? stage}
                </span>
                {open > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    filled === open
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-[#054a9d]/20 border-[#054a9d]/30 text-[#7ab0e8]"
                  }`}>
                    {filled === open ? "✓ Completo" : `${filled}/${open} cargados`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/25 text-[11px] font-medium">{total} partido{total !== 1 ? "s" : ""}</span>
                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-white/6 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {stageMatches.map(match => (
                  <PredictionCard
                    key={match.id}
                    match={match}
                    prediction={predsByMatch[match.id]}
                    participantId={participantId}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
