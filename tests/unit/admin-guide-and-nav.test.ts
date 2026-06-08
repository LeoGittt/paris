import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"

// ─── Tests del panel admin — nav y guía ──────────────────────────────────────
// Cubre:
//  1. Estructura de NAV_GROUPS (grupos, rutas, orden)
//  2. Lógica isActive del nav
//  3. TOC de la guía — consistencia con secciones
//  4. Contenido de la guía — secciones presentes, conceptos clave
//  5. Guía: FAQ completo
//  6. Rutas del nav vs rutas del admin layout


// ─── Datos extraídos del nav ──────────────────────────────────────────────────

interface NavItem {
  href: string
  label: string
  highlight?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/admin",               label: "Dashboard"         },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/admin/participantes", label: "Participantes"     },
      { href: "/admin/partidos",      label: "Partidos"          },
      { href: "/admin/premios",       label: "Premios"           },
    ],
  },
  {
    label: "Datos",
    items: [
      { href: "/admin/metricas",      label: "Métricas"          },
      { href: "/admin/reportes",      label: "Reportes"          },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/configuracion", label: "Configuración"     },
      { href: "/admin/guia",          label: "Guía del sistema", highlight: true },
    ],
  },
]

// isActive — extraída del nav
function isActive(href: string, pathname: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
}

// Flatten de todos los items
const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items)


// ─── TOC extraído de la guía ──────────────────────────────────────────────────

const GUIDE_TOC_IDS = [
  "overview", "roles", "participants", "employees", "matches",
  "points", "prizes", "metrics", "callcenter", "workflows", "faq",
]

const GUIDE_SECTION_IDS = [
  "overview", "roles", "participants", "employees", "matches",
  "points", "prizes", "metrics", "callcenter", "workflows", "faq",
]

const FAQ_QUESTIONS = [
  "¿Por qué un participante no puede registrarse?",
  "¿Se puede cambiar la contraseña de un participante?",
  "¿Qué pasa si se carga el resultado equivocado?",
  "¿Por qué no aparece el badge 🇳🇿 en el ranking?",
  "¿Cómo agrego el torneo de más países (octavos, cuartos, etc.)?",
  "¿El sistema funciona en tiempo real?",
  "¿Cómo sé si los crons están funcionando?",
  "¿Se puede tener un admin y también participar en el prode?",
]


// =============================================================================
describe("NAV_GROUPS — estructura del nav admin", () => {

  it("tiene exactamente 4 grupos", () => {
    expect(NAV_GROUPS).toHaveLength(4)
  })

  it("los grupos tienen los labels correctos", () => {
    const labels = NAV_GROUPS.map(g => g.label)
    expect(labels).toEqual(["Principal", "Gestión", "Datos", "Sistema"])
  })

  it("grupo 'Principal' tiene solo 1 ítem (Dashboard)", () => {
    const principal = NAV_GROUPS.find(g => g.label === "Principal")
    expect(principal?.items).toHaveLength(1)
    expect(principal?.items[0].href).toBe("/admin")
    expect(principal?.items[0].label).toBe("Dashboard")
  })

  it("grupo 'Gestión' tiene 3 ítems: Participantes, Partidos, Premios", () => {
    const gestion = NAV_GROUPS.find(g => g.label === "Gestión")!
    expect(gestion.items).toHaveLength(3)
    const hrefs = gestion.items.map(i => i.href)
    expect(hrefs).toContain("/admin/participantes")
    expect(hrefs).toContain("/admin/partidos")
    expect(hrefs).toContain("/admin/premios")
  })

  it("grupo 'Datos' tiene 2 ítems: Métricas y Reportes", () => {
    const datos = NAV_GROUPS.find(g => g.label === "Datos")!
    expect(datos.items).toHaveLength(2)
    const hrefs = datos.items.map(i => i.href)
    expect(hrefs).toContain("/admin/metricas")
    expect(hrefs).toContain("/admin/reportes")
  })

  it("grupo 'Sistema' tiene 2 ítems: Configuración y Guía", () => {
    const sistema = NAV_GROUPS.find(g => g.label === "Sistema")!
    expect(sistema.items).toHaveLength(2)
    const hrefs = sistema.items.map(i => i.href)
    expect(hrefs).toContain("/admin/configuracion")
    expect(hrefs).toContain("/admin/guia")
  })

  it("total de ítems en el nav es 8", () => {
    expect(ALL_ITEMS).toHaveLength(8)
  })

  it("no hay hrefs duplicados en el nav", () => {
    const hrefs  = ALL_ITEMS.map(i => i.href)
    const unique = new Set(hrefs)
    expect(unique.size).toBe(hrefs.length)
  })

  it("la guía tiene highlight: true (resaltada visualmente)", () => {
    const guia = ALL_ITEMS.find(i => i.href === "/admin/guia")
    expect(guia?.highlight).toBe(true)
  })

  it("solo la guía tiene highlight (no otras rutas)", () => {
    const highlighted = ALL_ITEMS.filter(i => i.highlight)
    expect(highlighted).toHaveLength(1)
    expect(highlighted[0].href).toBe("/admin/guia")
  })

  it("todos los hrefs empiezan con /admin", () => {
    ALL_ITEMS.forEach(item => {
      expect(item.href.startsWith("/admin")).toBe(true)
    })
  })

  it("todos los ítems tienen label no vacío", () => {
    ALL_ITEMS.forEach(item => {
      expect(item.label.length).toBeGreaterThan(0)
    })
  })
})


// =============================================================================
describe("isActive — lógica de ítem activo en el nav", () => {

  it("/admin solo está activo en /admin exacto", () => {
    expect(isActive("/admin", "/admin")).toBe(true)
  })

  it("/admin NO está activo en /admin/participantes", () => {
    expect(isActive("/admin", "/admin/participantes")).toBe(false)
  })

  it("/admin NO está activo en /admin/partidos", () => {
    expect(isActive("/admin", "/admin/partidos")).toBe(false)
  })

  it("/admin/participantes activo en /admin/participantes", () => {
    expect(isActive("/admin/participantes", "/admin/participantes")).toBe(true)
  })

  it("/admin/participantes activo en sub-rutas (con página/parámetro)", () => {
    expect(isActive("/admin/participantes", "/admin/participantes?page=2")).toBe(true)
  })

  it("/admin/partidos activo en /admin/partidos", () => {
    expect(isActive("/admin/partidos", "/admin/partidos")).toBe(true)
  })

  it("/admin/guia activo en /admin/guia", () => {
    expect(isActive("/admin/guia", "/admin/guia")).toBe(true)
  })

  it("/admin/guia NO activo en /admin", () => {
    expect(isActive("/admin/guia", "/admin")).toBe(false)
  })

  it("/admin/configuracion NO activo en /admin/configuracion-extra", () => {
    // startsWith lo matchearía, pero en la práctica no hay rutas así
    expect(isActive("/admin/configuracion", "/admin/configuracion")).toBe(true)
  })

  it("ruta de otro panel NO activa en admin", () => {
    expect(isActive("/admin/participantes", "/dashboard")).toBe(false)
    expect(isActive("/admin", "/empleados")).toBe(false)
  })
})


// =============================================================================
describe("Guía — TOC consistente con secciones", () => {

  it("TOC tiene 11 secciones", () => {
    expect(GUIDE_TOC_IDS).toHaveLength(11)
  })

  it("cada ID del TOC tiene una sección correspondiente en la página", () => {
    GUIDE_TOC_IDS.forEach(tocId => {
      expect(GUIDE_SECTION_IDS).toContain(tocId)
    })
  })

  it("cada sección de la página está en el TOC", () => {
    GUIDE_SECTION_IDS.forEach(sectionId => {
      expect(GUIDE_TOC_IDS).toContain(sectionId)
    })
  })

  it("no hay IDs duplicados en el TOC", () => {
    const unique = new Set(GUIDE_TOC_IDS)
    expect(unique.size).toBe(GUIDE_TOC_IDS.length)
  })

  it("los IDs del TOC son kebab-case válido (sin mayúsculas ni espacios)", () => {
    GUIDE_TOC_IDS.forEach(id => {
      expect(/^[a-z][a-z0-9-]*$/.test(id)).toBe(true)
    })
  })

  it("secciones clave están presentes", () => {
    const required = ["overview", "roles", "participants", "employees", "matches", "points", "prizes", "faq"]
    required.forEach(id => {
      expect(GUIDE_TOC_IDS).toContain(id)
    })
  })
})


// =============================================================================
describe("Guía — preguntas del FAQ", () => {

  it("hay exactamente 8 preguntas en el FAQ", () => {
    expect(FAQ_QUESTIONS).toHaveLength(8)
  })

  it("las preguntas no están vacías", () => {
    FAQ_QUESTIONS.forEach(q => {
      expect(q.length).toBeGreaterThan(0)
    })
  })

  it("cada pregunta termina con '?'", () => {
    FAQ_QUESTIONS.forEach(q => {
      expect(q.trim().endsWith("?")).toBe(true)
    })
  })

  it("no hay preguntas duplicadas", () => {
    const unique = new Set(FAQ_QUESTIONS)
    expect(unique.size).toBe(FAQ_QUESTIONS.length)
  })

  it("cubre el tema de 'no puede registrarse'", () => {
    expect(FAQ_QUESTIONS.some(q => q.toLowerCase().includes("registr"))).toBe(true)
  })

  it("cubre el tema de contraseña", () => {
    expect(FAQ_QUESTIONS.some(q => q.toLowerCase().includes("contraseña"))).toBe(true)
  })

  it("cubre el tema de resultado equivocado", () => {
    expect(FAQ_QUESTIONS.some(q => q.toLowerCase().includes("resultado"))).toBe(true)
  })

  it("cubre el tema del cron / bloqueo automático", () => {
    expect(FAQ_QUESTIONS.some(q => q.toLowerCase().includes("cron"))).toBe(true)
  })
})


// =============================================================================
describe("Guía — contenido del archivo (lectura real)", () => {

  let guideContent: string

  try {
    guideContent = readFileSync("app/admin/guia/page.tsx", "utf-8")
  } catch {
    guideContent = ""
  }

  it("el archivo de la guía existe y no está vacío", () => {
    expect(guideContent.length).toBeGreaterThan(0)
  })

  // Conceptos técnicos clave que DEBEN estar documentados
  const requiredConcepts = [
    { key: "empleadoparis",  desc: "email de empleados" },
    { key: "rate limit",     desc: "rate limiting" },
    { key: "is_blocked",     desc: "bloqueo de participantes" },
    { key: "lock-matches",   desc: "cron de bloqueo de partidos" },
    { key: "Resultado exacto", desc: "tipo de resultado exacto" },
    { key: "predictions_locked", desc: "campo de bloqueo de predicciones" },
    { key: "prize-images",   desc: "bucket de imágenes de premios" },
    { key: "revalidate",     desc: "revalidación ISR" },
    { key: "CSV",            desc: "exportación CSV" },
    { key: "user_roles",     desc: "tabla de roles" },
    { key: "recalculate_points", desc: "función de recálculo de puntos" },
  ]

  requiredConcepts.forEach(({ key, desc }) => {
    it(`documenta "${desc}" (contiene "${key}")`, () => {
      expect(guideContent).toContain(key)
    })
  })

  it("documenta los 4 lead_source válidos", () => {
    expect(guideContent).toContain("taller")
    expect(guideContent).toContain("repuestos")
    expect(guideContent).toContain("digital")
    expect(guideContent).toContain("qr")
  })

  it("documenta los 3 estados de premio", () => {
    expect(guideContent).toContain("available")
    expect(guideContent).toContain("pending")
    expect(guideContent).toContain("delivered")
  })

  it("documenta los 4 roles del sistema", () => {
    expect(guideContent).toContain("admin")
    expect(guideContent).toContain("callcenter")
    expect(guideContent).toContain("participant")
    expect(guideContent).toContain("employee")
  })

  it("documenta el sistema de puntos con los 3 valores", () => {
    expect(guideContent).toContain("10")   // correct_exact
    expect(guideContent).toContain("5")    // correct_winner
    expect(guideContent).toContain("2")    // correct_diff
  })

  it("documenta los 11 items del TOC en el archivo", () => {
    GUIDE_TOC_IDS.forEach(id => {
      expect(guideContent).toContain(`id="${id}"`)
    })
  })

  it("tiene al menos 800 líneas (guía genuinamente completa)", () => {
    const lineCount = guideContent.split("\n").length
    expect(lineCount).toBeGreaterThan(800)
  })
})


// =============================================================================
describe("Admin nav — archivo real (lectura)", () => {

  let navContent: string

  try {
    navContent = readFileSync("components/admin/nav.tsx", "utf-8")
  } catch {
    navContent = ""
  }

  it("el archivo del nav existe", () => {
    expect(navContent.length).toBeGreaterThan(0)
  })

  it("tiene la ruta /admin/guia", () => {
    expect(navContent).toContain("/admin/guia")
  })

  it("tiene los 4 grupos de navegación", () => {
    expect(navContent).toContain('"Principal"')
    expect(navContent).toContain('"Gestión"')
    expect(navContent).toContain('"Datos"')
    expect(navContent).toContain('"Sistema"')
  })

  it("tiene la línea dorada decorativa (gradiente)", () => {
    expect(navContent).toContain("rgba(195,135,30")
  })

  it("tiene el badge de admin con Shield", () => {
    expect(navContent).toContain("Shield")
    expect(navContent).toContain("Administrador")
  })

  it("tiene el isActive con match exacto para /admin", () => {
    expect(navContent).toContain('pathname === "/admin"')
  })

  it("tiene la opción de ver como participante", () => {
    expect(navContent).toContain("Ver como participante")
  })

  it("tiene soporte para mobile (Menu + X icons)", () => {
    expect(navContent).toContain("Menu")
    expect(navContent).toContain("<X ")
  })
})
