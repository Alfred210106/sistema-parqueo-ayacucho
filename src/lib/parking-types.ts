/** Tipos compartidos entre el servicio de datos (servidor) y los componentes (cliente) */

export type EstadoCochera = 'DISPONIBLE' | 'ULTIMOS' | 'LLENO'
export type EstadoReserva = 'ACTIVA' | 'FINALIZADA' | 'CANCELADA'

export interface CocheraDTO {
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
  estado: EstadoCochera
  ocupacionPct: number
}

export interface ReservaDTO {
  id: number
  codigo: string
  placa: string
  cocheraId: number
  cocheraNombre: string
  horas: number
  monto: number
  estado: EstadoReserva
  createdAt: string
  usuarioNombre?: string | null
}

/** Usuario autenticado devuelto por /api/auth/me */
export interface UsuarioSesion {
  id: number
  nombre: string
  email: string
  rol: 'CONDUCTOR' | 'ADMIN'
}

export interface CocheraResumen {
  id: number
  nombre: string
  ingresos: number
  reservas: number
  ocupados: number
  totalEspacios: number
}

export interface AdminStats {
  ingresosAcumulados: number
  ingresosActivos: number
  ingresosFinalizados: number
  totalReservas: number
  reservasActivas: number
  reservasFinalizadas: number
  reservasCanceladas: number
  espaciosTotales: number
  espaciosOcupados: number
  ocupacionGlobalPct: number
  porCochera: CocheraResumen[]
}

/** Formatea placa peruana mientras se escribe: ABC-123 / A1B-234 */
export function formatearPlaca(valor: string): string {
  const limpio = valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  if (limpio.length <= 3) return limpio
  return `${limpio.slice(0, 3)}-${limpio.slice(3)}`
}

export const PLACA_REGEX = /^[A-Z0-9]{3}-[0-9]{3}$/

export const moneda = (n: number) =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
