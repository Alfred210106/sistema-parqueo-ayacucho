'use client'

import {
  BookOpen,
  Car,
  CheckCircle2,
  ClipboardList,
  Database,
  Fingerprint,
  KeyRound,
  LayoutDashboard,
  Search,
  ShieldAlert,
  Smartphone,
  Ticket,
  UserPlus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Historia {
  id: string
  como: string
  quiero: string
  para: string
  criterios: string[]
  prioridad: 'Alta' | 'Media' | 'Baja'
  icono: React.ReactNode
}

const HISTORIAS: Historia[] = [
  {
    id: 'HU-01',
    como: 'Conductor del Centro Histórico',
    quiero: 'Ver la lista de cocheras cercanas con sus espacios libres en tiempo real',
    para: 'Decidir rápidamente a dónde dirigirme sin dar vueltas buscando estacionamiento',
    criterios: [
      'Se muestran todas las cocheras registradas (Jr. Asamblea, Alameda del Calvario, Jr. 28 de Julio, etc.).',
      'Cada tarjeta indica total de espacios, disponibles y tarifa por hora.',
      'Los datos se actualizan automáticamente cada 4 segundos.',
      'Verde = con espacios, ámbar = últimos espacios, rojo = llena.',
    ],
    prioridad: 'Alta',
    icono: <Car className="h-5 w-5" />,
  },
  {
    id: 'HU-02',
    como: 'Conductor',
    quiero: 'Filtrar y buscar cocheras por nombre o dirección',
    para: 'Encontrar la cochera más conveniente según mi destino en el centro histórico',
    criterios: [
      'Existe un buscador por nombre, jirón o referencia.',
      'Existen filtros rápidos: Todas, Con espacios y Llenas.',
      'Si no hay resultados se muestra un mensaje claro.',
    ],
    prioridad: 'Media',
    icono: <Search className="h-5 w-5" />,
  },
  {
    id: 'HU-03',
    como: 'Conductor',
    quiero: 'Reservar un lugar registrando la placa de mi vehículo',
    para: 'Asegurar un espacio antes de llegar a la cochera',
    criterios: [
      'El botón "Reservar Lugar" abre el formulario de registro de vehículo.',
      'La placa se valida con el formato peruano ABC-123.',
      'Se eligen las horas de estacionamiento y se muestra el monto a pagar antes de confirmar.',
      'Al confirmar, los espacios disponibles de la cochera se reducen en uno al instante.',
    ],
    prioridad: 'Alta',
    icono: <ClipboardList className="h-5 w-5" />,
  },
  {
    id: 'HU-04',
    como: 'Conductor',
    quiero: 'Recibir un código de reserva como comprobante',
    para: 'Presentarlo al llegar a la cochera y evitar malentendidos con el operador',
    criterios: [
      'Se genera un código único con prefijo AYC (p. ej. AYC-14823).',
      'El comprobante muestra placa, cochera, horas y monto.',
      'La reserva aparece inmediatamente en el panel del administrador.',
    ],
    prioridad: 'Alta',
    icono: <Ticket className="h-5 w-5" />,
  },
  {
    id: 'HU-05',
    como: 'Administrador de la cochera',
    quiero: 'Ver los ingresos generados acumulados por las reservas simuladas',
    para: 'Conocer la recaudación de mi cochera sin llevar cuentas manuales',
    criterios: [
      'El panel muestra el ingreso total acumulado en soles (S/).',
      'Se desglosan ingresos por cobrar (activos) y cobrados (finalizados).',
      'Se muestra un gráfico comparativo de ingresos por cochera.',
      'Las métricas se recalculan automáticamente con cada nueva reserva.',
    ],
    prioridad: 'Alta',
    icono: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    id: 'HU-06',
    como: 'Administrador de la cochera',
    quiero: 'Registrar la salida de un vehículo o cancelar su reserva',
    para: 'Liberar el espacio y mantener la ocupación siempre al día',
    criterios: [
      'Cada reserva activa tiene las acciones "Salida" y "Cancelar".',
      'Al ejecutar la acción, el espacio se libera y vuelve a estar disponible.',
      'El movimiento queda registrado en el historial con su estado final.',
    ],
    prioridad: 'Media',
    icono: <Fingerprint className="h-5 w-5" />,
  },
  {
    id: 'HU-07',
    como: 'Sistema',
    quiero: 'Impedir reservas cuando una cochera alcanza su aforo completo',
    para: 'Garantizar que nunca se vendan más espacios de los que existen',
    criterios: [
      'La reserva se procesa de forma atómica en la base de datos SQLite.',
      'Si disponibles = 0, el botón se deshabilita y muestra "Cochera llena".',
      'Si dos usuarios reservan el último espacio a la vez, solo una operación tiene éxito.',
    ],
    prioridad: 'Alta',
    icono: <ShieldAlert className="h-5 w-5" />,
  },
  {
    id: 'HU-08',
    como: 'Visitante de la web',
    quiero: 'Registrarme con mi nombre, correo y contraseña eligiendo mi rol',
    para: 'Tener una cuenta propia y acceder al sistema con mis credenciales',
    criterios: [
      'La pantalla de acceso permite alternar entre Iniciar Sesión y Crear Cuenta.',
      'La contraseña se guarda cifrada con scrypt + salt (nunca en texto plano).',
      'El correo debe ser único; si existe, se sugiere iniciar sesión.',
      'Se elige el rol al registrarse: Conductor o Administrador de cochera.',
    ],
    prioridad: 'Alta',
    icono: <UserPlus className="h-5 w-5" />,
  },
  {
    id: 'HU-09',
    como: 'Usuario registrado',
    quiero: 'Iniciar y cerrar sesión de forma segura según mi rol',
    para: 'Que cada persona vea únicamente las funciones que le corresponden',
    criterios: [
      'La sesión persiste 7 días mediante una cookie httpOnly firmada (HMAC-SHA256).',
      'Solo el rol CONDUCTOR puede reservar lugares con su cuenta.',
      'Solo el rol ADMIN ve el panel de administración y gestiona salidas.',
      'El botón "Cerrar sesión" limpia la sesión y vuelve a la pantalla de acceso.',
    ],
    prioridad: 'Alta',
    icono: <KeyRound className="h-5 w-5" />,
  },
  {
    id: 'HU-10',
    como: 'Conductor',
    quiero: 'Ver el listado de mis propias reservas',
    para: 'Llevar control de mis estacionamientos y liberar espacios si ya no los uso',
    criterios: [
      'Cada reserva guarda el usuario que la creó y aparece en "Mis reservas".',
      'Muestra código, cochera, placa, monto, estado y hora.',
      'Puedo cancelar una reserva activa propia y el espacio se libera al instante.',
    ],
    prioridad: 'Media',
    icono: <Ticket className="h-5 w-5" />,
  },
]

const STACK = [
  { icono: <Smartphone className="h-4 w-4" />, nombre: 'Frontend', detalle: 'Next.js 16 (App Router) + React 19 + TypeScript, componentes standalone' },
  { icono: <BookOpen className="h-4 w-4" />, nombre: 'Estilos', detalle: 'Tailwind CSS 4 + shadcn/ui, tarjetas verde/rojo según disponibilidad' },
  { icono: <Database className="h-4 w-4" />, nombre: 'Base de datos', detalle: 'SQLite local vía Prisma ORM (usuarios, cocheras y reservas persistidas)' },
  { icono: <LayoutDashboard className="h-4 w-4" />, nombre: 'Backend', detalle: 'API REST con rutas de Next.js y capa de servicios parking-service' },
  { icono: <KeyRound className="h-4 w-4" />, nombre: 'Autenticación', detalle: 'Login y registro con roles; contraseñas cifradas (scrypt) y sesiones firmadas (HMAC-SHA256) en cookie httpOnly' },
]

export function HistoriasSection() {
  return (
    <div className="space-y-6">
      {/* Objetivo del proyecto */}
      <Card className="border-stone-200 bg-stone-900 text-white">
        <CardContent className="pt-5">
          <h2 className="text-lg font-bold">
            Sistema de Parqueo de Autos — Centro Histórico de Ayacucho
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-stone-300">
            Prototipo funcional desarrollado para el curso: gestiona las cocheras del casco
            urbano de Huamanga (Plaza de Armas, Jirones Asamblea, 28 de Julio, Cusco, Bellido,
            Alameda del Calvario, entre otras). Los conductores consultan la disponibilidad y
            reservan su lugar registrando la placa del vehículo; los administradores monitorean
            la ocupación y los ingresos acumulados. Toda la información se persiste en una base
            de datos SQLite local y las reservas se procesan de forma atómica para simular
            correctamente el aforo real.
          </p>
        </CardContent>
      </Card>

      {/* Historias de usuario */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {HISTORIAS.map((h) => (
          <Card key={h.id} className="flex h-full flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  {h.id}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    h.prioridad === 'Alta'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : h.prioridad === 'Media'
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-stone-200 bg-stone-50 text-stone-600'
                  }
                >
                  Prioridad {h.prioridad}
                </Badge>
              </div>
              <CardTitle className="flex items-start gap-2 text-sm leading-snug">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
                  {h.icono}
                </span>
                <span>
                  <span className="text-stone-500">Como </span>
                  {h.como}
                  <span className="text-stone-500">, quiero </span>
                  {h.quiero}
                  <span className="text-stone-500">, para </span>
                  {h.para}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-auto">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-500">
                Criterios de aceptación
              </p>
              <ul className="space-y-1.5">
                {h.criterios.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs leading-relaxed text-stone-700">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {c}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stack del prototipo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Prototipo — Stack tecnológico</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {STACK.map((s) => (
            <div key={s.nombre} className="flex items-start gap-3 rounded-xl border bg-stone-50 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                {s.icono}
              </span>
              <div>
                <p className="text-sm font-bold">{s.nombre}</p>
                <p className="text-xs text-muted-foreground">{s.detalle}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
