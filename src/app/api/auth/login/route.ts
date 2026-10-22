import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verificarPassword } from '@/lib/passwords'
import { COOKIE_SESION, firmarSesion, opcionesCookie, type Rol } from '@/lib/auth'

// POST /api/auth/login — Inicia sesión y devuelve la cookie firmada
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const email = String(body?.email ?? '').trim().toLowerCase()
    const password = String(body?.password ?? '')

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Ingresa tu correo y contraseña.' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user || !verificarPassword(password, user.password)) {
      return NextResponse.json(
        { ok: false, error: 'Correo o contraseña incorrectos.' },
        { status: 401 }
      )
    }

    const token = firmarSesion({ uid: user.id, nombre: user.nombre, email: user.email, rol: user.rol as Rol })
    const res = NextResponse.json({
      ok: true,
      usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    })
    res.cookies.set(COOKIE_SESION, token, opcionesCookie())
    return res
  } catch (e) {
    console.error('[login] Error:', e)
    return NextResponse.json(
      { ok: false, error: 'Error interno al iniciar sesión.' },
      { status: 500 }
    )
  }
}
