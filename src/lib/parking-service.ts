/**
 * Servicio de datos del Sistema de Parqueo — Centro Histórico de Ayacucho
 * Capa de acceso a datos (SQLite vía Prisma). Equivalente al "service" de datos.
 */
import { db } from '@/lib/db'
import type { CocheraDTO, ReservaDTO, AdminStats } from '@/lib/parking-types'

const UMBRAL_ULTIMOS = 3

function toDTO(c: {
  id: number
  nombre: string
  direccion: string
  referencia: string
  totalEspacios: number
  disponibles: number
  tarifaHora: number
  horario: string
  telefono: string
  lat: number
  lng: number
}): CocheraDTO {
  const estado = c.disponibles === 0 ? 'LLENO' : c.disponibles <= UMBRAL_ULTIMOS ? 'ULTIMOS' : 'DISPONIBLE'
  return {
    ...c,
    estado,
    ocupacionPct: Math.round(((c.totalEspacios - c.disponibles) / c.totalEspacios) * 100),
  }
}

function generarCodigo(seq: number): string {
  const aleatorio = Math.floor(1000 + Math.random() * 9000)
  return `AYC-${seq}${aleatorio}`
}

/** Lista todas las cocheras con su estado calculado en tiempo real */
export async function listarCocheras(): Promise<CocheraDTO[]> {
  const cocheras = await db.cochera.findMany({ orderBy: { id: 'asc' } })
  return cocheras.map(toDTO)
}

/** Valida el formato de placa peruana: ABC-123 o A1B-234 */
export function validarPlaca(placa: string): boolean {
  return /^[A-Z0-9]{3}-[0-9]{3}$/.test(placa)
}

export type ResultadoReserva =
  | { ok: true; reserva: ReservaDTO }
  | { ok: false; error: string }

/**
 * Registra una reserva de forma atómica:
 * valida placa, verifica cupo, decrementa disponibles y crea la reserva.
 */
export async function crearReserva(input: {
  cocheraId: number
  placa: string
  horas: number
  userId: number
}): Promise<ResultadoReserva> {
  const placa = input.placa.trim().toUpperCase()
  if (!validarPlaca(placa)) {
    return { ok: false, error: 'Formato de placa inválido. Use el formato ABC-123.' }
  }
  if (!Number.isInteger(input.horas) || input.horas < 1 || input.horas > 12) {
    return { ok: false, error: 'Las horas deben estar entre 1 y 12.' }
  }

  try {
    const reserva = await db.$transaction(async (tx) => {
      const cochera = await tx.cochera.findUnique({ where: { id: input.cocheraId } })
      if (!cochera) throw new Error('La cochera indicada no existe.')
      if (cochera.disponibles <= 0) throw new Error('La cochera está LLENA en este momento.')

      await tx.cochera.update({
        where: { id: cochera.id },
        data: { disponibles: { decrement: 1 } },
      })

      const total = await tx.reserva.count()
      const monto = +(cochera.tarifaHora * input.horas).toFixed(2)
      return tx.reserva.create({
        data: {
          codigo: generarCodigo(total + 1),
          placa,
          cocheraId: cochera.id,
          userId: input.userId,
          horas: input.horas,
          monto,
          estado: 'ACTIVA',
        },
        include: { cochera: true },
      })
    })

    return {
      ok: true,
      reserva: {
        id: reserva.id,
        codigo: reserva.codigo,
        placa: reserva.placa,
        cocheraId: reserva.cocheraId,
        cocheraNombre: reserva.cochera.nombre,
        horas: reserva.horas,
        monto: reserva.monto,
        estado: 'ACTIVA',
        createdAt: reserva.createdAt.toISOString(),
      },
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al registrar la reserva.' }
  }
}

/** Lista las últimas reservas (panel admin) o solo las del conductor indicado */
export async function listarReservas(
  limite = 50,
  opciones?: { userId?: number }
): Promise<ReservaDTO[]> {
  const reservas = await db.reserva.findMany({
    where: opciones?.userId ? { userId: opciones.userId } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limite,
    include: { cochera: true, user: { select: { nombre: true } } },
  })
  return reservas.map((r) => ({
    id: r.id,
    codigo: r.codigo,
    placa: r.placa,
    cocheraId: r.cocheraId,
    cocheraNombre: r.cochera.nombre,
    horas: r.horas,
    monto: r.monto,
    estado: r.estado as ReservaDTO['estado'],
    createdAt: r.createdAt.toISOString(),
    usuarioNombre: r.user?.nombre ?? null,
  }))
}

/** Finaliza o cancela una reserva y libera un espacio.
 *  El ADMIN puede operar cualquier reserva; el CONDUCTOR solo la suya. */
export async function finalizarReserva(
  id: number,
  nuevoEstado: 'FINALIZADA' | 'CANCELADA',
  actor: { uid: number; rol: 'CONDUCTOR' | 'ADMIN' }
): Promise<{ ok: boolean; error?: string }> {
  try {
    await db.$transaction(async (tx) => {
      const reserva = await tx.reserva.findUnique({ where: { id } })
      if (!reserva) throw new Error('Reserva no encontrada.')
      if (reserva.estado !== 'ACTIVA') throw new Error('La reserva ya no está activa.')
      if (actor.rol !== 'ADMIN' && reserva.userId !== actor.uid) {
        throw new Error('No puedes modificar una reserva que no es tuya.')
      }

      await tx.reserva.update({ where: { id }, data: { estado: nuevoEstado } })

      const cochera = await tx.cochera.findUnique({ where: { id: reserva.cocheraId } })
      if (cochera && cochera.disponibles < cochera.totalEspacios) {
        await tx.cochera.update({
          where: { id: cochera.id },
          data: { disponibles: { increment: 1 } },
        })
      }
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al actualizar la reserva.' }
  }
}

/** Estadísticas para el panel de administración: ingresos acumulados, etc. */
export async function obtenerEstadisticas(): Promise<AdminStats> {
  const [cocheras, reservas] = await Promise.all([
    db.cochera.findMany({ orderBy: { id: 'asc' } }),
    db.reserva.findMany({ include: { cochera: true } }),
  ])

  const validas = reservas.filter((r) => r.estado !== 'CANCELADA')
  const ingresosAcumulados = +validas.reduce((s, r) => s + r.monto, 0).toFixed(2)
  const ingresosActivos = +validas
    .filter((r) => r.estado === 'ACTIVA')
    .reduce((s, r) => s + r.monto, 0)
    .toFixed(2)
  const ingresosFinalizados = +validas
    .filter((r) => r.estado === 'FINALIZADA')
    .reduce((s, r) => s + r.monto, 0)
    .toFixed(2)

  const espaciosTotales = cocheras.reduce((s, c) => s + c.totalEspacios, 0)
  const espaciosOcupados = cocheras.reduce((s, c) => s + (c.totalEspacios - c.disponibles), 0)

  const porCochera = cocheras.map((c) => {
    const deCochera = validas.filter((r) => r.cocheraId === c.id)
    return {
      id: c.id,
      nombre: c.nombre,
      ingresos: +deCochera.reduce((s, r) => s + r.monto, 0).toFixed(2),
      reservas: deCochera.length,
      ocupados: c.totalEspacios - c.disponibles,
      totalEspacios: c.totalEspacios,
    }
  })

  return {
    ingresosAcumulados,
    ingresosActivos,
    ingresosFinalizados,
    totalReservas: reservas.length,
    reservasActivas: reservas.filter((r) => r.estado === 'ACTIVA').length,
    reservasFinalizadas: reservas.filter((r) => r.estado === 'FINALIZADA').length,
    reservasCanceladas: reservas.filter((r) => r.estado === 'CANCELADA').length,
    espaciosTotales,
    espaciosOcupados,
    ocupacionGlobalPct: espaciosTotales
      ? Math.round((espaciosOcupados / espaciosTotales) * 100)
      : 0,
    porCochera,
  }
}
