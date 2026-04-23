export type UserRole = 'admin' | 'editor' | 'guionista' | 'cliente'

export type Profile = {
  id: string
  role: UserRole
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export const INTERNAL_ROLES: UserRole[] = ['admin', 'editor', 'guionista']

export function isInternalRole(role: UserRole): boolean {
  return INTERNAL_ROLES.includes(role)
}

export function homeForRole(role: UserRole): string {
  return role === 'cliente' ? '/kanban' : '/inicio'
}

export type ContentStatus =
  | 'baby_idea'
  | 'guionizar'
  | 'grabacion'
  | 'edicion'
  | 'revision'
  | 'publicado'

export const CONTENT_STATUS_ORDER: ContentStatus[] = [
  'baby_idea',
  'guionizar',
  'grabacion',
  'edicion',
  'revision',
  'publicado',
]

export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  baby_idea: 'Baby Idea',
  guionizar: 'Guionizar',
  grabacion: 'Grabación',
  edicion: 'Edición',
  revision: 'Revisión WA',
  publicado: 'Publicado',
}

export type Client = {
  id: string
  profile_id: string | null
  name: string
  instagram_handle: string | null
  bio_context: string | null
  niche: string | null
  voice_tone: string | null
  content_pillars: string[]
  followers_count: number | null
  embed_token: string | null
  instagram_photo_url: string | null
  avg_views_reel: number | null
  engagement_rate: number | null
  communication_style: string | null
  signature_phrases: string | null
  created_at: string
  updated_at: string
}

export type ContentIdea = {
  id: string
  client_id: string
  title: string
  status: ContentStatus
  assigned_to: string | null
  script_id: string | null
  publish_date: string | null
  views_count: number | null
  video_url: string | null
  created_at: string
  updated_at: string
}

export type ScriptStatus = 'borrador' | 'aprobado' | 'rechazado'

export type ScriptLine = {
  parte: string
  script: string
  modulacion: string
  emocion: string
}

export type Script = {
  id: string
  content_idea_id: string
  client_id: string
  raw_idea: string
  strategic_vision: string | null
  script_content: ScriptLine[] | null
  status: ScriptStatus
  rejection_note: string | null
  created_at: string
  updated_at: string
}

export type ClientContext = {
  name: string
  niche: string
  voiceTone: string
  contentPillars: string[]
  bioContext: string
  communicationStyle: string
  signaturePhrases: string
}

export type DeliveryStatus = 'pendiente' | 'en_progreso' | 'entregado' | 'publicado'

export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  entregado: 'Entregado',
  publicado: 'Publicado',
}

export const DELIVERY_STATUS_COLOR: Record<DeliveryStatus, string> = {
  pendiente: 'bg-muted text-muted-foreground',
  en_progreso: 'bg-kanban-edicion-bg text-kanban-edicion',
  entregado: 'bg-kanban-grabacion-bg text-kanban-grabacion',
  publicado: 'bg-kanban-publicado-bg text-kanban-publicado',
}

export type Delivery = {
  id: string
  content_idea_id: string | null
  client_id: string
  editor_id: string | null
  delivery_date: string
  status: DeliveryStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export type ResourceType = 'plantilla' | 'referencia' | 'asset' | 'guia' | 'cuenta'

export const RESOURCE_TYPE_LABEL: Record<ResourceType, string> = {
  plantilla: 'Plantilla',
  referencia: 'Referencia',
  asset: 'Asset',
  guia: 'Guía',
  cuenta: 'Cuenta',
}

export type Resource = {
  id: string
  client_id: string | null
  name: string
  type: ResourceType
  url: string
  tags: string[]
  account_email: string | null
  account_password: string | null
  created_by: string | null
  created_at: string
}
