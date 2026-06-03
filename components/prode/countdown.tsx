"use client"

import { useEffect, useState } from "react"

interface TimeLeft {
  days: number; hours: number; minutes: number; seconds: number
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Primer partido: 11 Jun 2026 16:00 Ciudad de México (UTC-6) = 22:00 UTC
    const target = new Date("2026-06-11T22:00:00Z").getTime()
    const tick = () => {
      const diff = target - Date.now()
      if (diff > 0) setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const units = [
    { value: timeLeft.days,    label: "Días"  },
    { value: timeLeft.hours,   label: "Horas" },
    { value: timeLeft.minutes, label: "Min"   },
    { value: timeLeft.seconds, label: "Seg"   },
  ]
  const display = (v: number) => mounted ? String(v).padStart(2, "0") : "--"

  return (
    <div className="inline-flex items-end gap-1.5 md:gap-3">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-end gap-1.5 md:gap-3">

          {/* Bloque de tiempo */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="relative bg-black/40 backdrop-blur-md border border-white/12
                         rounded-lg overflow-hidden text-center
                         w-14.5 h-13
                         md:w-20 md:h-17.5
                         flex items-center justify-center"
            >
              {/* Línea dorada superior */}
              <div className="absolute top-0 left-2 right-2 h-px bg-linear-to-r from-transparent via-[#c3871e]/60 to-transparent" />

              <span
                className="font-black tabular-nums leading-none text-[1.9rem] md:text-[2.8rem]"
                style={{ background: "linear-gradient(135deg, #e8a832 0%, #c3871e 50%, #9a6815 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'ChevySans', sans-serif" }}
              >
                {display(unit.value)}
              </span>
            </div>

            <span
              className="text-white/35 text-[8px] md:text-[9px] uppercase tracking-[0.25em] font-bold"
              style={{ fontFamily: "'ChevySans', sans-serif" }}
            >
              {unit.label}
            </span>
          </div>

          {/* Separador */}
          {i < units.length - 1 && (
            <span
              className="text-[#c3871e]/40 font-black text-xl md:text-3xl leading-none mb-6 md:mb-8 animate-pulse select-none"
              style={{ fontFamily: "'ChevySans', sans-serif" }}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
