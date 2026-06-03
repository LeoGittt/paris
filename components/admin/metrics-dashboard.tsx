"use client"

import { Users, TrendingUp, Target, MapPin, BarChart3, Calendar } from "lucide-react"
import type {
  MetricsOverview, DailyRow, CityRow, PredictionsMetrics, TopParticipant,
  AccessOverview, AccessDailyRow,
} from "@/app/admin/metricas/page"

const LEAD_LABELS: Record<string, { label: string; color: string }> = {
  taller:    { label: "Taller",     color: "#4ade80" },
  repuestos: { label: "Repuestos",  color: "#7ab0e8" },
  digital:   { label: "Digital",    color: "#c3871e" },
  qr:        { label: "QR",         color: "#f472b6" },
  direct:    { label: "Directo",    color: "#94a3b8" },
}

interface Props {
  overview: MetricsOverview | null
  daily: DailyRow[]
  cities: CityRow[]
  predictions: PredictionsMetrics | null
  topParticipants: TopParticipant[]
  accessOverview: AccessOverview | null
  accessDaily: AccessDailyRow[]
}

function StatCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string | number; sub?: string; color: string; icon: React.ElementType
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
      <div className="flex items-center justify-between">
        <p className="text-white/35 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
        <Icon className="w-4 h-4 opacity-40" style={{ color }} />
      </div>
      <span className="font-black text-3xl leading-none tabular-nums" style={{ color }}>{value}</span>
      {sub && <p className="text-white/25 text-[11px] font-medium">{sub}</p>}
    </div>
  )
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 shrink-0">
        <p className="text-white/50 text-[11px] font-bold truncate">{label}</p>
      </div>
      <div className="flex-1 h-2 bg-white/6 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-white/50 font-black text-sm tabular-nums w-8 text-right">{value}</span>
      <span className="text-white/20 text-[10px] w-8 text-right">{pct}%</span>
    </div>
  )
}

function SparkLine({ data }: { data: DailyRow[] }) {
  if (!data.length) return (
    <div className="h-20 flex items-center justify-center">
      <p className="text-white/20 text-sm">Sin datos</p>
    </div>
  )

  const max = Math.max(...data.map(d => d.registrations), 1)
  const width = 100 / data.length

  return (
    <div className="flex items-end gap-px h-20">
      {data.map((d, i) => {
        const h = Math.max(4, (d.registrations / max) * 100)
        return (
          <div key={i} className="group relative flex-1 flex flex-col items-center justify-end h-full">
            <div
              className="w-full rounded-sm transition-all duration-300 group-hover:opacity-100 opacity-70"
              style={{ height: `${h}%`, background: "linear-gradient(to top, #054a9d, #7ab0e8)" }}
            />
            {d.registrations > 0 && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0b2440] border border-white/10 rounded-lg px-2 py-1 text-white text-[9px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {d.registrations} reg.<br />
                <span className="text-white/40">{new Date(d.day).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function MetricsDashboard({ overview, daily, cities, predictions, topParticipants, accessOverview, accessDaily }: Props) {
  const ov = overview ?? {
    total_participants: 0, active_participants: 0, new_today: 0,
    new_this_week: 0, new_this_month: 0,
    from_taller: 0, from_repuestos: 0, from_digital: 0, from_qr: 0, from_direct: 0,
  }

  const pred = predictions ?? {
    participants_with_predictions: 0, total_predictions: 0,
    total_exact: 0, total_winner: 0, total_wrong: 0, total_pending: 0,
  }

  const participationRate = ov.total_participants > 0
    ? Math.round((pred.participants_with_predictions / ov.total_participants) * 100)
    : 0

  const activeRate = ov.total_participants > 0
    ? Math.round((ov.active_participants / ov.total_participants) * 100)
    : 0

  const leadSources = [
    { key: "taller",    value: ov.from_taller    },
    { key: "repuestos", value: ov.from_repuestos  },
    { key: "digital",   value: ov.from_digital    },
    { key: "qr",        value: ov.from_qr         },
    { key: "direct",    value: ov.from_direct     },
  ].filter(s => s.value > 0).sort((a, b) => b.value - a.value)

  const maxLeadSource = Math.max(...leadSources.map(s => s.value), 1)
  const maxCity = cities[0]?.total ?? 1

  return (
    <div className="space-y-6">

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total participantes" value={ov.total_participants}   color="#7ab0e8" icon={Users}    />
        <StatCard label="Activos"             value={ov.active_participants}  color="#4ade80" icon={TrendingUp} sub={`${activeRate}% del total`} />
        <StatCard label="Nuevos hoy"          value={ov.new_today}            color="#c3871e" icon={Calendar} />
        <StatCard label="Tasa de participación" value={`${participationRate}%`} color="#f472b6" icon={Target} sub={`${pred.participants_with_predictions} con pronósticos`} />
      </div>

      {/* Crecimiento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Nuevos esta semana", value: ov.new_this_week,  color: "#7ab0e8" },
          { label: "Nuevos este mes",    value: ov.new_this_month, color: "#4ade80" },
          { label: "Pronósticos totales",value: pred.total_predictions, color: "#c3871e" },
        ].map(s => (
          <div key={s.label} className="bg-[#0b2440] border border-white/8 rounded-2xl px-6 py-5 flex items-center justify-between">
            <p className="text-white/40 text-sm font-bold">{s.label}</p>
            <span className="font-black text-3xl tabular-nums" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Registros por día */}
        <div className="bg-[#0b2440] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-[#7ab0e8]" />
            <p className="text-white font-black uppercase text-sm tracking-wide">Registros últimos 30 días</p>
          </div>
          <SparkLine data={daily} />
          <div className="flex justify-between mt-2">
            <p className="text-white/20 text-[10px]">
              {daily[0] ? new Date(daily[0].day).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }) : ""}
            </p>
            <p className="text-white/20 text-[10px]">Hoy</p>
          </div>
        </div>

        {/* Origen de clientes */}
        <div className="bg-[#0b2440] border border-white/8 rounded-2xl p-6">
          <p className="text-white font-black uppercase text-sm tracking-wide mb-5">Origen de clientes</p>
          {leadSources.length === 0 ? (
            <p className="text-white/20 text-sm">Sin datos de origen aún</p>
          ) : (
            <div className="space-y-3.5">
              {leadSources.map(s => {
                const cfg = LEAD_LABELS[s.key] ?? { label: s.key, color: "#ffffff50" }
                return (
                  <MiniBar key={s.key} label={cfg.label} value={s.value} max={maxLeadSource} color={cfg.color} />
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pronósticos breakdown */}
        <div className="bg-[#0b2440] border border-white/8 rounded-2xl p-6">
          <p className="text-white font-black uppercase text-sm tracking-wide mb-5">Pronósticos</p>
          <div className="space-y-3">
            {[
              { label: "Resultado exacto",  value: pred.total_exact,   color: "#4ade80"  },
              { label: "Ganador correcto",   value: pred.total_winner,  color: "#7ab0e8"  },
              { label: "Incorrectos",        value: pred.total_wrong,   color: "#f87171"  },
              { label: "Pendientes",         value: pred.total_pending, color: "#ffffff40" },
            ].map(s => (
              <MiniBar key={s.label} label={s.label} value={s.value} max={pred.total_predictions || 1} color={s.color} />
            ))}
          </div>
        </div>

        {/* Top ciudades */}
        <div className="bg-[#0b2440] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-4 h-4 text-[#c3871e]" />
            <p className="text-white font-black uppercase text-sm tracking-wide">Participantes por ciudad</p>
          </div>
          {cities.length === 0 ? (
            <p className="text-white/20 text-sm">Sin datos de ciudad aún</p>
          ) : (
            <div className="space-y-3">
              {cities.slice(0, 8).map(c => (
                <MiniBar key={c.city} label={c.city} value={c.total} max={maxCity} color="#c3871e" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accesos diarios */}
      <div className="bg-[#0b2440] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#f472b6]" />
            <p className="text-white font-black uppercase text-sm tracking-wide">Accesos diarios (últimos 30 días)</p>
          </div>
          {accessOverview && (
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-white/30">Hoy: <span className="text-white/60 font-black">{accessOverview.logins_today}</span></span>
              <span className="text-white/30">Semana: <span className="text-white/60 font-black">{accessOverview.logins_this_week}</span></span>
              <span className="text-white/30">Mes: <span className="text-white/60 font-black">{accessOverview.logins_this_month}</span></span>
            </div>
          )}
        </div>
        {accessDaily.length === 0 ? (
          <div className="h-20 flex items-center justify-center">
            <p className="text-white/20 text-sm">Sin accesos registrados aún</p>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-px h-20">
              {accessDaily.map((d, i) => {
                const max = Math.max(...accessDaily.map(x => x.total_logins), 1)
                const h = Math.max(4, (d.total_logins / max) * 100)
                return (
                  <div key={i} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                    <div className="w-full rounded-sm opacity-70 group-hover:opacity-100 transition-all"
                         style={{ height: `${h}%`, background: "linear-gradient(to top, #be185d, #f472b6)" }} />
                    {d.total_logins > 0 && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0b2440] border border-white/10 rounded-lg px-2 py-1 text-white text-[9px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        {d.total_logins} logins · {d.unique_users} únicos
                        <br/><span className="text-white/40">{new Date(d.day).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-white/20 text-[10px]">
                {accessDaily[0] ? new Date(accessDaily[0].day).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }) : ""}
              </p>
              <p className="text-white/20 text-[10px]">Hoy</p>
            </div>
          </>
        )}
      </div>

      {/* Top 10 participantes */}
      <div className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6">
          <p className="text-white font-black uppercase text-sm tracking-wide">Top 10 participantes</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#06192c]/60 border-b border-white/6">
                {["#","Nombre","Ciudad","Origen","Puntos","Registro"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-white/20 text-[9px] font-black uppercase tracking-[0.25em] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {topParticipants.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-white/20 text-sm">Sin participantes todavía</td></tr>
              ) : topParticipants.map((p, i) => {
                const leadCfg = LEAD_LABELS[p.lead_source] ?? { label: p.lead_source, color: "#ffffff40" }
                return (
                  <tr key={i} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black ${
                        i === 0 ? "bg-[#c3871e]/15 text-[#c3871e] border border-[#c3871e]/30" :
                        i === 1 ? "bg-[#94a3b8]/10 text-[#94a3b8]" : "text-white/20"
                      }`}>
                        {(p.ranking_position ?? i + 1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/70 font-bold text-sm whitespace-nowrap">
                      {p.first_name} {p.last_name}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-sm">{p.city}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg"
                            style={{ color: leadCfg.color, background: `${leadCfg.color}15`, border: `1px solid ${leadCfg.color}25` }}>
                        {leadCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#c3871e] font-black text-sm tabular-nums">{p.total_points}</td>
                    <td className="px-4 py-3 text-white/25 text-[11px]">
                      {new Date(p.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
