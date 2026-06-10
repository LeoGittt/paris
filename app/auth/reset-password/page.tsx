"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const inputCls = `
  w-full px-4 py-3 rounded-xl text-white text-sm font-medium
  bg-[#06192c] border border-white/10
  placeholder:text-white/20
  focus:outline-none focus:border-[#054a9d] focus:ring-2 focus:ring-[#054a9d]/20
  transition-all
`

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password,  setPassword]  = useState("")
  const [password2, setPassword2] = useState("")
  const [showPass,  setShowPass]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState("")
  const [done,      setDone]      = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return }
    if (password !== password2) { setError("Las contraseñas no coinciden."); return }

    setLoading(true)
    setError("")

    const supabase = createClient()

    // Verificar que hay una sesión válida (debe venir del link de reset)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !session.user) {
      setError("Sesión expirada. Solicitá un nuevo enlace de reset.")
      setLoading(false)
      return
    }

    // Actualizar contraseña vía API (server-side, más confiable)
    const response = await fetch("/api/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    const result = await response.json()

    if (result.error || !response.ok) {
      // Traducir mensajes de error de Supabase
      const errorMap: Record<string, string> = {
        "New password should be different from the old password.": "La nueva contraseña debe ser diferente a la contraseña anterior.",
      }
      const message = errorMap[result.error] ?? result.error ?? "Error al cambiar la contraseña."
      setError(message)
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push("/login"), 2000)
  }

  if (done) return (
    <div className="min-h-screen bg-[#06192c] flex items-center justify-center px-5" style={{ fontFamily: "'ChevySans', sans-serif" }}>
      <div className="text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-white font-black uppercase text-2xl mb-2">¡Contraseña actualizada!</h2>
        <p className="text-white/40 text-sm">Redirigiendo al login...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#06192c] flex flex-col items-center justify-center px-5" style={{ fontFamily: "'ChevySans', sans-serif" }}>
      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4" style={{ width: 80, height: 34 }}>
            <Image src="/logo-paris.png" alt="Grupo Paris" fill className="object-contain" />
          </div>
          <h1 className="text-white font-black uppercase text-2xl">Nueva contraseña</h1>
          <p className="text-white/35 text-sm mt-1">Elegí una contraseña segura</p>
        </div>

        <div className="bg-[#0b2440] border border-white/8 rounded-2xl p-7 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/50 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputCls + " pr-11"}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5">
                Repetir contraseña
              </label>
              <input
                type={showPass ? "text" : "password"}
                required minLength={6}
                placeholder="Repetí la contraseña"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                className={inputCls}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-xs font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#054a9d] hover:bg-[#1558b8] disabled:opacity-50 text-white font-black uppercase tracking-wide rounded-xl text-sm transition-all shadow-lg shadow-[#054a9d]/30"
            >
              {loading ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
