import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Obtener la sesión actual del servidor (debe venir del callback de recovery)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: "No hay una sesión válida. Por favor, solicitá un nuevo enlace de reset." },
        { status: 401 }
      )
    }

    // Intentar actualizar la contraseña
    let error = null

    // Método 1: updateUser (para sesiones de recovery)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    error = updateError

    // Si falla y es porque no hay sesión de recovery, intentar con changeUserPassword (requiere contraseña actual)
    // Por ahora solo reportamos el error de updateUser

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Cerrar la sesión después de cambiar la contraseña
    await supabase.auth.signOut()

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Update password error:", err)
    return NextResponse.json(
      { error: "Error al cambiar la contraseña. Intentá de nuevo." },
      { status: 500 }
    )
  }
}
