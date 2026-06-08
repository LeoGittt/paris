"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type AvatarResult = { ok: true; url: string } | { ok: false; error: string }

export async function updateAvatar(formData: FormData): Promise<AvatarResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "No autenticado." }

  const file = formData.get("avatar") as File | null
  if (!file || file.size === 0) return { ok: false, error: "No se recibió ningún archivo." }
  if (file.size > 2 * 1024 * 1024) return { ok: false, error: "La imagen no puede superar los 2 MB." }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return { ok: false, error: "Solo se aceptan imágenes JPG, PNG o WebP." }

  const path = `${user.id}/avatar`
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { ok: false, error: "Error al subir la imagen." }

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)

  // Agregar cache-bust para que el browser no muestre la imagen vieja
  const urlWithBust = `${publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabase
    .from("participants")
    .update({ avatar_url: urlWithBust } as never)
    .eq("user_id", user.id)

  if (updateError) return { ok: false, error: "Error al guardar la foto." }

  revalidatePath("/empleados/ranking")
  return { ok: true, url: urlWithBust }
}
