'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import type { ScriptLine } from '@/types/novum'

export type ScriptActionResult = { ok: true } | { ok: false; error: string }

export async function updateScriptContent(
  scriptId: string,
  lines: ScriptLine[],
): Promise<ScriptActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])
  if (!scriptId) return { ok: false, error: 'ID requerido.' }

  const supabase = createClient()
  const { error } = await supabase
    .from('scripts')
    .update({ script_content: lines })
    .eq('id', scriptId)

  if (error) return { ok: false, error: error.message }
  revalidatePath('/scripts')
  return { ok: true }
}

export async function approveScript(scriptId: string): Promise<ScriptActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])
  if (!scriptId) return { ok: false, error: 'ID requerido.' }

  const supabase = createClient()

  const { error: scriptError } = await supabase
    .from('scripts')
    .update({ status: 'aprobado' })
    .eq('id', scriptId)

  if (scriptError) return { ok: false, error: scriptError.message }

  // Avanzar la idea a grabacion
  await supabase
    .from('content_ideas')
    .update({ status: 'grabacion' })
    .eq('script_id', scriptId)

  revalidatePath('/scripts')
  return { ok: true }
}

const RejectSchema = z.object({
  scriptId: z.string().uuid(),
  note: z.string().trim().min(1, 'Agrega una nota de rechazo.').max(500),
})

export async function rejectScript(formData: FormData): Promise<ScriptActionResult> {
  await requireRole(['admin', 'editor', 'guionista'])

  const parsed = RejectSchema.safeParse({
    scriptId: formData.get('scriptId'),
    note: formData.get('note'),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }
  }

  const supabase = createClient()

  const { error } = await supabase
    .from('scripts')
    .update({ status: 'rechazado', rejection_note: parsed.data.note })
    .eq('id', parsed.data.scriptId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/scripts')
  return { ok: true }
}
