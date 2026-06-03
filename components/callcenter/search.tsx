"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Phone, Mail, Car, MapPin, Trophy, Calendar, Download, Shield, CheckCircle2, Gift, Clock } from "lucide-react"
import type { ParticipantCC, PrizeCC } from "@/app/callcenter/page"

const LEAD_LABELS: Record<string, string> = {
  taller: "Taller", repuestos: "Repuestos", digital: "Digital", qr: "QR", direct: "Directo",
}

const PRIZE_STATUS: Record<string, string> = {
  available: "Disponible",
  pending:   "Pendiente entrega",
  delivered: "Entregado",
}

function ParticipantCard({ p, prizes, lastActivity }: {
  p: ParticipantCC
  prizes: PrizeCC[]
  lastActivity: string | null
}) {
  const handleExport = () => {
    const lines = [
      `FICHA CLIENTE — PRODE GRUPO PARIS 2026`,
      `Generado: ${new Date().toLocaleString("es-AR")}`,
      ``,
      `DATOS PERSONALES`,
      `Nombre: ${p.first_name} ${p.last_name}`,
      `DNI: ${p.dni}`,
      `Celular: ${p.phone}`,
      `Email: ${p.email}`,
      `Ciudad: ${p.city}`,
      ``,
      `VEHÍCULO`,
      `Patente: ${p.license_plate}`,
      `Marca / Modelo: ${p.car_brand} ${p.car_model}`,
      ``,
      `PRODE`,
      `Puntos: ${p.total_points}`,
      `Posición ranking: ${p.ranking_position ? `#${p.ranking_position}` : "Sin posición"}`,
      `Origen: ${LEAD_LABELS[p.lead_source] ?? p.lead_source}`,
      `Estado: ${p.is_blocked ? "BLOQUEADO" : "Activo"}`,
      `Registro: ${new Date(p.created_at).toLocaleDateString("es-AR")}`,
      `Última actividad: ${lastActivity ? new Date(lastActivity).toLocaleString("es-AR") : "Sin pronósticos"}`,
      ...(prizes.length > 0 ? [``, `PREMIOS GANADOS`, ...prizes.map(pr => `- ${pr.title} (${pr.stage}) — ${PRIZE_STATUS[pr.status] ?? pr.status}`)] : []),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url
    a.download = `cliente-${p.dni}-${new Date().toISOString().slice(0,10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`bg-[#0b2440] rounded-2xl overflow-hidden ${p.is_blocked ? "border border-red-500/20 opacity-70" : "border border-white/8"}`}>

      {/* Header */}
      <div className="px-6 py-4 bg-[#06192c]/60 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#054a9d]/20 border border-[#054a9d]/30 flex items-center justify-center shrink-0">
            <span className="text-[#7ab0e8] font-black text-sm">{p.first_name[0]}{p.last_name[0]}</span>
          </div>
          <div>
            <p className="text-white font-black text-base">{p.first_name} {p.last_name}</p>
            <p className="text-white/30 text-[11px] font-medium">DNI {p.dni} · Registro {new Date(p.created_at).toLocaleDateString("es-AR")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {p.is_blocked && (
            <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              Bloqueado
            </span>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 h-8 bg-white/4 hover:bg-white/8 border border-white/8 text-white/40 hover:text-white font-black text-[10px] uppercase tracking-wide rounded-xl transition-all"
          >
            <Download className="w-3 h-3" />
            Exportar
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Datos de contacto */}
        <div className="space-y-3">
          <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.25em]">Contacto</p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#7ab0e8] shrink-0" />
              <span className="text-white/70 font-bold text-sm">{p.phone}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#7ab0e8] shrink-0" />
              <span className="text-white/60 text-sm break-all">{p.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#7ab0e8] shrink-0" />
              <span className="text-white/60 text-sm">{p.city}</span>
            </div>
          </div>
        </div>

        {/* Vehículo */}
        <div className="space-y-3">
          <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.25em]">Vehículo</p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <Car className="w-4 h-4 text-[#c3871e] shrink-0" />
              <span className="text-white/70 font-black text-sm uppercase tracking-wide">{p.license_plate}</span>
            </div>
            <p className="text-white/50 text-sm">{p.car_brand} {p.car_model}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-white/25 text-[10px]">Origen:</span>
              <span className="text-white/50 text-[11px] font-bold">{LEAD_LABELS[p.lead_source] ?? p.lead_source}</span>
            </div>
          </div>
        </div>

        {/* Prode */}
        <div className="space-y-3">
          <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.25em]">Prode</p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-[#c3871e] shrink-0" />
              <div>
                <span className="text-[#c3871e] font-black text-xl tabular-nums">{p.total_points}</span>
                <span className="text-white/25 text-[10px] ml-1">puntos</span>
              </div>
            </div>
            {p.ranking_position ? (
              <div className="flex items-center gap-2">
                <span className="bg-[#c3871e]/15 border border-[#c3871e]/30 text-[#c3871e] font-black text-sm px-3 py-1 rounded-xl">
                  #{p.ranking_position} en el ranking
                </span>
              </div>
            ) : (
              <p className="text-white/25 text-sm">Sin pronósticos cargados</p>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-white/25 shrink-0" />
              <span className="text-white/40 text-[11px]">
                {lastActivity
                  ? `Último pronóstico: ${new Date(lastActivity).toLocaleDateString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
                  : "Sin pronósticos cargados"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-white/40 text-[11px]">
                {p.is_blocked ? "Cuenta bloqueada" : "Cuenta activa"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Premios ganados */}
      {prizes.length > 0 && (
        <div className="px-6 pb-5">
          <div className="bg-[#c3871e]/8 border border-[#c3871e]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-3.5 h-3.5 text-[#c3871e]" />
              <p className="text-[#c3871e] text-[10px] font-black uppercase tracking-wide">Premios ganados</p>
            </div>
            <div className="space-y-2">
              {prizes.map(prize => (
                <div key={prize.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm font-bold">{prize.title}</p>
                    <p className="text-white/30 text-[10px]">{prize.stage}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${
                    prize.status === "delivered"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : prize.status === "pending"
                        ? "bg-[#c3871e]/10 text-[#c3871e] border border-[#c3871e]/20"
                        : "bg-white/5 text-white/30 border border-white/10"
                  }`}>
                    {PRIZE_STATUS[prize.status] ?? prize.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function CallCenterSearch({ participants, query, prizesMap, lastActivityMap }: {
  participants: ParticipantCC[]
  query: string
  prizesMap: Record<string, PrizeCC[]>
  lastActivityMap: Record<string, string | null>
}) {
  const router  = useRouter()
  const [search, setSearch] = useState(query)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim().length < 2) return
    router.push(`/callcenter?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div className="space-y-5">

      {/* Buscador */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, patente, teléfono o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            className="w-full pl-12 pr-4 py-3.5 bg-[#0b2440] border border-white/10 rounded-2xl text-white text-base placeholder:text-white/20 focus:outline-none focus:border-[#054a9d] focus:ring-2 focus:ring-[#054a9d]/20 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={search.trim().length < 2}
          className="px-6 h-13 bg-[#054a9d] hover:bg-[#1558b8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase tracking-wide text-sm rounded-2xl transition-all shadow-lg shadow-[#054a9d]/25"
        >
          Buscar
        </button>
      </form>

      {/* Hint */}
      {!query && (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <p className="text-white/25 text-base font-medium">Ingresá al menos 2 caracteres para buscar</p>
          <p className="text-white/15 text-sm mt-1">Nombre, DNI, patente, teléfono o email</p>
        </div>
      )}

      {/* Sin resultados */}
      {query && participants.length === 0 && (
        <div className="text-center py-16">
          <p className="text-white/25 text-base font-medium">No se encontraron participantes para "{query}"</p>
        </div>
      )}

      {/* Resultados */}
      {participants.length > 0 && (
        <div className="space-y-4">
          <p className="text-white/30 text-[11px] font-medium">
            {participants.length} resultado{participants.length > 1 ? "s" : ""} para "{query}"
          </p>
          {participants.map(p => (
            <ParticipantCard
              key={p.id}
              p={p}
              prizes={prizesMap[p.id] ?? []}
              lastActivity={lastActivityMap[p.id] ?? null}
            />
          ))}
        </div>
      )}

      {/* Panel solo lectura aviso */}
      <div className="flex items-center gap-2 text-white/15 text-[11px]">
        <Shield className="w-3.5 h-3.5 shrink-0" />
        Panel de solo lectura — no se pueden realizar modificaciones desde este acceso
      </div>
    </div>
  )
}
