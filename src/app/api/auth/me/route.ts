import { NextResponse } from 'next/server'
import { getSesion } from '@/lib/auth'

// GET /api/auth/me — Devuelve el usuario de la sesión actual (o null)
export async function GET() {
  try {
    const sesion = await getSesion()
    return NextResponse.json({
      ok: true,
      usuario: sesion
        ? { id: sesion.uid, nombre: sesion.nombre, email: sesion.email, rol: sesion.rol }
        : null,
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Error al consultar la sesión.' },
      { status: 500 }
    )
  }
}
