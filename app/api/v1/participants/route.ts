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

  const { searchParams } = new URL(req.url)
  const rawPage  = parseInt(searchParams.get("page")  ?? "1")
  const rawLimit = parseInt(searchParams.get("limit") ?? "50")
  const page  = Math.max(1, Number.isNaN(rawPage)  ? 1  : rawPage)
  const limit = Math.min(100, Math.max(1, Number.isNaN(rawLimit) ? 50 : rawLimit))
  const from  = (page - 1) * limit

  const admin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, count, error } = await admin
    .from("participants")
    .select("id,first_name,last_name,dni,phone,email,city,license_plate,car_brand,car_model,lead_source,total_points,ranking_position,is_blocked,created_at", { count: "exact" })
    .eq("is_blocked", false)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1)

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data,
    meta: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
  })
}
