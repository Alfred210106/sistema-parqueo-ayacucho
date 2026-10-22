'use client'

import { motion } from 'framer-motion'
import {
  Banknote,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  Clock4,
  LogOut,
  XCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { moneda, type AdminStats, type ReservaDTO } from '@/lib/parking-types'

interface Props {
  stats: AdminStats | null
  reservas: ReservaDTO[]
  onAccion: (id: number, cancelar: boolean) => Promise<void>
  procesandoId: number | null
}

const ESTADO_BADGE: Record<ReservaDTO['estado'], { clase: string; texto: string }> = {
  ACTIVA: { clase: 'bg-emerald-100 text-emerald-800 border-emerald-200', texto: 'Activa' },
  FINALIZADA: { clase: 'bg-stone-100 text-stone-600 border-stone-200', texto: 'Finalizada' },
  CANCELADA: { clase: 'bg-red-100 text-red-700 border-red-200', texto: 'Cancelada' },
}

export function AdminPanel({ stats, reservas, onAccion, procesandoId }: Props) {
  const { toast } = useToast()

  async function accion(id: number, cancelar: boolean) {
    await onAccion(id, cancelar)
    toast({
      title: cancelar ? 'Reserva cancelada' : 'Salida registrada',
      description: cancelar
        ? 'La reserva fue cancelada y el espacio quedó libre.'
        : 'El vehículo salió de la cochera y el espacio quedó libre.',
    })
  }

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-stone-100" />
        ))}
      </div>
    )
  }

  const maxIngresos = Math.max(...stats.porCochera.map((c) => c.ingresos), 1)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-100">
                <Banknote className="h-4 w-4" /> Ingresos acumulados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.p
                key={stats.ingresosAcumulados}
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                className="text-3xl font-extrabold tabular-nums"
              >
                {moneda(stats.ingresosAcumulados)}
              </motion.p>
              <p className="mt-1 text-xs text-emerald-100/90">
                Generados por {stats.totalReservas} reservas simuladas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Clock4 className="h-4 w-4 text-emerald-600" /> Reservas activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold tabular-nums text-emerald-700">
                {stats.reservasActivas}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Por cobrar: <span className="font-bold text-stone-800">{moneda(stats.ingresosActivos)}</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-stone-500" /> Salidas registradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold tabular-nums">{stats.reservasFinalizadas}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Cobradas: <span className="font-bold text-stone-800">{moneda(stats.ingresosFinalizados)}</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <CarFront className="h-4 w-4 text-amber-600" /> Ocupación global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold tabular-nums">
                {stats.ocupacionGlobalPct}
                <span className="text-lg">%</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stats.espaciosOcupados} de {stats.espaciosTotales} espacios ocupados
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Ingresos por cochera */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <CircleDollarSign className="h-4 w-4 text-emerald-600" />
              Ingresos por cochera
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...stats.porCochera]
              .sort((a, b) => b.ingresos - a.ingresos)
              .map((c, idx) => (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                    <span className="truncate font-medium">{c.nombre}</span>
                    <span className="shrink-0 font-bold tabular-nums text-emerald-700">
                      {moneda(c.ingresos)}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.ingresos / maxIngresos) * 100}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {c.reservas} reservas · {c.ocupados}/{c.totalEspacios} espacios ocupados
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Historial de reservas */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Movimientos recientes</CardTitle>
            <Badge variant="outline" className="bg-stone-100 text-stone-600">
              Actualización automática
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 bg-stone-50">
                  <TableRow>
                    <TableHead className="text-xs">Código</TableHead>
                    <TableHead className="text-xs">Placa</TableHead>
                    <TableHead className="text-xs">Cochera</TableHead>
                    <TableHead className="text-xs">Usuario</TableHead>
                    <TableHead className="text-center text-xs">Hrs</TableHead>
                    <TableHead className="text-right text-xs">Monto</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs">Hora</TableHead>
                    <TableHead className="text-right text-xs">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                        Aún no hay reservas registradas.
                      </TableCell>
                    </TableRow>
                  )}
                  {reservas.map((r) => {
                    const badge = ESTADO_BADGE[r.estado]
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs font-bold">{r.codigo}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold">{r.placa}</TableCell>
                        <TableCell className="max-w-40 truncate text-xs">{r.cocheraNombre}</TableCell>
                        <TableCell className="max-w-28 truncate text-xs text-stone-500">
                          {r.usuarioNombre ?? '—'}
                        </TableCell>
                        <TableCell className="text-center text-xs tabular-nums">{r.horas}</TableCell>
                        <TableCell className="text-right text-xs font-bold tabular-nums text-emerald-700">
                          {moneda(r.monto)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-[10px]', badge.clase)}>
                            {badge.texto}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {format(new Date(r.createdAt), 'dd MMM HH:mm', { locale: es })}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.estado === 'ACTIVA' ? (
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={procesandoId === r.id}
                                onClick={() => accion(r.id, false)}
                                className="h-7 gap-1 border-emerald-200 px-2 text-[11px] text-emerald-700 hover:bg-emerald-50"
                              >
                                <LogOut className="h-3 w-3" /> Salida
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={procesandoId === r.id}
                                onClick={() => accion(r.id, true)}
                                className="h-7 gap-1 border-red-200 px-2 text-[11px] text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-3 w-3" /> Cancelar
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
