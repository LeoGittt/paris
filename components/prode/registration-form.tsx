"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

interface Props { onClose?: () => void }

const inputCls = `
  w-full px-4 py-3 rounded-xl text-white text-sm font-medium
  bg-[#06192c] border border-white/10
  placeholder:text-white/20
  focus:outline-none focus:border-[#054a9d] focus:ring-2 focus:ring-[#054a9d]/20
  transition-all
`

export function RegistrationForm({ onClose }: Props) {
  const [form, setForm]     = useState({ name: "", email: "", phone: "", dni: "", terms: false })
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    setDone(true)
    setLoading(false)
  }

  if (done) return (
    <div className="text-center py-6">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3
        className="text-white font-black uppercase text-2xl mb-2"
        style={{ fontFamily: "'ChevySans', sans-serif" }}
      >
        ¡Estás dentro!
      </h3>
      <p className="text-white/45 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
        Te enviamos un email con los próximos pasos para participar del Prode.
      </p>
      <button
        onClick={onClose}
        className="bg-[#054a9d] hover:bg-[#1558b8] text-white font-black uppercase tracking-wide px-8 h-11 rounded-xl text-sm transition-colors"
        style={{ fontFamily: "'ChevySans', sans-serif" }}
      >
        Continuar
      </button>
    </div>
  )

  return (
    <form onSubmit={onSubmit} className="space-y-3.5">

      {/* Nombre */}
      <div>
        <label className="block text-white/50 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5">
          Nombre completo
        </label>
        <input
          type="text" required placeholder="Tu nombre y apellido"
          value={form.name} onChange={e => set("name", e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-white/50 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5">
          Email
        </label>
        <input
          type="email" required placeholder="tu@email.com"
          value={form.email} onChange={e => set("email", e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Teléfono + DNI */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-white/50 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5">
            Teléfono
          </label>
          <input
            type="tel" required placeholder="+54 11 ..."
            value={form.phone} onChange={e => set("phone", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-white/50 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5">
            DNI
          </label>
          <input
            type="text" required placeholder="12345678"
            value={form.dni} onChange={e => set("dni", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-3 pt-1">
        <input
          type="checkbox" id="terms" required
          checked={form.terms} onChange={e => set("terms", e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#06192c] accent-[#054a9d] cursor-pointer"
        />
        <label htmlFor="terms" className="text-white/35 text-xs leading-relaxed cursor-pointer">
          Acepto los{" "}
          <a href="#" className="text-[#7ab0e8] hover:text-white transition-colors underline underline-offset-2">
            términos y condiciones
          </a>
          {" "}y la{" "}
          <a href="#" className="text-[#7ab0e8] hover:text-white transition-colors underline underline-offset-2">
            política de privacidad
          </a>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group w-full h-13 bg-[#054a9d] hover:bg-[#1558b8] disabled:opacity-60 disabled:cursor-not-allowed
                   text-white font-black uppercase tracking-wide rounded-xl text-sm
                   flex items-center justify-center gap-2
                   transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#054a9d]/30"
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
            Registrarme al Prode
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </button>
    </form>
  )
}
