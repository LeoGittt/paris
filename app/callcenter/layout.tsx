import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
import Image from "next/image"
import { Phone, LogOut } from "lucide-react"

export default async function CallCenterLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single() as { data: { role: string } | null }

  if (role?.role !== "callcenter" && role?.role !== "admin") redirect("/dashboard")

  return (
    <div className="min-h-screen bg-[#040f1c]" style={{ fontFamily: "'ChevySans', sans-serif" }}>
      <header className="bg-[#030b16] border-b border-white/6 px-5 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative" style={{ width: 40, height: 17 }}>
            <Image src="/logo-grupo-paris.png" alt="Grupo Paris" fill className="object-contain" />
          </div>
          <div className="w-px h-5 bg-white/15" />
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#7ab0e8]" />
            <span className="text-white font-black text-[13px] uppercase tracking-wide">Call Center</span>
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </form>
      </header>
      <main className="max-w-5xl mx-auto px-5 md:px-10 py-8">
        {children}
      </main>
    </div>
  )
}
