'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  CalendarClock,
  Car,
  CircleAlert,
  Loader2,
  MapPin,
  Ticket,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  formatearPlaca,
  moneda,
  PLACA_REGEX,
  type CocheraDTO,
  type ReservaDTO,
} from '@/lib/parking-types'

const HORAS = [1, 2, 3, 4, 6, 8, 12]

interface Props {
  cochera: CocheraDTO | null
  onClose: () => void
  onReservada: () => void
}

export function ReservarDialog({ cochera, onClose, onReservada }: Props) {
  const { toast } = useToast()
  const [placa, setPlaca] = useState('')
  const [horas, setHoras] = useState(1)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmada, setConfirmada] = useState<ReservaDTO | null>(null)

  useEffect(() => {
    if (cochera) {
      setPlaca('')
      setHoras(1)
      setEnviando(false)
      setError(null)
      setConfirmada(null)
    }
  }, [cochera])

  const monto = useMemo(() => {
    if (!cochera) return 0
    return +(cochera.tarifaHora * horas).toFixed(2)
  }, [cochera, horas])

  const placaValida = PLACA_REGEX.test(placa)

  async function reservar() {
    if (!cochera) return
    setEnviando(true)
    setError(null)
    try {
      const res = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cocheraId: cochera.id, placa, horas }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'No se pudo registrar la reserva.')
        return
      }
      setConfirmada(data.reserva as ReservaDTO)
      onReservada()
      toast({
        title: 'Reserva registrada',
        description: `Un espacio reservado en ${cochera.nombre} para la placa ${placa}.`,
      })
    } catch {
      setError('Error de conexión con el servidor. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={!!cochera} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {!confirmada ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Car className="h-5 w-5 text-emerald-600" />
                Registro de Vehículo — Reservar Lugar
              </DialogTitle>
              <DialogDescription id="reserva-descripcion">
                Completa los datos para simular el ingreso de tu vehículo.
              </DialogDescription>
            </DialogHeader>

            {cochera && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-sm font-bold text-emerald-900">{cochera.nombre}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-700">
                  <MapPin className="h-3 w-3" /> {cochera.direccion} · {cochera.referencia}
                </p>
                <p className="mt-1 text-xs font-semibold text-emerald-800">
                  {cochera.disponibles} espacios libres · {moneda(cochera.tarifaHora)}/hora
                </p>
              </div>
            )}

            <div className="grid gap-4 py-1">
              <div className="grid gap-2">
                <Label htmlFor="placa" className="text-sm font-semibold">
                  Placa vehicular
                </Label>
                <Input
                  id="placa"
                  placeholder="ABC-123"
                  value={placa}
                  onChange={(e) => setPlaca(formatearPlaca(e.target.value))}
                  className={cn(
                    'h-11 text-center font-mono text-lg font-bold tracking-[0.2em] uppercase',
                    placa && !placaValida && 'border-red-400 focus-visible:ring-red-300'
                  )}
                  maxLength={7}
                  autoComplete="off"
                  autoFocus
                />
                {placa && !placaValida && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <CircleAlert className="h-3.5 w-3.5" />
                    Formato peruano requerido: 3 letras/números, guión y 3 dígitos (ABC-123).
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-semibold">
                  <CalendarClock className="mr-1 inline h-4 w-4" />
                  Horas de estacionamiento
                </Label>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Horas">
                  {HORAS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHoras(h)}
                      aria-pressed={horas === h}
                      className={cn(
                        'min-w-11 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                        horas === h
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-400 hover:text-emerald-700'
                      )}
                    >
                      {h} h
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-stone-900 px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-stone-300">
                    {moneda(cochera?.tarifaHora ?? 0)} × {horas} h
                  </span>
                </div>
                <span className="text-xl font-extrabold text-emerald-400">{moneda(monto)}</span>
              </div>

              {error && (
                <p
                  role="alert"
                  className="flex items-start gap-1.5 rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-700"
                >
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button
                onClick={reservar}
                disabled={!placaValida || enviando}
                className="flex-[2] bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
              >
                {enviando ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Registrando…
                  </>
                ) : (
                  'Confirmar reserva'
                )}
              </Button>
            </div>
          </>
        ) : (
          /* ---- Ticket de confirmación ---- */
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <BadgeCheck className="h-9 w-9 text-emerald-600" />
            </div>
            <DialogHeader className="mt-3">
              <DialogTitle className="text-center text-lg">
                ¡Reserva registrada con éxito!
              </DialogTitle>
              <DialogDescription className="text-center">
                Presenta este código al llegar a la cochera. Tu espacio quedó reservado.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-4">
              <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                <Ticket className="h-4 w-4" /> Código de reserva
              </p>
              <p className="mt-1 font-mono text-3xl font-extrabold tracking-wider text-emerald-800">
                {confirmada.codigo}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-left text-xs">
                <div className="rounded-lg bg-white p-2">
                  <p className="text-stone-500">Placa</p>
                  <p className="font-mono text-sm font-bold">{confirmada.placa}</p>
                </div>
                <div className="rounded-lg bg-white p-2">
                  <p className="text-stone-500">Tiempo</p>
                  <p className="text-sm font-bold">{confirmada.horas} hora(s)</p>
                </div>
                <div className="col-span-2 rounded-lg bg-white p-2">
                  <p className="text-stone-500">Cochera</p>
                  <p className="text-sm font-bold">{confirmada.cocheraNombre}</p>
                </div>
                <div className="col-span-2 flex items-center justify-between rounded-lg bg-white p-2">
                  <p className="text-stone-500">Monto a pagar</p>
                  <p className="text-base font-extrabold text-emerald-700">
                    {moneda(confirmada.monto)}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="mt-4 w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
            >
              Entendido
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
