import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/types"

const PUBLIC_PATHS = ["/", "/login", "/registro", "/ranking", "/terminos", "/bases", "/api/", "/auth/"]
const ADMIN_PATHS  = ["/admin"]
const CC_PATHS     = ["/callcenter"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresca la sesión — SIEMPRE antes de leer user
  const { data: { user } } = await supabase.auth.getUser()

  // "/" debe ser match exacto — startsWith("/") matchearía TODO
  const isPublic = PUBLIC_PATHS.some(p =>
    pathname === p || (p.length > 1 && pathname.startsWith(p))
  )

  // Rutas protegidas sin sesión → login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  const needsRole =
    user && (
      ADMIN_PATHS.some(p => pathname.startsWith(p)) ||
      CC_PATHS.some(p => pathname.startsWith(p))    ||
      pathname === "/login" ||
      pathname === "/registro"
    )

  // Leer rol una sola vez si es necesario
  let role: string | null = null
  if (needsRole) {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user!.id)
      .single() as { data: { role: string } | null }
    role = roleData?.role ?? null
  }

  // Rutas de admin/callcenter → verificar rol
  if (user && ADMIN_PATHS.some(p => pathname.startsWith(p)) && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  if (user && CC_PATHS.some(p => pathname.startsWith(p)) && role !== "callcenter" && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Usuario autenticado en login/registro → redirigir según rol
  if (user && (pathname === "/login" || pathname === "/registro")) {
    if (role === "admin")       return NextResponse.redirect(new URL("/admin", request.url))
    if (role === "callcenter")  return NextResponse.redirect(new URL("/callcenter", request.url))
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
