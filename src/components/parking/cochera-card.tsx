'use client'

import { motion } from 'framer-motion'
import { Car, Clock, MapPin, Phone, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { moneda, type CocheraDTO } from '@/lib/parking-types'

interface Props {
  cochera: CocheraDTO
  onReservar: (cochera: CocheraDTO) => void
}

const ESTILOS = {
  DISPONIBLE: {
    card: 'border-emerald-200 hover:border-emerald-400',
    top: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    barra: 'bg-emerald-500',
    indicador: '[&>[data-slot=progress-indicator]]:bg-emerald-500',
    texto: 'text-emerald-700',
    icono: 'bg-emerald-100 text-emerald-600',
    etiqueta: 'Con espacios disponibles',
  },
  ULTIMOS: {
    card: 'border-amber-200 hover:border-amber-400',
    top: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
    barra: 'bg-amber-500',
    indicador: '[&>[data-slot=progress-indicator]]:bg-amber-500',
    texto: 'text-amber-700',
    icono: 'bg-amber-100 text-amber-600',
    etiqueta: '¡Últimos espacios!',
  },
  LLENO: {
    card: 'border-red-200 hover:border-red-300 opacity-95',
    top: 'bg-red-500',
    badge: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
    barra: 'bg-red-500',
    indicador: '[&>[data-slot=progress-indicator]]:bg-red-500',
    texto: 'text-red-700',
    icono: 'bg-red-100 text-red-600',
    etiqueta: 'Cochera llena',
  },
} as const

export function CocheraCard({ cochera, onReservar }: Props) {
  const e = ESTILOS[cochera.estado]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -3 }}
      className="h-full"
    >
      <Card
        className={cn(
          'relative h-full overflow-hidden pt-0 gap-4 transition-shadow hover:shadow-lg',
          e.card
        )}
        aria-label={`Cochera ${cochera.nombre}`}
      >
        <div className={cn('h-1.5 w-full', e.top)} />

        <CardHeader className="pb-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                e.icono
              )}
            >
              <Car className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold leading-tight">{cochera.nombre}</h3>
              <p className="truncate text-xs text-muted-foreground">{cochera.direccion}</p>
            </div>
          </div>
          <Badge variant="outline" className={cn('mt-2 w-fit', e.badge)}>
            <span className={cn('mr-1 inline-block h-2 w-2 rounded-full', e.barra)} />
            {e.etiqueta}
          </Badge>
        </CardHeader>

        <CardContent className="pb-0">
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-2">{cochera.referencia}</span>
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{cochera.horario}</span>
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {cochera.telefono}
          </p>

          {/* Disponibilidad en tiempo real */}
          <div className="mt-4 rounded-xl bg-stone-50 p-3">
            <div className="flex items-end justify-between">
              <div>
                <motion.span
                  key={cochera.disponibles}
                  initial={{ scale: 1.35 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    'inline-block text-3xl font-extrabold tabular-nums',
                    cochera.estado === 'LLENO' ? 'text-red-600' : cochera.estado === 'ULTIMOS' ? 'text-amber-600' : 'text-emerald-700'
                  )}
                >
                  {cochera.disponibles}
                </motion.span>
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  de {cochera.totalEspacios} libres
                </span>
              </div>
              <div className="text-right">
                <p className={cn('text-lg font-bold', e.texto)}>{moneda(cochera.tarifaHora)}</p>
                <p className="text-[11px] text-muted-foreground">por hora</p>
              </div>
            </div>
            <div className="mt-2.5">
              <Progress
                value={cochera.ocupacionPct}
                aria-label={`Ocupación ${cochera.ocupacionPct}%`}
                className={cn('h-2 bg-stone-200', e.indicador)}
              />
              <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                Ocupación: <span className={cn('font-bold', e.texto)}>{cochera.ocupacionPct}%</span>
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="mt-auto">
          <Button
            onClick={() => onReservar(cochera)}
            disabled={cochera.estado === 'LLENO'}
            className={cn(
              'w-full font-semibold',
              cochera.estado === 'LLENO'
                ? 'bg-stone-200 text-stone-500'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            )}
          >
            {cochera.estado === 'LLENO' ? (
              'Cochera llena'
            ) : (
              <>
                Reservar Lugar
                <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
