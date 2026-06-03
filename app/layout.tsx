import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://prodesanjuan.com.ar'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Prode Chevrolet Grupo Paris | Mundial 2026',
    template: '%s | Prode Chevrolet Grupo Paris',
  },
  description: 'Participá gratis del Prode oficial del Mundial 2026 de Chevrolet Grupo Paris. Hacé tus pronósticos, sumá puntos y ganá premios en cada etapa del torneo. Solo para clientes Grupo Paris — San Juan, Argentina.',
  keywords: [
    'prode mundial 2026', 'chevrolet grupo paris', 'pronosticos futbol',
    'mundial 2026 argentina', 'grupo paris san juan', 'concesionaria chevrolet san juan',
    'prode futbol gratis', 'premios mundial 2026',
  ],
  authors: [{ name: 'Chevrolet Grupo Paris' }],
  creator: 'Chevrolet Grupo Paris',
  publisher: 'Chevrolet Grupo Paris',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: siteUrl,
    siteName: 'Prode Chevrolet Grupo Paris',
    title: 'Prode Chevrolet Grupo Paris | Mundial 2026',
    description: 'Hacé tus pronósticos del Mundial 2026 y ganá premios con Chevrolet Grupo Paris. ¡Participación gratuita!',
    images: [{
      url: '/banner-prode.png',
      width: 2243,
      height: 656,
      alt: 'Prode Chevrolet Grupo Paris — Mundial 2026',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prode Chevrolet Grupo Paris | Mundial 2026',
    description: 'Hacé tus pronósticos del Mundial 2026 y ganá premios con Chevrolet Grupo Paris.',
    images: ['/banner-prode.png'],
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="bg-background">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
