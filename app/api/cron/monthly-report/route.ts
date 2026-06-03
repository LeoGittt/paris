import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

// Vercel Cron llama este endpoint el día 1 de cada mes a las 8:00 UTC
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const admin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any

    const now = new Date()
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const monthEnd  = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      { count: totalParticipants },
      { count: newThisMonth },
      { count: activePredictors },
      { data: metricsOverview },
      { data: top3 },
    ] = await Promise.all([
      admin.from("participants").select("*", { count: "exact", head: true }),
      admin.from("participants").select("*", { count: "exact", head: true }).gte("created_at", monthAgo.toISOString()),
      admin.from("predictions").select("participant_id", { count: "exact", head: true }),
      db.from("metrics_overview").select("*").single(),
      admin.from("ranking_view")
        .select("first_name, last_name, total_points, ranking_position")
        .order("ranking_position", { ascending: true })
        .limit(3) as unknown as Promise<{ data: { first_name: string; last_name: string; total_points: number; ranking_position: number }[] | null }>,
    ])

    const data: Record<string, unknown> = {
      total_participantes:  totalParticipants ?? 0,
      nuevos_este_mes:      newThisMonth ?? 0,
      con_pronosticos:      activePredictors ?? 0,
      de_taller:            metricsOverview?.data?.from_taller ?? 0,
      de_repuestos:         metricsOverview?.data?.from_repuestos ?? 0,
      de_digital:           metricsOverview?.data?.from_digital ?? 0,
      de_qr:                metricsOverview?.data?.from_qr ?? 0,
    }

    // Top 3 del mes
    ;(top3 ?? []).forEach((p, i) => {
      data[`top${i + 1}`] = `${p.first_name} ${p.last_name} (${p.total_points}pts)`
    })

    const monthName = monthAgo.toLocaleDateString("es-AR", { month: "long", year: "numeric" })

    await db.from("report_snapshots").insert({
      type:         "monthly",
      period_label: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      data,
    })

    return NextResponse.json({ ok: true, period: monthName })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
