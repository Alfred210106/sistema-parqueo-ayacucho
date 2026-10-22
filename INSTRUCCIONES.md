# Sistema de Parqueo de Autos — Centro Histórico de Ayacucho

Prototipo web fullstack para curso: consulta de cocheras en tiempo real, reserva de
lugares con registro de placa vehicular, panel de administración de ingresos y
autenticación con roles (Conductor / Administrador).

## Contenido del proyecto

| Carpeta / archivo | Descripción |
|---|---|
| `src/app/page.tsx` | Página principal (login + vista Conductor + panel Administrador + Historias de Usuario) |
| `src/components/parking/` | Componentes: tarjeta de cochera, diálogo de reserva, panel admin, mis reservas, pantalla de acceso |
| `src/lib/parking-service.ts` | Servicio de datos (reservas atómicas, estadísticas) |
| `src/lib/auth.ts` + `src/lib/passwords.ts` | Sesiones firmadas (HMAC) y cifrado de contraseñas (scrypt) |
| `src/app/api/` | API REST: cocheras, reservas, auth (login/registro/logout/me), estadísticas |
| `prisma/schema.prisma` | Modelos: User, Cochera, Reserva |
| `prisma/seed.ts` | Datos iniciales: 8 cocheras reales de Ayacucho + cuentas demo |
| `db/custom.db` | Base de datos SQLite ya poblada y lista para usar |

## Requisitos

- **Node.js 18.18 o superior** (o **Bun 1.x** — recomendado)
- No necesita instalar base de datos: usa SQLite incluida en `db/custom.db`

## Puesta en marcha (con Bun)

```bash
bun install
bun run db:generate
bun run dev
```

Abre http://localhost:3000

## Puesta en marcha (con Node.js / npm)

```bash
npm install
npx prisma generate
npm run dev
```

Abre http://localhost:3000

> La primera compilación puede tardar unos segundos. Si `npm run dev` falla por el
> `tee` en Windows, ejecuta directamente: `npx next dev -p 3000`

## Cuentas de demostración

| Rol | Correo | Contraseña | Puede |
|---|---|---|---|
| Administrador | `admin@demo.pe` | `admin123` | Ver ingresos acumulados, ocupación, registrar salidas y cancelaciones |
| Conductor | `conductor@demo.pe` | `demo123` | Reservar lugares con su placa, ver y cancelar sus reservas |

También puedes **crear tu propia cuenta** desde la pestaña "Crear Cuenta"
(eligiendo el rol) — las contraseñas se guardan cifradas con scrypt.

## Funcionalidades

1. **Vista Conductor**: tarjetas de cocheras (verde = disponible, ámbar = últimos
   espacios, rojo = llena), buscador, filtros y botón "Reservar Lugar" que descuenta
   un espacio en tiempo real (actualización cada 4 s).
2. **Registro de Vehículo**: placa peruana con auto-formato (ABC-123), horas de
   estacionamiento, monto calculado y ticket con código único (AYC-XXXXX).
3. **Mis reservas**: el conductor ve sus propias reservas y puede cancelarlas.
4. **Vista Administrador**: ingresos acumulados en soles, ingresos por cochera,
   ocupación global y tabla de movimientos con acciones "Salida" / "Cancelar".
5. **Historias de Usuario**: 10 HU con criterios de aceptación y stack tecnológico.

## Restablecer la base de datos

```bash
# Elimina los datos y vuelve a crear tablas + seed
rm db/custom.db        # (en Windows: del db\custom.db)
npx prisma db push
bun prisma/seed.ts     # o: npx tsx prisma/seed.ts
```

## Tecnologías

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui + Lucide + framer-motion
- Prisma ORM + SQLite (archivo local `db/custom.db`)
- Autenticación propia con roles, cookie httpOnly firmada (HMAC-SHA256)

Proyecto académico con datos ficticios — Ayacucho, Perú.
