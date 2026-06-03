"use client"

import { useState, useTransition } from "react"
import { Save, CheckCircle2, AlertCircle, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Config { id: string; correct_winner: number; correct_exact: number; correct_diff: number }

const inputCls = "w-full px-4 py-3 bg-[#06192c] border border-white/10 rounded-xl text-white text-center text-2xl font-black tabular-nums focus:outline-none focus:border-[#054a9d] focus:ring-2 focus:ring-[#054a9d]/20 transition-all"

export function PointsConfig({ config }: { config: Config | null }) {
  const [winner, setWinner] = useState(config?.correct_winner ?? 5)
  const [exact,  setExact]  = useState(config?.correct_exact  ?? 10)
  const [diff,   setDiff]   = useState(config?.correct_diff   ?? 2)
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from("point_config")
        .update({ correct_winner: winner, correct_exact: exact, correct_diff: diff })
        .eq("id", config?.id ?? "")

      setStatus(error ? "error" : "ok")
      setTimeout(() => setStatus("idle"), 3000)
    })
  }

  const fields = [
    { label: "Resultado exacto",    sub: "Marcador perfecto (ej: 2-1 siendo 2-1)",    value: exact,  set: setExact,  color: "#4ade80" },
    { label: "Ganador o empate",     sub: "Acertó quién ganó o que empataban",          value: winner, set: setWinner, color: "#7ab0e8" },
    { label: "Diferencia de goles",  sub: "Ganador correcto + diferencia exacta",       value: diff,   set: setDiff,   color: "#c3871e" },
  ]

  return (
    <div className="max-w-2xl space-y-6">

      {/* Advertencia */}
      <div className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-5 py-4">
        <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-orange-400 font-bold text-sm">Cambios con impacto inmediato</p>
          <p className="text-orange-400/60 text-xs mt-0.5">
            Modificar los puntos solo afecta partidos que se recalculen desde ahora.
            Para recalcular partidos ya finalizados, ir a Partidos → "Recalcular todos los puntos".
          </p>
        </div>
      </div>

      {/* Config cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {fields.map(f => (
          <div
            key={f.label}
            className="bg-[#0b2440] border border-white/8 rounded-2xl p-5"
            style={{ borderColor: `${f.color}20` }}
          >
            <div className="w-8 h-1 rounded-full mb-4" style={{ background: f.color }} />
            <p className="text-white font-black text-sm uppercase tracking-wide mb-1">{f.label}</p>
            <p className="text-white/30 text-[11px] font-medium mb-4 leading-relaxed">{f.sub}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => f.set(v => Math.max(0, v - 1))}
                className="w-9 h-9 rounded-xl bg-white/6 hover:bg-white/12 text-white font-black text-lg transition-colors flex items-center justify-center"
              >–</button>
              <input
                type="number"
                min={0}
                max={99}
                value={f.value}
                onChange={e => f.set(parseInt(e.target.value) || 0)}
                className={inputCls}
                style={{ color: f.color }}
              />
              <button
                onClick={() => f.set(v => v + 1)}
                className="w-9 h-9 rounded-xl bg-white/6 hover:bg-white/12 text-white font-black text-lg transition-colors flex items-center justify-center"
              >+</button>
            </div>
            <p className="text-center text-[10px] font-black uppercase tracking-widest mt-2" style={{ color: f.color }}>
              {f.value} punto{f.value !== 1 ? "s" : ""}
            </p>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/6">
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Vista previa del sistema de puntos</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-white/6">
          {fields.map(f => (
            <div key={f.label} className="px-5 py-4 text-center">
              <p className="font-black text-3xl tabular-nums mb-1" style={{ color: f.color }}>{f.value}</p>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isPending || !config}
          className="flex items-center gap-2 px-6 h-11 bg-[#054a9d] hover:bg-[#1558b8] disabled:opacity-50 text-white font-black uppercase tracking-wide text-sm rounded-xl transition-all shadow-lg shadow-[#054a9d]/25"
        >
          <Save className="w-4 h-4" />
          {isPending ? "Guardando..." : "Guardar configuración"}
        </button>

        {status === "ok" && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
            <CheckCircle2 className="w-4 h-4" />
            Configuración guardada
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
            <AlertCircle className="w-4 h-4" />
            Error al guardar
          </div>
        )}
      </div>

      {!config && (
        <div className="flex items-center gap-2 text-orange-400/60 text-sm">
          <Settings className="w-4 h-4" />
          No se encontró configuración. Ejecutá el schema SQL para crearla.
        </div>
      )}
    </div>
  )
}
