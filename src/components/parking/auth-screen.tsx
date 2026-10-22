'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Car,
  CircleAlert,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogIn,
  MapPin,
  ShieldCheck,
  UserPlus,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { UsuarioSesion } from '@/lib/parking-types'

interface Props {
  onAutenticado: (usuario: UsuarioSesion) => void
}

const CUENTAS_DEMO = [
  {
    rol: 'CONDUCTOR' as const,
    titulo: 'Conductor demo',
    detalle: 'Reserva lugares con tu placa',
    email: 'conductor@demo.pe',
    password: 'demo123',
    icono: <Car className="h-4 w-4" />,
  },
  {
    rol: 'ADMIN' as const,
    titulo: 'Administrador demo',
    detalle: 'Panel de ingresos y salidas',
    email: 'admin@demo.pe',
    password: 'admin123',
    icono: <LayoutDashboard className="h-4 w-4" />,
  },
]

export function AuthScreen({ onAutenticado }: Props) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function enviar(modo: 'login' | 'registro', datos: Record<string, string>) {
    setEnviando(true)
    setError(null)
    try {
      const ruta = modo === 'login' ? '/api/auth/login' : '/api/auth/registro'
      const res = await fetch(ruta, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Ocurrió un error. Inténtalo de nuevo.')
        return
      }
      onAutenticado(data.usuario as UsuarioSesion)
    } catch {
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  async function entrarDemo(cuenta: (typeof CUENTAS_DEMO)[number]) {
    await enviar('login', { email: cuenta.email, password: cuenta.password })
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 lg:flex-row">
      {/* Panel de marca */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-stone-900 px-6 py-10 text-white lg:w-[46%] lg:px-12 lg:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, #10b981 0, transparent 40%), radial-gradient(circle at 80% 70%, #10b981 0, transparent 45%)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/40">
              <Car className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold leading-tight">Parqueo Ayacucho</h1>
              <p className="flex items-center gap-1 text-xs text-stone-400">
                <MapPin className="h-3 w-3" /> Centro Histórico de Huamanga
              </p>
            </div>
          </div>

          <h2 className="mt-10 max-w-md text-2xl font-extrabold leading-snug sm:text-3xl">
            Encuentra y reserva tu lugar en el centro de Ayacucho
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-400">
            Consulta la disponibilidad de las cocheras en tiempo real, registra tu vehículo y
            administra los ingresos del estacionamiento desde un solo sistema.
          </p>

          <ul className="mt-8 space-y-3 text-sm">
            {[
              { icono: <Zap className="h-4 w-4" />, texto: 'Cocheras reales: Plaza Mayor, Alameda del Calvario, Jr. 28 de Julio y más' },
              { icono: <ShieldCheck className="h-4 w-4" />, texto: 'Sesiones seguras con roles de conductor y administrador' },
              { icono: <LayoutDashboard className="h-4 w-4" />, texto: 'Ingresos acumulados y ocupación actualizados al instante' },
            ].map((f) => (
              <li key={f.texto} className="flex items-start gap-2.5 text-stone-300">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  {f.icono}
                </span>
                {f.texto}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-10 text-[11px] text-stone-500">
          Prototipo académico — Sistema de Parqueo de Autos · Ayacucho, Perú
        </p>
      </div>

      {/* Formularios */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Tabs defaultValue="login" className="gap-5">
            <TabsList className="h-11 w-full rounded-xl border border-stone-200 bg-white p-1.5">
              <TabsTrigger
                value="login"
                className="flex-1 gap-1.5 rounded-lg text-sm font-semibold data-[state=active]:bg-stone-900 data-[state=active]:text-white"
              >
                <LogIn className="h-4 w-4" /> Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger
                value="registro"
                className="flex-1 gap-1.5 rounded-lg text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                <UserPlus className="h-4 w-4" /> Crear Cuenta
              </TabsTrigger>
            </TabsList>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-1.5 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700"
              >
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            {/* ---- Iniciar sesión ---- */}
            <TabsContent value="login">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  void enviar('login', {
                    email: String(fd.get('email') ?? ''),
                    password: String(fd.get('password') ?? ''),
                  })
                }}
              >
                <div className="grid gap-2">
                  <Label htmlFor="email-login" className="text-sm font-semibold">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email-login"
                    name="email"
                    type="email"
                    required
                    placeholder="tucorreo@ejemplo.pe"
                    className="h-11 border-stone-200 bg-white"
                    autoComplete="email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password-login" className="text-sm font-semibold">
                    Contraseña
                  </Label>
                  <Input
                    id="password-login"
                    name="password"
                    type="password"
                    required
                    placeholder="Tu contraseña"
                    className="h-11 border-stone-200 bg-white"
                    autoComplete="current-password"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={enviando}
                  className="h-11 w-full bg-stone-900 font-semibold text-white hover:bg-stone-800"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Verificando…
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-1 h-4 w-4" /> Ingresar al sistema
                    </>
                  )}
                </Button>
              </form>

              {/* Cuentas demo */}
              <div className="mt-6">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-500">
                  <KeyRound className="h-3.5 w-3.5" /> Cuentas de demostración
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CUENTAS_DEMO.map((c) => (
                    <button
                      key={c.email}
                      type="button"
                      disabled={enviando}
                      onClick={() => void entrarDemo(c)}
                      className={cn(
                        'rounded-xl border p-3 text-left transition-colors disabled:opacity-60',
                        'border-stone-200 bg-white hover:border-emerald-400 hover:shadow-sm'
                      )}
                    >
                      <span className="flex items-center gap-1.5 text-sm font-bold text-stone-800">
                        {c.icono}
                        {c.titulo}
                      </span>
                      <span className="mt-0.5 block text-xs text-stone-500">{c.detalle}</span>
                      <span className="mt-1.5 block font-mono text-[11px] text-stone-400">
                        {c.email} · {c.password}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ---- Registro ---- */}
            <TabsContent value="registro">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  void enviar('registro', {
                    nombre: String(fd.get('nombre') ?? ''),
                    email: String(fd.get('email') ?? ''),
                    password: String(fd.get('password') ?? ''),
                    rol: String(fd.get('rol') ?? 'CONDUCTOR'),
                  })
                }}
              >
                <div className="grid gap-2">
                  <Label htmlFor="nombre-reg" className="text-sm font-semibold">
                    Nombre completo
                  </Label>
                  <Input
                    id="nombre-reg"
                    name="nombre"
                    required
                    minLength={3}
                    placeholder="Ej. María Torres Huamán"
                    className="h-11 border-stone-200 bg-white"
                    autoComplete="name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email-reg" className="text-sm font-semibold">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email-reg"
                    name="email"
                    type="email"
                    required
                    placeholder="tucorreo@ejemplo.pe"
                    className="h-11 border-stone-200 bg-white"
                    autoComplete="email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password-reg" className="text-sm font-semibold">
                    Contraseña
                  </Label>
                  <Input
                    id="password-reg"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className="h-11 border-stone-200 bg-white"
                    autoComplete="new-password"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold">Tipo de cuenta</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="rol"
                        value="CONDUCTOR"
                        defaultChecked
                        className="peer sr-only"
                      />
                      <div className="rounded-xl border border-stone-200 bg-white p-3 text-center transition-colors peer-checked:border-emerald-600 peer-checked:bg-emerald-50 peer-checked:ring-1 peer-checked:ring-emerald-600">
                        <Car className="mx-auto h-5 w-5 text-stone-600 peer-checked:text-emerald-700" />
                        <p className="mt-1 text-sm font-bold">Conductor</p>
                        <p className="text-[11px] text-stone-500">Reservar lugares</p>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="rol" value="ADMIN" className="peer sr-only" />
                      <div className="rounded-xl border border-stone-200 bg-white p-3 text-center transition-colors peer-checked:border-emerald-600 peer-checked:bg-emerald-50 peer-checked:ring-1 peer-checked:ring-emerald-600">
                        <LayoutDashboard className="mx-auto h-5 w-5 text-stone-600" />
                        <p className="mt-1 text-sm font-bold">Administrador</p>
                        <p className="text-[11px] text-stone-500">Gestionar cochera</p>
                      </div>
                    </label>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={enviando}
                  className="h-11 w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Creando cuenta…
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-1 h-4 w-4" /> Crear mi cuenta
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-stone-500">
                  Al registrarte aceptas que este es un prototipo académico con datos ficticios.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
