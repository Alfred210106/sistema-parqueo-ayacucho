import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Parqueo Ayacucho | Sistema de Parqueo del Centro Histórico",
  description:
    "Prototipo funcional de un sistema de parqueo de autos para el Centro Histórico de Ayacucho: consulta de cocheras en tiempo real, reserva de lugares y panel de ingresos para administradores.",
  keywords: ["Ayacucho", "parqueo", "cocheras", "Huamanga", "reserva", "estacionamiento", "Centro Histórico"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Parqueo Ayacucho — Sistema de Parqueo del Centro Histórico",
    description: "Cocheras en tiempo real, reservas con placa y panel de administración de ingresos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
