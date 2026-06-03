"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Clock, Lock, XCircle, ChevronDown } from "lucide-react"
import { savePrediction } from "@/lib/actions/predictions"
import { Flag } from "@/components/ui/flag"
import type { MatchRow, PredictionRow } from "@/app/dashboard/pronosticos/page"

interface Props {
  matches: MatchRow[]
  predsByMatch: Record<string, PredictionRow>
  participantId: string
}

const STAGE_LABELS: Record<string, string> = {
  group:         "Fase de Grupos",
  round_of_32:   "Ronda de 32",
  round_of_16:   "Octavos de Final",
  quarterfinal:  "Cuartos de Final",
  semifinal:     "Semifinales",
  third_place:   "Tercer Puesto",
  final:         "Final",
}

const RESULT_CONFIG: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  correct_exact:  { color: "#4ade80", label: "Exacto",    icon: CheckCircle2 },
  correct_winner: { color: "#7ab0e8", label: "Correcto",  icon: CheckCircle2 },
  correct_diff:   { color: "#c3871e", label: "Diferencia",icon: CheckCircle2 },
  wrong:          { color: "#f87171", label: "Incorrecto", icon: XCircle },
  pending:        { color: "#ffffff40", label: "Pendiente", icon: Clock },
}

function PredictionCard({
  match,
  prediction,
  participantId,
}: {
  match: MatchRow
  prediction: PredictionRow | undefined
  participantId: string
}) {
  const [s1, setS1] = useState(prediction?.predicted_score1 ?? 0)
  const [s2, setS2] = useState(prediction?.predicted_score2 ?? 0)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const isLocked   = match.predictions_locked || match.is_finished
  const hasPred    = !!prediction
  const resultCfg  = prediction ? (RESULT_CONFIG[prediction.result] ?? RESULT_CONFIG.pending) : null

  const handleSave = () => {
    setError("")
    setSaved(false)
    startTransition(async () => {
      const res = await savePrediction(participantId, match.id, s1, s2)
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } else {
        setError(res.error)
      }
    })
  }

  const dateStr = match.formatted_date
  const timeStr = match.formatted_time

  return (
    <div className={`bg-[#0b2440] border rounded-2xl overflow-hidden transition-all ${
      isLocked ? "border-white/5 opacity-70" : "border-white/8 hover:border-white/14"
    }`}>

      {/* Header del partido */}
      <div className="px-5 py-3 bg-[#06192c]/60 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {match.group_name && (
            <span className="text-[10px] font-black uppercase tracking-wider text-white/30 bg-white/5 px-2 py-0.5 rounded-md">
              {match.group_name}
            </span>
          )}
          <span className="text-white/25 text-[11px] font-medium capitalize">{dateStr} · {timeStr} hs</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isLocked && <Lock className="w-3 h-3 text-white/20" />}
          {match.is_finished && resultCfg && (
            <span className="text-[10px] font-black uppercase" style={{ color: resultCfg.color }}>
              {hasPred ? `+${prediction!.points_earned}pts` : "Sin pronóstico"}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Equipos y marcador */}
        <div className="flex items-center gap-3 mb-5">
          {/* Local */}
          <div className="flex-1 flex items-center gap-2.5">
            <Flag emoji={match.team1_flag} size={28} />
            <span className="text-white font-black text-sm uppercase tracking-wide leading-tight">{match.team1}</span>
          </div>

          {/* Resultado real o "VS" */}
          <div className="shrink-0 text-center">
            {match.is_finished ? (
              <span className="text-white font-black text-lg tabular-nums">{match.score1} – {match.score2}</span>
            ) : (
              <span className="text-white/20 font-black text-sm">VS</span>
            )}
          </div>

          {/* Visitante */}
          <div className="flex-1 flex items-center justify-end gap-2.5">
            <span className="text-white font-black text-sm uppercase tracking-wide leading-tight text-right">{match.team2}</span>
            <Flag emoji={match.team2_flag} size={28} />
          </div>
        </div>

        {/* Input de pronóstico */}
        {!isLocked ? (
          <div className="space-y-3">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.25em] text-center">
              Tu pronóstico
            </p>
            <div className="flex items-center gap-3">
              {/* Score 1 */}
              <div className="flex-1 flex items-center justify-center gap-2">
                <button
                  onClick={() => setS1(v => Math.max(0, v - 1))}
                  className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 text-white font-black text-lg transition-colors flex items-center justify-center"
                >–</button>
                <span className="text-white font-black text-3xl tabular-nums w-8 text-center">{s1}</span>
                <button
                  onClick={() => setS1(v => v + 1)}
                  className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 text-white font-black text-lg transition-colors flex items-center justify-center"
                >+</button>
              </div>

              <span className="text-white/20 font-black text-xl">–</span>

              {/* Score 2 */}
              <div className="flex-1 flex items-center justify-center gap-2">
                <button
                  onClick={() => setS2(v => Math.max(0, v - 1))}
                  className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 text-white font-black text-lg transition-colors flex items-center justify-center"
                >–</button>
                <span className="text-white font-black text-3xl tabular-nums w-8 text-center">{s2}</span>
                <button
                  onClick={() => setS2(v => v + 1)}
                  className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 text-white font-black text-lg transition-colors flex items-center justify-center"
                >+</button>
              </div>
            </div>

            {error && <p className="text-red-400 text-[11px] font-medium text-center">{error}</p>}

            <button
              onClick={handleSave}
              disabled={isPending}
              className={`w-full h-10 rounded-xl text-[12px] font-black uppercase tracking-wide transition-all ${
                saved
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                  : "bg-[#054a9d] hover:bg-[#1558b8] text-white disabled:opacity-50"
              }`}
            >
              {isPending ? "Guardando..." : saved ? "✓ Guardado" : hasPred ? "Actualizar" : "Guardar pronóstico"}
            </button>
          </div>
        ) : (
          /* Partido bloqueado o finalizado — mostrar pronóstico cargado */
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

export function PredictionsClient({ matches, predsByMatch, participantId }: Props) {
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({ group: true })

  // Agrupar por stage
  const grouped = matches.reduce<Record<string, MatchRow[]>>((acc, m) => {
    const key = m.stage
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  const stageOrder = ["group","round_of_32","round_of_16","quarterfinal","semifinal","third_place","final"]

  const toggleStage = (stage: string) =>
    setExpandedStages(v => ({ ...v, [stage]: !v[stage] }))

  if (!matches.length) {
    return (
      <div className="text-center py-20">
        <p className="text-white/25 text-base font-medium">El fixture aún no fue cargado</p>
        <p className="text-white/15 text-sm mt-1">Volvé cuando se publiquen los partidos</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {stageOrder.filter(s => grouped[s]?.length).map(stage => {
        const stageMatches = grouped[stage]
        const isOpen = expandedStages[stage] ?? false
        const pending = stageMatches.filter(m => !m.predictions_locked && !m.is_finished).length
        const total   = stageMatches.length

        return (
          <div key={stage} className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
            {/* Stage header */}
            <button
              onClick={() => toggleStage(stage)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-white font-black uppercase text-sm tracking-wide">
                  {STAGE_LABELS[stage] ?? stage}
                </span>
                {pending > 0 && (
                  <span className="bg-[#054a9d]/30 border border-[#054a9d]/40 text-[#7ab0e8] text-[10px] font-black px-2 py-0.5 rounded-full">
                    {pending} pendiente{pending > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/25 text-[11px] font-medium">{total} partidos</span>
                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
