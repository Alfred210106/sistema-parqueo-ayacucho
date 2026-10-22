/**
 * Seed: Base de datos simulada del Sistema de Parqueo
 * Centro Histórico de Ayacucho (Huamanga, Perú)
 */
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/passwords'

const prisma = new PrismaClient()

// Cuentas de demostración del prototipo
const usuariosDemo = [
  {
    nombre: 'Rosa García Huamán',
    email: 'admin@demo.pe',
    password: 'admin123',
    rol: 'ADMIN',
  },
  {
    nombre: 'Carlos Quispe Condori',
    email: 'conductor@demo.pe',
    password: 'demo123',
    rol: 'CONDUCTOR',
  },
]

const cocheras = [
  {
    nombre: 'Cochera Municipal Plaza Mayor',
    direccion: 'Jr. Coronel Pacheco cuadra 2',
    referencia: 'A 50 m de la Plaza de Armas, Catedral de Ayacucho',
    totalEspacios: 24,
    disponibles: 18,
    tarifaHora: 2.5,
    horario: 'Lun a Dom, 06:00 – 22:00',
    telefono: '966 412 208',
    lat: -13.1588,
    lng: -74.2239,
  },
  {
    nombre: 'Cochera El Calvario',
    direccion: 'Alameda del Calvario s/n',
    referencia: 'Frente a la Plaza de Toros, subida al Mirador de Acuchimay',
    totalEspacios: 30,
    disponibles: 26,
    tarifaHora: 1.5,
    horario: 'Lun a Dom, 05:30 – 22:30',
    telefono: '966 388 145',
    lat: -13.1561,
    lng: -74.2178,
  },
  {
    nombre: 'Cochera 28 de Julio',
    direccion: 'Jr. 28 de Julio cuadra 4',
    referencia: 'A una cuadra del Mercado Central de Huamanga',
    totalEspacios: 20,
    disponibles: 9,
    tarifaHora: 2.0,
    horario: 'Lun a Dom, 05:00 – 23:00',
    telefono: '966 520 933',
    lat: -13.1572,
    lng: -74.2225,
  },
  {
    nombre: 'Cochera Asamblea',
    direccion: 'Jr. Asamblea cuadra 3',
    referencia: 'Entre la Plaza Mayor y la Plaza San Juan de Dios',
    totalEspacios: 16,
    disponibles: 12,
    tarifaHora: 2.5,
    horario: 'Lun a Sáb, 06:30 – 21:30 · Dom 07:00 – 13:00',
    telefono: '966 601 774',
    lat: -13.1583,
    lng: -74.2253,
  },
  {
    nombre: 'Cochera Jr. Cusco',
    direccion: 'Jr. Cusco cuadra 2',
    referencia: 'Frente al CMAC, a 3 cuadras de la Plaza de Armas',
    totalEspacios: 18,
    disponibles: 4,
    tarifaHora: 2.0,
    horario: 'Lun a Dom, 06:00 – 22:00',
    telefono: '966 745 210',
    lat: -13.1601,
    lng: -74.2241,
  },
  {
    nombre: 'Cochera Universitaria Bellido',
    direccion: 'Jr. Bellido cuadra 5',
    referencia: 'Al lado del Parque Universitario UNSCH',
    totalEspacios: 22,
    disponibles: 15,
    tarifaHora: 1.8,
    horario: 'Lun a Dom, 06:00 – 22:30',
    telefono: '966 319 587',
    lat: -13.1541,
    lng: -74.2212,
  },
  {
    nombre: 'Cochera San Martín',
    direccion: 'Jr. San Martín cuadra 1',
    referencia: 'Esquina con Jr. Libertad, a 2 cuadras de la Plaza Mayor',
    totalEspacios: 14,
    disponibles: 11,
    tarifaHora: 2.2,
    horario: 'Lun a Dom, 06:00 – 21:00',
    telefono: '966 890 342',
    lat: -13.1580,
    lng: -74.2227,
  },
  {
    nombre: 'Cochera Arequipa Magisterial',
    direccion: 'Jr. Arequipa cuadra 3',
    referencia: 'Cerca a la Plaza América y UGEL Huamanga',
    totalEspacios: 12,
    disponibles: 0,
    tarifaHora: 1.8,
    horario: 'Lun a Sáb, 06:30 – 21:00',
    telefono: '966 234 761',
    lat: -13.1615,
    lng: -74.2209,
  },
]

async function main() {
  // Cuentas demo: siempre se aseguran (no dependen de las cocheras)
  for (const u of usuariosDemo) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { nombre: u.nombre, email: u.email, password: hashPassword(u.password), rol: u.rol },
    })
  }
  console.log('Cuentas demo verificadas: admin@demo.pe (ADMIN) y conductor@demo.pe (CONDUCTOR).')

  const existentes = await prisma.cochera.count()
  if (existentes > 0) {
    console.log(`La base de datos ya contiene ${existentes} cocheras. Seed de cocheras omitido.`)
    return
  }

  for (const c of cocheras) {
    await prisma.cochera.create({ data: c })
  }

  // Reservas de demostración para que el panel de administración
  // muestre ingresos acumulados desde el inicio
  const demo = [
    { placa: 'AYC-712', cocheraNombre: 'Cochera Municipal Plaza Mayor', horas: 2 },
    { placa: 'V3K-845', cocheraNombre: 'Cochera El Calvario', horas: 1 },
    { placa: 'HUP-204', cocheraNombre: 'Cochera 28 de Julio', horas: 3 },
    { placa: 'MQL-119', cocheraNombre: 'Cochera Asamblea', horas: 2 },
    { placa: 'S7T-466', cocheraNombre: 'Cochera Universitaria Bellido', horas: 1 },
  ]

  for (let i = 0; i < demo.length; i++) {
    const d = demo[i]
    const cochera = await prisma.cochera.findFirst({ where: { nombre: d.cocheraNombre } })
    if (!cochera) continue
    await prisma.reserva.create({
      data: {
        codigo: `AYC-${String(1001 + i)}`,
        placa: d.placa,
        cocheraId: cochera.id,
        horas: d.horas,
        monto: +(cochera.tarifaHora * d.horas).toFixed(2),
        estado: i % 2 === 0 ? 'FINALIZADA' : 'ACTIVA',
      },
    })
  }

  console.log('Seed completado: 8 cocheras del Centro Histórico de Ayacucho + reservas de demostración.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
