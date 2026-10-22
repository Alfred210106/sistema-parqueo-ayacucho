/**
 * Autenticación del Sistema de Parqueo — Centro Histórico de Ayacucho.
 * Sesiones firmadas con HMAC-SHA256 (tipo JWT) guardadas en cookie httpOnly.
 * Roles: CONDUCTOR | ADMIN.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const COOKIE_SESION = 'pa_sesion'
const SECRETO = process.env.AUTH_SECRET || 'parqueo-ayacucho-secreto-para-desarrollo'
const DURACION_SEG = 7 * 24 * 60 * 60 // 7 días

export type Rol = 'CONDUCTOR' | 'ADMIN'

export interface Sesion {
  uid: number
  nombre: string
  email: string
  rol: Rol
  exp: number
}

/** Firma la sesión del usuario y devuelve el token "payload.firma" */
export function firmarSesion(datos: Omit<Sesion, 'exp'>): string {
  const payload: Sesion = { ...datos, exp: Math.floor(Date.now() / 1000) + DURACION_SEG }
  const cuerpo = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const firma = createHmac('sha256', SECRETO).update(cuerpo).digest('base64url')
  return `${cuerpo}.${firma}`
}

/** Verifica la firma y vigencia del token; devuelve la sesión o null */
export function verificarSesion(token?: string | null): Sesion | null {
  if (!token) return null
  const [cuerpo, firma] = token.split('.')
  if (!cuerpo || !firma) return null
  const esperada = createHmac('sha256', SECRETO).update(cuerpo).digest('base64url')
  const a = Buffer.from(firma)
  const b = Buffer.from(esperada)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const sesion = JSON.parse(Buffer.from(cuerpo, 'base64url').toString()) as Sesion
    if (!sesion.exp || sesion.exp < Math.floor(Date.now() / 1000)) return null
    return sesion
  } catch {
    return null
  }
}

/** Lee la sesión actual desde la cookie httpOnly (solo servidor) */
export async function getSesion(): Promise<Sesion | null> {
  const store = await cookies()
  return verificarSesion(store.get(COOKIE_SESION)?.value)
}

/** Opciones seguras de la cookie de sesión */
export function opcionesCookie() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: DURACION_SEG,
    secure: process.env.NODE_ENV === 'production',
  }
}
