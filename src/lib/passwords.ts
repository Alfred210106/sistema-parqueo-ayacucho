/**
 * Utilidades de cifrado de contraseñas (scrypt + salt aleatorio).
 * Archivo independiente de Next.js para poder usarse también en el seed.
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

/** Genera "salt:hash" con scrypt (64 bytes) a partir de la contraseña en texto plano */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(plain, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

/** Verifica la contraseña comparando en tiempo constante */
export function verificarPassword(plain: string, almacenada: string): boolean {
  const [salt, hash] = almacenada.split(':')
  if (!salt || !hash) return false
  const calculado = scryptSync(plain, salt, 64)
  const esperado = Buffer.from(hash, 'hex')
  return calculado.length === esperado.length && timingSafeEqual(calculado, esperado)
}
