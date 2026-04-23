import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#4A8EC4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Novum',
  description: 'Plataforma de gestión de contenido para agencias creativas.',
  appleWebApp: {
    capable: true,
    title: 'Novum',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
