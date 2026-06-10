import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function EmpleadosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: participant } = await supabase
    .from("participants")
    .select("first_name, last_name, is_employee, is_blocked")
    .eq("user_id", user.id)
    .single() as { data: { first_name: string; last_name: string; is_employee: boolean; is_blocked: boolean } | null }

  if (!participant || participant.is_blocked) redirect("/")
  if (!participant.is_employee) redirect("/dashboard")

  return (
    <div
      className="min-h-screen bg-[#06192c]"
      style={{ fontFamily: "'ChevySans', sans-serif" }}
    >
      {/* Franja dorada superior */}
      <div
        className="h-0.5 w-full"
        style={{ background: "linear-gradient(90deg, transparent 0%, #c3871e 30%, #e8a832 50%, #c3871e 70%, transparent 100%)" }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#040f1c]/90 backdrop-blur-xl border-b border-white/6">
        <div className="max-w-5xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between">

          {/* Logo + título */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative shrink-0" style={{ width: 100, height: 27 }}>
                <Image
                  src="/ChatGPT_Image_7_jun_2026__23_41_29-removebg-preview.png"
                  alt="Grupo Paris"
                  fill
                  className="object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ mixBlendMode: "screen" }}
                />
              </div>
            </Link>

            <div className="w-px h-5 bg-white/10" />

            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#c3871e" }}
              />
              <span
                className="text-[11px] font-black uppercase tracking-[0.25em]"
                style={{
                  background: "linear-gradient(135deg, #e8a832, #c3871e)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Panel Empleados
              </span>
            </div>
          </div>

          {/* Derecha: nombre + botones */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-white/30 text-[11px] font-medium">
              {participant.first_name} {participant.last_name}
            </span>
            <Link
              href="/empleados/perfil"
              className="inline-flex items-center gap-1.5 text-white/25 hover:text-white/70 text-[11px] font-black uppercase tracking-widest transition-colors"
            >
              Mi perfil
            </Link>
            <div className="w-px h-4 bg-white/10" />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-white/25 hover:text-white/70 text-[11px] font-black uppercase tracking-widest transition-colors group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
              Mi panel
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-5xl mx-auto px-5 md:px-10 py-10 md:py-14">
        {children}
      </main>

      {/* Footer mínimo */}
      <footer className="border-t border-white/4 py-6 text-center">
        <p className="text-white/12 text-[10px] font-medium tracking-wider uppercase">
          Grupo Paris · Prode Mundial 2026 · Uso interno
        </p>
      </footer>
    </div>
  )
}
