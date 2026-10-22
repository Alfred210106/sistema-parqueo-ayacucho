import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * El cliente cacheado solo se reutiliza si expone los modelos actuales del
 * esquema. Así, tras ejecutar `prisma generate` en desarrollo, el servidor
 * adopta el cliente regenerado sin reiniciar el proceso.
 */
function clienteVigente(c: PrismaClient | undefined): c is PrismaClient {
  return (
    !!c &&
    typeof (c as unknown as { user?: { findUnique?: unknown } }).user?.findUnique === 'function' &&
    typeof (c as unknown as { cochera?: { findUnique?: unknown } }).cochera?.findUnique ===
      'function'
  )
}

function crearCliente(): PrismaClient {
  const nuevo = new PrismaClient({
    log: ['query'],
  })
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = nuevo
  return nuevo
}

export const db = clienteVigente(globalForPrisma.prisma) ? globalForPrisma.prisma : crearCliente()
