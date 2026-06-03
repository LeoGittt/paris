"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Lock, Edit3, RefreshCw, AlertCircle, Plus, Trash2, Upload } from "lucide-react"
import { Flag } from "@/components/ui/flag"
import {
  saveMatchResult,
  recalculateAllPoints,
  updateMatchDetails,
  createMatch,
  deleteMatch,
  bulkCreateMatches,
} from "@/lib/actions/admin/matches"
import type { MatchAdminRow } from "@/app/admin/partidos/page"

const STAGE_LABELS: Record<string, string> = {
  group:        "Fase de Grupos",
  round_of_32:  "Dieciseisavos",
  round_of_16:  "Octavos",
  quarterfinal: "Cuartos",
  semifinal:    "Semifinales",
  third_place:  "Tercer Puesto",
  final:        "Final",
}

const STAGE_ORDER = ["group","round_of_32","round_of_16","quarterfinal","semifinal","third_place","final"]

const inputCls = "w-full px-3 py-2.5 bg-[#06192c] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#054a9d] focus:ring-1 focus:ring-[#054a9d]/30 transition-all placeholder:text-white/20"
const labelCls = "block text-white/40 text-[11px] font-bold uppercase tracking-wide mb-1.5"

const toDatetimeLocal = (iso: string) =>
  iso.replace(/Z$/, "").replace(/\+\d{2}:\d{2}$/, "").slice(0, 16)

const toISO = (local: string) => local + ":00Z"

// ─── Result Modal ────────────────────────────────────────────────────────────

function ResultModal({ match, onClose }: { match: MatchAdminRow; onClose: () => void }) {
  const [s1, setS1] = useState(match.score1 ?? 0)
  const [s2, setS2] = useState(match.score2 ?? 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    setLoading(true)
    setError("")
    const res = await saveMatchResult(match.id, s1, s2)
    if (res.ok) {
      onClose()
    } else {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0b2440] border border-white/10 rounded-2xl p-7 w-full max-w-sm shadow-2xl">
        <h3 className="text-white font-black uppercase text-lg mb-1">Cargar resultado</h3>
        <p className="text-white/40 text-sm mb-6 flex items-center gap-1.5">
          <Flag emoji={match.team1_flag} size={16} /> {match.team1} vs <Flag emoji={match.team2_flag} size={16} /> {match.team2}
        </p>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 text-center">
            <div className="flex justify-center mb-1"><Flag emoji={match.team1_flag} size={36} /></div>
            <p className="text-white/40 text-[11px] font-bold uppercase tracking-wide mb-2">{match.team1}</p>
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setS1(v => Math.max(0, v-1))} className="w-9 h-9 rounded-xl bg-white/6 hover:bg-white/12 text-white font-black text-lg transition-colors">–</button>
              <span className="text-white font-black text-4xl tabular-nums w-10 text-center">{s1}</span>
              <button onClick={() => setS1(v => v+1)} className="w-9 h-9 rounded-xl bg-white/6 hover:bg-white/12 text-white font-black text-lg transition-colors">+</button>
            </div>
          </div>
          <span className="text-white/20 font-black text-2xl">–</span>
          <div className="flex-1 text-center">
            <div className="flex justify-center mb-1"><Flag emoji={match.team2_flag} size={36} /></div>
            <p className="text-white/40 text-[11px] font-bold uppercase tracking-wide mb-2">{match.team2}</p>
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setS2(v => Math.max(0, v-1))} className="w-9 h-9 rounded-xl bg-white/6 hover:bg-white/12 text-white font-black text-lg transition-colors">–</button>
              <span className="text-white font-black text-4xl tabular-nums w-10 text-center">{s2}</span>
              <button onClick={() => setS2(v => v+1)} className="w-9 h-9 rounded-xl bg-white/6 hover:bg-white/12 text-white font-black text-lg transition-colors">+</button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-11 bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 font-bold uppercase text-sm rounded-xl transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="h-11 bg-[#c3871e] hover:bg-[#d9961f] disabled:opacity-50 text-white font-black uppercase text-sm rounded-xl transition-all"
          >
            {loading ? "Guardando..." : "Guardar y recalcular"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Match Modal ─────────────────────────────────────────────────────────

function EditMatchModal({ match, onClose }: { match: MatchAdminRow; onClose: () => void }) {
  const [t1, setT1]       = useState(match.team1)
  const [t2, setT2]       = useState(match.team2)
  const [f1, setF1]       = useState(match.team1_flag)
  const [f2, setF2]       = useState(match.team2_flag)
  const [date, setDate]   = useState(toDatetimeLocal(match.match_date))
  const [group, setGroup] = useState(match.group_name ?? "")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  const handleSave = async () => {
    setLoading(true)
    setError("")
    const res = await updateMatchDetails(match.id, {
      team1: t1.trim(), team2: t2.trim(),
      team1_flag: f1.trim(), team2_flag: f2.trim(),
      match_date: toISO(date),
      group_name: group.trim() || null,
    })
    if (!res.ok) {
      setError(res.error)
      setLoading(false)
      return
    }
    onClose()
  }

  const isValid = t1.trim() && t2.trim() && date

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0b2440] border border-white/10 rounded-2xl p-7 w-full max-w-md shadow-2xl">
        <h3 className="text-white font-black uppercase text-lg mb-5">Editar partido</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Local</label>
              <div className="flex gap-2">
                <input
                  value={f1} onChange={e => setF1(e.target.value)}
                  className="w-11 shrink-0 px-1 py-2.5 bg-[#06192c] border border-white/10 rounded-xl text-white text-center text-base focus:outline-none focus:border-[#054a9d] transition-all"
                  placeholder="🏳️" maxLength={4}
                />
                <input value={t1} onChange={e => setT1(e.target.value)} className={inputCls} placeholder="Argentina" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Visitante</label>
              <div className="flex gap-2">
                <input
                  value={f2} onChange={e => setF2(e.target.value)}
                  className="w-11 shrink-0 px-1 py-2.5 bg-[#06192c] border border-white/10 rounded-xl text-white text-center text-base focus:outline-none focus:border-[#054a9d] transition-all"
                  placeholder="🏳️" maxLength={4}
                />
                <input value={t2} onChange={e => setT2(e.target.value)} className={inputCls} placeholder="Brasil" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fecha y hora (UTC)</label>
              <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Grupo (opcional)</label>
              <input value={group} onChange={e => setGroup(e.target.value)} className={inputCls} placeholder="Grupo A" />
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs font-medium mt-4">{error}</p>}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button onClick={onClose} className="h-11 bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 font-bold uppercase text-sm rounded-xl transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !isValid}
            className="h-11 bg-[#054a9d] hover:bg-[#1558b8] disabled:opacity-50 text-white font-black uppercase text-sm rounded-xl transition-all"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Create Match Modal ───────────────────────────────────────────────────────

function CreateMatchModal({ onClose }: { onClose: (stage?: string) => void }) {
  const [t1, setT1]       = useState("")
  const [t2, setT2]       = useState("")
  const [f1, setF1]       = useState("")
  const [f2, setF2]       = useState("")
  const [date, setDate]   = useState("")
  const [stage, setStage] = useState("group")
  const [group, setGroup] = useState("")
  const [venue, setVenue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]    = useState("")

  const isValid = t1.trim() && t2.trim() && date

  const handleCreate = async () => {
    if (!isValid) return
    setLoading(true)
    setError("")
    const res = await createMatch({
      team1:      t1.trim(),
      team2:      t2.trim(),
      team1_flag: f1.trim(),
      team2_flag: f2.trim(),
      match_date: toISO(date),
      stage,
      group_name: stage === "group" ? (group.trim() || null) : null,
      venue:      venue.trim() || null,
    })
    if (res.ok) {
      onClose(stage)
    } else {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onClose()} />
      <div className="relative bg-[#0b2440] border border-white/10 rounded-2xl p-7 w-full max-w-md shadow-2xl">
        <h3 className="text-white font-black uppercase text-lg mb-1">Crear partido</h3>
        <p className="text-white/30 text-sm mb-5">Agregar al fixture</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Local</label>
              <div className="flex gap-2">
                <input
                  value={f1} onChange={e => setF1(e.target.value)}
                  className="w-11 shrink-0 px-1 py-2.5 bg-[#06192c] border border-white/10 rounded-xl text-white text-center text-base focus:outline-none focus:border-[#054a9d] transition-all"
                  placeholder="🏳️" maxLength={4}
                />
                <input value={t1} onChange={e => setT1(e.target.value)} className={inputCls} placeholder="Argentina" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Visitante</label>
              <div className="flex gap-2">
                <input
                  value={f2} onChange={e => setF2(e.target.value)}
                  className="w-11 shrink-0 px-1 py-2.5 bg-[#06192c] border border-white/10 rounded-xl text-white text-center text-base focus:outline-none focus:border-[#054a9d] transition-all"
                  placeholder="🏳️" maxLength={4}
                />
                <input value={t2} onChange={e => setT2(e.target.value)} className={inputCls} placeholder="México" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fecha y hora (UTC)</label>
              <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
              <p className="text-white/20 text-[10px] mt-1">Argentina = UTC−3</p>
            </div>
            <div>
              <label className={labelCls}>Fase</label>
              <select
                value={stage} onChange={e => setStage(e.target.value)}
                className={inputCls + " cursor-pointer bg-[#06192c]"}
              >
                {STAGE_ORDER.map(s => (
                  <option key={s} value={s} className="bg-[#06192c]">{STAGE_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          {stage === "group" && (
            <div>
              <label className={labelCls}>Nombre del grupo</label>
              <input value={group} onChange={e => setGroup(e.target.value)} className={inputCls} placeholder="Grupo A" />
            </div>
          )}

          <div>
            <label className={labelCls}>Estadio (opcional)</label>
            <input value={venue} onChange={e => setVenue(e.target.value)} className={inputCls} placeholder="MetLife Stadium" />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button onClick={() => onClose()} className="h-11 bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 font-bold uppercase text-sm rounded-xl transition-all">
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !isValid}
            className="h-11 bg-[#c3871e] hover:bg-[#d9961f] disabled:opacity-50 text-white font-black uppercase text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Creando..." : <><Plus className="w-4 h-4" />Crear partido</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CSV Import Modal ─────────────────────────────────────────────────────────
// Formato esperado del CSV:
// date(ISO),team1,team1_flag,team2,team2_flag,stage,group_name,venue
// Ejemplo: 2026-06-15T18:00:00Z,Argentina,🇦🇷,México,🇲🇽,group,Grupo A,MetLife

function ImportCSVModal({ onClose }: { onClose: () => void }) {
  const [preview, setPreview]   = useState<ReturnType<typeof parseCSV>>([])
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n").filter(l => l.trim() && !l.startsWith("#"))
    return lines.map((line, i) => {
      const cols = line.split(",").map(c => c.trim())
      if (cols.length < 6) throw new Error(`Línea ${i + 1}: faltan columnas (mínimo 6)`)
      return {
        match_date: cols[0],
        team1:      cols[1],
        team1_flag: cols[2] ?? "",
        team2:      cols[3],
        team2_flag: cols[4] ?? "",
        stage:      cols[5],
        group_name: cols[6]?.trim() || null,
        venue:      cols[7]?.trim() || null,
      }
    })
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = parseCSV(ev.target?.result as string)
        setPreview(parsed)
      } catch (err) {
        setError(String(err))
        setPreview([])
      }
    }
    reader.readAsText(file, "UTF-8")
  }

  const handleImport = async () => {
    if (!preview.length) return
    setLoading(true)
    setError("")
    const res = await bulkCreateMatches(preview)
    if (res.ok) {
      setSuccess(true)
    } else {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !loading && onClose()} />
      <div className="relative bg-[#0b2440] border border-white/10 rounded-2xl p-7 w-full max-w-lg shadow-2xl">
        {success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-white font-black text-lg">{preview.length} partidos importados</p>
            <button onClick={onClose} className="mt-5 px-6 h-11 bg-[#054a9d] hover:bg-[#1558b8] text-white font-black uppercase text-sm rounded-xl transition-all">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-white font-black uppercase text-lg mb-1">Importar fixture CSV</h3>
            <p className="text-white/30 text-xs mb-5 leading-relaxed">
              Formato: <code className="text-white/50">fecha_ISO, local, bandera, visitante, bandera, fase, grupo, estadio</code>
              <br/>Ejemplo: <code className="text-white/50">2026-06-15T18:00:00Z,Argentina,🇦🇷,México,🇲🇽,group,Grupo A,MetLife</code>
            </p>

            <label className="flex flex-col items-center gap-3 border-2 border-dashed border-white/15 hover:border-white/30 rounded-xl p-8 cursor-pointer transition-colors mb-4">
              <Upload className="w-8 h-8 text-white/20" />
              <p className="text-white/40 text-sm font-medium">Seleccioná un archivo .csv</p>
              <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
            </label>

            {preview.length > 0 && (
              <div className="mb-4 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-3">
                <p className="text-emerald-400 text-sm font-bold">{preview.length} partidos listos para importar</p>
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                  {preview.map((m, i) => (
                    <p key={i} className="text-white/40 text-[11px] flex items-center gap-1">
                      <Flag emoji={m.team1_flag} size={14} /> {m.team1} vs <Flag emoji={m.team2_flag} size={14} /> {m.team2} · {m.stage}{m.group_name ? ` · ${m.group_name}` : ""}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button onClick={onClose} disabled={loading} className="h-11 bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 font-bold uppercase text-sm rounded-xl transition-all">
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={loading || !preview.length}
                className="h-11 bg-[#054a9d] hover:bg-[#1558b8] disabled:opacity-50 text-white font-black uppercase text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Importando..." : <><Upload className="w-4 h-4" />Importar {preview.length || ""}</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MatchesAdmin({ matches, activeStage }: { matches: MatchAdminRow[]; activeStage: string }) {
  const router = useRouter()
  const [resultModal, setResultModal]   = useState<MatchAdminRow | null>(null)
  const [editModal, setEditModal]       = useState<MatchAdminRow | null>(null)
  const [showCreate, setShowCreate]     = useState(false)
  const [showImport, setShowImport]     = useState(false)
  const [isPending, startTransition]    = useTransition()
  const [recalcMsg, setRecalcMsg]       = useState("")

  const grouped = matches.reduce<Record<string, MatchAdminRow[]>>((acc, m) => {
    if (!acc[m.stage]) acc[m.stage] = []
    acc[m.stage].push(m)
    return acc
  }, {})

  const currentStageMatches = grouped[activeStage] ?? []
  const pending  = currentStageMatches.filter(m => !m.is_finished).length
  const finished = currentStageMatches.filter(m => m.is_finished).length

  const handleRecalcAll = () => {
    startTransition(async () => {
      const res = await recalculateAllPoints()
      setRecalcMsg(res.ok ? "✓ Puntos recalculados" : `Error: ${res.error}`)
      setTimeout(() => setRecalcMsg(""), 3000)
    })
  }

  const handleDelete = (match: MatchAdminRow) => {
    const extra = match.is_finished
      ? "\n\n⚠️ Este partido tiene resultado cargado. Se eliminarán también todos los pronósticos y puntos asociados."
      : match.predictions_locked
        ? "\n\nEste partido ya está bloqueado. Los pronósticos asociados también serán eliminados."
        : ""
    if (!confirm(`¿Eliminar el partido ${match.team1} vs ${match.team2}?${extra}\n\nEsta acción no se puede deshacer.`)) return
    startTransition(async () => {
      await deleteMatch(match.id)
    })
  }

  const handleCreateClose = (stage?: string) => {
    setShowCreate(false)
    if (stage) router.push(`/admin/partidos?stage=${stage}`)
    else router.refresh()
  }

  return (
    <div className="space-y-4">

      {/* Toolbar: stage tabs + create button */}
      <div className="flex items-start gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          {STAGE_ORDER.filter(s => grouped[s]?.length).map(s => (
            <button
              key={s}
              onClick={() => router.push(`/admin/partidos?stage=${s}`)}
              className={`shrink-0 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-wide transition-all ${
                activeStage === s
                  ? "bg-[#c3871e]/15 text-[#c3871e] border border-[#c3871e]/30"
                  : "bg-white/4 text-white/30 hover:text-white/60 hover:bg-white/8 border border-white/6"
              }`}
            >
              {STAGE_LABELS[s] ?? s}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowImport(true)}
          className="shrink-0 flex items-center gap-2 px-4 h-9 bg-white/4 hover:bg-white/8 border border-white/8 text-white/50 hover:text-white font-black text-[12px] uppercase tracking-wide rounded-xl transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          Importar CSV
        </button>
        <button
          onClick={() => setShowCreate(true)}
          className="shrink-0 flex items-center gap-2 px-4 h-9 bg-[#c3871e]/15 hover:bg-[#c3871e]/25 border border-[#c3871e]/30 text-[#c3871e] font-black text-[12px] uppercase tracking-wide rounded-xl transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Crear partido
        </button>
      </div>

      {/* Stats + recalculate */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-[11px] font-medium">
          <span className="text-emerald-400">{finished} finalizados</span>
          <span className="text-white/30">{pending} pendientes</span>
        </div>
        <button
          onClick={handleRecalcAll}
          disabled={isPending}
          className="flex items-center gap-2 px-4 h-9 bg-white/4 hover:bg-white/8 border border-white/8 text-white/50 hover:text-white font-black text-[11px] uppercase tracking-wide rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
          {recalcMsg || "Recalcular todos los puntos"}
        </button>
      </div>

      {/* No matches in this stage */}
      {currentStageMatches.length === 0 && (
        <div className="text-center py-16 bg-[#0b2440] border border-white/6 rounded-2xl">
          <p className="text-white/25 text-sm font-medium mb-3">No hay partidos en esta fase todavía</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-5 h-9 bg-[#c3871e]/15 hover:bg-[#c3871e]/25 border border-[#c3871e]/30 text-[#c3871e] font-black text-[12px] uppercase tracking-wide rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Crear primer partido
          </button>
        </div>
      )}

      {/* Matches grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {currentStageMatches.map(match => (
          <div
            key={match.id}
            className={`bg-[#0b2440] rounded-2xl overflow-hidden transition-all ${
              match.is_finished ? "border border-emerald-500/15" : "border border-white/8"
            }`}
          >
            {/* Header */}
            <div className="px-4 py-2.5 bg-[#06192c]/60 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {match.group_name && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/25 bg-white/5 px-1.5 py-0.5 rounded">
                    {match.group_name}
                  </span>
                )}
                <span className="text-white/20 text-[10px] font-medium">
                  {match.formatted_date} {match.formatted_time}hs
                </span>
              </div>
              <div className="flex items-center gap-1">
                {match.is_finished && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {match.predictions_locked && !match.is_finished && <Lock className="w-3.5 h-3.5 text-orange-400/60" />}
              </div>
            </div>

            <div className="px-4 py-4">
              {/* Teams */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 flex items-center gap-2">
                  <Flag emoji={match.team1_flag} size={24} />
                  <span className="text-white/80 font-bold text-sm leading-tight">{match.team1}</span>
                </div>
                {match.is_finished ? (
                  <span className="text-white font-black text-lg tabular-nums shrink-0">
                    {match.score1} – {match.score2}
                  </span>
                ) : (
                  <span className="text-white/20 font-black text-sm shrink-0">VS</span>
                )}
                <div className="flex-1 flex items-center justify-end gap-2">
                  <span className="text-white/80 font-bold text-sm leading-tight text-right">{match.team2}</span>
                  <Flag emoji={match.team2_flag} size={24} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setResultModal(match)}
                  className={`flex-1 h-9 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all ${
                    match.is_finished
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-[#c3871e]/15 border border-[#c3871e]/30 text-[#c3871e] hover:bg-[#c3871e]/25"
                  }`}
                >
                  {match.is_finished ? "Editar resultado" : "Cargar resultado"}
                </button>
                <button
                  onClick={() => setEditModal(match)}
                  className="w-9 h-9 rounded-xl bg-white/4 border border-white/8 text-white/30 hover:text-white/60 hover:bg-white/8 transition-all flex items-center justify-center"
                  title="Editar partido"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(match)}
                  disabled={isPending}
                  className="w-9 h-9 rounded-xl bg-red-500/5 border border-red-500/15 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center justify-center disabled:opacity-30"
                  title="Eliminar partido"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {resultModal && <ResultModal match={resultModal} onClose={() => setResultModal(null)} />}
      {editModal   && <EditMatchModal match={editModal} onClose={() => { setEditModal(null); router.refresh() }} />}
      {showCreate  && <CreateMatchModal onClose={handleCreateClose} />}
      {showImport  && <ImportCSVModal onClose={() => { setShowImport(false); router.refresh() }} />}
    </div>
  )
}
