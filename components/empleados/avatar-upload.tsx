"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"
import { Camera, Loader2, CheckCircle2 } from "lucide-react"
import { updateAvatar } from "@/lib/actions/employee"

interface Props {
  currentUrl: string | null
  initials: string
  size?: number
  ringColor?: string
}

export function AvatarUpload({ currentUrl, initials, size = 80, ringColor }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl]           = useState(currentUrl)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    setSuccess(false)

    const form = new FormData()
    form.append("avatar", file)

    startTransition(async () => {
      const result = await updateAvatar(form)
      if (result.ok) {
        setUrl(result.url)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      } else {
        setError(result.error)
      }
      if (inputRef.current) inputRef.current.value = ""
    })
  }

  const ring = ringColor ?? "rgba(5,74,157,0.6)"

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="relative group shrink-0 transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ width: size, height: size }}
        title="Cambiar foto de perfil"
      >
        {/* Ring exterior animado */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-300 group-hover:opacity-100 opacity-0"
          style={{
            boxShadow: `0 0 0 3px ${ring}, 0 0 20px ${ring}`,
          }}
        />

        {/* Avatar container */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden"
          style={{ border: `2px solid ${ring}` }}
        >
          {url ? (
            <Image src={url} alt={initials} fill className="object-cover" sizes={`${size}px`} />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(5,74,157,0.4) 0%, rgba(5,74,157,0.2) 100%)",
                fontSize: size * 0.32,
              }}
            >
              <span className="font-black text-[#7ab0e8] select-none">{initials}</span>
            </div>
          )}

          {/* Overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
              isPending ? "opacity-100 bg-black/60" : "opacity-0 bg-black/50 group-hover:opacity-100"
            }`}
          >
            {success
              ? <CheckCircle2 className="text-emerald-400" style={{ width: size * 0.35, height: size * 0.35 }} />
              : isPending
              ? <Loader2 className="text-white animate-spin" style={{ width: size * 0.3, height: size * 0.3 }} />
              : <Camera className="text-white" style={{ width: size * 0.3, height: size * 0.3 }} />
            }
          </div>
        </div>

        {/* Flash de éxito */}
        {success && (
          <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-emerald-400 pointer-events-none" />
        )}
      </button>

      {error && (
        <p className="text-red-400 text-[10px] font-medium text-center leading-tight" style={{ maxWidth: size + 16 }}>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
