import { describe, it, expect } from "vitest"

// ─── Tests de seguridad en exports CSV ───────────────────────────────────────

function escapeCell(v: unknown): string {
  const s = String(v ?? "")
  // Prevenir formula injection (CSV injection)
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  // Escapar comillas dobles (estándar RFC 4180)
  return `"${safe.replace(/"/g, '""')}"`
}

// ─────────────────────────────────────────────────────────────────
describe("Bug 18: CSV injection — fórmulas en nombres/emails", () => {
  // Si un campo empieza con =, +, -, @, Excel/Google Sheets lo ejecuta como fórmula.
  // Ejemplo: first_name = '=HYPERLINK("evil.com","click")' → link malicioso en export.

  it("nombres que empiezan con = son neutralizados con prefijo '", () => {
    const result = escapeCell("=HYPERLINK(\"evil.com\",\"click\")")
    // El prefijo ' neutraliza la fórmula — Excel lo trata como texto
    expect(result.startsWith(`"'=`)).toBe(true)
  })

  it("valores que empiezan con + son neutralizados", () => {
    expect(escapeCell("+cmd|'/C calc'!A0").startsWith(`"'+`)).toBe(true)
  })

  it("valores que empiezan con - son neutralizados", () => {
    expect(escapeCell("-2+3+cmd|'/C calc'!A0").startsWith(`"'-`)).toBe(true)
  })

  it("valores que empiezan con @ son neutralizados", () => {
    expect(escapeCell("@SUM(1+1)").startsWith(`"'@`)).toBe(true)
  })

  it("valores normales no se modifican", () => {
    expect(escapeCell("Juan")).toBe('"Juan"')
    expect(escapeCell("test@email.com")).toBe('"test@email.com"')
    expect(escapeCell(123)).toBe('"123"')
  })

  it("número positivo sin = no es afectado", () => {
    expect(escapeCell("5")).toBe('"5"')
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 19: CSV — comillas dobles no escapadas quiebran el parser", () => {
  // El export original: `"${v}"` — si v = O"Brien → "O"Brien" → CSV inválido
  // Fix: RFC 4180 — las " dentro de campos se escapan como ""

  it("comillas dobles dentro de un valor se escapan como \"\"", () => {
    expect(escapeCell(`O"Brien`)).toBe('"O""Brien"')
  })

  it("múltiples comillas se escapan todas", () => {
    expect(escapeCell(`He said "hello" and "bye"`)).toBe('"He said ""hello"" and ""bye"""')
  })

  it("valor sin comillas no cambia", () => {
    expect(escapeCell("Juan Perez")).toBe('"Juan Perez"')
  })

  it("valor vacío se representa como campo vacío", () => {
    expect(escapeCell("")).toBe('""')
    expect(escapeCell(null)).toBe('""')
    expect(escapeCell(undefined)).toBe('""')
  })

  it("combinación: comillas + formula injection → ambos resueltos", () => {
    const malicious = `="cmd /c calc"`
    const result = escapeCell(malicious)
    // Debe empezar con '= (fórmula neutralizada) Y las " escapadas
    expect(result).toBe(`"'=""cmd /c calc"""`)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 17: lock_started_matches — partidos no se bloquean automáticamente", () => {
  // La función existe en la DB pero nunca se llamaba desde ningún cron.
  // Fix: nuevo endpoint /api/cron/lock-matches + entrada en vercel.json

  it("vercel.json debe tener el cron de lock-matches cada minuto", async () => {
    const { readFileSync } = await import("fs")
    const vercel = JSON.parse(readFileSync("vercel.json", "utf-8"))
    const cronPaths = vercel.crons.map((c: { path: string }) => c.path)
    expect(cronPaths).toContain("/api/cron/lock-matches")

    const lockCron = vercel.crons.find((c: { path: string }) => c.path === "/api/cron/lock-matches")
    expect(lockCron.schedule).toBe("* * * * *") // cada minuto
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 21: ranking_position stale para participantes bloqueados", () => {
  // recalculate_points no reseteaba ranking_position de bloqueados.
  // Resultado: un participante bloqueado mostraba su última posición en su dashboard.

  it("lógica: participante bloqueado debe tener ranking_position null", () => {
    function calcRanking(participants: { id: string; total_points: number; is_blocked: boolean }[]) {
      // Resetear bloqueados
      const result = participants.map(p => ({ ...p, ranking_position: p.is_blocked ? null : (undefined as number | null | undefined) }))

      // Rankear solo los no bloqueados
      const active = result.filter(p => !p.is_blocked).sort((a, b) => b.total_points - a.total_points)
      active.forEach((p, i) => { p.ranking_position = i + 1 })

      return result
    }

    const input = [
      { id: "a", total_points: 30, is_blocked: false },
      { id: "b", total_points: 20, is_blocked: true },  // bloqueado
      { id: "c", total_points: 10, is_blocked: false },
    ]

    const output = calcRanking(input)
    const blocked = output.find(p => p.id === "b")
    expect(blocked?.ranking_position).toBeNull() // bloqueado = sin posición

    const active1 = output.find(p => p.id === "a")
    const active2 = output.find(p => p.id === "c")
    expect(active1?.ranking_position).toBe(1)
    expect(active2?.ranking_position).toBe(2)
  })
})
