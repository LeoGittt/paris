import { chromium } from "playwright"

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // DNI único para el test
  const dni = Math.floor(10000000 + Math.random() * 89999999).toString()
  const email = `empleadoparis@${dni}.com`
  const password = "Test1234!"

  console.log(`\n=== TEST: Registro de empleado sin auto ===`)
  console.log(`Email: ${email}`)
  console.log(`DNI:   ${dni}`)

  await page.goto("http://localhost:3001")

  // Abrir el formulario de registro
  const regBtn = page.locator("button", { hasText: /registr/i }).first()
  await regBtn.waitFor({ timeout: 5000 })
  await regBtn.click()

  await page.waitForSelector("form", { timeout: 5000 })
  console.log("✓ Formulario de registro abierto")

  // --- PASO 1: datos personales ---
  await page.fill('input[placeholder="Juan"]',         "Empleado")
  await page.fill('input[placeholder="Pérez"]',        "SinAuto")
  await page.fill('input[placeholder="12345678"]',     dni)
  await page.fill('input[placeholder="+54 264 ..."]',  "2645551234")
  await page.fill('input[placeholder="tu@email.com"]', email)
  await page.fill('input[type="password"]',            password)

  await page.click('button[type="submit"]')
  console.log("✓ Paso 1 enviado — esperando paso 2...")

  // Esperar paso 2
  await page.waitForSelector('text=Provincia', { timeout: 5000 })
  console.log("✓ Paso 2 visible")

  // --- PASO 2: solo provincia + ciudad + términos (SIN auto) ---
  // Seleccionar provincia
  const provSelect = page.locator("select").filter({ hasText: "Seleccioná una provincia" })
  await provSelect.selectOption("San Juan")
  console.log("✓ Provincia seleccionada: San Juan")

  // Esperar que el selector de localidad se active y seleccionar
  await page.waitForTimeout(300)
  const citySelect = page.locator("select").filter({ hasText: /localidad|provincia/i }).last()
  await citySelect.selectOption("San Juan")
  console.log("✓ Localidad seleccionada: San Juan")

  // Aceptar términos
  await page.locator('input[type="checkbox"]').first().check()
  console.log("✓ Términos aceptados")

  // Verificar que el botón Registrarme está habilitado (sin llenar auto)
  const submitBtn = page.locator('button[type="submit"]:has-text("Registrarme")')
  const isDisabled = await submitBtn.getAttribute("disabled")
  if (isDisabled !== null) {
    console.error("✗ ERROR: botón deshabilitado — campos de auto todavía son requeridos")
    await browser.close()
    process.exit(1)
  }
  console.log("✓ Botón Registrarme habilitado (sin completar datos de auto)")

  // Enviar
  await submitBtn.click()
  console.log("⏳ Enviando registro...")

  // Esperar resultado
  const success = await Promise.race([
    page.waitForSelector('text=¡Estás dentro!', { timeout: 15000 }).then(() => true),
    page.waitForSelector('.text-red-400', { timeout: 15000 }).then(() => false),
  ])

  if (success) {
    console.log("✅ REGISTRO EXITOSO — empleado sin auto registrado correctamente")
  } else {
    const errMsg = await page.locator('.text-red-400').first().textContent()
    console.error(`✗ ERROR en registro: ${errMsg}`)
    process.exit(1)
  }

  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
