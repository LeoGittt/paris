"use client"

import { useState, useTransition } from "react"
import { Plus, Trophy, CheckCircle2, Clock, Gift, Trash2, User } from "lucide-react"
import { createPrize, assignWinner, markPrizeDelivered, deletePrize } from "@/lib/actions/admin/prizes"

interface Prize {
  id: string; title: string; description: string | null; stage: string
  prize_type: string; status: "available" | "pending" | "delivered"
  winner_id: string | null; delivered_at: string | null; created_at: string
}
interface Participant { id: string; first_name: string; last_name: string; total_points: number; ranking_position: number | null }

const STATUS_CONFIG = {
  available: { label: "Disponible", color: "#4ade80", icon: Gift },
  pending:   { label: "Pendiente",  color: "#c3871e", icon: Clock },
  delivered: { label: "Entregado",  color: "#7ab0e8", icon: CheckCircle2 },
}

const inputCls = "w-full px-3 py-2.5 bg-[#06192c] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#054a9d] transition-all"
const labelCls = "block text-white/40 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5"

function CreateModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", stage: "Fase de Grupos", prize_type: "weekly" })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) return
    setLoading(true)
    setError("")
    const res = await createPrize(form)
    if (!res.ok) {
      setError(res.error ?? "Error al crear el premio")
      setLoading(false)
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0b2440] border border-white/10 rounded-2xl p-7 w-full max-w-md shadow-2xl">
        <h3 className="text-white font-black uppercase text-lg mb-5">Crear premio</h3>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Título</label>
            <input type="text" placeholder="Ej: Premio Semanal Fase de Grupos" value={form.title} onChange={e => set("title", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Descripción</label>
            <textarea placeholder="Descripción del premio..." value={form.description} onChange={e => set("description", e.target.value)} rows={2} className={inputCls + " resize-none"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Etapa</label>
              <select value={form.stage} onChange={e => set("stage", e.target.value)} className={inputCls}>
                {["Fase de Grupos","Dieciseisavos","Octavos","Cuartos de Final","Semifinal","Final","General"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tipo</label>
              <select value={form.prize_type} onChange={e => set("prize_type", e.target.value)} className={inputCls}>
                <option value="weekly">Semanal</option>
                <option value="stage">Por etapa</option>
                <option value="final">Premio final</option>
              </select>
            </div>
          </div>
        </div>
        {error && <p className="text-red-400 text-xs font-medium mt-3">{error}</p>}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button onClick={onClose} className="h-11 bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 font-bold uppercase text-sm rounded-xl transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={loading || !form.title.trim()} className="h-11 bg-[#c3871e] hover:bg-[#d9961f] disabled:opacity-50 text-white font-black uppercase text-sm rounded-xl transition-all">
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  )
}

function AssignModal({ prize, participants, onClose }: { prize: Prize; participants: Participant[]; onClose: () => void }) {
  const [selected, setSelected] = useState(prize.winner_id ?? "")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!selected) return
    setLoading(true)
    await assignWinner(prize.id, selected)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0b2440] border border-white/10 rounded-2xl p-7 w-full max-w-md shadow-2xl">
        <h3 className="text-white font-black uppercase text-lg mb-1">Asignar ganador</h3>
        <p className="text-white/40 text-sm mb-5">{prize.title}</p>
        <div className="max-h-60 overflow-y-auto space-y-1.5 mb-5">
          {participants.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                selected === p.id
                  ? "bg-[#c3871e]/15 border border-[#c3871e]/30"
                  : "bg-white/3 border border-white/6 hover:bg-white/6"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-white/6 flex items-center justify-center shrink-0">
                <span className="text-white/40 text-[10px] font-black">{p.first_name[0]}{p.last_name[0]}</span>
              </div>
              <div className="flex-1">
                <p className="text-white/80 font-bold text-sm">{p.first_name} {p.last_name}</p>
                <p className="text-white/30 text-[11px]">{p.total_points} pts · #{p.ranking_position ?? "—"}</p>
              </div>
              {selected === p.id && <CheckCircle2 className="w-4 h-4 text-[#c3871e] shrink-0" />}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-11 bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 font-bold uppercase text-sm rounded-xl transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={loading || !selected} className="h-11 bg-[#c3871e] hover:bg-[#d9961f] disabled:opacity-50 text-white font-black uppercase text-sm rounded-xl transition-all">
            {loading ? "Asignando..." : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PrizesAdmin({ prizes, participants }: { prizes: Prize[]; participants: Participant[] }) {
  const [showCreate, setShowCreate] = useState(false)
  const [assignPrize, setAssignPrize] = useState<Prize | null>(null)
  const [isPending, startTransition] = useTransition()

  const participantsById = Object.fromEntries(participants.map(p => [p.id, p]))

  const handleDeliver = (id: string) => {
    startTransition(async () => { await markPrizeDelivered(id) })
  }

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`¿Eliminar el premio "${title}"?`)) return
    startTransition(async () => { await deletePrize(id) })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-white/30 text-[11px] font-medium">{prizes.length} premios en total</p>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 h-9 bg-[#c3871e]/15 hover:bg-[#c3871e]/25 border border-[#c3871e]/30 text-[#c3871e] font-black text-[11px] uppercase tracking-wide rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Nuevo premio
        </button>
      </div>

      {prizes.length === 0 ? (
        <div className="bg-[#0b2440] border border-white/8 rounded-2xl px-6 py-16 text-center">
          <Gift className="w-10 h-10 text-white/15 mx-auto mb-4" />
          <p className="text-white/25 text-sm">No hay premios configurados</p>
          <button onClick={() => setShowCreate(true)} className="mt-4 text-[#c3871e] text-sm font-black uppercase tracking-wide hover:text-white transition-colors">
            Crear el primero →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {prizes.map(prize => {
            const cfg     = STATUS_CONFIG[prize.status]
            const winner  = prize.winner_id ? participantsById[prize.winner_id] : null
            return (
              <div key={prize.id} className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: cfg.color }}>{cfg.label}</span>
                  </div>
                  <span className="text-white/20 text-[10px] font-medium">{prize.stage}</span>
                </div>
                <div className="px-5 py-4">
                  <h3 className="text-white font-black text-sm uppercase tracking-wide mb-1">{prize.title}</h3>
                  {prize.description && <p className="text-white/35 text-xs mb-3">{prize.description}</p>}

                  {winner && (
                    <div className="flex items-center gap-2 bg-[#c3871e]/8 border border-[#c3871e]/20 rounded-xl px-3 py-2 mb-3">
                      <Trophy className="w-3.5 h-3.5 text-[#c3871e] shrink-0" />
                      <span className="text-white/70 text-[11px] font-bold">{winner.first_name} {winner.last_name}</span>
                      <span className="text-white/25 text-[10px] ml-auto">{winner.total_points}pts</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {prize.status !== "delivered" && (
                      <button
                        onClick={() => setAssignPrize(prize)}
                        className="flex-1 h-8 bg-white/4 hover:bg-white/8 border border-white/8 text-white/50 hover:text-white font-black text-[10px] uppercase tracking-wide rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <User className="w-3 h-3" />
                        {prize.winner_id ? "Cambiar ganador" : "Asignar ganador"}
                      </button>
                    )}
                    {prize.status === "pending" && (
                      <button
                        onClick={() => handleDeliver(prize.id)}
                        disabled={isPending}
                        className="flex-1 h-8 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-wide rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Marcar entregado
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(prize.id, prize.title)}
                      disabled={isPending}
                      className="w-8 h-8 bg-red-500/8 hover:bg-red-500/15 border border-red-500/15 text-red-400/50 hover:text-red-400 rounded-xl transition-all flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreate  && <CreateModal onClose={() => setShowCreate(false)} />}
      {assignPrize && <AssignModal prize={assignPrize} participants={participants} onClose={() => setAssignPrize(null)} />}
    </div>
  )
}
