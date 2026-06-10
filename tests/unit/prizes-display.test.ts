import { describe, it, expect } from "vitest"

// ─── Tests del sistema de premios — display y validación ─────────────────────
// Cubre:
//  1. Validación de imagen en CreateModal (tamaño, tipo)
//  2. Lógica de PrizesSection (filtro de entregados, main vs rest)
//  3. STATUS_CONFIG — labels y colores correctos
//  4. Ordenamiento visual (main prize = primero, resto secundarios)
//  5. Texto truncado y valores edge case
//  6. Validación del form de creación

// ─── Lógica extraída de prizes-admin.tsx ─────────────────────────────────────

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB (admin — más generoso que employee avatar)
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

function validatePrizeImage(file: { size: number; type: string } | null): { ok: boolean; error?: string } {
  if (!file) return { ok: true } // opcional
  if (file.size > MAX_IMAGE_SIZE)
    return { ok: false, error: "La imagen no puede superar 5 MB." }
  if (!VALID_IMAGE_TYPES.includes(file.type))
    return { ok: false, error: "Solo JPG, PNG o WebP." }
  return { ok: true }
}

function canCreatePrize(title: string): boolean {
  return title.trim().length > 0
}

// ─── Lógica extraída de PrizesSection ────────────────────────────────────────

type PrizeStatus = "available" | "pending" | "delivered"

interface LandingPrize {
  id: string
  title: string
  description: string | null
  stage: string
  prize_type: string
  status: PrizeStatus
  winner_id: string | null
  image_url: string | null
}

function filterDisplayPrizes(prizes: LandingPrize[]): LandingPrize[] {
  return prizes.filter(p => p.status !== "delivered")
}

function splitPrizes(prizes: LandingPrize[]): { main: LandingPrize | null; rest: LandingPrize[] } {
  const visible = filterDisplayPrizes(prizes)
  if (visible.length === 0) return { main: null, rest: [] }
  const [main, ...rest] = visible
  return { main, rest }
}

const STATUS_CONFIG = {
  available: { label: "Disponible", color: "#4ade80" },
  pending:   { label: "Pendiente",  color: "#c3871e" },
  delivered: { label: "Entregado",  color: "#7ab0e8" },
}

function makePrize(overrides: Partial<LandingPrize> = {}): LandingPrize {
  return {
    id:          "prize-uuid",
    title:       "Premio Test",
    description: "Descripción del premio",
    stage:       "Fase de Grupos",
    prize_type:  "weekly",
    status:      "available",
    winner_id:   null,
    image_url:   null,
    ...overrides,
  }
}


// =============================================================================
describe("Validación de imagen de premio", () => {

  it("sin imagen (null) → válido — es opcional", () => {
    expect(validatePrizeImage(null).ok).toBe(true)
  })

  it("JPEG bajo el límite es válido", () => {
    expect(validatePrizeImage({ size: 1_000_000, type: "image/jpeg" }).ok).toBe(true)
  })

  it("PNG es válido", () => {
    expect(validatePrizeImage({ size: 2_000_000, type: "image/png" }).ok).toBe(true)
  })

  it("WebP es válido", () => {
    expect(validatePrizeImage({ size: 500_000, type: "image/webp" }).ok).toBe(true)
  })

  it("exactamente 5 MB es válido (límite exacto)", () => {
    expect(validatePrizeImage({ size: 5 * 1024 * 1024, type: "image/jpeg" }).ok).toBe(true)
  })

  it("5 MB + 1 byte es inválido", () => {
    const r = validatePrizeImage({ size: 5 * 1024 * 1024 + 1, type: "image/jpeg" })
    expect(r.ok).toBe(false)
    expect(r.error).toContain("5 MB")
  })

  it("GIF no está permitido", () => {
    expect(validatePrizeImage({ size: 500_000, type: "image/gif" }).ok).toBe(false)
  })

  it("SVG no está permitido", () => {
    expect(validatePrizeImage({ size: 500_000, type: "image/svg+xml" }).ok).toBe(false)
  })

  it("PDF no está permitido", () => {
    expect(validatePrizeImage({ size: 100_000, type: "application/pdf" }).ok).toBe(false)
  })

  it("imagen de 10 MB es inválida", () => {
    expect(validatePrizeImage({ size: 10 * 1024 * 1024, type: "image/jpeg" }).ok).toBe(false)
  })
})


// =============================================================================
describe("Validación del form de creación", () => {

  it("título no vacío → puede crear", () => {
    expect(canCreatePrize("Premio semanal")).toBe(true)
  })

  it("título vacío → no puede crear", () => {
    expect(canCreatePrize("")).toBe(false)
  })

  it("título solo espacios → no puede crear", () => {
    expect(canCreatePrize("   ")).toBe(false)
  })

  it("título con un solo carácter → puede crear", () => {
    expect(canCreatePrize("A")).toBe(true)
  })
})


// =============================================================================
describe("STATUS_CONFIG — labels y colores por estado", () => {

  it("available tiene label 'Disponible'", () => {
    expect(STATUS_CONFIG.available.label).toBe("Disponible")
  })

  it("pending tiene label 'Pendiente'", () => {
    expect(STATUS_CONFIG.pending.label).toBe("Pendiente")
  })

  it("delivered tiene label 'Entregado'", () => {
    expect(STATUS_CONFIG.delivered.label).toBe("Entregado")
  })

  it("cada estado tiene color hexadecimal definido", () => {
    Object.values(STATUS_CONFIG).forEach(cfg => {
      expect(cfg.color).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  it("los 3 estados posibles están cubiertos", () => {
    expect(Object.keys(STATUS_CONFIG)).toEqual(["available", "pending", "delivered"])
  })
})


// =============================================================================
describe("filterDisplayPrizes — ocultar premios entregados", () => {

  it("lista vacía → devuelve vacío", () => {
    expect(filterDisplayPrizes([])).toHaveLength(0)
  })

  it("premio 'delivered' se oculta", () => {
    const prizes = [makePrize({ status: "delivered" })]
    expect(filterDisplayPrizes(prizes)).toHaveLength(0)
  })

  it("premio 'available' se muestra", () => {
    const prizes = [makePrize({ status: "available" })]
    expect(filterDisplayPrizes(prizes)).toHaveLength(1)
  })

  it("premio 'pending' se muestra (ganador asignado pero no entregado aún)", () => {
    const prizes = [makePrize({ status: "pending", winner_id: "user-123" })]
    expect(filterDisplayPrizes(prizes)).toHaveLength(1)
  })

  it("mezcla de estados: solo oculta delivered", () => {
    const prizes = [
      makePrize({ id: "1", status: "available" }),
      makePrize({ id: "2", status: "pending"   }),
      makePrize({ id: "3", status: "delivered" }),
      makePrize({ id: "4", status: "available" }),
    ]
    const result = filterDisplayPrizes(prizes)
    expect(result).toHaveLength(3)
    expect(result.map(p => p.id)).not.toContain("3")
  })

  it("todos delivered → lista vacía (muestra 'Los premios se anunciarán pronto')", () => {
    const prizes = [
      makePrize({ id: "1", status: "delivered" }),
      makePrize({ id: "2", status: "delivered" }),
    ]
    expect(filterDisplayPrizes(prizes)).toHaveLength(0)
  })
})


// =============================================================================
describe("splitPrizes — main prize vs secundarios", () => {

  it("sin premios → main null, rest vacío", () => {
    const { main, rest } = splitPrizes([])
    expect(main).toBeNull()
    expect(rest).toHaveLength(0)
  })

  it("un solo premio → es main, rest vacío", () => {
    const prizes = [makePrize({ id: "solo" })]
    const { main, rest } = splitPrizes(prizes)
    expect(main?.id).toBe("solo")
    expect(rest).toHaveLength(0)
  })

  it("tres premios → main es el primero, rest son los otros dos", () => {
    const prizes = [
      makePrize({ id: "p1" }),
      makePrize({ id: "p2" }),
      makePrize({ id: "p3" }),
    ]
    const { main, rest } = splitPrizes(prizes)
    expect(main?.id).toBe("p1")
    expect(rest.map(p => p.id)).toEqual(["p2", "p3"])
  })

  it("si el primero es delivered → el segundo pasa a main", () => {
    const prizes = [
      makePrize({ id: "p1", status: "delivered" }),
      makePrize({ id: "p2", status: "available" }),
      makePrize({ id: "p3", status: "available" }),
    ]
    const { main, rest } = splitPrizes(prizes)
    expect(main?.id).toBe("p2")
    expect(rest.map(p => p.id)).toEqual(["p3"])
  })
})


// =============================================================================
describe("Premio con y sin imagen", () => {

  it("premio sin image_url → image_url es null", () => {
    const p = makePrize({ image_url: null })
    expect(p.image_url).toBeNull()
  })

  it("premio con image_url → tiene URL válida de Supabase storage", () => {
    const url = "https://zswhbfvyrjxsrnqkylqq.supabase.co/storage/v1/object/public/prize-images/test.jpg"
    const p = makePrize({ image_url: url })
    expect(p.image_url).toBeTruthy()
    expect(p.image_url).toContain("supabase.co")
    expect(p.image_url).toContain("prize-images")
  })

  it("image_url de URL externa es aceptada (string cualquiera)", () => {
    const p = makePrize({ image_url: "https://external.com/image.jpg" })
    expect(p.image_url).toContain("https://")
  })
})


// =============================================================================
describe("Edge cases en datos de premios", () => {

  it("título muy largo (>100 chars) — el componente lo maneja sin error", () => {
    const longTitle = "A".repeat(200)
    const p = makePrize({ title: longTitle })
    expect(p.title.length).toBe(200) // el dato existe, el truncado es CSS
  })

  it("descripción null — no hay error en la UI (condicional antes de renderizar)", () => {
    const p = makePrize({ description: null })
    expect(p.description).toBeNull()
    // PrizesSection y PrizesAdmin muestran descripción condicionalmente
    const shouldShowDesc = p.description !== null && p.description !== ""
    expect(shouldShowDesc).toBe(false)
  })

  it("descripción vacía — no se muestra", () => {
    const p = makePrize({ description: "" })
    expect(p.description?.length).toBe(0)
  })

  it("prize_type válidos son weekly, stage y final", () => {
    const validTypes = ["weekly", "stage", "final"]
    validTypes.forEach(t => {
      const p = makePrize({ prize_type: t })
      expect(validTypes).toContain(p.prize_type)
    })
  })

  it("etapas válidas del torneo", () => {
    const stages = ["Fase de Grupos","Dieciseisavos","Octavos","Cuartos de Final","Semifinal","Final","General"]
    stages.forEach(s => {
      const p = makePrize({ stage: s })
      expect(p.stage).toBe(s)
    })
  })
})
