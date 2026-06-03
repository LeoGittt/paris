"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { logAccess } from "@/lib/actions/log-access"

const inputCls = `
  w-full px-4 py-3 rounded-xl text-white text-sm font-medium
  bg-[#06192c] border border-white/10
  placeholder:text-white/20
  focus:outline-none focus:border-[#054a9d] focus:ring-2 focus:ring-[#054a9d]/20
  transition-all
`
const labelCls = "block text-white/50 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5"

type LoginMode = "email" | "dni"

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get("redirectTo") ?? "/dashboard"

  const [mode, setMode]       = useState<LoginMode>("email")
  const [email, setEmail]     = useState("")
  const [dni, setDni]         = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  const [showForgot,   setShowForgot]   = useState(false)
  const [forgotEmail,  setForgotEmail]  = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError,  setForgotError]  = useState("")
  const [forgotSent,   setForgotSent]   = useState(false)

  const supabase = createClient()

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotError("")
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    if (error) {
      setForgotError("Error al enviar el email. Intentá de nuevo más tarde.")
    } else {
      setForgotSent(true)
    }
    setForgotLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    let loginEmail = email

    // Si el modo es DNI, buscar el email asociado
    if (mode === "dni") {
      const { data: participant } = await supabase
        .from("participants")
        .select("email")
        .eq("dni", dni.replace(/\D/g, ""))
        .single() as { data: { email: string } | null }

      if (!participant) {
        setError("No encontramos un usuario con ese DNI.")
        setLoading(false)
        return
      }
      loginEmail = participant.email
    }

    const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    })

    if (authError) {
      setError("Email, DNI o contraseña incorrectos.")
      setLoading(false)
      return
    }

    // Redirigir según rol
    if (signInData.user) {
      // Registro de acceso para métricas (fire-and-forget)
      logAccess(signInData.user.id)

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", signInData.user.id)
        .single() as { data: { role: string } | null }

      const role = roleData?.role
      if (role === "admin") {
        router.push("/admin")
      } else if (role === "callcenter") {
        router.push("/callcenter")
      } else {
        router.push(redirectTo)
      }
    } else {
      router.push(redirectTo)
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#06192c] flex flex-col items-center justify-center px-5"
         style={{ fontFamily: "'ChevySans', sans-serif" }}>

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full bg-[#054a9d]/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-4" style={{ width: 100, height: 42 }}>
            <Image src="/bowtie.png" alt="Chevrolet" fill className="object-contain" style={{ mixBlendMode: "screen" }} />
          </div>
          <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.3em]">GRUPO PARIS</p>
          <h1 className="text-white font-black uppercase text-3xl mt-1">PRODE 2026</h1>
        </div>

        {/* Card */}
        <div className="bg-[#0b2440] border border-white/8 rounded-2xl p-7 shadow-2xl">
          <div className="absolute top-0 left-10 right-10 h-px bg-linear-to-r from-transparent via-[#c3871e]/50 to-transparent -translate-y-px" />

          <h2 className="text-white font-black uppercase text-xl mb-1">Ingresar</h2>
          <p className="text-white/35 text-sm font-medium mb-6">Accedé a tu panel de pronósticos</p>

          {/* Toggle Email / DNI */}
          <div className="flex bg-[#06192c] rounded-xl p-1 mb-5">
            {(["email", "dni"] as LoginMode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError("") }}
                className={`flex-1 py-2 rounded-lg text-[12px] font-black uppercase tracking-wide transition-all ${
                  mode === m
                    ? "bg-[#054a9d] text-white shadow-lg shadow-[#054a9d]/30"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {m === "email" ? "Con Email" : "Con DNI"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "email" ? (
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" required placeholder="tu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className={inputCls} autoComplete="email" />
              </div>
            ) : (
              <div>
                <label className={labelCls}>DNI</label>
                <input type="text" required placeholder="12345678"
                  value={dni} onChange={e => setDni(e.target.value)}
                  className={inputCls} autoComplete="off" />
              </div>
            )}

            <div>
              <label className={labelCls}>Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputCls + " pr-11"}
                  autoComplete="current-password"
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

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-xs font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full h-12 bg-[#054a9d] hover:bg-[#1558b8] disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-black uppercase tracking-wide rounded-xl text-sm
                         flex items-center justify-center gap-2 transition-all mt-2
                         shadow-lg shadow-[#054a9d]/30"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex flex-col items-center gap-3 mt-6">
          <button
            onClick={() => setShowForgot(true)}
            className="text-white/30 hover:text-white/60 text-sm font-medium transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
          <p className="text-white/25 text-sm font-medium">
            ¿No tenés cuenta?{" "}
            <a href="/" className="text-[#7ab0e8] hover:text-white transition-colors font-bold">
              Registrate gratis
            </a>
          </p>
        </div>

        {/* Modal recuperar contraseña */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForgot(false)} />
            <div className="relative bg-[#0b2440] border border-white/10 rounded-2xl p-7 w-full max-w-sm shadow-2xl">
              <h3 className="text-white font-black uppercase text-lg mb-1">Recuperar contraseña</h3>
              <p className="text-white/35 text-sm mb-5">Te enviamos un link a tu email</p>

              {forgotSent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white font-bold text-sm">¡Email enviado!</p>
                  <p className="text-white/40 text-xs mt-1">Revisá tu casilla y seguí las instrucciones</p>
                  <button
                    onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail("") }}
                    className="mt-4 text-[#7ab0e8] text-sm font-bold hover:text-white transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="block text-white/50 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5">
                      Email
                    </label>
                    <input
                      type="email" required placeholder="tu@email.com"
                      value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  {forgotError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <p className="text-red-400 text-xs font-medium">{forgotError}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowForgot(false); setForgotError("") }}
                      className="h-11 bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 font-bold uppercase text-sm rounded-xl transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="h-11 bg-[#054a9d] hover:bg-[#1558b8] disabled:opacity-50 text-white font-black uppercase text-sm rounded-xl transition-all"
                    >
                      {forgotLoading ? "Enviando..." : "Enviar"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
