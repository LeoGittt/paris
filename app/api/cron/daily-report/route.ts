import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

// Vercel Cron — todos los días a las 6:00 UTC
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

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [
      { count: totalParticipants },
      { count: newToday },
      { count: loginsToday },
      { count: predictionsToday },
    ] = await Promise.all([
      admin.from("participants").select("*", { count: "exact", head: true }),
      admin.from("participants").select("*", { count: "exact", head: true }).gte("created_at", yesterday.toISOString()),
      db.from("access_logs").select("*", { count: "exact", head: true }).gte("accessed_at", yesterday.toISOString()),
      admin.from("predictions").select("*", { count: "exact", head: true }).gte("submitted_at", yesterday.toISOString()),
    ])

    const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })

    await db.from("report_snapshots").insert({
      type:         "daily",
      period_label: today.charAt(0).toUpperCase() + today.slice(1),
      data: {
        total_participantes:     totalParticipants ?? 0,
        nuevos_hoy:              newToday ?? 0,
        accesos_hoy:             loginsToday ?? 0,
        pronosticos_hoy:         predictionsToday ?? 0,
      },
    })

    return NextResponse.json({ ok: true, date: today })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
