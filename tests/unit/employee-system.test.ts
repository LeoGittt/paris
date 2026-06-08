import { describe, it, expect } from "vitest"

// ─── Tests del sistema de empleados Paris ────────────────────────────────────
// Cubre:
//  1. Detección de email de empleado (patrón empleadoparis@{dni}.com)
//  2. Validación de archivo de avatar
//  3. Sistema de trofeos (getTrophies)
//  4. Función de iniciales
//  5. Ranking de empleados — ordenamiento y posiciones
//  6. Proxy: protección de rutas /empleados
//  7. Registro: is_employee se establece correctamente


// ─── Lógica extraída de lib/actions/register.ts ───────────────────────────────

const EMPLOYEE_EMAIL_PATTERN = /^empleadoparis@\d{7,8}\.com$/i

function isEmployeeEmail(email: string): boolean {
  return EMPLOYEE_EMAIL_PATTERN.test(email)
}

// Extrae el DNI del email de empleado
function extractDniFromEmail(email: string): string | null {
  const match = email.match(/^empleadoparis@(\d{7,8})\.com$/i)
  return match ? match[1] : null
}


// ─── Lógica extraída de lib/actions/employee.ts ───────────────────────────────

const MAX_AVATAR_SIZE   = 2 * 1024 * 1024  // 2 MB
const ALLOWED_TYPES     = ["image/jpeg", "image/png", "image/webp"]

type AvatarValidation = { ok: true } | { ok: false; error: string }

function validateAvatarFile(file: { size: number; type: string } | null): AvatarValidation {
  if (!file || file.size === 0)
    return { ok: false, error: "No se recibió ningún archivo." }
  if (file.size > MAX_AVATAR_SIZE)
    return { ok: false, error: "La imagen no puede superar los 2 MB." }
  if (!ALLOWED_TYPES.includes(file.type))
    return { ok: false, error: "Solo se aceptan imágenes JPG, PNG o WebP." }
  return { ok: true }
}

function buildAvatarPath(userId: string): string {
  return `${userId}/avatar`
}


// ─── Lógica extraída de components/empleados/employee-ranking-client.tsx ──────

interface EmployeeRow {
  participant_id: string
  first_name: string
  last_name: string
  total_points: number
  avatar_url: string | null
  correct_exact: number
  correct_winner: number
  correct_diff: number
  predictions_count: number
  ranking_position: number
}

interface Trophy {
  emoji: string
  label: string
  description: string
}

function getTrophies(row: EmployeeRow, all: EmployeeRow[]): Trophy[] {
  const trophies: Trophy[] = []

  if (row.ranking_position === 1)
    trophies.push({ emoji: "🥇", label: "Campeón Paris",  description: "1° lugar entre empleados" })
  if (row.ranking_position === 2)
    trophies.push({ emoji: "🥈", label: "Subcampeón",     description: "2° lugar entre empleados" })
  if (row.ranking_position === 3)
    trophies.push({ emoji: "🥉", label: "Top 3 Paris",    description: "3° lugar entre empleados" })

  const maxExact = Math.max(...all.map(r => r.correct_exact))
  if (maxExact > 0 && row.correct_exact === maxExact)
    trophies.push({ emoji: "🎯", label: "Francotirador",  description: "Más aciertos exactos" })

  const maxPreds = Math.max(...all.map(r => r.predictions_count))
  if (maxPreds > 0 && row.predictions_count === maxPreds)
    trophies.push({ emoji: "🔥", label: "El Más Activo",  description: "Más pronósticos cargados" })

  const maxWinner = Math.max(...all.map(r => r.correct_winner))
  if (maxWinner > 0 && row.correct_winner === maxWinner)
    trophies.push({ emoji: "💡", label: "Adivinador",     description: "Más resultados acertados" })

  trophies.push({ emoji: "⚽", label: "Prode Paris", description: "Empleado Grupo Paris 2026" })

  return trophies
}

function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

function makeEmployee(overrides: Partial<EmployeeRow> = {}): EmployeeRow {
  return {
    participant_id:   "uuid-default",
    first_name:       "Juan",
    last_name:        "Perez",
    total_points:     0,
    avatar_url:       null,
    correct_exact:    0,
    correct_winner:   0,
    correct_diff:     0,
    predictions_count: 0,
    ranking_position: 99,
    ...overrides,
  }
}


// =============================================================================
describe("isEmployeeEmail — detección de email de empleado Paris", () => {

  it("patrón válido con DNI de 8 dígitos", () => {
    expect(isEmployeeEmail("empleadoparis@12345678.com")).toBe(true)
  })

  it("patrón válido con DNI de 7 dígitos", () => {
    expect(isEmployeeEmail("empleadoparis@1234567.com")).toBe(true)
  })

  it("es case-insensitive — EMPLEADOPARIS funciona", () => {
    expect(isEmployeeEmail("EMPLEADOPARIS@12345678.COM")).toBe(true)
  })

  it("case-insensitive mixto", () => {
    expect(isEmployeeEmail("EmpleadoParis@12345678.com")).toBe(true)
  })

  it("email de cliente normal → NO es empleado", () => {
    expect(isEmployeeEmail("juan@gmail.com")).toBe(false)
  })

  it("email con nombre real → NO es empleado", () => {
    expect(isEmployeeEmail("juan.perez@grupoparis.com")).toBe(false)
  })

  it("DNI de 6 dígitos es inválido (mínimo 7)", () => {
    expect(isEmployeeEmail("empleadoparis@123456.com")).toBe(false)
  })

  it("DNI de 9 dígitos es inválido (máximo 8)", () => {
    expect(isEmployeeEmail("empleadoparis@123456789.com")).toBe(false)
  })

  it("sin DNI → inválido", () => {
    expect(isEmployeeEmail("empleadoparis@.com")).toBe(false)
  })

  it("letras en el DNI → inválido", () => {
    expect(isEmployeeEmail("empleadoparis@1234567a.com")).toBe(false)
  })

  it("dominio diferente a .com → inválido", () => {
    expect(isEmployeeEmail("empleadoparis@12345678.com.ar")).toBe(false)
    expect(isEmployeeEmail("empleadoparis@12345678.net")).toBe(false)
  })

  it("texto adicional antes de empleadoparis → inválido", () => {
    expect(isEmployeeEmail("xempleadoparis@12345678.com")).toBe(false)
  })

  it("email vacío → inválido", () => {
    expect(isEmployeeEmail("")).toBe(false)
  })
})


// =============================================================================
describe("extractDniFromEmail — extracción del DNI del email", () => {

  it("extrae el DNI de 8 dígitos correctamente", () => {
    expect(extractDniFromEmail("empleadoparis@12345678.com")).toBe("12345678")
  })

  it("extrae el DNI de 7 dígitos correctamente", () => {
    expect(extractDniFromEmail("empleadoparis@1234567.com")).toBe("1234567")
  })

  it("email inválido devuelve null", () => {
    expect(extractDniFromEmail("juan@gmail.com")).toBeNull()
  })

  it("el DNI extraído es solo dígitos", () => {
    const dni = extractDniFromEmail("empleadoparis@99887766.com")
    expect(dni).not.toBeNull()
    expect(/^\d+$/.test(dni!)).toBe(true)
  })
})


// =============================================================================
describe("validateAvatarFile — validación de archivo de avatar", () => {

  const validJpeg = { size: 500_000,           type: "image/jpeg" }
  const validPng  = { size: 1_000_000,          type: "image/png"  }
  const validWebp = { size: 200_000,            type: "image/webp" }

  it("JPEG de 500KB es válido", () => {
    expect(validateAvatarFile(validJpeg).ok).toBe(true)
  })

  it("PNG de 1MB es válido", () => {
    expect(validateAvatarFile(validPng).ok).toBe(true)
  })

  it("WebP es válido", () => {
    expect(validateAvatarFile(validWebp).ok).toBe(true)
  })

  it("exactamente 2MB es válido (límite exacto)", () => {
    expect(validateAvatarFile({ size: 2 * 1024 * 1024, type: "image/jpeg" }).ok).toBe(true)
  })

  it("2MB + 1 byte es inválido", () => {
    const r = validateAvatarFile({ size: 2 * 1024 * 1024 + 1, type: "image/jpeg" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain("2 MB")
  })

  it("archivo de 10MB es inválido", () => {
    expect(validateAvatarFile({ size: 10 * 1024 * 1024, type: "image/jpeg" }).ok).toBe(false)
  })

  it("GIF no está permitido", () => {
    const r = validateAvatarFile({ size: 500_000, type: "image/gif" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain("JPG, PNG o WebP")
  })

  it("PDF no está permitido", () => {
    expect(validateAvatarFile({ size: 500_000, type: "application/pdf" }).ok).toBe(false)
  })

  it("SVG no está permitido", () => {
    expect(validateAvatarFile({ size: 500_000, type: "image/svg+xml" }).ok).toBe(false)
  })

  it("archivo null → error", () => {
    const r = validateAvatarFile(null)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain("ningún archivo")
  })

  it("archivo de 0 bytes → error", () => {
    expect(validateAvatarFile({ size: 0, type: "image/jpeg" }).ok).toBe(false)
  })

  it("solo acepta exactamente los 3 tipos permitidos", () => {
    expect(ALLOWED_TYPES).toHaveLength(3)
    expect(ALLOWED_TYPES).toContain("image/jpeg")
    expect(ALLOWED_TYPES).toContain("image/png")
    expect(ALLOWED_TYPES).toContain("image/webp")
  })
})


// =============================================================================
describe("buildAvatarPath — ruta de storage del avatar", () => {

  it("construye el path con userId/avatar", () => {
    expect(buildAvatarPath("abc-123")).toBe("abc-123/avatar")
  })

  it("cada usuario tiene su propia carpeta (no comparte path)", () => {
    const p1 = buildAvatarPath("user-1")
    const p2 = buildAvatarPath("user-2")
    expect(p1).not.toBe(p2)
  })

  it("el path termina siempre en /avatar", () => {
    const userId = "550e8400-e29b-41d4-a716-446655440000"
    expect(buildAvatarPath(userId)).toMatch(/\/avatar$/)
  })
})


// =============================================================================
describe("initials — función de iniciales", () => {

  it("Juan Perez → JP", () => {
    expect(initials("Juan", "Perez")).toBe("JP")
  })

  it("maria gomez → MG (convierte a mayúsculas)", () => {
    expect(initials("maria", "gomez")).toBe("MG")
  })

  it("nombre con acento → inicial correcta", () => {
    expect(initials("José", "García")).toBe("JG")
  })

  it("cadena vacía primer nombre → solo segunda inicial", () => {
    expect(initials("", "Perez")).toBe("P")
  })

  it("cadena vacía segundo nombre → solo primera inicial", () => {
    expect(initials("Juan", "")).toBe("J")
  })

  it("ambas cadenas vacías → cadena vacía", () => {
    expect(initials("", "")).toBe("")
  })

  it("siempre en mayúsculas sin importar el input", () => {
    const result = initials("ana", "torres")
    expect(result).toBe(result.toUpperCase())
  })
})


// =============================================================================
describe("getTrophies — sistema de trofeos", () => {

  const baseAll = [
    makeEmployee({ participant_id: "p1", ranking_position: 1, total_points: 100, correct_exact: 8, correct_winner: 5, predictions_count: 20 }),
    makeEmployee({ participant_id: "p2", ranking_position: 2, total_points:  80, correct_exact: 5, correct_winner: 8, predictions_count: 25 }),
    makeEmployee({ participant_id: "p3", ranking_position: 3, total_points:  60, correct_exact: 3, correct_winner: 3, predictions_count: 30 }),
    makeEmployee({ participant_id: "p4", ranking_position: 4, total_points:  40, correct_exact: 1, correct_winner: 2, predictions_count: 10 }),
  ]

  // ── Trofeos de posición ───────────────────────────────────────────────────────
  it("posición 1 → trofeo 🥇 Campeón Paris", () => {
    const t = getTrophies(baseAll[0], baseAll)
    expect(t.some(x => x.emoji === "🥇")).toBe(true)
    expect(t.some(x => x.label === "Campeón Paris")).toBe(true)
  })

  it("posición 2 → trofeo 🥈 Subcampeón", () => {
    const t = getTrophies(baseAll[1], baseAll)
    expect(t.some(x => x.emoji === "🥈")).toBe(true)
  })

  it("posición 3 → trofeo 🥉 Top 3 Paris", () => {
    const t = getTrophies(baseAll[2], baseAll)
    expect(t.some(x => x.emoji === "🥉")).toBe(true)
  })

  it("posición 4+ → NO tiene trofeos de posición", () => {
    const t = getTrophies(baseAll[3], baseAll)
    expect(t.some(x => ["🥇","🥈","🥉"].includes(x.emoji))).toBe(false)
  })

  it("posición 1 NO tiene 🥈 ni 🥉", () => {
    const t = getTrophies(baseAll[0], baseAll)
    expect(t.some(x => x.emoji === "🥈")).toBe(false)
    expect(t.some(x => x.emoji === "🥉")).toBe(false)
  })

  // ── Trofeo Francotirador ──────────────────────────────────────────────────────
  it("más correct_exact → trofeo 🎯 Francotirador", () => {
    const t = getTrophies(baseAll[0], baseAll) // p1 tiene 8 exact (máximo)
    expect(t.some(x => x.emoji === "🎯")).toBe(true)
  })

  it("sin ser el máximo exact → NO tiene 🎯", () => {
    const t = getTrophies(baseAll[1], baseAll) // p2 tiene 5 exact
    expect(t.some(x => x.emoji === "🎯")).toBe(false)
  })

  it("cuando todos tienen exact=0 → nadie recibe 🎯 (maxExact > 0 guard)", () => {
    const noExact = baseAll.map(r => ({ ...r, correct_exact: 0 }))
    const t = getTrophies(noExact[0], noExact)
    expect(t.some(x => x.emoji === "🎯")).toBe(false)
  })

  // ── Trofeo El Más Activo ───────────────────────────────────────────────────────
  it("más predictions_count → trofeo 🔥 El Más Activo", () => {
    const t = getTrophies(baseAll[2], baseAll) // p3 tiene 30 predicciones (máximo)
    expect(t.some(x => x.emoji === "🔥")).toBe(true)
  })

  it("sin ser el más activo → NO tiene 🔥", () => {
    const t = getTrophies(baseAll[3], baseAll) // p4 tiene 10 predicciones
    expect(t.some(x => x.emoji === "🔥")).toBe(false)
  })

  it("cuando todos tienen 0 predicciones → nadie recibe 🔥", () => {
    const noPreds = baseAll.map(r => ({ ...r, predictions_count: 0 }))
    const t = getTrophies(noPreds[0], noPreds)
    expect(t.some(x => x.emoji === "🔥")).toBe(false)
  })

  // ── Trofeo Adivinador ─────────────────────────────────────────────────────────
  it("más correct_winner → trofeo 💡 Adivinador", () => {
    const t = getTrophies(baseAll[1], baseAll) // p2 tiene 8 winners (máximo)
    expect(t.some(x => x.emoji === "💡")).toBe(true)
  })

  it("sin ser el mayor winner → NO tiene 💡", () => {
    const t = getTrophies(baseAll[0], baseAll) // p1 tiene 5 winners
    expect(t.some(x => x.emoji === "💡")).toBe(false)
  })

  // ── Trofeo de participación ───────────────────────────────────────────────────
  it("todos los empleados tienen ⚽ Prode Paris (trofeo de participación)", () => {
    baseAll.forEach(row => {
      const t = getTrophies(row, baseAll)
      expect(t.some(x => x.emoji === "⚽")).toBe(true)
    })
  })

  it("⚽ siempre es el último trofeo", () => {
    const t = getTrophies(baseAll[0], baseAll)
    expect(t[t.length - 1].emoji).toBe("⚽")
  })

  // ── Empates en estadísticas ───────────────────────────────────────────────────
  it("si dos empleados empatan en exact → AMBOS reciben 🎯", () => {
    const tied = [
      makeEmployee({ participant_id: "a", ranking_position: 1, correct_exact: 5 }),
      makeEmployee({ participant_id: "b", ranking_position: 2, correct_exact: 5 }),
    ]
    expect(getTrophies(tied[0], tied).some(x => x.emoji === "🎯")).toBe(true)
    expect(getTrophies(tied[1], tied).some(x => x.emoji === "🎯")).toBe(true)
  })

  // ── Un solo empleado ──────────────────────────────────────────────────────────
  it("único empleado recibe 🥇 + trofeos de liderazgo + ⚽", () => {
    const solo = [makeEmployee({
      ranking_position: 1, correct_exact: 5, correct_winner: 3, predictions_count: 10
    })]
    const t = getTrophies(solo[0], solo)
    expect(t.some(x => x.emoji === "🥇")).toBe(true)
    expect(t.some(x => x.emoji === "🎯")).toBe(true)
    expect(t.some(x => x.emoji === "🔥")).toBe(true)
    expect(t.some(x => x.emoji === "💡")).toBe(true)
    expect(t.some(x => x.emoji === "⚽")).toBe(true)
  })

  it("lista vacía de empleados → solo ⚽ para cualquier row", () => {
    const row = makeEmployee({ ranking_position: 1 })
    // Math.max(...[]) = -Infinity → ningún trofeo de stat se asigna
    const t = getTrophies(row, [])
    expect(t).toHaveLength(2) // 🥇 + ⚽
  })

  // ── Conteo mínimo de trofeos ──────────────────────────────────────────────────
  it("todo empleado tiene al menos 1 trofeo (⚽ garantizado)", () => {
    const noStats = makeEmployee({ ranking_position: 10, correct_exact: 0, correct_winner: 0, predictions_count: 0 })
    const all     = [noStats]
    const t       = getTrophies(noStats, all)
    expect(t.length).toBeGreaterThanOrEqual(1)
  })
})


// =============================================================================
describe("Proxy: protección de rutas /empleados", () => {

  const EMP_PATHS = ["/empleados"]

  function isEmpleadoPath(pathname: string): boolean {
    return EMP_PATHS.some(p => pathname.startsWith(p))
  }

  function requiresAuthRedirect(pathname: string, isAuthenticated: boolean): boolean {
    return !isAuthenticated && isEmpleadoPath(pathname)
  }

  it("/empleados requiere autenticación", () => {
    expect(requiresAuthRedirect("/empleados", false)).toBe(true)
  })

  it("/empleados/ranking requiere autenticación", () => {
    expect(requiresAuthRedirect("/empleados/ranking", false)).toBe(true)
  })

  it("usuario autenticado en /empleados → no redirige (el layout verifica is_employee)", () => {
    expect(requiresAuthRedirect("/empleados", true)).toBe(false)
  })

  it("/dashboard no es una ruta de empleados", () => {
    expect(isEmpleadoPath("/dashboard")).toBe(false)
  })

  it("/admin no es una ruta de empleados", () => {
    expect(isEmpleadoPath("/admin")).toBe(false)
  })
})


// =============================================================================
describe("Registro: is_employee se establece según el email", () => {

  // Simula la lógica de register.ts
  function buildParticipantRow(email: string) {
    return {
      email,
      is_employee: isEmployeeEmail(email),
    }
  }

  it("email de empleado → is_employee: true", () => {
    const row = buildParticipantRow("empleadoparis@12345678.com")
    expect(row.is_employee).toBe(true)
  })

  it("email de cliente → is_employee: false", () => {
    const row = buildParticipantRow("juan@gmail.com")
    expect(row.is_employee).toBe(false)
  })

  it("email de empleado con DNI de 7 → is_employee: true", () => {
    const row = buildParticipantRow("empleadoparis@1234567.com")
    expect(row.is_employee).toBe(true)
  })

  it("email case-insensitive → is_employee: true", () => {
    expect(buildParticipantRow("EMPLEADOPARIS@12345678.COM").is_employee).toBe(true)
  })

  it("dominio incorrecto → is_employee: false (no .com.ar)", () => {
    expect(buildParticipantRow("empleadoparis@12345678.com.ar").is_employee).toBe(false)
  })

  it("el campo is_employee siempre es boolean (nunca undefined)", () => {
    const row = buildParticipantRow("cualquier@email.com")
    expect(typeof row.is_employee).toBe("boolean")
  })
})


// =============================================================================
describe("Employee ranking — ordenamiento y posiciones", () => {

  function buildRanking(employees: { id: string; points: number }[]): EmployeeRow[] {
    return employees
      .sort((a, b) => b.points - a.points)
      .map((e, i) => makeEmployee({
        participant_id: e.id,
        total_points: e.points,
        ranking_position: i + 1,
      }))
  }

  it("el empleado con más puntos es posición 1", () => {
    const ranking = buildRanking([
      { id: "a", points: 50 },
      { id: "b", points: 100 },
      { id: "c", points: 30 },
    ])
    expect(ranking[0].participant_id).toBe("b")
    expect(ranking[0].ranking_position).toBe(1)
  })

  it("el ranking es estrictamente descendente en puntos", () => {
    const ranking = buildRanking([
      { id: "a", points: 80 },
      { id: "b", points: 60 },
      { id: "c", points: 40 },
    ])
    for (let i = 1; i < ranking.length; i++) {
      expect(ranking[i - 1].total_points).toBeGreaterThanOrEqual(ranking[i].total_points)
    }
  })

  it("posiciones son consecutivas comenzando en 1", () => {
    const ranking = buildRanking([
      { id: "a", points: 50 },
      { id: "b", points: 40 },
      { id: "c", points: 30 },
    ])
    ranking.forEach((row, i) => {
      expect(row.ranking_position).toBe(i + 1)
    })
  })

  it("un solo empleado tiene posición 1", () => {
    const ranking = buildRanking([{ id: "solo", points: 100 }])
    expect(ranking[0].ranking_position).toBe(1)
  })

  it("sin empleados → ranking vacío", () => {
    expect(buildRanking([])).toHaveLength(0)
  })

  it("top 3 son los primeros 3 elementos del ranking", () => {
    const ranking = buildRanking([
      { id: "a", points: 100 },
      { id: "b", points: 80 },
      { id: "c", points: 60 },
      { id: "d", points: 40 },
      { id: "e", points: 20 },
    ])
    const top3 = ranking.filter(r => r.ranking_position <= 3)
    expect(top3).toHaveLength(3)
    expect(top3.map(r => r.ranking_position).sort()).toEqual([1, 2, 3])
  })
})
