'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

const CreateResourceSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: z.enum(['plantilla', 'referencia', 'asset', 'guia']),
  url: z.string().trim().url(),
  tags: z.string().trim().max(300).optional().or(z.literal('')),
  client_id: z.string().uuid().optional().or(z.literal('')),
})

export type ResourceActionResult = { ok: true } | { ok: false; error: string }

export async function createResource(formData: FormData): Promise<ResourceActionResult> {
  const { profile } = await requireRole(['admin', 'editor'])

  const parsed = CreateResourceSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    url: formData.get('url'),
    tags: formData.get('tags') || '',
    client_id: formData.get('client_id') || '',
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }
  }

  const { tags, client_id, ...rest } = parsed.data
  const tagsArray = tags ? tags.split(',').map((s) => s.trim()).filter(Boolean) : []

  const supabase = createClient()
  const { error } = await supabase.from('resources').insert({
    ...rest,
    tags: tagsArray,
    client_id: client_id || null,
    created_by: profile.id,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/recursos')
  return { ok: true }
}

export async function deleteResource(id: string): Promise<ResourceActionResult> {
  await requireRole(['admin', 'editor'])

  const supabase = createClient()
  const { error } = await supabase.from('resources').delete().eq('id', id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/recursos')
  return { ok: true }
}
