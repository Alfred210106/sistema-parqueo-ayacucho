import { NextRequest, NextResponse } from 'next/server'
import { finalizarReserva } from '@/lib/parking-service'
import { getSesion } from '@/lib/auth'

// POST /api/reservas/[id]/finalizar — Simula la salida del vehículo (libera un espacio)
// Body opcional: { cancelar?: boolean } — cancela la reserva en lugar de finalizarla.
// El ADMIN puede operar cualquier reserva; el CONDUCTOR solo las suyas.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sesion = await getSesion()
    if (!sesion) {
      return NextResponse.json(
        { ok: false, error: 'Debes iniciar sesión.' },
        { status: 401 }
      )
    }

    const { id } = await params
    const reservaId = Number(id)
    if (!Number.isInteger(reservaId)) {
      return NextResponse.json({ ok: false, error: 'ID de reserva inválido.' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const cancelar = Boolean((body as { cancelar?: boolean })?.cancelar)
    const resultado = await finalizarReserva(
      reservaId,
      cancelar ? 'CANCELADA' : 'FINALIZADA',
      { uid: sesion.uid, rol: sesion.rol }
    )

    if (!resultado.ok) {
      return NextResponse.json({ ok: false, error: resultado.error }, { status: 422 })
    }
    return NextResponse.json({
      ok: true,
      mensaje: cancelar
        ? 'Reserva cancelada y espacio liberado.'
        : 'Reserva finalizada y espacio liberado.',
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Error interno al actualizar la reserva.' },
      { status: 500 }
    )
  }
}
