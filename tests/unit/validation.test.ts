import { describe, it, expect } from "vitest"

// -----------------------------------------------------------------
// Lógica extraída de registration-form.tsx y lib/actions/register.ts
// Testeamos las reglas de validación y transformaciones como funciones puras
// -----------------------------------------------------------------

function normalizeDni(raw: string): string {
  return raw.replace(/\D/g, "")
}

function normalizePlate(raw: string): string {
  return raw.toUpperCase().replace(/\s/g, "")
}

function isStep1Valid(form: {
  first_name: string
  last_name: string
  dni: string
  phone: string
  email: string
  password: string
}): boolean {
  return (
    form.first_name.trim().length > 1 &&
    form.last_name.trim().length > 1 &&
    form.dni.replace(/\D/g, "").length >= 7 &&
    form.phone.trim().length >= 8 &&
    form.email.includes("@") &&
    form.password.length >= 6
  )
}

function isStep2Valid(form: {
  license_plate: string
  car_brand: string
  car_model: string
  city: string
  accepts_terms: boolean
}): boolean {
  return (
    form.license_plate.trim().length >= 6 &&
    form.car_brand.trim().length > 0 &&
    form.car_model.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.accepts_terms
  )
}

// -----------------------------------------------------------------
describe("normalizeDni", () => {
  it("elimina puntos y guiones", () => {
    expect(normalizeDni("12.345.678")).toBe("12345678")
    expect(normalizeDni("12-345-678")).toBe("12345678")
  })

  it("deja pasar solo dígitos", () => {
    expect(normalizeDni("12345678")).toBe("12345678")
  })

  it("elimina cualquier carácter no numérico", () => {
    expect(normalizeDni("  1a2b3c4d5e6f7  ")).toBe("1234567")
  })

  it("DNI vacío devuelve cadena vacía", () => {
    expect(normalizeDni("")).toBe("")
  })
})

// -----------------------------------------------------------------
describe("normalizePlate", () => {
  it("convierte a mayúsculas", () => {
    expect(normalizePlate("abc123")).toBe("ABC123")
  })

  it("elimina espacios", () => {
    expect(normalizePlate("AA 123 BB")).toBe("AA123BB")
  })

  it("formato viejo (6 chars)", () => {
    expect(normalizePlate("aab 123")).toBe("AAB123")
  })

  it("formato Mercosur (7 chars)", () => {
    expect(normalizePlate("aa 123 bb")).toBe("AA123BB")
  })
})

// -----------------------------------------------------------------
describe("isStep1Valid — validación formulario paso 1", () => {
  const base = {
    first_name: "Juan",
    last_name:  "Perez",
    dni:        "12345678",
    phone:      "1134567890",
    email:      "juan@test.com",
    password:   "secret123",
  }

  it("datos válidos retornan true", () => {
    expect(isStep1Valid(base)).toBe(true)
  })

  it("nombre con 1 char es inválido", () => {
    expect(isStep1Valid({ ...base, first_name: "J" })).toBe(false)
  })

  it("apellido vacío es inválido", () => {
    expect(isStep1Valid({ ...base, last_name: "" })).toBe(false)
  })

  it("DNI con menos de 7 dígitos es inválido", () => {
    expect(isStep1Valid({ ...base, dni: "123456" })).toBe(false)
  })

  it("DNI con 7 dígitos es válido (min)", () => {
    expect(isStep1Valid({ ...base, dni: "1234567" })).toBe(true)
  })

  it("email sin @ es inválido", () => {
    expect(isStep1Valid({ ...base, email: "juantest.com" })).toBe(false)
  })

  it("password menor a 6 chars es inválido", () => {
    expect(isStep1Valid({ ...base, password: "12345" })).toBe(false)
  })

  it("teléfono con 7 chars es inválido", () => {
    expect(isStep1Valid({ ...base, phone: "1234567" })).toBe(false)
  })
})

// -----------------------------------------------------------------
describe("isStep2Valid — validación formulario paso 2", () => {
  const base = {
    license_plate: "AAB123",
    car_brand:     "Chevrolet",
    car_model:     "Onix",
    city:          "Rosario",
    accepts_terms: true,
  }

  it("datos válidos retornan true", () => {
    expect(isStep2Valid(base)).toBe(true)
  })

  it("patente con menos de 6 chars es inválida", () => {
    expect(isStep2Valid({ ...base, license_plate: "AAB12" })).toBe(false)
  })

  it("marca vacía es inválida", () => {
    expect(isStep2Valid({ ...base, car_brand: "" })).toBe(false)
  })

  it("ciudad vacía es inválida", () => {
    expect(isStep2Valid({ ...base, city: "" })).toBe(false)
  })

  it("sin aceptar términos es inválido", () => {
    expect(isStep2Valid({ ...base, accepts_terms: false })).toBe(false)
  })
})
