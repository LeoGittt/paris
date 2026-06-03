import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

// Vercel Cron llama este endpoint cada lunes a las 8:00 UTC
// Autenticado con CRON_SECRET para evitar llamadas externas no autorizadas
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")
  if (!secret || authHeader !== `Bearer ${secret}`) {
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
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      { count: totalParticipants },
      { count: newThisWeek },
      { count: totalPredictions },
      { data: metricsOverview },
    ] = await Promise.all([
      admin.from("participants").select("*", { count: "exact", head: true }),
      admin.from("participants").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
      admin.from("predictions").select("*", { count: "exact", head: true }),
      db.from("metrics_overview").select("*").single(),
    ])

    const data = {
      total_participantes:  totalParticipants ?? 0,
      nuevos_esta_semana:   newThisWeek ?? 0,
      total_pronosticos:    totalPredictions ?? 0,
      de_taller:            metricsOverview?.from_taller ?? 0,
      de_repuestos:         metricsOverview?.from_repuestos ?? 0,
      de_digital:           metricsOverview?.from_digital ?? 0,
      de_qr:                metricsOverview?.from_qr ?? 0,
    }

    const periodStart = weekAgo.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
    const periodEnd   = now.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })

    await db.from("report_snapshots").insert({
      type:         "weekly",
      period_label: `Semana del ${periodStart} al ${periodEnd}`,
      data,
    })

    return NextResponse.json({ ok: true, period: `${periodStart} – ${periodEnd}` })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
