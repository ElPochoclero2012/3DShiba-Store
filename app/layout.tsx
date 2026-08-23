import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const siteDescription =
  'Impresión 3D FDM a pedido: figuras, accesorios, mates, vasos y juegos. Mar de Cobo.'

export const metadata: Metadata = {
  metadataBase: new URL('https://3dshiba-store.vercel.app'),
  title: {
    default: '3DShiba Store',
    template: '%s · 3DShiba Store',
  },
  description: siteDescription,
  icons: {
    icon: '/logo-3dshiba.jpg',
    apple: '/logo-3dshiba.jpg',
  },
  openGraph: {
    title: '3DShiba Store',
    description: siteDescription,
    siteName: '3DShiba Store',
    locale: 'es_AR',
    type: 'website',
    images: [{ url: '/logo-3dshiba.jpg', alt: '3DShiba Store' }],
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
