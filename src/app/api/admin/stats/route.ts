import { NextRequest, NextResponse } from 'next/server'
import { obtenerEstadisticas } from '@/lib/parking-service'

// GET /api/admin/stats — Ingresos acumulados y métricas del panel de administración
export async function GET(_req: NextRequest) {
  try {
    const stats = await obtenerEstadisticas()
    return NextResponse.json({ ok: true, stats })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'No se pudieron calcular las estadísticas.' },
      { status: 500 }
    )
  }
}
