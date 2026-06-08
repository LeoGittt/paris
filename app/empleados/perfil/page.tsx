import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Trophy, ArrowRight, Edit3 } from "lucide-react"
import { AvatarUpload } from "@/components/empleados/avatar-upload"

export default async function EmployeeProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: employee } = await supabase
    .from("participants")
    .select(`
      id, first_name, last_name, email, dni, phone, city,
      car_brand, car_model, license_plate,
      total_points, avatar_url, user_id
    `)
    .eq("user_id", user.id)
    .single() as { data: {
      id: string
      first_name: string
      last_name: string
      email: string
      dni: string
      phone: string
      city: string
      car_brand: string
      car_model: string
      license_plate: string
      total_points: number
      avatar_url: string | null
      user_id: string
    } | null }

  if (!employee) redirect("/")

  // Obtener ranking interno
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rankingData } = await (supabase as any)
    .from("employee_ranking_view")
    .select("ranking_position, predictions_count, correct_exact, correct_winner")
    .eq("participant_id", employee.id)
    .single() as { data: {
      ranking_position: number
      predictions_count: number
      correct_exact: number
      correct_winner: number
    } | null }

  const initials = `${employee.first_name[0]}${employee.last_name[0]}`.toUpperCase()

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="text-center">
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.3em] mb-2">Tu perfil</p>
        <h1 className="text-white font-black uppercase text-4xl md:text-5xl leading-none mb-2">
          {employee.first_name} {employee.last_name}
        </h1>
        <p className="text-white/40 text-sm font-medium">Empleado Grupo Paris</p>
      </div>

      {/* Avatar + Upload Section */}
      <div className="flex flex-col items-center">
        <div className="mb-6">
          <AvatarUpload
            currentUrl={employee.avatar_url}
            initials={initials}
            size={140}
            ringColor="#c3871e"
          />
        </div>
        <p className="text-white/30 text-sm font-medium text-center max-w-xs">
          Toca tu foto para cambiarla · JPG, PNG o WebP · máx 2 MB
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {[
          {
            label: "Posición",
            value: rankingData?.ranking_position ? `#${rankingData.ranking_position}` : "—",
            color: "#c3871e",
            bg: "rgba(195,135,30,0.08)",
          },
          {
            label: "Puntos",
            value: employee.total_points.toString(),
            color: "#7ab0e8",
            bg: "rgba(122,176,232,0.08)",
          },
          {
            label: "Pronósticos",
            value: (rankingData?.predictions_count ?? 0).toString(),
            color: "#4ade80",
            bg: "rgba(74,222,128,0.08)",
          },
          {
            label: "Exactos",
            value: (rankingData?.correct_exact ?? 0).toString(),
            color: "#f472b6",
            bg: "rgba(244,114,182,0.08)",
          },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 text-center"
            style={{ background: stat.bg, border: `1px solid ${stat.color}20` }}
          >
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              {stat.label}
            </p>
            <p className="font-black text-2xl tabular-nums" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Datos Personales */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-white font-black uppercase text-lg mb-4">Datos personales</h2>
        <div className="rounded-2xl border border-white/8 bg-[#0b2440] overflow-hidden">
          <div className="divide-y divide-white/4">
            {[
              { label: "Email", value: employee.email },
              { label: "DNI", value: employee.dni },
              { label: "Teléfono", value: employee.phone },
              { label: "Localidad", value: employee.city },
              { label: "Vehículo", value: `${employee.car_brand} ${employee.car_model} (${employee.license_plate})` },
            ].map(item => (
              <div key={item.label} className="px-5 py-4 flex items-center justify-between">
                <span className="text-white/40 text-sm font-bold uppercase tracking-wide">{item.label}</span>
                <span className="text-white/70 text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insignias/Trofeos Preview */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black uppercase text-lg">Trofeos</h2>
          <Link
            href="/empleados/ranking"
            className="text-white/25 hover:text-white/70 text-[11px] font-black uppercase tracking-widest transition-colors"
          >
            Ver ranking →
          </Link>
        </div>
        <div className="rounded-2xl border border-white/8 bg-[#0b2440] p-6 text-center">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-[#c3871e]" />
          <p className="text-white/45 text-sm font-medium mb-4">
            Tus insignias aparecen en el ranking interno
          </p>
          <Link
            href="/empleados/ranking"
            className="inline-flex items-center gap-2 bg-[#054a9d] hover:bg-[#1558b8] text-white font-black uppercase tracking-wide px-6 h-10 rounded-xl text-[12px] transition-all"
          >
            <Trophy className="w-3.5 h-3.5" />
            Ver ranking
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/empleados/ranking"
          className="group flex items-center gap-4 bg-[#0b2440] border border-white/8 rounded-2xl px-5 py-4 hover:border-white/16 hover:-translate-y-0.5 transition-all"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#c3871e]/12 border border-[#c3871e]/25">
            <Trophy className="w-4 h-4 text-[#c3871e]" />
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-sm">Ranking interno</p>
            <p className="text-white/30 text-[11px] font-medium">Ver posición y trofeos</p>
          </div>
          <ArrowRight className="w-4 h-4 text-white/15 group-hover:text-white/40 transition-colors" />
        </Link>

        <Link
          href="/dashboard"
          className="group flex items-center gap-4 bg-[#0b2440] border border-white/8 rounded-2xl px-5 py-4 hover:border-white/16 hover:-translate-y-0.5 transition-all"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#7ab0e8]/12 border border-[#7ab0e8]/25">
            <Edit3 className="w-4 h-4 text-[#7ab0e8]" />
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-sm">Mi panel</p>
            <p className="text-white/30 text-[11px] font-medium">Cargar pronósticos</p>
          </div>
          <ArrowRight className="w-4 h-4 text-white/15 group-hover:text-white/40 transition-colors" />
        </Link>
      </div>

    </div>
  )
}
