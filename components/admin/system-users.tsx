"use client"

import { useState, useTransition } from "react"
import { Plus, Shield, Phone, Ban, CheckCircle2, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { createSystemUser, toggleUserEnabled, deleteSystemUser, updateUserRole } from "@/lib/actions/admin/users"
import type { SystemUser } from "@/app/admin/configuracion/page"

const ROLE_CONFIG = {
  admin:       { label: "Administrador", color: "#c3871e", icon: Shield },
  callcenter:  { label: "Call Center",   color: "#7ab0e8", icon: Phone  },
}

const inputCls = "w-full px-3 py-2.5 bg-[#06192c] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#054a9d] transition-all"
const labelCls = "block text-white/40 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5"

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [role,     setRole]     = useState<"admin" | "callcenter">("callcenter")
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")

  const handleCreate = async () => {
    if (!email.trim() || password.length < 6) return
    setLoading(true)
    setError("")
    const res = await createSystemUser(email.trim(), password, role)
    if (res.ok) {
      onClose()
    } else {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0b2440] border border-white/10 rounded-2xl p-7 w-full max-w-sm shadow-2xl">
        <h3 className="text-white font-black uppercase text-lg mb-5">Crear usuario</h3>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Rol</label>
            <div className="flex gap-2">
              {(["callcenter", "admin"] as const).map(r => {
                const cfg = ROLE_CONFIG[r]
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[12px] font-black uppercase tracking-wide transition-all border ${
                      role === r
                        ? "border-opacity-40 text-white"
                        : "bg-white/3 border-white/8 text-white/30 hover:text-white/60"
                    }`}
                    style={role === r ? { background: `${cfg.color}15`, borderColor: `${cfg.color}40`, color: cfg.color } : {}}
                  >
                    <cfg.icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email" placeholder="usuario@grupoparis.com.ar"
              value={email} onChange={e => setEmail(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputCls + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mt-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button onClick={onClose} className="h-11 bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 font-bold uppercase text-sm rounded-xl transition-all">
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !email.trim() || password.length < 6}
            className="h-11 bg-[#054a9d] hover:bg-[#1558b8] disabled:opacity-40 text-white font-black uppercase text-sm rounded-xl transition-all"
          >
            {loading ? "Creando..." : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  )
}

export function SystemUsersManager({ users }: { users: SystemUser[] }) {
  const [showCreate, setShowCreate] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (userId: string, banned: boolean) => {
    startTransition(async () => {
      await toggleUserEnabled(userId, !banned)
    })
  }

  const handleDelete = (userId: string, email: string) => {
    if (!confirm(`¿Eliminar el usuario ${email}? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      await deleteSystemUser(userId)
    })
  }

  const handleRoleChange = (userId: string, role: "admin" | "callcenter") => {
    startTransition(async () => {
      await updateUserRole(userId, role)
    })
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 h-9 bg-[#054a9d]/15 hover:bg-[#054a9d]/25 border border-[#054a9d]/30 text-[#7ab0e8] font-black text-[11px] uppercase tracking-wide rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Nuevo usuario
        </button>
      </div>

      {/* Lista */}
      <div className="bg-[#0b2440] border border-white/8 rounded-2xl overflow-hidden">
        {users.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-white/20 text-sm">No hay usuarios del sistema configurados</p>
          </div>
        ) : (
          <div className="divide-y divide-white/4">
            {users.map(u => {
              const roleCfg = ROLE_CONFIG[u.role]
              return (
                <div key={u.user_id} className={`flex items-center gap-4 px-6 py-4 ${u.banned ? "opacity-50" : ""}`}>

                  {/* Ícono de rol */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${roleCfg.color}12`, border: `1px solid ${roleCfg.color}25` }}
                  >
                    <roleCfg.icon className="w-4 h-4" style={{ color: roleCfg.color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 font-bold text-sm truncate">{u.email}</p>
                    <p className="text-white/25 text-[11px] font-medium mt-0.5">
                      {u.last_sign_in
                        ? `Último acceso: ${new Date(u.last_sign_in).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}`
                        : "Sin acceso registrado"
                      }
                    </p>
                  </div>

                  {/* Selector de rol */}
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.user_id, e.target.value as "admin" | "callcenter")}
                    disabled={isPending}
                    className="h-8 px-2 bg-white/4 border border-white/8 rounded-lg text-white/60 text-[11px] font-bold uppercase cursor-pointer hover:bg-white/8 transition-all disabled:opacity-50 focus:outline-none"
                    style={{ color: roleCfg.color }}
                  >
                    <option value="admin">Administrador</option>
                    <option value="callcenter">Call Center</option>
                  </select>

                  {/* Estado badge */}
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg shrink-0 ${
                    u.banned
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {u.banned ? "Deshabilitado" : "Activo"}
                  </span>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggle(u.user_id, u.banned)}
                      disabled={isPending}
                      title={u.banned ? "Habilitar usuario" : "Deshabilitar usuario"}
                      className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${
                        u.banned
                          ? "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10"
                          : "text-orange-400/60 hover:text-orange-400 hover:bg-orange-500/10"
                      }`}
                    >
                      {u.banned ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(u.user_id, u.email)}
                      disabled={isPending}
                      title="Eliminar usuario"
                      className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
