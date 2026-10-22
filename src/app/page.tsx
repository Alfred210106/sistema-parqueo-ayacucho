'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Car,
  CarFront,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  LogOut,
  MapPin,
  Search,
  SearchX,
  Signal,
  Wallet,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminPanel } from '@/components/parking/admin-panel'
import { AuthScreen } from '@/components/parking/auth-screen'
import { CocheraCard } from '@/components/parking/cochera-card'
import { HistoriasSection } from '@/components/parking/historias'
import { MisReservas } from '@/components/parking/mis-reservas'
import { ReservarDialog } from '@/components/parking/reservar-dialog'
import { cn } from '@/lib/utils'
import type {
  AdminStats,
  CocheraDTO,
  ReservaDTO,
  UsuarioSesion,
} from '@/lib/parking-types'

type Filtro = 'TODAS' | 'CON_ESPACIO' | 'LLENAS'

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'CON_ESPACIO', label: 'Con espacios' },
  { id: 'LLENAS', label: 'Llenas' },
]

export default function Home() {
  const { toast } = useToast()
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)
  const [cocheras, setCocheras] = useState<CocheraDTO[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [cocheraReserva, setCocheraReserva] = useState<CocheraDTO | null>(null)
  const [tab, setTab] = useState('conductor')

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [reservas, setReservas] = useState<ReservaDTO[]>([])
  const [misReservas, setMisReservas] = useState<ReservaDTO[]>([])
  const [procesandoId, setProcesandoId] = useState<number | null>(null)

  // ---- Sesión ----
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const data = await res.json()
        if (data.ok && data.usuario) setUsuario(data.usuario as UsuarioSesion)
      } catch {
        /* sin sesión */
      } finally {
        setCargandoSesion(false)
      }
    })()
  }, [])

  const cargarCocheras = useCallback(async () => {
    try {
      const res = await fetch('/api/cocheras', { cache: 'no-store' })
      const data = await res.json()
      if (data.ok) setCocheras(data.cocheras as CocheraDTO[])
    } catch {
      /* en el siguiente ciclo se reintenta */
    } finally {
      setCargando(false)
    }
  }, [])

  const cargarAdmin = useCallback(async () => {
    try {
      const [resStats, resReservas] = await Promise.all([
        fetch('/api/admin/stats', { cache: 'no-store' }),
        fetch('/api/reservas', { cache: 'no-store' }),
      ])
      const dStats = await resStats.json()
      const dReservas = await resReservas.json()
      if (dStats.ok) setStats(dStats.stats as AdminStats)
      if (dReservas.ok) setReservas(dReservas.reservas as ReservaDTO[])
    } catch {
      /* en el siguiente ciclo se reintenta */
    }
  }, [])

  const cargarMisReservas = useCallback(async () => {
    try {
      const res = await fetch('/api/reservas?mias=1', { cache: 'no-store' })
      const data = await res.json()
      if (data.ok) setMisReservas(data.reservas as ReservaDTO[])
    } catch {
      /* en el siguiente ciclo se reintenta */
    }
  }, [])

  // Sondeo en tiempo real: cocheras cada 4 s
  useEffect(() => {
    if (!usuario) return
    cargarCocheras()
    const t = setInterval(cargarCocheras, 4000)
    return () => clearInterval(t)
  }, [usuario, cargarCocheras])

  // Mis reservas (conductores)
  useEffect(() => {
    if (!usuario || usuario.rol !== 'CONDUCTOR') return
    cargarMisReservas()
    const t = setInterval(cargarMisReservas, 4000)
    return () => clearInterval(t)
  }, [usuario, cargarMisReservas])

  // Sondeo del panel de administración solo cuando está visible
  useEffect(() => {
    if (!usuario || usuario.rol !== 'ADMIN' || tab !== 'admin') return
    cargarAdmin()
    const t = setInterval(cargarAdmin, 4000)
    return () => clearInterval(t)
  }, [usuario, tab, cargarAdmin])

  const esConductor = usuario?.rol === 'CONDUCTOR'
  const esAdmin = usuario?.rol === 'ADMIN'

  const cocherasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return cocheras.filter((c) => {
      const cumpleBusqueda =
        !q ||
        c.nombre.toLowerCase().includes(q) ||
        c.direccion.toLowerCase().includes(q) ||
        c.referencia.toLowerCase().includes(q)
      const cumpleFiltro =
        filtro === 'TODAS' ||
        (filtro === 'CON_ESPACIO' && c.estado !== 'LLENO') ||
        (filtro === 'LLENAS' && c.estado === 'LLENO')
      return cumpleBusqueda && cumpleFiltro
    })
  }, [cocheras, busqueda, filtro])

  const resumen = useMemo(() => {
    const espaciosLibres = cocheras.reduce((s, c) => s + c.disponibles, 0)
    const llenas = cocheras.filter((c) => c.estado === 'LLENO').length
    const tarifaPromedio = cocheras.length
      ? cocheras.reduce((s, c) => s + c.tarifaHora, 0) / cocheras.length
      : 0
    return { espaciosLibres, llenas, tarifaPromedio }
  }, [cocheras])

  // ---- Acciones ----
  function intentarReservar(cochera: CocheraDTO) {
    if (!esConductor) {
      toast({
        title: 'Acción solo para conductores',
        description: 'Tu cuenta es de administrador: gestiona las salidas desde el panel.',
      })
      return
    }
    setCocheraReserva(cochera)
  }

  async function accionAdmin(id: number, cancelar: boolean) {
    setProcesandoId(id)
    try {
      await fetch(`/api/reservas/${id}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelar }),
      })
      await Promise.all([cargarAdmin(), cargarCocheras()])
    } finally {
      setProcesandoId(null)
    }
  }

  async function cancelarMiReserva(id: number) {
    setProcesandoId(id)
    try {
      const res = await fetch(`/api/reservas/${id}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelar: true }),
      })
      const data = await res.json()
      toast(
        data.ok
          ? {
              title: 'Reserva cancelada',
              description: 'Tu espacio quedó libre nuevamente.',
            }
          : { title: 'No se pudo cancelar', description: data.error ?? 'Inténtalo de nuevo.' }
      )
      await Promise.all([cargarMisReservas(), cargarCocheras()])
    } finally {
      setProcesandoId(null)
    }
  }

  async function cerrarSesion() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUsuario(null)
    setTab('conductor')
    setCocheras([])
    setStats(null)
    setReservas([])
    setMisReservas([])
    toast({ title: 'Sesión cerrada', description: 'Vuelve pronto al Parqueo Ayacucho.' })
  }

  // ---- Pantalla de carga de sesión ----
  if (cargandoSesion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-emerald-600/10">
            <Car className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-stone-500">Cargando Parqueo Ayacucho…</p>
        </div>
      </div>
    )
  }

  // ---- Acceso: login / registro ----
  if (!usuario) {
    return (
      <AuthScreen
        onAutenticado={(u) => {
          setUsuario(u)
          toast({
            title: `¡Bienvenido, ${u.nombre.split(' ')[0]}!`,
            description:
              u.rol === 'ADMIN'
                ? 'Tu panel de administración está listo.'
                : 'Ya puedes reservar tu lugar en el centro histórico.',
          })
        }}
      />
    )
  }

  const iniciales = usuario.nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex min-h-screen flex-col bg-stone-100">
      {/* ===== Encabezado ===== */}
      <header className="sticky top-0 z-40 bg-stone-900 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/40">
              <Car className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-extrabold leading-tight sm:text-lg">
                Parqueo Ayacucho
              </h1>
              <p className="flex items-center gap-1 text-[11px] text-stone-400 sm:text-xs">
                <MapPin className="h-3 w-3" />
                Sistema de Parqueo · Centro Histórico de Huamanga
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-stone-800 px-3 py-1.5 text-[11px] font-semibold text-emerald-400 ring-1 ring-emerald-400/30 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <Signal className="h-3 w-3" /> En vivo · cada 4 s
            </span>

            {/* Usuario autenticado */}
            <div className="flex items-center gap-2 rounded-full bg-stone-800 py-1 pl-1 pr-1 ring-1 ring-stone-700 sm:pr-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold">
                {iniciales}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block max-w-36 truncate text-xs font-bold">{usuario.nombre}</span>
                <span
                  className={cn(
                    'block text-[10px] font-semibold uppercase tracking-wide',
                    esAdmin ? 'text-amber-400' : 'text-emerald-400'
                  )}
                >
                  {esAdmin ? 'Administrador' : 'Conductor'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => void cerrarSesion()}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Contenido ===== */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {/* Resumen global */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[
            {
              icono: <CarFront className="h-4 w-4" />,
              label: 'Cocheras registradas',
              valor: String(cocheras.length),
              color: 'text-stone-900',
            },
            {
              icono: <Gauge className="h-4 w-4" />,
              label: 'Espacios libres ahora',
              valor: String(resumen.espaciosLibres),
              color: 'text-emerald-700',
            },
            {
              icono: <ClipboardList className="h-4 w-4" />,
              label: 'Cocheras llenas',
              valor: String(resumen.llenas),
              color: 'text-red-600',
            },
            {
              icono: <Wallet className="h-4 w-4" />,
              label: 'Tarifa promedio / hora',
              valor: `S/ ${resumen.tarifaPromedio.toFixed(2)}`,
              color: 'text-amber-700',
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm sm:p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
                {s.icono}
              </span>
              <div className="min-w-0">
                <p className={cn('truncate text-xl font-extrabold tabular-nums', s.color)}>
                  {cargando ? '—' : s.valor}
                </p>
                <p className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
                  {s.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pestañas principales */}
        <Tabs value={tab} onValueChange={setTab} className="mt-6 gap-6">
          <TabsList className="h-11 w-full justify-start gap-1 overflow-x-auto rounded-xl border border-stone-200 bg-white p-1.5 sm:w-fit">
            <TabsTrigger
              value="conductor"
              className="gap-1.5 rounded-lg px-3 text-xs font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white sm:px-4 sm:text-sm"
            >
              <Car className="h-4 w-4" /> Conductor
            </TabsTrigger>
            {esAdmin && (
              <TabsTrigger
                value="admin"
                className="gap-1.5 rounded-lg px-3 text-xs font-semibold data-[state=active]:bg-stone-900 data-[state=active]:text-white sm:px-4 sm:text-sm"
              >
                <LayoutDashboard className="h-4 w-4" /> Administrador
              </TabsTrigger>
            )}
            <TabsTrigger
              value="historias"
              className="gap-1.5 rounded-lg px-3 text-xs font-semibold data-[state=active]:bg-stone-900 data-[state=active]:text-white sm:px-4 sm:text-sm"
            >
              <ClipboardList className="h-4 w-4" /> Historias de Usuario
            </TabsTrigger>
          </TabsList>

          {/* ---- Vista Conductor ---- */}
          <TabsContent value="conductor" className="space-y-5">
            {esConductor && (
              <MisReservas
                reservas={misReservas}
                onCancelar={(id) => void cancelarMiReserva(id)}
                procesandoId={procesandoId}
              />
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por jirón, nombre o referencia… (p. ej. Asamblea, Calvario)"
                  className="h-11 border-stone-200 bg-white pl-9"
                  aria-label="Buscar cocheras"
                />
              </div>
              <div className="flex gap-1.5" role="group" aria-label="Filtros">
                {FILTROS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFiltro(f.id)}
                    aria-pressed={filtro === f.id}
                    className={cn(
                      'h-11 rounded-lg border px-3.5 text-xs font-semibold transition-colors sm:text-sm',
                      filtro === f.id
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {cargando ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-80 animate-pulse rounded-xl bg-stone-200/60" />
                ))}
              </div>
            ) : cocherasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
                <SearchX className="h-10 w-10 text-stone-300" />
                <p className="mt-3 text-sm font-semibold text-stone-600">
                  No se encontraron cocheras con ese criterio
                </p>
                <p className="text-xs text-stone-400">
                  Prueba con otro jirón (p. ej. &quot;Cusco&quot;, &quot;Bellido&quot;) o cambia el filtro.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cocherasFiltradas.map((c) => (
                  <CocheraCard key={c.id} cochera={c} onReservar={intentarReservar} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ---- Vista Administrador (solo rol ADMIN) ---- */}
          {esAdmin && (
            <TabsContent value="admin">
              <AdminPanel
                stats={stats}
                reservas={reservas}
                onAccion={accionAdmin}
                procesandoId={procesandoId}
              />
            </TabsContent>
          )}

          {/* ---- Historias de Usuario ---- */}
          <TabsContent value="historias">
            <HistoriasSection />
          </TabsContent>
        </Tabs>
      </main>

      {/* ===== Pie de página (pegado al fondo) ===== */}
      <footer className="mt-auto border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1.5 px-4 py-4 text-center text-xs text-stone-500 sm:flex-row sm:px-6 sm:text-left">
          <p>
            <span className="font-bold text-stone-700">Parqueo Ayacucho</span> — Prototipo
            académico de un sistema de parqueo del Centro Histórico de Ayacucho (Huamanga, Perú).
          </p>
          <p>Los datos son ficticios y solo para fines educativos.</p>
        </div>
      </footer>

      {/* Diálogo de registro de vehículo */}
      <ReservarDialog
        cochera={cocheraReserva}
        onClose={() => setCocheraReserva(null)}
        onReservada={() => {
          void cargarCocheras()
          if (esConductor) void cargarMisReservas()
        }}
      />
    </div>
  )
}
