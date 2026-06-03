import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Users, Calendar, Trophy, Gift, Target, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react"

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: totalParticipants },
    { count: activeParticipants },
    { count: totalMatches },
    { count: finishedMatches },
    { count: totalPredictions },
    { count: totalPrizes },
    { data: recentParticipants },
    { data: topRanking },
  ] = await Promise.all([
    supabase.from("participants").select("*", { count: "exact", head: true }),
    supabase.from("participants").select("*", { count: "exact", head: true }).eq("is_blocked", false),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("is_finished", true),
    supabase.from("predictions").select("*", { count: "exact", head: true }),
    supabase.from("prizes").select("*", { count: "exact", head: true }),
    supabase.from("participants").select("first_name, last_name, email, city, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("ranking_view").select("first_name, last_name, total_points, ranking_position").order("ranking_position", { ascending: true }).limit(5),
  ])

  const stats = [
    { label: "Participantes",    value: totalParticipants ?? 0,   icon: Users,    color: "#7ab0e8", href: "/admin/participantes" },
    { label: "Activos",          value: activeParticipants ?? 0,  icon: TrendingUp, color: "#4ade80", href: "/admin/participantes" },
    { label: "Pronósticos",      value: totalPredictions ?? 0,    icon: Target,   color: "#c3871e", href: "/admin/partidos" },
    { label: "Partidos finalizados", value: `${finishedMatches ?? 0}/${totalMatches ?? 0}`, icon: Calendar, color: "#f472b6", href: "/admin/partidos" },
  ]

  const quickActions = [
    { href: "/admin/partidos",      icon: Calendar, label: "Cargar resultado",   sub: "Actualizar marcador de un partido" },
    { href: "/admin/participantes", icon: Users,    label: "Ver participantes",  sub: "Buscar, editar o exportar" },
    { href: "/admin/premios",       icon: Gift,     label: "Gestionar premios",  sub: "Crear o asignar ganadores" },
    { href: "/admin/configuracion", icon: Trophy,   label: "Config puntos",      sub: "Modificar sistema de puntuación" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Panel de control</p>
        <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none">DASHBOARD</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-2xl p-5 flex flex-col gap-2 hover:-translate-y-0.5 transition-all"
            style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-white/35 text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</p>
              <s.icon className="w-4 h-4 opacity-40 group-hover:opacity-70 transition-opacity" style={{ color: s.color }} />
            </div>
            <span className="font-black text-3xl leading-none tabular-nums" style={{ color: s.color }}>
              {s.value}
            </span>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Acciones rápidas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(a => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex items-center gap-4 bg-[#0b2440] border border-white/8 rounded-2xl px-5 py-4 hover:border-white/16 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#c3871e]/10 border border-[#c3871e]/20 flex items-center justify-center shrink-0">
                <a.icon className="w-4 h-4 text-[#c3871e]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm">{a.label}</p>
                <p className="text-white/30 text-[11px] font-medium truncate">{a.sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/15 group-hover:text-white/40 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Últimos registros */}
        <div className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
            <p className="text-white font-black uppercase text-sm tracking-wide">Últimos registros</p>
            <Link href="/admin/participantes" className="text-[#7ab0e8] text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors">
              Ver todos →
            </Link>
          </div>
          {!recentParticipants?.length ? (
            <div className="px-6 py-10 text-center">
              <p className="text-white/20 text-sm">Sin participantes todavía</p>
            </div>
          ) : (
            <div className="divide-y divide-white/4">
              {recentParticipants.map((p, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/4 border border-white/8 flex items-center justify-center shrink-0">
                    <span className="text-white/40 text-[10px] font-black">
                      {p.first_name[0]}{p.last_name[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 font-bold text-sm truncate">{p.first_name} {p.last_name}</p>
                    <p className="text-white/25 text-[11px] truncate">{p.city} · {p.email}</p>
                  </div>
                  <p className="text-white/20 text-[10px] font-medium shrink-0">
                    {new Date(p.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top ranking */}
        <div className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/6">
            <p className="text-white font-black uppercase text-sm tracking-wide">Top Ranking</p>
          </div>
          {!topRanking?.length ? (
            <div className="px-6 py-10 text-center">
              <p className="text-white/20 text-sm">Sin puntos cargados todavía</p>
            </div>
          ) : (
            <div className="divide-y divide-white/4">
              {topRanking.map((p, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${
                    i === 0 ? "bg-[#c3871e]/15 text-[#c3871e] border border-[#c3871e]/30" :
                    i === 1 ? "bg-[#94a3b8]/10 text-[#94a3b8] border border-[#94a3b8]/20" :
                    "bg-white/4 text-white/30 border border-white/8"
                  }`}>
                    {p.ranking_position}
                  </span>
                  <p className="text-white/70 font-bold text-sm flex-1 truncate">{p.first_name} {p.last_name}</p>
                  <span className="text-[#c3871e] font-black text-sm tabular-nums shrink-0">
                    {p.total_points} <span className="text-white/20 text-[10px]">pts</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Estado premios */}
      <div className="bg-[#0b2440] border border-white/8 rounded-2xl px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gift className="w-5 h-5 text-[#c3871e]" />
          <div>
            <p className="text-white font-bold text-sm">Premios configurados</p>
            <p className="text-white/30 text-[11px]">{totalPrizes ?? 0} premios en total</p>
          </div>
        </div>
        <Link
          href="/admin/premios"
          className="flex items-center gap-2 bg-[#c3871e]/15 hover:bg-[#c3871e]/25 border border-[#c3871e]/30 text-[#c3871e] font-black uppercase text-[11px] tracking-wide px-4 h-9 rounded-xl transition-all"
        >
          {totalPrizes === 0 ? "Crear premios" : "Gestionar"}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
