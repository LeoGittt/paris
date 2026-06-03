"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, FileText, Clock, Calendar, ChevronDown } from "lucide-react"
import * as XLSX from "xlsx"
import type {
  ReportParticipant, ReportRanking, ReportPrize,
  ReportPredictions, ReportSnapshot,
} from "@/app/admin/reportes/page"

const LEAD_LABELS: Record<string, string> = {
  taller: "Taller", repuestos: "Repuestos", digital: "Digital", qr: "QR", direct: "Directo",
}

const STATUS_LABELS: Record<string, string> = {
  available: "Disponible", pending: "Pendiente", delivered: "Entregado",
}

interface Props {
  participants: ReportParticipant[]
  ranking: ReportRanking[]
  prizes: ReportPrize[]
  predictions: ReportPredictions | null
  snapshots: ReportSnapshot[]
}

export function ReportGenerator({ participants, ranking, prizes, predictions, snapshots }: Props) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo]     = useState("")
  const [expandedSnapshot, setExpandedSnapshot] = useState<string | null>(null)

  const generatedAt = new Date().toLocaleString("es-AR")

  // Filtrar participantes por rango de fechas si se seleccionó
  const filteredParticipants = participants.filter(p => {
    if (dateFrom && p.created_at < dateFrom) return false
    if (dateTo   && p.created_at > dateTo + "T23:59:59Z") return false
    return true
  })

  const buildSummary = (ps: ReportParticipant[]) => ({
    total_participants:   ps.length,
    active:               ps.filter(p => !p.is_blocked).length,
    blocked:              ps.filter(p => p.is_blocked).length,
    from_taller:          ps.filter(p => p.lead_source === "taller").length,
    from_repuestos:       ps.filter(p => p.lead_source === "repuestos").length,
    from_digital:         ps.filter(p => p.lead_source === "digital").length,
    from_qr:              ps.filter(p => p.lead_source === "qr").length,
    from_direct:          ps.filter(p => p.lead_source === "direct").length,
    total_predictions:    predictions?.total_predictions ?? 0,
    exact_predictions:    predictions?.total_exact ?? 0,
    winner_predictions:   predictions?.total_winner ?? 0,
    prizes_delivered:     prizes.filter(p => p.status === "delivered").length,
    prizes_pending:       prizes.filter(p => p.status === "pending").length,
  })

  const handleExportExcel = () => {
    const summary = buildSummary(filteredParticipants)
    const wb = XLSX.utils.book_new()

    // Sheet 1: Resumen
    const summaryRows = [
      ["PRODE GRUPO PARIS 2026 — Reporte completo"],
      [`Generado: ${generatedAt}`],
      dateFrom || dateTo ? [`Período: ${dateFrom || "inicio"} → ${dateTo || "hoy"}`] : [],
      [],
      ["PARTICIPANTES"],
      ["Total registrados",       summary.total_participants],
      ["Activos",                  summary.active],
      ["Bloqueados",               summary.blocked],
      [],
      ["ORIGEN DE CLIENTES"],
      ["Taller",    summary.from_taller],
      ["Repuestos", summary.from_repuestos],
      ["Digital",   summary.from_digital],
      ["QR",        summary.from_qr],
      ["Directo",   summary.from_direct],
      [],
      ["PRONÓSTICOS"],
      ["Total pronósticos",        summary.total_predictions],
      ["Resultado exacto",         summary.exact_predictions],
      ["Ganador correcto",         summary.winner_predictions],
      [],
      ["PREMIOS"],
      ["Entregados",               summary.prizes_delivered],
      ["Pendientes de entrega",    summary.prizes_pending],
    ].filter(row => row.length > 0)

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows)
    wsSummary["!cols"] = [{ wch: 30 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen")

    // Sheet 2: Participantes
    const participantRows = filteredParticipants.map(p => ({
      Nombre:      p.first_name,
      Apellido:    p.last_name,
      DNI:         p.dni,
      Email:       p.email,
      Celular:     p.phone,
      Ciudad:      p.city,
      Patente:     p.license_plate,
      Marca:       p.car_brand,
      Modelo:      p.car_model,
      Origen:      LEAD_LABELS[p.lead_source] ?? p.lead_source,
      Puntos:      p.total_points,
      Posición:    p.ranking_position ?? "-",
      Estado:      p.is_blocked ? "Bloqueado" : "Activo",
      Registro:    new Date(p.created_at).toLocaleDateString("es-AR"),
    }))
    const wsParticipants = XLSX.utils.json_to_sheet(participantRows)
    XLSX.utils.book_append_sheet(wb, wsParticipants, "Participantes")

    // Sheet 3: Ranking
    const rankingRows = ranking.map(r => ({
      Posición: r.ranking_position,
      Nombre:   r.first_name,
      Apellido: r.last_name,
      Puntos:   r.total_points,
      Exactos:  r.correct_exact,
      Ganadores: r.correct_winner,
    }))
    const wsRanking = XLSX.utils.json_to_sheet(rankingRows)
    XLSX.utils.book_append_sheet(wb, wsRanking, "Ranking Top 50")

    // Sheet 4: Premios
    const prizeRows = prizes.map(p => ({
      Premio:       p.title,
      Descripción:  p.description ?? "",
      Etapa:        p.stage,
      Tipo:         p.prize_type,
      Estado:       STATUS_LABELS[p.status] ?? p.status,
      "Fecha entrega": p.delivered_at ? new Date(p.delivered_at).toLocaleDateString("es-AR") : "-",
    }))
    const wsPrizes = XLSX.utils.json_to_sheet(prizeRows)
    XLSX.utils.book_append_sheet(wb, wsPrizes, "Premios")

    const date = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `reporte-prode-${date}.xlsx`)
  }

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import("jspdf")
    const { default: autoTable } = await import("jspdf-autotable")
    const summary = buildSummary(filteredParticipants)

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

    // Header
    doc.setFillColor(4, 15, 28)
    doc.rect(0, 0, 210, 35, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18); doc.setFont("helvetica", "bold")
    doc.text("PRODE GRUPO PARIS 2026", 14, 14)
    doc.setFontSize(11); doc.setTextColor(195, 135, 30)
    doc.text("Reporte Completo", 14, 22)
    doc.setFontSize(8); doc.setTextColor(150, 150, 150)
    doc.text(`Generado: ${generatedAt}`, 14, 29)
    if (dateFrom || dateTo) doc.text(`Período: ${dateFrom || "inicio"} → ${dateTo || "hoy"}`, 110, 29)

    let y = 45

    // Resumen stats
    const stats = [
      ["Total participantes", summary.total_participants, "Activos", summary.active],
      ["Pronósticos",         summary.total_predictions,  "Exactos", summary.exact_predictions],
      ["Premios entregados",  summary.prizes_delivered,   "Pendientes", summary.prizes_pending],
    ]

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(40, 40, 40)
    doc.text("RESUMEN EJECUTIVO", 14, y); y += 6

    autoTable(doc, {
      startY: y,
      body: stats as unknown as string[][],
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: "bold" }, 2: { fontStyle: "bold" } },
      alternateRowStyles: { fillColor: [245, 248, 255] },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

    // Origen
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(40, 40, 40)
    doc.text("ORIGEN DE CLIENTES", 14, y); y += 6

    autoTable(doc, {
      startY: y,
      head: [["Origen", "Cantidad", "% del total"]],
      body: [
        ["Taller",    summary.from_taller,    `${((summary.from_taller / (summary.total_participants || 1)) * 100).toFixed(1)}%`],
        ["Repuestos", summary.from_repuestos, `${((summary.from_repuestos / (summary.total_participants || 1)) * 100).toFixed(1)}%`],
        ["Digital",   summary.from_digital,   `${((summary.from_digital / (summary.total_participants || 1)) * 100).toFixed(1)}%`],
        ["QR",        summary.from_qr,        `${((summary.from_qr / (summary.total_participants || 1)) * 100).toFixed(1)}%`],
        ["Directo",   summary.from_direct,    `${((summary.from_direct / (summary.total_participants || 1)) * 100).toFixed(1)}%`],
      ],
      headStyles: { fillColor: [5, 74, 157], textColor: 255, fontSize: 8 },
      styles: { fontSize: 8 },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

    // Top 10 ranking
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(40, 40, 40)
    doc.text("TOP 10 RANKING", 14, y); y += 6

    autoTable(doc, {
      startY: y,
      head: [["#", "Nombre", "Puntos", "Exactos"]],
      body: ranking.slice(0, 10).map(r => [r.ranking_position, `${r.first_name} ${r.last_name}`, r.total_points, r.correct_exact]),
      headStyles: { fillColor: [195, 135, 30], textColor: 255, fontSize: 8 },
      styles: { fontSize: 8 },
    })

    // Footer
    const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7); doc.setTextColor(180, 180, 180)
      doc.text(`Página ${i} de ${pageCount} — Prode Grupo Paris 2026`, 14, 290)
    }

    doc.save(`reporte-prode-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div className="space-y-8">

      {/* Generador manual */}
      <div className="bg-[#0b2440] border border-white/8 rounded-2xl p-6 space-y-5">
        <div>
          <p className="text-white font-black uppercase text-sm tracking-wide mb-1">Generar reporte</p>
          <p className="text-white/30 text-[12px]">
            Excel con 4 hojas: Resumen, Participantes, Ranking Top 50 y Premios
          </p>
        </div>

        {/* Filtro de fechas opcional */}
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-1">Desde (opcional)</p>
            <input
              type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="h-10 px-3 bg-[#06192c] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#054a9d] transition-all"
            />
          </div>
          <div>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-1">Hasta (opcional)</p>
            <input
              type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="h-10 px-3 bg-[#06192c] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#054a9d] transition-all"
            />
          </div>
        </div>

        {/* Stats de la selección */}
        <div className="flex items-center gap-6 text-[12px]">
          <span className="text-white/40">
            <span className="text-white font-black">{filteredParticipants.length}</span> participantes
            {(dateFrom || dateTo) && <span className="text-white/25"> en el período seleccionado</span>}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-5 h-11 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-black text-sm rounded-xl transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel (4 hojas)
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 h-11 bg-[#c3871e]/15 hover:bg-[#c3871e]/25 border border-[#c3871e]/30 text-[#c3871e] font-black text-sm rounded-xl transition-all"
          >
            <FileText className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Reportes automáticos (snapshots del cron) */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-[#7ab0e8]" />
          <p className="text-white font-black uppercase text-sm tracking-wide">Reportes automáticos</p>
          <span className="text-white/25 text-[11px] font-medium">Generados automáticamente cada semana y cada mes</span>
        </div>

        {snapshots.length === 0 ? (
          <div className="bg-[#0b2440] border border-white/6 rounded-2xl px-6 py-10 text-center">
            <Calendar className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-white/25 text-sm font-medium">No hay reportes automáticos generados todavía</p>
            <p className="text-white/15 text-[11px] mt-1">El primer reporte se generará el próximo lunes a las 8:00 UTC</p>
          </div>
        ) : (
          <div className="space-y-2">
            {snapshots.map(snap => (
              <div key={snap.id} className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedSnapshot(expandedSnapshot === snap.id ? null : snap.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${
                      snap.type === "weekly"
                        ? "bg-[#7ab0e8]/10 text-[#7ab0e8] border border-[#7ab0e8]/20"
                        : "bg-[#c3871e]/10 text-[#c3871e] border border-[#c3871e]/20"
                    }`}>
                      {snap.type === "weekly" ? "Semanal" : "Mensual"}
                    </span>
                    <span className="text-white/70 font-bold text-sm">{snap.period_label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/25 text-[11px]">
                      {new Date(snap.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-white/25 transition-transform ${expandedSnapshot === snap.id ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {expandedSnapshot === snap.id && (
                  <div className="px-5 pb-5 border-t border-white/6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      {Object.entries(snap.data).map(([k, v]) => (
                        <div key={k} className="bg-[#06192c]/60 rounded-xl p-3">
                          <p className="text-white/30 text-[9px] font-black uppercase tracking-wide mb-1">
                            {k.replace(/_/g, " ")}
                          </p>
                          <p className="text-white font-black text-lg tabular-nums">{String(v)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
