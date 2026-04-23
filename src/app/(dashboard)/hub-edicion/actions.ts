'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import type { ContentStatus, DeliveryStatus } from '@/types/novum'

const CreateDeliverySchema = z.object({
  client_id: z.string().uuid(),
  content_idea_id: z.string().uuid().optional().or(z.literal('')),
  editor_id: z.string().uuid().optional().or(z.literal('')),
  delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida.'),
  notes: z.string().max(500).optional(),
})

export type DeliveryActionResult = { ok: true } | { ok: false; error: string }

export async function createDelivery(formData: FormData): Promise<DeliveryActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])

  const parsed = CreateDeliverySchema.safeParse({
    client_id: formData.get('client_id'),
    content_idea_id: formData.get('content_idea_id') || undefined,
    editor_id: formData.get('editor_id') || undefined,
    delivery_date: formData.get('delivery_date'),
    notes: formData.get('notes') || undefined,
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }
  }

  const supabase = createClient()
  const { error } = await supabase.from('deliveries').insert({
    client_id: parsed.data.client_id,
    content_idea_id: parsed.data.content_idea_id || null,
    editor_id: parsed.data.editor_id || null,
    delivery_date: parsed.data.delivery_date,
    notes: parsed.data.notes,
  })

  if (error) return { ok: false, error: error.message }

  // Auto-mover a 'edicion' cuando se asigna un editor a una idea
  if (parsed.data.editor_id && parsed.data.content_idea_id) {
    await supabase
      .from('content_ideas')
      .update({ status: 'edicion', assigned_to: parsed.data.editor_id })
      .eq('id', parsed.data.content_idea_id)
      .in('status', ['baby_idea', 'guionizar', 'grabacion'])
  }

  revalidatePath('/hub-edicion')
  revalidatePath('/kanban')
  return { ok: true }
}

export async function moveIdeaStatus(
  ideaId: string,
  newStatus: ContentStatus,
): Promise<DeliveryActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])
  if (!ideaId) return { ok: false, error: 'ID requerido.' }

  const supabase = createClient()
  const { error } = await supabase
    .from('content_ideas')
    .update({ status: newStatus })
    .eq('id', ideaId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/hub-edicion')
  revalidatePath('/kanban')
  revalidatePath('/clientes', 'layout')
  return { ok: true }
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: DeliveryStatus,
): Promise<DeliveryActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])

  if (!deliveryId) return { ok: false, error: 'ID requerido.' }

  const supabase = createClient()
  const { error } = await supabase
    .from('deliveries')
    .update({ status })
    .eq('id', deliveryId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/hub-edicion')
  return { ok: true }
}

export async function updateDeliveryFull(
  deliveryId: string,
  deliveryStatus: DeliveryStatus,
  ideaId: string | null,
  ideaStatus: ContentStatus | null,
): Promise<DeliveryActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])
  if (!deliveryId) return { ok: false, error: 'ID requerido.' }

  const supabase = createClient()
  const { error } = await supabase
    .from('deliveries')
    .update({ status: deliveryStatus })
    .eq('id', deliveryId)

  if (error) return { ok: false, error: error.message }

  if (ideaId && ideaStatus) {
    await supabase
      .from('content_ideas')
      .update({ status: ideaStatus })
      .eq('id', ideaId)
  }

  revalidatePath('/hub-edicion')
  revalidatePath('/kanban')
  revalidatePath('/clientes', 'layout')
  return { ok: true }
}

export async function deleteDelivery(deliveryId: string): Promise<DeliveryActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])

  const supabase = createClient()
  const { error } = await supabase.from('deliveries').delete().eq('id', deliveryId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/hub-edicion')
  revalidatePath('/kanban')
  revalidatePath('/clientes', 'layout')
  return { ok: true }
}

export async function deleteIdeaFromHub(ideaId: string): Promise<DeliveryActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])
  if (!ideaId) return { ok: false, error: 'ID requerido.' }

  const supabase = createClient()
  const { error } = await supabase.from('content_ideas').delete().eq('id', ideaId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/hub-edicion')
  revalidatePath('/kanban')
  revalidatePath('/clientes', 'layout')
  return { ok: true }
}

const UpdateDeliveryDetailsSchema = z.object({
  deliveryId: z.string().uuid(),
  delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida.'),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export async function updateDeliveryDetails(formData: FormData): Promise<DeliveryActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])

  const parsed = UpdateDeliveryDetailsSchema.safeParse({
    deliveryId: formData.get('deliveryId'),
    delivery_date: formData.get('delivery_date'),
    notes: formData.get('notes') || '',
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }

  const supabase = createClient()
  const { error } = await supabase
    .from('deliveries')
    .update({
      delivery_date: parsed.data.delivery_date,
      notes: parsed.data.notes || null,
    })
    .eq('id', parsed.data.deliveryId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/hub-edicion')
  return { ok: true }
}

const UpdateIdeaTitleSchema = z.object({
  ideaId: z.string().uuid(),
  title: z.string().trim().min(2).max(280),
})

export async function updateIdeaTitleFromHub(formData: FormData): Promise<DeliveryActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])

  const parsed = UpdateIdeaTitleSchema.safeParse({
    ideaId: formData.get('ideaId'),
    title: formData.get('title'),
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }

  const supabase = createClient()
  const { error } = await supabase
    .from('content_ideas')
    .update({ title: parsed.data.title })
    .eq('id', parsed.data.ideaId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/hub-edicion')
  revalidatePath('/kanban')
  revalidatePath('/clientes', 'layout')
  return { ok: true }
}
