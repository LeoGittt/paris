import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

// Vercel Cron — cada minuto (configurar en vercel.json)
// Bloquea partidos cuya fecha ya pasó para que no se puedan modificar pronósticos
export async function GET(request: Request) {
  const secret     = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const admin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await admin.rpc("lock_started_matches" as never)
    if (error) throw error

    return NextResponse.json({ ok: true, locked_at: new Date().toISOString() })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
