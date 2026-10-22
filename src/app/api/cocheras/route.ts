import { NextRequest, NextResponse } from 'next/server'
import { listarCocheras } from '@/lib/parking-service'

// GET /api/cocheras — Lista de cocheras con estado en tiempo real
export async function GET(_req: NextRequest) {
  try {
    const cocheras = await listarCocheras()
    return NextResponse.json({ ok: true, cocheras })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'No se pudo obtener la lista de cocheras.' },
      { status: 500 }
    )
  }
}
