'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import type { ContentStatus } from '@/types/novum'

const UpdateClientSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  instagram_handle: z.string().trim().max(60).optional().or(z.literal('')),
  followers_count: z.coerce.number().int().min(0).optional().or(z.literal('')),
  niche: z.string().trim().max(120).optional().or(z.literal('')),
  voice_tone: z.string().trim().max(300).optional().or(z.literal('')),
  content_pillars: z.string().trim().max(500).optional().or(z.literal('')),
  bio_context: z.string().trim().max(1000).optional().or(z.literal('')),
  communication_style: z.string().trim().max(1000).optional().or(z.literal('')),
  signature_phrases: z.string().trim().max(1000).optional().or(z.literal('')),
})

const UpdateInstagramSchema = z.object({
  clientId: z.string().uuid(),
  instagram_photo_url: z.string().trim().url().optional().or(z.literal('')),
  avg_views_reel: z.coerce.number().int().min(0).optional().or(z.literal('')),
  engagement_rate: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
})

export type ClientActionResult = { ok: true } | { ok: false; error: string }

export async function updateClientContext(formData: FormData): Promise<ClientActionResult> {
  await requireRole(['admin', 'editor', 'guionista', 'cliente'])

  const parsed = UpdateClientSchema.safeParse({
    clientId: formData.get('clientId'),
    name: formData.get('name'),
    instagram_handle: formData.get('instagram_handle') || '',
    followers_count: formData.get('followers_count') || '',
    niche: formData.get('niche') || '',
    voice_tone: formData.get('voice_tone') || '',
    content_pillars: formData.get('content_pillars') || '',
    bio_context: formData.get('bio_context') || '',
    communication_style: formData.get('communication_style') || '',
    signature_phrases: formData.get('signature_phrases') || '',
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }
  }

  const { clientId, content_pillars, followers_count, ...rest } = parsed.data

  // content_pillars llega como string separado por comas
  const pillarsArray = content_pillars
    ? content_pillars.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const supabase = createClient()
  const { error } = await supabase
    .from('clients')
    .update({
      ...rest,
      instagram_handle: rest.instagram_handle || null,
      niche: rest.niche || null,
      voice_tone: rest.voice_tone || null,
      bio_context: rest.bio_context || null,
      communication_style: rest.communication_style || null,
      signature_phrases: rest.signature_phrases || null,
      content_pillars: pillarsArray,
      followers_count: typeof followers_count === 'number' ? followers_count : null,
    })
    .eq('id', clientId)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/clientes/${clientId}`)
  revalidatePath('/clientes')
  return { ok: true }
}

const UpdateIdeaStatsSchema = z.object({
  ideaId: z.string().uuid(),
  views_count: z.coerce.number().int().min(0).optional().or(z.literal('')),
  video_url: z.string().trim().url().optional().or(z.literal('')),
})

export async function updateIdeaStats(formData: FormData): Promise<ClientActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])

  const parsed = UpdateIdeaStatsSchema.safeParse({
    ideaId: formData.get('ideaId'),
    views_count: formData.get('views_count') || '',
    video_url: formData.get('video_url') || '',
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }

  const { ideaId, views_count, video_url } = parsed.data
  const supabase = createClient()

  const { error } = await supabase
    .from('content_ideas')
    .update({
      views_count: typeof views_count === 'number' ? views_count : null,
      video_url: video_url || null,
    })
    .eq('id', ideaId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/clientes')
  return { ok: true }
}

export async function updateInstagramAnalytics(formData: FormData): Promise<ClientActionResult> {
  await requireRole(['admin', 'editor'])

  const parsed = UpdateInstagramSchema.safeParse({
    clientId: formData.get('clientId'),
    instagram_photo_url: formData.get('instagram_photo_url') || '',
    avg_views_reel: formData.get('avg_views_reel') || '',
    engagement_rate: formData.get('engagement_rate') || '',
  })

  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }

  const { clientId, avg_views_reel, engagement_rate, instagram_photo_url } = parsed.data
  const supabase = createClient()

  const { error } = await supabase
    .from('clients')
    .update({
      instagram_photo_url: instagram_photo_url || null,
      avg_views_reel: typeof avg_views_reel === 'number' ? avg_views_reel : null,
      engagement_rate: typeof engagement_rate === 'number' ? engagement_rate : null,
    })
    .eq('id', clientId)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/clientes/${clientId}`)
  return { ok: true }
}

// ─── Ideas management (team) ────────────────────────────────────────────────

const CreateIdeaSchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().trim().min(2, 'Escribe el título del video.').max(280),
  status: z.enum(['baby_idea', 'guionizar', 'grabacion', 'edicion', 'revision', 'publicado']).default('baby_idea'),
})

const UpdateIdeaSchema = z.object({
  ideaId: z.string().uuid(),
  title: z.string().trim().min(2).max(280),
  status: z.enum(['baby_idea', 'guionizar', 'grabacion', 'edicion', 'revision', 'publicado']),
})

export async function createIdeaForClient(formData: FormData): Promise<ClientActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])

  const parsed = CreateIdeaSchema.safeParse({
    clientId: formData.get('clientId'),
    title: formData.get('title'),
    status: formData.get('status') || 'baby_idea',
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }

  const supabase = createClient()
  const { error } = await supabase.from('content_ideas').insert({
    client_id: parsed.data.clientId,
    title: parsed.data.title,
    status: parsed.data.status as ContentStatus,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/clientes/${parsed.data.clientId}`)
  revalidatePath('/hub-edicion')
  revalidatePath('/kanban')
  return { ok: true }
}

export async function updateIdeaForTeam(formData: FormData): Promise<ClientActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])

  const parsed = UpdateIdeaSchema.safeParse({
    ideaId: formData.get('ideaId'),
    title: formData.get('title'),
    status: formData.get('status'),
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }

  const supabase = createClient()
  const { error } = await supabase
    .from('content_ideas')
    .update({ title: parsed.data.title, status: parsed.data.status as ContentStatus })
    .eq('id', parsed.data.ideaId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/clientes', 'layout')
  revalidatePath('/hub-edicion')
  revalidatePath('/kanban')
  return { ok: true }
}

export async function deleteIdeaForTeam(ideaId: string): Promise<ClientActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])
  if (!ideaId) return { ok: false, error: 'ID requerido.' }

  const supabase = createClient()
  const { error } = await supabase.from('content_ideas').delete().eq('id', ideaId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/clientes', 'layout')
  revalidatePath('/hub-edicion')
  revalidatePath('/kanban')
  return { ok: true }
}

export async function moveIdeaStatusFromProfile(
  ideaId: string,
  status: ContentStatus,
): Promise<ClientActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])
  if (!ideaId) return { ok: false, error: 'ID requerido.' }

  const supabase = createClient()
  const { error } = await supabase
    .from('content_ideas')
    .update({ status })
    .eq('id', ideaId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/clientes', 'layout')
  revalidatePath('/hub-edicion')
  revalidatePath('/kanban')
  return { ok: true }
}
