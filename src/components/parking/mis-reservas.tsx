'use client'

import { motion } from 'framer-motion'
import { CalendarClock, MapPin, Ticket, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { moneda, type ReservaDTO } from '@/lib/parking-types'

interface Props {
  reservas: ReservaDTO[]
  onCancelar: (id: number) => void
  procesandoId: number | null
}

const ESTADO_CLASE: Record<ReservaDTO['estado'], string> = {
  ACTIVA: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  FINALIZADA: 'bg-stone-100 text-stone-600 border-stone-200',
  CANCELADA: 'bg-red-100 text-red-700 border-red-200',
}

export function MisReservas({ reservas, onCancelar, procesandoId }: Props) {
  if (reservas.length === 0) {
    return (
      <Card className="border-dashed border-stone-300 bg-white/60">
        <CardContent className="flex items-center gap-3 py-4">
          <Ticket className="h-5 w-5 text-stone-400" />
          <p className="text-sm text-stone-600">
            Aún no tienes reservas. Elige una cochera con espacios y toca{' '}
            <span className="font-bold text-emerald-700">Reservar Lugar</span>.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-emerald-100">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <Ticket className="h-4 w-4 text-emerald-600" /> Mis reservas
          <Badge variant="outline" className="ml-1 bg-emerald-50 text-emerald-700">
            {reservas.filter((r) => r.estado === 'ACTIVA').length} activas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {reservas.map((r) => (
          <motion.div
            key={r.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-stone-200 bg-stone-50 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-sm font-extrabold tracking-wide text-stone-800">
                {r.codigo}
              </p>
              <Badge variant="outline" className={cn('text-[10px]', ESTADO_CLASE[r.estado])}>
                {r.estado === 'ACTIVA'
                  ? 'Activa'
                  : r.estado === 'FINALIZADA'
                    ? 'Finalizada'
                    : 'Cancelada'}
              </Badge>
            </div>
            <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-stone-700">
              <MapPin className="h-3 w-3 shrink-0 text-stone-400" />
              <span className="truncate">{r.cocheraNombre}</span>
            </p>
            <p className="mt-1 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
                {format(new Date(r.createdAt), 'dd MMM HH:mm', { locale: es })}
              </span>
              <span className="font-bold text-emerald-700">{moneda(r.monto)}</span>
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-stone-600">{r.placa}</span>
              {r.estado === 'ACTIVA' && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={procesandoId === r.id}
                  onClick={() => onCancelar(r.id)}
                  className="h-7 gap-1 border-red-200 px-2 text-[11px] text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-3 w-3" /> Cancelar
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}
