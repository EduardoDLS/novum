'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import type { ScriptLine } from '@/types/novum'

const FeedbackSchema = z.object({
  scriptId: z.string().uuid(),
  notes: z.string().trim().min(1, 'Escribe tu comentario.').max(500),
})

export type FeedbackResult = { ok: true } | { ok: false; error: string }

export async function submitScriptFeedback(formData: FormData): Promise<FeedbackResult> {
  await requireRole(['cliente'])

  const parsed = FeedbackSchema.safeParse({
    scriptId: formData.get('scriptId'),
    notes: formData.get('notes'),
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }

  const supabase = createClient()
  const { error } = await supabase
    .from('scripts')
    .update({ client_notes: parsed.data.notes })
    .eq('id', parsed.data.scriptId)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/guion/${parsed.data.scriptId}`)
  return { ok: true }
}

export async function updateScriptAsClient(
  scriptId: string,
  lines: ScriptLine[],
): Promise<FeedbackResult> {
  const { profile } = await requireRole(['cliente'])
  const supabase = createClient()

  // Verifica que el script pertenece al cliente autenticado
  const { data: script } = await supabase
    .from('scripts')
    .select('client_id, clients(profile_id)')
    .eq('id', scriptId)
    .single()

  type ScriptWithClient = { client_id: string; clients: { profile_id: string | null } | null }
  const row = script as unknown as ScriptWithClient | null
  if (!row || row.clients?.profile_id !== profile.id) {
    return { ok: false, error: 'Sin permisos.' }
  }

  const { error } = await supabase
    .from('scripts')
    .update({ script_content: lines })
    .eq('id', scriptId)

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/guion/${scriptId}`)
  return { ok: true }
}
