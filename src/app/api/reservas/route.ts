import { NextRequest, NextResponse } from 'next/server'
import { crearReserva, listarReservas } from '@/lib/parking-service'
import { getSesion } from '@/lib/auth'

// GET /api/reservas — Últimas reservas (admin) o solo las propias con ?mias=1
export async function GET(req: NextRequest) {
  try {
    const mias = req.nextUrl.searchParams.get('mias') === '1'

    if (mias) {
      const sesion = await getSesion()
      if (!sesion) {
        return NextResponse.json(
          { ok: false, error: 'Debes iniciar sesión para ver tus reservas.' },
          { status: 401 }
        )
      }
      const reservas = await listarReservas(20, { userId: sesion.uid })
      return NextResponse.json({ ok: true, reservas })
    }

    const reservas = await listarReservas()
    return NextResponse.json({ ok: true, reservas })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'No se pudo obtener el historial de reservas.' },
      { status: 500 }
    )
  }
}

// POST /api/reservas — Registra una reserva del conductor autenticado (atómico)
export async function POST(req: NextRequest) {
  try {
    const sesion = await getSesion()
    if (!sesion) {
      return NextResponse.json(
        { ok: false, error: 'Debes iniciar sesión para reservar un lugar.' },
        { status: 401 }
      )
    }
    if (sesion.rol !== 'CONDUCTOR') {
      return NextResponse.json(
        { ok: false, error: 'Solo las cuentas de conductor pueden reservar lugares.' },
        { status: 403 }
      )
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body.cocheraId !== 'number' || typeof body.placa !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Datos incompletos: se requiere cocheraId, placa y horas.' },
        { status: 400 }
      )
    }
    const horas = typeof body.horas === 'number' ? body.horas : 1
    const resultado = await crearReserva({
      cocheraId: body.cocheraId,
      placa: body.placa,
      horas,
      userId: sesion.uid,
    })

    if (!resultado.ok) {
      return NextResponse.json({ ok: false, error: resultado.error }, { status: 422 })
    }
    return NextResponse.json({ ok: true, reserva: resultado.reserva }, { status: 201 })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Error interno al registrar la reserva.' },
      { status: 500 }
    )
  }
}
