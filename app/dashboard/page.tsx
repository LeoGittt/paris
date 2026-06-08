import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Target, Trophy, Gift, ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Flag } from "@/components/ui/flag"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Datos del participante
  const { data: participant } = await supabase
    .from("participants")
    .select("id, first_name, total_points, ranking_position")
    .eq("user_id", user.id)
    .single() as { data: { id: string; first_name: string; total_points: number; ranking_position: number | null } | null }

  if (!participant) redirect("/")

  // Stats de pronósticos
  const { data: statsRows } = await supabase
    .rpc("get_participant_stats", { p_participant_id: participant.id as string })

  const stats = statsRows?.[0] ?? {
    total_points: participant.total_points,
    ranking_position: participant.ranking_position,
    predictions_count: 0,
    correct_exact: 0,
    correct_winner: 0,
  }

  // Últimos 5 pronósticos con partido
  const { data: recentPredictions } = await supabase
    .from("predictions")
    .select(`
      id,
      predicted_score1,
      predicted_score2,
      points_earned,
      result,
      submitted_at,
      matches (team1, team2, score1, score2, is_finished, match_date)
    `)
    .eq("participant_id", participant.id as string)
    .order("submitted_at", { ascending: false })
    .limit(5) as { data: PredictionWithMatch[] | null }

  // Próximos partidos sin pronóstico
  const { data: upcomingMatches } = await supabase
    .from("matches")
    .select("id, team1, team2, team1_flag, team2_flag, match_date, group_name, predictions_locked")
    .eq("is_finished", false)
    .eq("predictions_locked", false)
    .or("team1.ilike.%argentina%,team2.ilike.%argentina%")
    .order("match_date", { ascending: true })
    .limit(3) as { data: UpcomingMatch[] | null }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Bienvenido</p>
        <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none">
          {String(participant.first_name).toUpperCase()}
        </h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Puntos totales",
            value: String(stats.total_points ?? 0),
            unit: "pts",
            color: "#c3871e",
            bg: "rgba(195,135,30,0.08)",
            border: "rgba(195,135,30,0.20)",
          },
          {
            label: "Posición",
            value: stats.ranking_position ? `#${stats.ranking_position}` : "—",
            unit: "ranking",
            color: "#7ab0e8",
            bg: "rgba(122,176,232,0.08)",
            border: "rgba(122,176,232,0.20)",
          },
          {
            label: "Pronósticos",
            value: String(stats.predictions_count ?? 0),
            unit: "cargados",
            color: "#4ade80",
            bg: "rgba(74,222,128,0.08)",
            border: "rgba(74,222,128,0.20)",
          },
          {
            label: "Exactos",
            value: String(stats.correct_exact ?? 0),
            unit: "aciertos",
            color: "#f472b6",
            bg: "rgba(244,114,182,0.08)",
            border: "rgba(244,114,182,0.20)",
          },
        ].map(card => (
          <div
            key={card.label}
            className="rounded-2xl p-5 flex flex-col gap-2"
            style={{ background: card.bg, border: `1px solid ${card.border}` }}
          >
            <p className="text-white/35 text-[10px] font-black uppercase tracking-[0.2em]">{card.label}</p>
            <div className="flex items-end gap-1.5">
              <span className="font-black text-3xl leading-none tabular-nums" style={{ color: card.color }}>
                {card.value}
              </span>
              <span className="text-white/25 text-[10px] font-bold mb-0.5">{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Partidos disponibles para pronosticar */}
        <div className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
            <p className="text-white font-black uppercase text-sm tracking-wide">Pendientes</p>
            <Link href="/dashboard/pronosticos" className="text-[#7ab0e8] text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors">
              Ver todos →
            </Link>
          </div>

          {!upcomingMatches?.length ? (
            <div className="px-6 py-10 text-center">
              <p className="text-white/25 text-sm font-medium">No hay partidos disponibles por ahora</p>
            </div>
          ) : (
            <div className="divide-y divide-white/4">
              {upcomingMatches.map(match => (
                <Link
                  key={match.id}
                  href="/dashboard/pronosticos"
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors group"
                >
                  <div>
                    <p className="text-white font-bold text-sm flex items-center gap-1.5">
                      <Flag emoji={match.team1_flag} size={18} />
                      {match.team1}
                      <span className="text-white/30">vs</span>
                      {match.team2}
                      <Flag emoji={match.team2_flag} size={18} />
                    </p>
                    <p className="text-white/30 text-[11px] font-medium mt-0.5">
                      {match.group_name && `${match.group_name} · `}
                      {new Date(match.match_date).toLocaleDateString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-[#7ab0e8] transition-colors" />
                </Link>
              ))}
            </div>
          )}

          <div className="px-6 py-4 border-t border-white/6">
            <Link
              href="/dashboard/pronosticos"
              className="group w-full flex items-center justify-center gap-2 bg-[#054a9d] hover:bg-[#1558b8] text-white font-black uppercase tracking-wide px-4 h-10 rounded-xl text-[12px] transition-all"
            >
              <Target className="w-3.5 h-3.5" />
              Cargar pronósticos
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Últimos pronósticos */}
        <div className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/6">
            <p className="text-white font-black uppercase text-sm tracking-wide">Últimos pronósticos</p>
          </div>

          {!recentPredictions?.length ? (
            <div className="px-6 py-10 text-center">
              <p className="text-white/25 text-sm font-medium">Todavía no cargaste ningún pronóstico</p>
            </div>
          ) : (
            <div className="divide-y divide-white/4">
              {recentPredictions.map(pred => {
                const match = pred.matches
                const resultIcon = {
                  correct_exact:  { icon: CheckCircle2, color: "#4ade80",  label: `+${pred.points_earned}pts` },
                  correct_winner: { icon: CheckCircle2, color: "#7ab0e8",  label: `+${pred.points_earned}pts` },
                  correct_diff:   { icon: CheckCircle2, color: "#c3871e",  label: `+${pred.points_earned}pts` },
                  wrong:          { icon: XCircle,      color: "#f87171",  label: "0pts" },
                  pending:        { icon: Clock,        color: "#ffffff40", label: "Pendiente" },
                }[pred.result] ?? { icon: Clock, color: "#ffffff40", label: "Pendiente" }

                return (
                  <div key={pred.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 font-bold text-sm truncate">
                        {match?.team1} <span className="text-white/30 font-normal">{pred.predicted_score1}–{pred.predicted_score2}</span> {match?.team2}
                      </p>
                      {match?.is_finished && (
                        <p className="text-white/25 text-[11px] mt-0.5">
                          Real: {match.score1}–{match.score2}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <resultIcon.icon className="w-3.5 h-3.5" style={{ color: resultIcon.color }} />
                      <span className="text-[11px] font-black" style={{ color: resultIcon.color }}>
                        {resultIcon.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Links rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/ranking", icon: Trophy, label: "Ver Ranking", sub: "Tu posición en la tabla", color: "#c3871e" },
          { href: "/dashboard/premios", icon: Gift,   label: "Premios",     sub: "Qué podés ganar",        color: "#7ab0e8" },
          { href: "/",                  icon: Target,  label: "Ir al inicio", sub: "Volver a la landing",   color: "#4ade80" },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-4 bg-[#0b2440] border border-white/8 rounded-2xl px-5 py-4 hover:border-white/16 hover:-translate-y-0.5 transition-all"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}>
              <item.icon className="w-4 h-4" style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-white font-black text-sm">{item.label}</p>
              <p className="text-white/30 text-[11px] font-medium">{item.sub}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/15 group-hover:text-white/40 ml-auto transition-colors" />
          </Link>
        ))}
      </div>

    </div>
  )
}

interface PredictionWithMatch {
  id: string
  predicted_score1: number
  predicted_score2: number
  points_earned: number
  result: string
  submitted_at: string
  matches: {
    team1: string
    team2: string
    score1: number | null
    score2: number | null
    is_finished: boolean
    match_date: string
  } | null
}

interface UpcomingMatch {
  id: string
  team1: string
  team2: string
  team1_flag: string
  team2_flag: string
  match_date: string
  group_name: string | null
  predictions_locked: boolean
}
