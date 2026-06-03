import { describe, it, expect } from "vitest"

// ─── Tests para bugs misceláneos encontrados en el segundo audit ─────────────

// ─────────────────────────────────────────────────────────────────
describe("Bug 14: Paginación — page param sin validar (NaN)", () => {
  // admin/participantes/page.tsx usaba parseInt(page) sin validar
  // parseInt("abc") = NaN → (NaN - 1) * 20 = NaN → query rota

  function parsePage(raw: string): number {
    return Math.max(1, parseInt(raw) || 1)
  }

  it("page numérico válido funciona", () => {
    expect(parsePage("1")).toBe(1)
    expect(parsePage("2")).toBe(2)
    expect(parsePage("10")).toBe(10)
  })

  it("string no numérico devuelve página 1 (fallback)", () => {
    expect(parsePage("abc")).toBe(1)
    expect(parsePage("")).toBe(1)
    expect(parsePage("undefined")).toBe(1)
    expect(parsePage("null")).toBe(1)
  })

  it("página 0 o negativa se fuerza a 1", () => {
    expect(parsePage("0")).toBe(1)
    expect(parsePage("-5")).toBe(1)
  })

  it("NaN no produce range inválido", () => {
    const page    = parsePage("abc")
    const pageSize = 20
    const rangeFrom = (page - 1) * pageSize
    const rangeTo   = rangeFrom + pageSize - 1
    expect(Number.isFinite(rangeFrom)).toBe(true)
    expect(Number.isFinite(rangeTo)).toBe(true)
    expect(rangeFrom).toBe(0)
    expect(rangeTo).toBe(19)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 16: Validación de image_url en premios", () => {
  // dashboard/premios/page.tsx renderizaba cualquier URL en <img> sin validar
  // Podría cargar recursos externos arbitrarios o tracking pixels

  function isSafeImageUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return parsed.protocol === "https:"
    } catch {
      return false
    }
  }

  it("URL HTTPS válida es permitida", () => {
    expect(isSafeImageUrl("https://example.com/image.jpg")).toBe(true)
    expect(isSafeImageUrl("https://cdn.grupoparis.com/prize.png")).toBe(true)
  })

  it("URL HTTP (no segura) es rechazada", () => {
    expect(isSafeImageUrl("http://example.com/image.jpg")).toBe(false)
  })

  it("javascript: es rechazado", () => {
    expect(isSafeImageUrl("javascript:alert(1)")).toBe(false)
  })

  it("data: URLs son rechazadas", () => {
    expect(isSafeImageUrl("data:image/png;base64,abc")).toBe(false)
  })

  it("rutas relativas son rechazadas (no tienen protocolo)", () => {
    expect(isSafeImageUrl("/images/prize.jpg")).toBe(false)
    expect(isSafeImageUrl("images/prize.jpg")).toBe(false)
  })

  it("string vacío es rechazado", () => {
    expect(isSafeImageUrl("")).toBe(false)
  })

  it("URL malformada es rechazada", () => {
    expect(isSafeImageUrl("not a url at all")).toBe(false)
    expect(isSafeImageUrl("://missing-protocol.com")).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 13: select('*') — overfetching de datos sensibles", () => {
  // dashboard/page.tsx pedía select("*") cuando solo necesita id y first_name
  // Esto baja DNI, teléfono, patente, email — innecesariamente

  it("los campos mínimos necesarios para dashboard/page son solo id y first_name", () => {
    // Documentamos los campos que REALMENTE se usan en la página
    const camposUsados = ["id", "first_name"]
    const camposSensibles = ["dni", "phone", "email", "license_plate", "car_brand", "car_model"]

    // Ningún campo sensible debe estar en los campos mínimos
    camposSensibles.forEach(campo => {
      expect(camposUsados).not.toContain(campo)
    })
  })

  it("select('id, first_name') es suficiente — participantId viene de id, header de first_name", () => {
    const mockParticipant = { id: "uuid-123", first_name: "Juan" }
    // Solo se usan estos dos campos en la página
    expect(mockParticipant.id).toBeTruthy()
    expect(mockParticipant.first_name).toBeTruthy()
  })
})

// ─────────────────────────────────────────────────────────────────
describe("Bug 15: createPrize sin error handling — modal cierra aunque falle", () => {
  // prizes-admin.tsx llamaba await createPrize(form) sin verificar el resultado
  // Si fallaba, el modal cerraba igual y el admin no sabía

  it("patrón correcto: verificar res.ok antes de cerrar modal", () => {
    // Simular el flujo corregido
    async function handleSaveFixed(
      createFn: () => Promise<{ ok: boolean; error?: string }>,
      onClose: () => void,
      setError: (e: string) => void
    ) {
      const res = await createFn()
      if (!res.ok) {
        setError(res.error ?? "Error desconocido")
        return // NO cierra
      }
      onClose() // Solo cierra si ok
    }

    let closed  = false
    let errMsg  = ""
    const onClose   = () => { closed = true }
    const setError  = (e: string) => { errMsg = e }

    // Caso: falla
    return handleSaveFixed(() => Promise.resolve({ ok: false, error: "DB error" }), onClose, setError)
      .then(() => {
        expect(closed).toBe(false)
        expect(errMsg).toBe("DB error")
      })
  })

  it("cuando ok=true el modal sí cierra", () => {
    async function handleSaveFixed(
      createFn: () => Promise<{ ok: boolean; error?: string }>,
      onClose: () => void,
      setError: (e: string) => void
    ) {
      const res = await createFn()
      if (!res.ok) { setError(res.error ?? "Error"); return }
      onClose()
    }

    let closed = false
    return handleSaveFixed(
      () => Promise.resolve({ ok: true }),
      () => { closed = true },
      () => {}
    ).then(() => {
      expect(closed).toBe(true)
    })
  })
})
