"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Target, Trophy, Gift, LogOut, Menu, X, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/dashboard",             icon: LayoutDashboard, label: "Mi Panel"      },
  { href: "/dashboard/pronosticos", icon: Target,          label: "Pronósticos"   },
  { href: "/dashboard/ranking",     icon: Trophy,          label: "Ranking"       },
  { href: "/dashboard/premios",     icon: Gift,            label: "Premios"       },
]

interface Props {
  participant: {
    first_name: string
    last_name: string
    total_points: number
    ranking_position: number | null
  }
  isEmployee?: boolean
}

export function DashboardNav({ participant, isEmployee = false }: Props) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative shrink-0" style={{ width: 120, height: 32 }}>
            <Image src="/logo-grupo-paris.png" alt="Grupo Paris" fill className="object-contain" />
          </div>
          <div className="w-px bg-white/20 self-stretch" />
          <p className="text-white font-black text-[13px] uppercase tracking-wide">PRODE 2026</p>
        </Link>
      </div>

      {/* Perfil */}
      <div className="px-5 py-5 border-b border-white/6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#054a9d]/30 border border-[#054a9d]/40 flex items-center justify-center shrink-0">
            <span className="text-[#7ab0e8] font-black text-sm">
              {participant.first_name[0]}{participant.last_name[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm truncate">
              {participant.first_name} {participant.last_name}
            </p>
            <p className="text-white/35 text-[11px] font-medium">
              {participant.total_points} pts
              {participant.ranking_position && (
                <span className="text-[#c3871e] ml-1">· #{participant.ranking_position}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Navegación */}
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
                  ? "bg-[#054a9d] text-white shadow-lg shadow-[#054a9d]/25"
                  : "text-white/40 hover:text-white hover:bg-white/6"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Panel empleados (solo empleados Paris) */}
      {isEmployee && (
        <div className="px-3 pb-2">
          <Link
            href="/empleados/ranking"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all bg-[#c3871e]/10 border border-[#c3871e]/20 text-[#c3871e] hover:bg-[#c3871e]/20"
          >
            <Users className="w-4 h-4 shrink-0" />
            Panel Empleados
          </Link>
        </div>
      )}

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/6">
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
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-[#040f1c] border-r border-white/6 z-40">
        <NavContent />
      </aside>

      {/* Header móvil */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 bg-[#040f1c]/95 backdrop-blur-xl border-b border-white/6 h-16 flex items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative" style={{ width: 100, height: 27 }}>
            <Image src="/logo-grupo-paris.png" alt="Grupo Paris" fill className="object-contain" />
          </div>
        </Link>
        <button
          onClick={() => setOpen(v => !v)}
          className="p-2 text-white/50 hover:text-white hover:bg-white/8 rounded-lg transition-all"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Drawer móvil */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[#040f1c] border-r border-white/6 flex flex-col">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}
