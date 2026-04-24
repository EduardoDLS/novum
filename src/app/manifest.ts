import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Novum',
    short_name: 'Novum',
    description: 'Plataforma de gestión de contenido',
    start_url: '/',
    display: 'standalone',
    background_color: '#0E1013',
    theme_color: '#4A8EC4',
    icons: [
      { src: '/apple-icon.png',   sizes: '180x180', type: 'image/png' },
      { src: '/api/icon/192',     sizes: '192x192', type: 'image/png' },
      { src: '/api/icon/512',     sizes: '512x512', type: 'image/png' },
      { src: '/icon.svg',         sizes: 'any',      type: 'image/svg+xml' },
    ],
  }
}
