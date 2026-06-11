import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://prodegrupoparis.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Prode Grupo Paris | Mundial 2026',
    template: '%s | Prode Grupo Paris',
  },
  description: 'Participá gratis del Prode oficial del Mundial 2026 de Grupo Paris. Hacé tus pronósticos, sumá puntos y ganá premios en cada etapa del torneo..',
  keywords: [
    'prode mundial 2026', 'grupo paris', 'pronosticos futbol',
    'mundial 2026 argentina', 'prode futbol gratis', 'premios mundial 2026',
  ],
  authors: [{ name: 'Grupo Paris' }],
  creator: 'Grupo Paris',
  publisher: 'Grupo Paris',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: siteUrl,
    siteName: 'Prode Grupo Paris',
    title: 'Prode Grupo Paris | Mundial 2026',
    description: 'Hacé tus pronósticos del Mundial 2026 y ganá premios con Grupo Paris. ¡Participación gratuita!',
    images: [{
      url: '/banner-prode.png',
      width: 2243,
      height: 656,
      alt: 'Prode Grupo Paris — Mundial 2026',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prode Grupo Paris | Mundial 2026',
    description: 'Hacé tus pronósticos del Mundial 2026 y ganá premios con Grupo Paris.',
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
