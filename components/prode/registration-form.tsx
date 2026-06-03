"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import HCaptcha from "@hcaptcha/react-hcaptcha"
import { registerParticipant } from "@/lib/actions/register"

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? ""

interface Props { onClose?: () => void }

const inputCls = `
  w-full px-4 py-3 rounded-xl text-white text-sm font-medium
  bg-[#06192c] border border-white/10
  placeholder:text-white/20
  focus:outline-none focus:border-[#054a9d] focus:ring-2 focus:ring-[#054a9d]/20
  transition-all
`

const labelCls = "block text-white/50 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5"

type Step = 1 | 2

export function RegistrationForm({ onClose }: Props) {
  const router = useRouter()
  const [step, setStep]           = useState<Step>(1)
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState("")
  const [showPass, setShowPass]   = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<HCaptcha>(null)

  const [form, setForm] = useState({
    first_name:        "",
    last_name:         "",
    dni:               "",
    phone:             "",
    email:             "",
    password:          "",
    license_plate:     "",
    car_brand:         "",
    car_model:         "",
    city:              "",
    accepts_terms:     false,
    accepts_marketing: false,
  })

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  const step1Valid =
    form.first_name.trim().length > 1 &&
    form.last_name.trim().length > 1 &&
    form.dni.replace(/\D/g, "").length >= 7 &&
    form.phone.trim().length >= 8 &&
    form.email.includes("@") &&
    form.password.length >= 8

  const step2Valid =
    form.license_plate.trim().length >= 6 &&
    form.car_brand.trim().length > 0 &&
    form.car_model.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.accepts_terms

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      if (!step1Valid) return
      setStep(2)
      return
    }
    if (!step2Valid) return
    if (HCAPTCHA_SITE_KEY && !captchaToken) {
      setError("Por favor completá el captcha para continuar.")
      return
    }
    setLoading(true)
    setError("")
    const result = await registerParticipant(form, captchaToken ?? undefined)
    if (result.ok) {
      setDone(true)
    } else {
      setError(result.error)
      captchaRef.current?.resetCaptcha()
      setCaptchaToken(null)
    }
    setLoading(false)
  }

  if (done) return (
    <div className="text-center py-6">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-white font-black uppercase text-2xl mb-2" style={{ fontFamily: "'ChevySans', sans-serif" }}>
        ¡Estás dentro!
      </h3>
      <p className="text-white/45 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
        Tu registro fue realizado correctamente. Ya podés comenzar a cargar tus pronósticos.
      </p>
      <button
        onClick={() => { onClose?.(); window.location.href = "/dashboard" }}
        className="bg-[#054a9d] hover:bg-[#1558b8] text-white font-black uppercase tracking-wide px-8 h-11 rounded-xl text-sm transition-colors"
        style={{ fontFamily: "'ChevySans', sans-serif" }}
      >
        Ir al Panel
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">

      {/* Indicador de paso */}
      <div className="flex items-center gap-2 mb-2">
        {([1, 2] as Step[]).map(s => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                step >= s
                  ? "bg-[#054a9d] text-white"
                  : "bg-white/8 text-white/25"
              }`}
            >
              {s}
            </div>
            {s < 2 && <div className={`flex-1 h-px w-8 ${step > s ? "bg-[#054a9d]" : "bg-white/10"}`} />}
          </div>
        ))}
        <span className="text-white/25 text-[11px] ml-1">
          {step === 1 ? "Datos personales" : "Tu vehículo"}
        </span>
      </div>

      {step === 1 && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nombre</label>
              <input type="text" required placeholder="Juan"
                value={form.first_name} onChange={e => set("first_name", e.target.value)}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Apellido</label>
              <input type="text" required placeholder="Pérez"
                value={form.last_name} onChange={e => set("last_name", e.target.value)}
                className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>DNI</label>
              <input type="text" required placeholder="12345678"
                value={form.dni} onChange={e => set("dni", e.target.value)}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Celular</label>
              <input type="tel" required placeholder="+54 264 ..."
                value={form.phone} onChange={e => set("phone", e.target.value)}
                className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Correo electrónico</label>
            <input type="email" required placeholder="tu@email.com"
              value={form.email} onChange={e => set("email", e.target.value)}
              className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                value={form.password}
                onChange={e => set("password", e.target.value)}
                className={inputCls + " pr-11"}
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

          <button
            type="submit"
            disabled={!step1Valid}
            className="group w-full h-12 bg-[#054a9d] hover:bg-[#1558b8] disabled:opacity-40 disabled:cursor-not-allowed
                       text-white font-black uppercase tracking-wide rounded-xl text-sm
                       flex items-center justify-center gap-2 transition-all"
            style={{ fontFamily: "'ChevySans', sans-serif" }}
          >
            Continuar
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Patente</label>
              <input type="text" required placeholder="AA123BB"
                value={form.license_plate}
                onChange={e => set("license_plate", e.target.value.toUpperCase())}
                className={inputCls + " uppercase"} />
            </div>
            <div>
              <label className={labelCls}>Localidad</label>
              <input type="text" required placeholder="San Juan"
                value={form.city} onChange={e => set("city", e.target.value)}
                className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Marca</label>
              <input type="text" required placeholder="Chevrolet"
                value={form.car_brand} onChange={e => set("car_brand", e.target.value)}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Modelo</label>
              <input type="text" required placeholder="Tracker"
                value={form.car_model} onChange={e => set("car_model", e.target.value)}
                className={inputCls} />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required
                checked={form.accepts_terms}
                onChange={e => set("accepts_terms", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#06192c] accent-[#054a9d] cursor-pointer shrink-0"
              />
              <span className="text-white/35 text-xs leading-relaxed">
                Acepto las{" "}
                <a href="/bases" target="_blank" className="text-[#7ab0e8] hover:text-white transition-colors underline underline-offset-2">
                  Bases y Condiciones
                </a>
                {" "}y los{" "}
                <a href="/terminos" target="_blank" className="text-[#7ab0e8] hover:text-white transition-colors underline underline-offset-2">
                  Términos y Condiciones
                </a>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox"
                checked={form.accepts_marketing}
                onChange={e => set("accepts_marketing", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#06192c] accent-[#054a9d] cursor-pointer shrink-0"
              />
              <span className="text-white/35 text-xs leading-relaxed">
                Acepto recibir comunicaciones comerciales de Chevrolet Grupo Paris
              </span>
            </label>
          </div>

          {/* hCaptcha — solo renderiza si la site key está configurada */}
          {HCAPTCHA_SITE_KEY && (
            <div className="flex justify-center pt-1">
              <HCaptcha
                ref={captchaRef}
                sitekey={HCAPTCHA_SITE_KEY}
                onVerify={token => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
                theme="dark"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-xs font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => { setStep(1); setError("") }}
              className="h-12 bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white
                         font-bold uppercase tracking-wide rounded-xl text-sm transition-all"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={loading || !step2Valid || (!!HCAPTCHA_SITE_KEY && !captchaToken)}
              className="group h-12 bg-[#054a9d] hover:bg-[#1558b8] disabled:opacity-40 disabled:cursor-not-allowed
                         text-white font-black uppercase tracking-wide rounded-xl text-sm
                         flex items-center justify-center gap-2 transition-all"
              style={{ fontFamily: "'ChevySans', sans-serif" }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Registrando...
                </>
              ) : (
                <>
                  Registrarme
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </form>
  )
}
