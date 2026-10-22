import { NextResponse } from 'next/server'
import { COOKIE_SESION, opcionesCookie } from '@/lib/auth'

// POST /api/auth/logout — Cierra la sesión eliminando la cookie
export async function POST() {
  const res = NextResponse.json({ ok: true, mensaje: 'Sesión cerrada.' })
  res.cookies.set(COOKIE_SESION, '', { ...opcionesCookie(), maxAge: 0 })
  return res
}
