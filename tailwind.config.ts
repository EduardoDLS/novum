import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        novum: {
          charcoal: '#0E1013',
          'charcoal-raised': '#12151A',
          warm: '#F2EFE8',
          graphite: '#848A92',
          steel: '#2F4A68',
          'steel-hover': '#243a54',
          silver: '#C8CDD4',
          'silver-strong': '#9299A0',
          'dark-raised': '#151719',
          'dark-elevated': '#1B1E22',
          'dark-border': '#272B31',
          gold: '#2F4A68',
          'gold-dim': '#1A2E45',
        },
        kanban: {
          'baby-idea': 'hsl(var(--kanban-baby-idea))',
          'baby-idea-bg': 'hsl(var(--kanban-baby-idea-bg))',
          guionizar: 'hsl(var(--kanban-guionizar))',
          'guionizar-bg': 'hsl(var(--kanban-guionizar-bg))',
          grabacion: 'hsl(var(--kanban-grabacion))',
          'grabacion-bg': 'hsl(var(--kanban-grabacion-bg))',
          edicion: 'hsl(var(--kanban-edicion))',
          'edicion-bg': 'hsl(var(--kanban-edicion-bg))',
          revision: 'hsl(var(--kanban-revision))',
          'revision-bg': 'hsl(var(--kanban-revision-bg))',
          publicado: 'hsl(var(--kanban-publicado))',
          'publicado-bg': 'hsl(var(--kanban-publicado-bg))',
        },
      },
      fontFamily: {
        sans: ['Century Gothic', 'AppleGothic', 'Trebuchet MS', 'sans-serif'],
        accent: ['Arlon', 'Century Gothic', 'sans-serif'],
      },
      fontSize: {
        xs: ['11px', { lineHeight: '1.5' }],
        sm: ['12px', { lineHeight: '1.5' }],
        base: ['14px', { lineHeight: '1.5' }],
        md: ['16px', { lineHeight: '1.5' }],
        lg: ['20px', { lineHeight: '1.35' }],
        xl: ['24px', { lineHeight: '1.35' }],
        '2xl': ['32px', { lineHeight: '1.2' }],
        '3xl': ['48px', { lineHeight: '1.2' }],
        '4xl': ['64px', { lineHeight: '1.2' }],
      },
      letterSpacing: {
        tight: '-0.02em',
        wide: '0.04em',
        wider: '0.08em',
        caps: '0.12em',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        'elev-1': '0 1px 4px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.03)',
        'elev-2': '0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        'elev-3': '0 12px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)',
        'gold':   '0 0 20px rgba(47,74,104,0.15)',
      },
      transitionDuration: {
        fast: '100ms',
        base: '150ms',
        slow: '250ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
