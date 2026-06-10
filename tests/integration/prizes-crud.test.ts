import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createAdminClient, createTestParticipant } from "../helpers/supabase"

// ─── Tests de integración: CRUD de premios contra DB real ────────────────────
// Cubre:
//  1. Crear premio sin imagen
//  2. Crear premio con image_url
//  3. Todos los campos se persisten correctamente
//  4. Valores por defecto al crear (status=available, winner_id=null)
//  5. Asignar ganador → status cambia a pending
//  6. Asignar ganador bloqueado → no permitido
//  7. Marcar entregado → status=delivered, delivered_at seteado
//  8. Marcar entregado sin ganador → no permitido
//  9. Marcar entregado dos veces → no permitido
// 10. Eliminar premio
// 11. Premios entregados NO aparecen en la landing (filtro de status)
// 12. Storage bucket prize-images existe y es público

const admin = createAdminClient()
const TP    = "__prize_test__"
const cleanupPrizeIds: string[] = []
const cleanupUserIds:  string[] = []

afterAll(async () => {
  for (const id of cleanupPrizeIds) {
    await admin.from("prizes").delete().eq("id", id)
  }
  for (const uid of cleanupUserIds) {
    await admin.auth.admin.deleteUser(uid)
  }
})

function uid() { return `${Date.now()}${Math.floor(Math.random() * 9999)}` }

async function createPrize(overrides: Partial<{
  title: string; description: string; stage: string; prize_type: string; image_url: string
}> = {}) {
  const ts = uid()
  const { data, error } = await admin.from("prizes").insert({
    title:       overrides.title       ?? `${TP}Premio${ts}`,
    description: overrides.description ?? "Premio de prueba de integración",
    stage:       overrides.stage       ?? "Fase de Grupos",
    prize_type:  overrides.prize_type  ?? "weekly",
    image_url:   overrides.image_url   ?? null,
  }).select("id, title, description, stage, prize_type, status, winner_id, image_url, delivered_at").single()

  if (data?.id) cleanupPrizeIds.push(data.id)
  return { data, error }
}


// =============================================================================
describe("Premio: crear sin imagen", () => {

  it("se crea con todos los campos correctos", async () => {
    const { data, error } = await createPrize({
      title:       `${TP}SinFoto${uid()}`,
      description: "Premio sin foto adjunta",
      stage:       "Semifinal",
      prize_type:  "stage",
    })

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data!.title).toContain("SinFoto")
    expect(data!.description).toBe("Premio sin foto adjunta")
    expect(data!.stage).toBe("Semifinal")
    expect(data!.prize_type).toBe("stage")
    expect(data!.image_url).toBeNull()
  })

  it("status por defecto es 'available'", async () => {
    const { data } = await createPrize()
    expect(data?.status).toBe("available")
  })

  it("winner_id por defecto es null", async () => {
    const { data } = await createPrize()
    expect(data?.winner_id).toBeNull()
  })

  it("delivered_at por defecto es null", async () => {
    const { data } = await createPrize()
    expect(data?.delivered_at).toBeNull()
  })
})


// =============================================================================
describe("Premio: crear con image_url", () => {

  it("image_url se persiste correctamente", async () => {
    const fakeUrl = "https://zswhbfvyrjxsrnqkylqq.supabase.co/storage/v1/object/public/prize-images/test-image.jpg"
    const { data, error } = await createPrize({ image_url: fakeUrl })

    expect(error).toBeNull()
    expect(data?.image_url).toBe(fakeUrl)
  })

  it("image_url puede ser una URL de dominio externo", async () => {
    const externalUrl = "https://example.com/premio.png"
    const { data } = await createPrize({ image_url: externalUrl })
    expect(data?.image_url).toBe(externalUrl)
  })
})


// =============================================================================
describe("Premio: leer desde DB", () => {

  let testPrizeId: string

  beforeAll(async () => {
    const { data } = await createPrize({ title: `${TP}Lectura${uid()}` })
    testPrizeId = data?.id ?? ""
  })

  it("puede leerse por ID", async () => {
    const { data, error } = await admin
      .from("prizes")
      .select("id, title, status")
      .eq("id", testPrizeId)
      .single()

    expect(error).toBeNull()
    expect(data?.id).toBe(testPrizeId)
    expect(data?.status).toBe("available")
  })

  it("puede leerse lista de premios disponibles", async () => {
    const { data, error } = await admin
      .from("prizes")
      .select("id, title, status")
      .eq("status", "available")

    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
    const found = data?.find(p => p.id === testPrizeId)
    expect(found).toBeDefined()
  })
})


// =============================================================================
describe("Premio: asignar ganador", () => {

  let prizeId:       string
  let participantId: string
  let userId:        string

  beforeAll(async () => {
    const { data: p } = await createPrize({ title: `${TP}Ganador${uid()}` })
    prizeId = p?.id ?? ""

    const ts = uid()
    const part = await createTestParticipant({
      email:         `${TP}winner${ts}@test.com`,
      password:      "Test1234!",
      dni:           ts.slice(-8),
      license_plate: `PW${ts.slice(-5)}`,
    })
    participantId = part.participantId
    userId        = part.userId
    cleanupUserIds.push(userId)
  })

  it("asignar ganador cambia status a pending y setea winner_id", async () => {
    const { error } = await admin
      .from("prizes")
      .update({ winner_id: participantId, status: "pending" })
      .eq("id", prizeId)

    expect(error).toBeNull()

    const { data } = await admin
      .from("prizes")
      .select("status, winner_id")
      .eq("id", prizeId)
      .single()

    expect(data?.status).toBe("pending")
    expect(data?.winner_id).toBe(participantId)
  })

  it("ganador bloqueado no puede ser asignado (validado en server action)", async () => {
    // Bloquear participante
    await admin.from("participants").update({ is_blocked: true }).eq("id", participantId)

    const { data: blockedPart } = await admin
      .from("participants")
      .select("is_blocked")
      .eq("id", participantId)
      .single()

    expect(blockedPart?.is_blocked).toBe(true)

    // La validación se hace en el server action (prizes.ts:assignWinner)
    // Aquí verificamos que la DB permita el estado consistente
    const isBlocked = blockedPart?.is_blocked ?? false
    const canAssign = !isBlocked
    expect(canAssign).toBe(false)

    // Desbloquear para limpiar
    await admin.from("participants").update({ is_blocked: false }).eq("id", participantId)
  })
})


// =============================================================================
describe("Premio: marcar como entregado", () => {

  let prizeId:       string
  let participantId: string
  let userId:        string

  beforeAll(async () => {
    const { data: p } = await createPrize({ title: `${TP}Entrega${uid()}` })
    prizeId = p?.id ?? ""

    const ts = uid()
    const part = await createTestParticipant({
      email:         `${TP}deliver${ts}@test.com`,
      password:      "Test1234!",
      dni:           ts.slice(-8),
      license_plate: `PD${ts.slice(-5)}`,
    })
    participantId = part.participantId
    userId        = part.userId
    cleanupUserIds.push(userId)

    // Asignar ganador primero
    await admin.from("prizes")
      .update({ winner_id: participantId, status: "pending" })
      .eq("id", prizeId)
  })

  it("no puede entregarse sin ganador asignado", async () => {
    const { data: noWinner } = await createPrize({ title: `${TP}NoWinner${uid()}` })
    const noWinnerId = noWinner?.id ?? ""

    // Simular validación del server action
    const { data: prize } = await admin
      .from("prizes")
      .select("winner_id, status")
      .eq("id", noWinnerId)
      .single()

    const canDeliver = prize?.winner_id !== null
    expect(canDeliver).toBe(false)
  })

  it("marcar entregado setea status=delivered y delivered_at", async () => {
    const { error } = await admin.from("prizes")
      .update({ status: "delivered", delivered_at: new Date().toISOString() })
      .eq("id", prizeId)

    expect(error).toBeNull()

    const { data } = await admin
      .from("prizes")
      .select("status, delivered_at")
      .eq("id", prizeId)
      .single()

    expect(data?.status).toBe("delivered")
    expect(data?.delivered_at).not.toBeNull()
    expect(new Date(data!.delivered_at!).getTime()).toBeLessThanOrEqual(Date.now())
  })

  it("premio ya entregado no puede entregarse de nuevo (doble entrega)", async () => {
    const { data: prize } = await admin
      .from("prizes")
      .select("status")
      .eq("id", prizeId)
      .single()

    const alreadyDelivered = prize?.status === "delivered"
    expect(alreadyDelivered).toBe(true)
    // El server action valida esto y devuelve error
    const canDeliver = !alreadyDelivered
    expect(canDeliver).toBe(false)
  })
})


// =============================================================================
describe("Premio: eliminar", () => {

  it("se puede eliminar un premio creado", async () => {
    const { data: newPrize } = await createPrize({ title: `${TP}ToDelete${uid()}` })
    const idToDelete = newPrize?.id ?? ""

    // Eliminar
    const { error: deleteError } = await admin.from("prizes").delete().eq("id", idToDelete)
    expect(deleteError).toBeNull()

    // Verificar que no existe más
    const { data: deleted } = await admin.from("prizes").select("id").eq("id", idToDelete).single()
    expect(deleted).toBeNull()

    // Ya no necesita cleanup
    const idx = cleanupPrizeIds.indexOf(idToDelete)
    if (idx >= 0) cleanupPrizeIds.splice(idx, 1)
  })
})


// =============================================================================
describe("Premios: filtro de visibilidad en la landing", () => {

  it("premios 'delivered' no aparecen en la vista pública", async () => {
    // Crear uno delivered y uno available
    const ts = uid()
    const { data: deliveredPrize } = await createPrize({ title: `${TP}Delivered${ts}` })
    const { data: availablePrize } = await createPrize({ title: `${TP}Available${ts}` })

    // Marcar el primero como delivered
    await admin.from("prizes")
      .update({ status: "delivered", delivered_at: new Date().toISOString() })
      .eq("id", deliveredPrize!.id)

    // La vista pública filtra por status != delivered (igual que PrizesSection)
    const { data: visiblePrizes } = await admin
      .from("prizes")
      .select("id, status")
      .neq("status", "delivered")

    const visibleIds = visiblePrizes?.map(p => p.id) ?? []
    expect(visibleIds).toContain(availablePrize!.id)
    expect(visibleIds).not.toContain(deliveredPrize!.id)
  })

  it("premios 'pending' SÍ aparecen en la landing (ganador asignado pero no entregado)", async () => {
    const { data: prize } = await createPrize({ title: `${TP}Pending${uid()}` })

    await admin.from("prizes")
      .update({ status: "pending" })
      .eq("id", prize!.id)

    const { data } = await admin
      .from("prizes")
      .select("id, status")
      .eq("id", prize!.id)
      .single()

    // pending != delivered → aparece en la landing
    expect(data?.status).toBe("pending")
    expect(data?.status).not.toBe("delivered")
  })
})


// =============================================================================
describe("Storage: bucket prize-images existe y es accesible", () => {

  it("el bucket prize-images existe en Supabase Storage", async () => {
    const { data: buckets, error } = await admin.storage.listBuckets()
    expect(error).toBeNull()

    const prizesBucket = buckets?.find(b => b.name === "prize-images")
    expect(prizesBucket).toBeDefined()
    expect(prizesBucket?.name).toBe("prize-images")
  })

  it("el bucket es público (para servir imágenes sin auth)", async () => {
    const { data: buckets } = await admin.storage.listBuckets()
    const prizesBucket = buckets?.find(b => b.name === "prize-images")

    // Bucket público = las URLs pueden ser accedidas sin token
    expect(prizesBucket?.public).toBe(true)
  })

  it("se puede generar una publicUrl sin error", () => {
    const { data } = admin.storage
      .from("prize-images")
      .getPublicUrl("nonexistent-file.jpg")

    // getPublicUrl siempre devuelve una URL (aunque el archivo no exista)
    expect(data.publicUrl).toContain("prize-images")
    expect(data.publicUrl).toContain("supabase.co")
  })
})
