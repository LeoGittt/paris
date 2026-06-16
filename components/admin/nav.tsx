"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Users, Calendar, Gift, Settings,
  LogOut, Menu, X, Shield, BarChart3, Trophy, FileText,
  BookOpen, ChevronDown, HardHat,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { href: "/admin",               icon: LayoutDashboard, label: "Dashboard"     },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/admin/participantes", icon: Users,           label: "Participantes" },
      { href: "/admin/empleados",     icon: HardHat,         label: "Empleados"     },
      { href: "/admin/partidos",      icon: Calendar,        label: "Partidos"      },
      { href: "/admin/premios",       icon: Gift,            label: "Premios"       },
    ],
  },
  {
    label: "Datos",
    items: [
      { href: "/admin/metricas",      icon: BarChart3,       label: "Métricas"      },
      { href: "/admin/reportes",      icon: FileText,        label: "Reportes"      },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/configuracion", icon: Settings,        label: "Configuración" },
      { href: "/admin/guia",          icon: BookOpen,        label: "Guía del sistema", highlight: true },
    ],
  },
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

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

  const NavContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative shrink-0 overflow-hidden" style={{ width: 160, height: 45 }}>
            <Image
              src="/logo-paris.png" alt="Grupo Paris" fill
              className="object-cover opacity-75 group-hover:opacity-100 transition-opacity"
              style={{ objectPosition: "50% 52%" }}
            />
          </div>
          <div className="w-px bg-white/15 self-stretch" />
          <p className="text-white/90 font-black text-[13px] uppercase tracking-wide">PRODE 2026</p>
        </Link>
      </div>

      {/* Admin badge */}
      <div className="px-4 py-3 border-b border-white/6">
        <div
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
          style={{
            background: "linear-gradient(135deg, rgba(195,135,30,0.12) 0%, rgba(195,135,30,0.06) 100%)",
            border: "1px solid rgba(195,135,30,0.25)",
          }}
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(195,135,30,0.2)", border: "1px solid rgba(195,135,30,0.35)" }}
          >
            <Shield className="w-3 h-3 text-[#c3871e]" />
          </div>
          <div className="leading-none">
            <p className="text-[#c3871e] text-[10px] font-black uppercase tracking-[0.2em]">Administrador</p>
            <p className="text-[#c3871e]/40 text-[9px] font-medium mt-0.5">Acceso completo</p>
          </div>
        </div>
      </div>

      {/* Nav items por grupo */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em] px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-150 ${
                      active
                        ? "bg-[#c3871e]/12 text-[#c3871e]"
                        : item.highlight
                        ? "text-[#7ab0e8]/60 hover:text-[#7ab0e8] hover:bg-[#054a9d]/10"
                        : "text-white/35 hover:text-white/80 hover:bg-white/5"
                    }`}
                    style={active ? { border: "1px solid rgba(195,135,30,0.2)", boxShadow: "inset 3px 0 0 rgba(195,135,30,0.5)" } : { border: "1px solid transparent" }}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {active && <div className="w-1 h-1 rounded-full bg-[#c3871e]" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pt-3 pb-4 border-t border-white/6 space-y-0.5">
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-white/25 hover:text-white/60 hover:bg-white/4 transition-all"
          style={{ border: "1px solid transparent" }}
        >
          <Trophy className="w-4 h-4 shrink-0" />
          Ver como participante
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-white/25 hover:text-red-400/80 hover:bg-red-500/6 transition-all"
          style={{ border: "1px solid transparent" }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
        <p className="text-white/10 text-[9px] font-medium text-center pt-2 pb-1">
          Mundial 2026 · Panel Admin
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-[#030b16] border-r border-white/6 z-40 overflow-hidden">
        {/* Línea dorada top */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(195,135,30,0.6), transparent)" }} />
        <NavContent />
      </aside>

      {/* Header móvil */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 bg-[#030b16]/95 backdrop-blur-xl border-b border-white/6 h-16 flex items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(195,135,30,0.15)", border: "1px solid rgba(195,135,30,0.3)" }}>
            <Shield className="w-3.5 h-3.5 text-[#c3871e]" />
          </div>
          <span className="text-white font-black text-[13px] uppercase tracking-wide">Admin</span>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="p-2 text-white/40 hover:text-white hover:bg-white/8 rounded-lg transition-all"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Drawer móvil */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[#030b16] border-r border-white/6 flex flex-col overflow-hidden">
            <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(195,135,30,0.6), transparent)" }} />
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}
