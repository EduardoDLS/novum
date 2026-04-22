import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Novum',
    short_name: 'Novum',
    description: 'Plataforma de gestión de contenido',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0C0F',
    theme_color: '#2F4A68',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  }
}
