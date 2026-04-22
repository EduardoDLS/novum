import { createServiceClient } from '@/lib/supabase/service'
import { generateScript } from './generate-script'
import type { ClientContext } from '@/types/novum'

export async function regenerateScriptRecord(scriptId: string, notes?: string): Promise<void> {
  const supabase = createServiceClient()

  const { data: script } = await supabase
    .from('scripts')
    .select('id, client_id, raw_idea')
    .eq('id', scriptId)
    .single()

  if (!script) return

  const { data: client } = await supabase
    .from('clients')
    .select('name, niche, voice_tone, content_pillars, bio_context, communication_style, signature_phrases')
    .eq('id', script.client_id)
    .single()

  if (!client) return

  const clientCtx: ClientContext = {
    name: client.name,
    niche: client.niche ?? 'Personal brand',
    voiceTone: client.voice_tone ?? 'Auténtico, directo y cercano',
    contentPillars: client.content_pillars ?? [],
    bioContext: client.bio_context ?? '',
    communicationStyle: (client as { communication_style?: string | null }).communication_style ?? '',
    signaturePhrases: (client as { signature_phrases?: string | null }).signature_phrases ?? '',
  }

  const ideaWithNotes = notes?.trim()
    ? `${script.raw_idea}\n\nNotas adicionales del equipo: ${notes}`
    : script.raw_idea

  const { vision, script: scriptLines } = await generateScript(ideaWithNotes, clientCtx)

  await supabase
    .from('scripts')
    .update({
      strategic_vision: vision,
      script_content: scriptLines,
      status: 'borrador',
      rejection_note: null,
    })
    .eq('id', scriptId)
}

export async function triggerScriptGeneration(ideaId: string): Promise<void> {
  const supabase = createServiceClient()

  const { data: idea } = await supabase
    .from('content_ideas')
    .select('id, title, client_id, status')
    .eq('id', ideaId)
    .single()

  if (!idea || idea.status !== 'baby_idea') return

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, niche, voice_tone, content_pillars, bio_context, communication_style, signature_phrases')
    .eq('id', idea.client_id)
    .single()

  if (!client) return

  const clientCtx: ClientContext = {
    name: client.name,
    niche: client.niche ?? 'Personal brand',
    voiceTone: client.voice_tone ?? 'Auténtico, directo y cercano',
    contentPillars: client.content_pillars ?? [],
    bioContext: client.bio_context ?? '',
    communicationStyle: (client as { communication_style?: string | null }).communication_style ?? '',
    signaturePhrases: (client as { signature_phrases?: string | null }).signature_phrases ?? '',
  }

  const { vision, script } = await generateScript(idea.title, clientCtx)

  const { data: savedScript } = await supabase
    .from('scripts')
    .insert({
      content_idea_id: idea.id,
      client_id: idea.client_id,
      raw_idea: idea.title,
      strategic_vision: vision,
      script_content: script,
      status: 'borrador',
    })
    .select('id')
    .single()

  if (!savedScript) return

  await supabase
    .from('content_ideas')
    .update({ status: 'guionizar', script_id: savedScript.id })
    .eq('id', ideaId)
}
