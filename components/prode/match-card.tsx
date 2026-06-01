"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { countryCodeMap } from "@/lib/matches-data"

interface Team { name: string; code: string }
interface MatchCardProps {
  team1: Team; team2: Team
  date: string; time: string; stage: string
  disabled?: boolean
}

function Flag({ code, name }: { code: string; name: string }) {
  const iso = countryCodeMap[code] || code.toLowerCase()
  return (
    <div className="relative w-14 h-10 md:w-16 md:h-11 rounded-md overflow-hidden shadow-lg ring-1 ring-white/10">
      <Image
        src={`https://flagcdn.com/w160/${iso}.png`}
        alt={name}
        fill
        className="object-cover"
        sizes="64px"
      />
    </div>
  )
}

export function MatchCard({ team1, team2, date, time, stage, disabled = false }: MatchCardProps) {
  const [score1, setScore1] = useState("")
  const [score2, setScore2] = useState("")
  const done = score1 !== "" && score2 !== ""

  const onChange = (set: (v: string) => void, val: string) => {
    if (val === "" || (/^\d$/.test(val) && +val >= 0 && +val <= 9)) set(val)
  }

  const inputCls = cn(
    "relative w-11 h-13 md:w-13 md:h-14 text-center text-2xl font-black rounded-lg",
    "bg-[#06192c] border-2 text-white transition-all",
    "focus:outline-none focus:border-[#054a9d] focus:ring-2 focus:ring-[#054a9d]/30",
    "placeholder:text-white/15",
    disabled && "opacity-40 cursor-not-allowed"
  )

  return (
    <div className={cn(
      "group relative rounded-2xl transition-all duration-300 overflow-hidden",
      !disabled && "hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
    )}>
      {/* Card */}
      <div className="relative bg-[#0b2440] border border-white/8 group-hover:border-white/16 rounded-2xl overflow-hidden transition-colors">

        {/* Stage badge — top center */}
        <div className="flex justify-center pt-3.5 pb-0 px-4">
          <span
            className="text-[#7ab0e8] text-[10px] font-black uppercase tracking-[0.25em]"
            style={{ fontFamily: "'ChevySans', sans-serif" }}
          >
            {stage}
          </span>
        </div>

        {/* Date / time */}
        <div className="flex items-center justify-center gap-3 px-4 py-2">
          <span className="text-white/35 text-[10px] font-medium">{date}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-[#c3871e] text-[10px] font-bold">{time}</span>
        </div>

        {/* Separador */}
        <div className="h-px mx-4 bg-white/6" />

        {/* Match row */}
        <div className="flex items-center gap-2 px-4 py-5">

          {/* Team 1 */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <Flag code={team1.code} name={team1.name} />
            <span className="text-white font-black text-sm tracking-wide" style={{ fontFamily: "'ChevySans', sans-serif" }}>
              {team1.code}
            </span>
            <span className="text-white/35 text-[10px] font-medium text-center leading-tight">
              {team1.name}
            </span>
          </div>

          {/* Score inputs */}
          <div className="flex items-center gap-2 px-1">
            <input
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={score1}
              onChange={e => onChange(setScore1, e.target.value)}
              disabled={disabled}
              className={cn(inputCls, score1 !== "" ? "border-[#054a9d]" : "border-white/12")}
              placeholder="–"
            />
            <span className="text-white/25 text-xl font-black select-none">:</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={score2}
              onChange={e => onChange(setScore2, e.target.value)}
              disabled={disabled}
              className={cn(inputCls, score2 !== "" ? "border-[#054a9d]" : "border-white/12")}
              placeholder="–"
            />
          </div>

          {/* Team 2 */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <Flag code={team2.code} name={team2.name} />
            <span className="text-white font-black text-sm tracking-wide" style={{ fontFamily: "'ChevySans', sans-serif" }}>
              {team2.code}
            </span>
            <span className="text-white/35 text-[10px] font-medium text-center leading-tight">
              {team2.name}
            </span>
          </div>
        </div>

        {/* Done indicator */}
        {done && (
          <div className="mx-4 mb-4 flex items-center justify-center gap-2 bg-[#054a9d]/15 border border-[#054a9d]/30 rounded-xl py-2">
            <svg className="w-3.5 h-3.5 text-[#7ab0e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[#7ab0e8] text-[11px] font-black uppercase tracking-wider">
              Predicción guardada
            </span>
          </div>
        )}

        {/* Bottom accent line on hover */}
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-linear-to-r from-transparent via-[#054a9d]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  )
}
