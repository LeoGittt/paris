"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, Calendar, Gift, Settings, LogOut, Menu, X, Shield, BarChart3, Trophy, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/admin",                icon: LayoutDashboard, label: "Dashboard"     },
  { href: "/admin/participantes",  icon: Users,           label: "Participantes" },
  { href: "/admin/partidos",       icon: Calendar,        label: "Partidos"      },
  { href: "/admin/premios",        icon: Gift,            label: "Premios"       },
  { href: "/admin/metricas",       icon: BarChart3,       label: "Métricas"      },
  { href: "/admin/reportes",       icon: FileText,        label: "Reportes"      },
  { href: "/admin/configuracion",  icon: Settings,        label: "Configuración" },
]

export function AdminNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const NavContent = () => (
    <>
      <div className="px-5 py-6 border-b border-white/6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative shrink-0" style={{ width: 40, height: 17 }}>
            <Image src="/bowtie.png" alt="Chevrolet" fill className="object-contain" style={{ mixBlendMode: "screen" }} />
          </div>
          <div className="w-px bg-white/20 self-stretch" />
          <div className="leading-none">
            <p className="text-white/50 text-[8px] font-black uppercase tracking-[0.2em]">GRUPO PARIS</p>
            <p className="text-white font-black text-[13px] uppercase tracking-wide">ADMIN</p>
          </div>
        </Link>
      </div>

      <div className="px-5 py-3 border-b border-white/6">
        <div className="flex items-center gap-2 bg-[#c3871e]/10 border border-[#c3871e]/25 rounded-xl px-3 py-2">
          <Shield className="w-3.5 h-3.5 text-[#c3871e] shrink-0" />
          <span className="text-[#c3871e] text-[11px] font-black uppercase tracking-wide">Panel Administrador</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? "bg-[#c3871e]/15 text-[#c3871e] border border-[#c3871e]/25"
                  : "text-white/40 hover:text-white hover:bg-white/6"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/6 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white/30 hover:text-white/60 hover:bg-white/4 transition-all"
        >
          <Trophy className="w-4 h-4 shrink-0" />
          Ver como participante
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white/30 hover:text-red-400 hover:bg-red-500/8 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <>
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-[#030b16] border-r border-white/6 z-40">
        <NavContent />
      </aside>

      <header className="md:hidden fixed top-0 inset-x-0 z-50 bg-[#030b16]/95 backdrop-blur-xl border-b border-white/6 h-16 flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#c3871e]" />
          <span className="text-white font-black text-[13px] uppercase">Admin</span>
        </div>
        <button onClick={() => setOpen(v => !v)} className="p-2 text-white/50 hover:text-white hover:bg-white/8 rounded-lg transition-all">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[#030b16] border-r border-white/6 flex flex-col">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}
