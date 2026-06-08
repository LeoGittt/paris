import { NextRequest, NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

function authenticated(req: NextRequest): boolean {
  const key = req.headers.get("x-api-key") ?? req.headers.get("authorization")?.replace("Bearer ", "")
  return !!process.env.API_SECRET_KEY && key === process.env.API_SECRET_KEY
}

export async function GET(req: NextRequest) {
  if (!authenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any

  const [{ data: overview }, { data: ranking }] = await Promise.all([
    db.from("metrics_overview").select("*").single(),
    admin
      .from("ranking_view")
      .select("participant_id,first_name,last_name,total_points,ranking_position")
      .order("ranking_position", { ascending: true })
      .limit(10),
  ])

  return NextResponse.json({
    overview,
    ranking_top10: ranking,
    generated_at: new Date().toISOString(),
  })
}
