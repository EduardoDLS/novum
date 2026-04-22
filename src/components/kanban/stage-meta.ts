import type { ContentStatus } from '@/types/novum'

type StageVisual = {
  label: string
  /** Clase Tailwind que usa el token HSL del stage como color principal. */
  dot: string
  /** Fondo sutil de la columna (bg token). */
  bg: string
  /** Borde superior de la columna (accent). */
  accent: string
}

export const STAGE_META: Record<ContentStatus, StageVisual> = {
  baby_idea: {
    label: 'Baby Idea',
    dot: 'bg-kanban-baby-idea',
    bg: 'bg-kanban-baby-idea-bg',
    accent: 'bg-kanban-baby-idea',
  },
  guionizar: {
    label: 'Guionizar',
    dot: 'bg-kanban-guionizar',
    bg: 'bg-kanban-guionizar-bg',
    accent: 'bg-kanban-guionizar',
  },
  grabacion: {
    label: 'Grabación',
    dot: 'bg-kanban-grabacion',
    bg: 'bg-kanban-grabacion-bg',
    accent: 'bg-kanban-grabacion',
  },
  edicion: {
    label: 'Edición',
    dot: 'bg-kanban-edicion',
    bg: 'bg-kanban-edicion-bg',
    accent: 'bg-kanban-edicion',
  },
  revision: {
    label: 'Revisión WA',
    dot: 'bg-kanban-revision',
    bg: 'bg-kanban-revision-bg',
    accent: 'bg-kanban-revision',
  },
  publicado: {
    label: 'Publicado',
    dot: 'bg-kanban-publicado',
    bg: 'bg-kanban-publicado-bg',
    accent: 'bg-kanban-publicado',
  },
}
