'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

const BabyIdeaSchema = z.object({
  title: z
    .string()
    .trim()
    .min(4, 'Describe tu idea en al menos 4 caracteres.')
    .max(280, 'Máximo 280 caracteres.'),
})

export type ActionResult =
  | { ok: true; ideaId: string }
  | { ok: false; error: string }

async function getClientIdForCurrentUser(): Promise<string> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')

  const { data, error } = await supabase
    .from('clients')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (error || !data) {
    throw new Error('No encontramos tu perfil de cliente.')
  }
  return data.id
}

export async function createBabyIdea(formData: FormData): Promise<ActionResult> {
  await requireRole(['cliente'])

  const parsed = BabyIdeaSchema.safeParse({
    title: formData.get('title'),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }
  }

  try {
    const clientId = await getClientIdForCurrentUser()
    const supabase = createClient()
    const { data: idea, error } = await supabase
      .from('content_ideas')
      .insert({
        client_id: clientId,
        title: parsed.data.title,
        status: 'baby_idea',
      })
      .select('id')
      .single()

    if (error || !idea) return { ok: false, error: error?.message ?? 'Error al guardar.' }

    revalidatePath('/kanban')
    return { ok: true, ideaId: idea.id }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Error interno.' }
  }
}

export async function deleteBabyIdea(ideaId: string): Promise<{ ok: boolean; error?: string }> {
  await requireRole(['cliente'])

  if (!ideaId) return { ok: false, error: 'ID requerido.' }

  const supabase = createClient()
  const { error } = await supabase.from('content_ideas').delete().eq('id', ideaId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/kanban')
  return { ok: true }
}
