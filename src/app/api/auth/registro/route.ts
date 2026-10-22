import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/passwords'
import { COOKIE_SESION, firmarSesion, opcionesCookie, type Rol } from '@/lib/auth'

const ROLES_VALIDOS: Rol[] = ['CONDUCTOR', 'ADMIN']
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST /api/auth/registro — Crea una cuenta (conductor o administrador) e inicia sesión
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const nombre = String(body?.nombre ?? '').trim()
    const email = String(body?.email ?? '').trim().toLowerCase()
    const password = String(body?.password ?? '')
    const rol = String(body?.rol ?? 'CONDUCTOR') as Rol

    if (nombre.length < 3) {
      return NextResponse.json(
        { ok: false, error: 'El nombre debe tener al menos 3 caracteres.' },
        { status: 400 }
      )
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { ok: false, error: 'Ingresa un correo electrónico válido.' },
        { status: 400 }
      )
    }
    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      )
    }
    if (!ROLES_VALIDOS.includes(rol)) {
      return NextResponse.json({ ok: false, error: 'Rol inválido.' }, { status: 400 })
    }

    const existente = await db.user.findUnique({ where: { email } })
    if (existente) {
      return NextResponse.json(
        { ok: false, error: 'Ya existe una cuenta con ese correo. Inicia sesión.' },
        { status: 409 }
      )
    }

    const user = await db.user.create({
      data: { nombre, email, password: hashPassword(password), rol },
    })

    const token = firmarSesion({ uid: user.id, nombre: user.nombre, email: user.email, rol: user.rol as Rol })
    const res = NextResponse.json(
      {
        ok: true,
        usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
      },
      { status: 201 }
    )
    res.cookies.set(COOKIE_SESION, token, opcionesCookie())
    return res
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Error interno al crear la cuenta.' },
      { status: 500 }
    )
  }
}
