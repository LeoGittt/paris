"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search, Download, Ban, CheckCircle2, Trash2, ChevronLeft, ChevronRight, FileSpreadsheet, FileText, Edit3, AlertCircle, BarChart2, X } from "lucide-react"
import * as XLSX from "xlsx"
import { toggleBlockParticipant, deleteParticipant, updateParticipantProfile, getParticipantPredictions } from "@/lib/actions/admin/participants"
import type { ParticipantPrediction } from "@/lib/actions/admin/participants"
import type { ParticipantRow } from "@/app/admin/participantes/page"

const LEAD_LABELS: Record<string, string> = {
  taller: "Taller", repuestos: "Repuestos", digital: "Digital", qr: "QR", direct: "Directo",
}

const LEAD_OPTIONS = [
  { value: "taller",    label: "Taller" },
  { value: "repuestos", label: "Repuestos" },
  { value: "digital",   label: "Digital" },
  { value: "qr",        label: "QR" },
  { value: "direct",    label: "Directo" },
]

const inputCls = "w-full px-3 py-2 bg-[#06192c] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#054a9d] focus:ring-1 focus:ring-[#054a9d]/30 transition-all placeholder:text-white/20"
const labelCls = "block text-white/40 text-[10px] font-bold uppercase tracking-wide mb-1"

function EditParticipantModal({ p, onClose }: { p: ParticipantRow; onClose: () => void }) {
  const [form, setForm] = useState({
    first_name:    p.first_name,
    last_name:     p.last_name,
    dni:           p.dni,
    phone:         p.phone,
    email:         p.email,
    license_plate: p.license_plate,
    car_brand:     p.car_brand,
    car_model:     p.car_model,
    car_year:      String(p.car_year ?? ""),
    city:          p.city,
    lead_source:   p.lead_source,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setLoading(true)
    setError("")
    const res = await updateParticipantProfile(p.id, form)
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
      <div className="relative bg-[#0b2440] border border-white/10 rounded-2xl p-7 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <h3 className="text-white font-black uppercase text-lg mb-1">Editar participante</h3>
        <p className="text-white/30 text-sm mb-5">{p.first_name} {p.last_name}</p>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nombre</label>
              <input value={form.first_name} onChange={e => set("first_name", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Apellido</label>
              <input value={form.last_name} onChange={e => set("last_name", e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>DNI</label>
              <input value={form.dni} onChange={e => set("dni", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Celular</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Patente</label>
              <input value={form.license_plate} onChange={e => set("license_plate", e.target.value.toUpperCase())} className={inputCls + " uppercase"} />
            </div>
            <div>
              <label className={labelCls}>Localidad</label>
              <input value={form.city} onChange={e => set("city", e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Marca</label>
              <input value={form.car_brand} onChange={e => set("car_brand", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Modelo</label>
              <input value={form.car_model} onChange={e => set("car_model", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Año</label>
              <input type="number" min="1950" max={new Date().getFullYear() + 1}
                value={form.car_year} onChange={e => set("car_year", e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Origen</label>
            <select value={form.lead_source} onChange={e => set("lead_source", e.target.value)} className={inputCls + " cursor-pointer bg-[#06192c]"}>
              {LEAD_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-[#06192c]">{o.label}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mt-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button onClick={onClose} className="h-11 bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 font-bold uppercase text-sm rounded-xl transition-all">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={loading} className="h-11 bg-[#054a9d] hover:bg-[#1558b8] disabled:opacity-50 text-white font-black uppercase text-sm rounded-xl transition-all">
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  )
}

const STAGE_LABELS: Record<string, string> = {
  group:        "Grupos",
  round_of_32:  "32vos",
  round_of_16:  "Octavos",
  quarterfinal: "Cuartos",
  semifinal:    "Semis",
  third_place:  "3er puesto",
  final:        "Final",
}

const RESULT_CONFIG = {
  correct_exact:  { label: "Exacto",     bg: "bg-[#c3871e]/15",   text: "text-[#c3871e]",    border: "border-[#c3871e]/30"   },
  correct_winner: { label: "Ganador",    bg: "bg-[#7ab0e8]/15",   text: "text-[#7ab0e8]",    border: "border-[#7ab0e8]/30"   },
  correct_diff:   { label: "Diferencia", bg: "bg-emerald-500/15", text: "text-emerald-400",  border: "border-emerald-500/30" },
  wrong:          { label: "Incorrecto", bg: "bg-red-500/10",     text: "text-red-400",      border: "border-red-500/20"     },
  pending:        { label: "Pendiente",  bg: "bg-white/5",        text: "text-white/30",     border: "border-white/10"       },
} as const

function ParticipantPredictionsModal({ participant, onClose }: { participant: ParticipantRow; onClose: () => void }) {
  const [loading, setLoading]       = useState(true)
  const [predictions, setPredictions] = useState<ParticipantPrediction[]>([])
  const [fetchError, setFetchError]  = useState("")

  useEffect(() => {
    getParticipantPredictions(participant.id).then(res => {
      if (res.ok) setPredictions(res.predictions)
      else setFetchError(res.error)
      setLoading(false)
    })
  }, [participant.id])

  const stats = {
    total:   predictions.length,
    exact:   predictions.filter(p => p.result === "correct_exact").length,
    winner:  predictions.filter(p => p.result === "correct_winner").length,
    diff:    predictions.filter(p => p.result === "correct_diff").length,
    wrong:   predictions.filter(p => p.result === "wrong").length,
    pending: predictions.filter(p => p.result === "pending").length,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0b2440] border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/6 shrink-0">
          <div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Pronósticos del participante</p>
            <h3 className="text-white font-black text-xl">{participant.first_name} {participant.last_name}</h3>
            <p className="text-white/30 text-sm font-mono mt-0.5">
              DNI {participant.dni} · {participant.total_points} pts · #{participant.ranking_position ?? "—"}
            </p>
          </div>
          <button onClick={onClose} className="text-white/25 hover:text-white/70 p-2 hover:bg-white/6 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats summary */}
        {!loading && predictions.length > 0 && (
          <div className="grid grid-cols-6 divide-x divide-white/5 border-b border-white/6 shrink-0">
            {([
              { label: "Total",       value: stats.total,   color: "text-white/60"    },
              { label: "Exactos",     value: stats.exact,   color: "text-[#c3871e]"   },
              { label: "Ganadores",   value: stats.winner,  color: "text-[#7ab0e8]"   },
              { label: "Diferencia",  value: stats.diff,    color: "text-emerald-400" },
              { label: "Incorrectos", value: stats.wrong,   color: "text-red-400"     },
              { label: "Pendientes",  value: stats.pending, color: "text-white/30"    },
            ] as const).map(s => (
              <div key={s.label} className="flex flex-col items-center py-4 gap-1">
                <span className={`font-black text-xl tabular-nums ${s.color}`}>{s.value}</span>
                <span className="text-white/25 text-[9px] font-black uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <svg className="animate-spin w-5 h-5 text-[#054a9d]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-white/30 text-sm font-medium">Cargando pronósticos...</span>
            </div>
          ) : fetchError ? (
            <div className="flex items-center gap-3 m-6 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{fetchError}</p>
            </div>
          ) : predictions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <BarChart2 className="w-10 h-10 text-white/10" />
              <p className="text-white/25 text-sm font-medium">Todavía no cargó ningún pronóstico</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-[#0b2440]">
                <tr className="border-b border-white/6">
                  {["Partido", "Etapa", "Mi pronóstico", "Resultado real", "Estado", "Pts"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-white/20 text-[9px] font-black uppercase tracking-[0.25em] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {predictions.map(pred => {
                  const cfg = RESULT_CONFIG[pred.result] ?? RESULT_CONFIG.pending
                  return (
                    <tr key={pred.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-base leading-none">{pred.team1_flag}</span>
                          <span className="text-white/70 font-bold">{pred.team1}</span>
                          <span className="text-white/20 text-xs font-black">VS</span>
                          <span className="text-white/70 font-bold">{pred.team2}</span>
                          <span className="text-base leading-none">{pred.team2_flag}</span>
                        </div>
                        <p className="text-white/25 text-[10px] font-medium mt-0.5">
                          {new Date(pred.match_date).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-white/5 text-white/35">
                          {STAGE_LABELS[pred.stage] ?? pred.stage}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-black text-white tabular-nums text-base">
                          {pred.predicted_score1} <span className="text-white/25">–</span> {pred.predicted_score2}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {pred.is_finished && pred.real_score1 !== null ? (
                          <span className="font-black tabular-nums text-base text-white/50">
                            {pred.real_score1} <span className="text-white/20">–</span> {pred.real_score2}
                          </span>
                        ) : (
                          <span className="text-white/20 text-sm font-medium">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`font-black text-base tabular-nums ${pred.points_earned > 0 ? "text-[#c3871e]" : "text-white/20"}`}>
                          {pred.points_earned > 0 ? `+${pred.points_earned}` : pred.result === "pending" ? "—" : "0"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

interface Props {
  participants: ParticipantRow[]
  total: number
  page: number
  pageSize: number
  query: string
  dateFrom: string
  dateTo: string
}

export function ParticipantsTable({ participants, total, page, pageSize, query, dateFrom, dateTo }: Props) {
  const router   = useRouter()
  const [search, setSearch]   = useState(query)
  const [fromDate, setFromDate] = useState(dateFrom)
  const [toDate, setToDate]     = useState(dateTo)
  const [editTarget, setEditTarget]             = useState<ParticipantRow | null>(null)
  const [predictionsTarget, setPredictionsTarget] = useState<ParticipantRow | null>(null)
  const [isPending, startTransition]             = useTransition()

  const totalPages = Math.ceil(total / pageSize)

  const buildUrl = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams({
      q:    overrides.q    ?? search,
      page: overrides.page ?? "1",
      ...(( overrides.from ?? fromDate) ? { from: overrides.from ?? fromDate } : {}),
      ...(( overrides.to   ?? toDate)   ? { to:   overrides.to   ?? toDate   } : {}),
    })
    return `/admin/participantes?${params.toString()}`
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(buildUrl())
  }

  const handleDateFilter = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(buildUrl())
  }

  const getExportRows = () =>
    participants.map(p => ({
      Nombre:      p.first_name,
      Apellido:    p.last_name,
      DNI:         p.dni,
      Email:       p.email,
      Celular:     p.phone,
      Patente:     p.license_plate,
      Marca:       p.car_brand,
      Modelo:      p.car_model,
      Año:         p.car_year ?? "",
      Localidad:   p.city,
      Origen:      LEAD_LABELS[p.lead_source] ?? p.lead_source,
      Puntos:      p.total_points,
      Posición:    p.ranking_position ?? "-",
      Bloqueado:   p.is_blocked ? "Sí" : "No",
      Registro:    new Date(p.created_at).toLocaleDateString("es-AR"),
    }))

  const handleExportCSV = () => {
    const rows = getExportRows()
    const headers = Object.keys(rows[0] ?? {})
    // Escapar: 1) comillas dobles → "" (estándar CSV), 2) prevenir formula injection
    const escapeCell = (v: unknown): string => {
      const s = String(v ?? "")
      const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s  // prefix fórmulas con '
      return `"${safe.replace(/"/g, '""')}"` // escapar " internos
    }
    const csv = [headers.map(h => `"${h}"`), ...rows.map(r => Object.values(r).map(escapeCell))].map(r => r.join(",")).join("\n")
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url
    a.download = `participantes-prode-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportExcel = () => {
    const rows = getExportRows()
    const ws   = XLSX.utils.json_to_sheet(rows)
    ws["!cols"] = [
      { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 28 }, { wch: 18 },
      { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 8  }, { wch: 15 }, { wch: 10 },
      { wch: 8  }, { wch: 8  }, { wch: 10 }, { wch: 12 },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Participantes")
    XLSX.writeFile(wb, `participantes-prode-${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import("jspdf")
    const { default: autoTable } = await import("jspdf-autotable")

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })

    // Header
    doc.setFillColor(6, 25, 44)
    doc.rect(0, 0, 297, 30, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("PRODE GRUPO PARIS 2026", 14, 12)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(195, 135, 30)
    doc.text("Reporte de Participantes", 14, 20)
    doc.setTextColor(180, 180, 180)
    doc.text(`Generado: ${new Date().toLocaleString("es-AR")}`, 14, 26)
    doc.text(`Total: ${total} participantes`, 200, 26)

    const rows = getExportRows()

    autoTable(doc, {
      startY: 35,
      head: [[
        "Nombre", "Apellido", "DNI", "Email", "Celular",
        "Patente", "Vehículo", "Año", "Ciudad", "Origen", "Pts", "Pos", "Estado"
      ]],
      body: rows.map(r => [
        r.Nombre, r.Apellido, r.DNI, r.Email, r.Celular,
        r.Patente, [r.Marca, r.Modelo].filter(Boolean).join(" "), r.Año, r.Localidad, r.Origen, r.Puntos, r.Posición, r.Bloqueado
      ]),
      styles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [40, 40, 40],
      },
      headStyles: {
        fillColor: [5, 74, 157],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7,
      },
      alternateRowStyles: {
        fillColor: [245, 248, 255],
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 20 },
        2: { cellWidth: 16 },
        3: { cellWidth: 38 },
        4: { cellWidth: 20 },
        5: { cellWidth: 16 },
        6: { cellWidth: 25 },
        7: { cellWidth: 12 },
        8: { cellWidth: 18 },
        9: { cellWidth: 14 },
        10: { cellWidth: 8  },
        11: { cellWidth: 8  },
        12: { cellWidth: 13 },
      },
      didDrawPage: (data) => {
        // Footer en cada página
        const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
        doc.setFontSize(7)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Página ${data.pageNumber} de ${pageCount} — Prode Grupo Paris 2026`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 5
        )
      },
    })

    doc.save(`participantes-prode-${new Date().toISOString().slice(0,10)}.pdf`)
  }

  const handleToggleBlock = (id: string, blocked: boolean) => {
    startTransition(async () => {
      const res = await toggleBlockParticipant(id, !blocked)
      if (!res.ok) alert(`Error al ${blocked ? "desbloquear" : "bloquear"}: ${res.error}`)
    })
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      const res = await deleteParticipant(id)
      if (!res.ok) alert(`Error al eliminar: ${res.error}`)
    })
  }

  return (
    <div className="space-y-4">
      {/* Search toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, email, patente, teléfono..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#0b2440] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#054a9d] focus:ring-2 focus:ring-[#054a9d]/20 transition-all"
            />
          </div>
          <button type="submit" className="px-4 h-10 bg-[#054a9d] hover:bg-[#1558b8] text-white font-black text-sm rounded-xl transition-colors">
            Buscar
          </button>
        </form>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 h-10 bg-white/4 hover:bg-white/8 border border-white/8 text-white/50 hover:text-white font-black text-sm rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 h-10 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-black text-sm rounded-xl transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 h-10 bg-[#c3871e]/15 hover:bg-[#c3871e]/25 border border-[#c3871e]/30 text-[#c3871e] font-black text-sm rounded-xl transition-all"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Date filter */}
      <form onSubmit={handleDateFilter} className="flex flex-wrap gap-2 items-end">
        <div>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-1">Desde</p>
          <input
            type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            className="h-10 px-3 bg-[#0b2440] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#054a9d] transition-all"
          />
        </div>
        <div>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-1">Hasta</p>
          <input
            type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            className="h-10 px-3 bg-[#0b2440] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#054a9d] transition-all"
          />
        </div>
        <button type="submit" className="h-10 px-4 bg-white/6 hover:bg-white/10 border border-white/8 text-white/50 hover:text-white font-black text-[12px] uppercase tracking-wide rounded-xl transition-all">
          Filtrar fechas
        </button>
        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => { setFromDate(""); setToDate(""); router.push(buildUrl({ from: "", to: "" })) }}
            className="h-10 px-3 text-white/30 hover:text-white/60 text-[11px] font-medium transition-colors"
          >
            Limpiar
          </button>
        )}
      </form>

      {/* Stats */}
      <div className="flex items-center gap-4 text-white/30 text-[11px] font-medium">
        <span>{total} participantes</span>
        {query && <span>· "{query}"</span>}
        {(dateFrom || dateTo) && <span>· Fecha: {dateFrom || "inicio"} → {dateTo || "hoy"}</span>}
      </div>

      {/* Table */}
      <div className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#06192c]/60 border-b border-white/6">
                {["Participante","DNI","Email","Patente","Vehículo","Ciudad","Origen","Pts","Pos","Estado","Pronósticos","Acciones"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-white/20 text-[9px] font-black uppercase tracking-[0.25em] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-white/20 text-sm">
                    No se encontraron participantes
                  </td>
                </tr>
              ) : participants.map(p => (
                <tr key={p.id} className={`hover:bg-white/3 transition-colors ${p.is_blocked ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>
                      <p className="text-white/80 font-bold text-sm">{p.first_name} {p.last_name}</p>
                      <p className="text-white/25 text-[10px]">{p.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm font-mono">{p.dni}</td>
                  <td className="px-4 py-3 text-white/50 text-sm max-w-[160px] truncate">{p.email}</td>
                  <td className="px-4 py-3 text-white/50 text-sm font-mono uppercase">{p.license_plate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>
                      <p className="text-white/70 font-bold text-sm">{p.car_brand || "—"}</p>
                      {(p.car_model || p.car_year) && (
                        <p className="text-white/30 text-[10px]">
                          {[p.car_model, p.car_year].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm">{p.city}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-white/5 text-white/40">
                      {LEAD_LABELS[p.lead_source] ?? p.lead_source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#c3871e] font-black text-sm tabular-nums">{p.total_points}</td>
                  <td className="px-4 py-3 text-white/40 text-sm tabular-nums">{p.ranking_position ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                      p.is_blocked
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      {p.is_blocked ? "Bloqueado" : "Activo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => setPredictionsTarget(p)}
                      className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-[#054a9d]/15 hover:bg-[#054a9d]/30 border border-[#054a9d]/30 text-[#7ab0e8] hover:text-white text-[11px] font-black uppercase tracking-wide transition-all"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      Ver
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditTarget(p)}
                        title="Editar"
                        className="p-1.5 rounded-lg text-[#7ab0e8]/50 hover:text-[#7ab0e8] hover:bg-[#7ab0e8]/10 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleBlock(p.id, p.is_blocked)}
                        disabled={isPending}
                        title={p.is_blocked ? "Desbloquear" : "Bloquear"}
                        className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${
                          p.is_blocked
                            ? "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10"
                            : "text-orange-400/60 hover:text-orange-400 hover:bg-orange-500/10"
                        }`}
                      >
                        {p.is_blocked ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, `${p.first_name} ${p.last_name}`)}
                        disabled={isPending}
                        title="Eliminar"
                        className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/6 flex items-center justify-between">
            <p className="text-white/25 text-[11px] font-medium">
              Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(buildUrl({ page: String(page - 1) }))}
                disabled={page <= 1}
                className="p-2 rounded-xl bg-white/4 border border-white/8 text-white/40 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push(buildUrl({ page: String(page + 1) }))}
                disabled={page >= totalPages}
                className="p-2 rounded-xl bg-white/4 border border-white/8 text-white/40 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {editTarget && (
        <EditParticipantModal
          p={editTarget}
          onClose={() => { setEditTarget(null); router.refresh() }}
        />
      )}

      {predictionsTarget && (
        <ParticipantPredictionsModal
          participant={predictionsTarget}
          onClose={() => setPredictionsTarget(null)}
        />
      )}
    </div>
  )
}
