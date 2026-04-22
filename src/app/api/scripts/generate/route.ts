import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { generateScript } from '@/lib/ai/generate-script'
import type { ClientContext } from '@/types/novum'

// Protege el endpoint con un secreto interno.
// Solo el servidor puede llamar a esta ruta.
const GENERATE_SECRET = process.env.GENERATE_SECRET

export async function POST(req: NextRequest) {
  // Verificación de secreto interno
  const authHeader = req.headers.get('x-generate-secret')
  if (!GENERATE_SECRET || authHeader !== GENERATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ideaId } = await req.json()
  if (!ideaId) {
    return NextResponse.json({ error: 'ideaId requerido' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 1. Obtener la idea y datos del cliente
  const { data: idea, error: ideaError } = await supabase
    .from('content_ideas')
    .select('id, title, client_id, status')
    .eq('id', ideaId)
    .single()

  if (ideaError || !idea) {
    return NextResponse.json({ error: 'Idea no encontrada' }, { status: 404 })
  }

  // Si ya fue procesada, no regenerar
  if (idea.status !== 'baby_idea') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, name, niche, voice_tone, content_pillars, bio_context, communication_style, signature_phrases')
    .eq('id', idea.client_id)
    .single()

  if (clientError || !client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  const clientCtx: ClientContext = {
    name: client.name,
    niche: client.niche ?? 'Personal brand',
    voiceTone: client.voice_tone ?? 'Auténtico, directo y cercano',
    contentPillars: client.content_pillars ?? [],
    bioContext: client.bio_context ?? '',
    communicationStyle: (client as { communication_style?: string | null }).communication_style ?? '',
    signaturePhrases: (client as { signature_phrases?: string | null }).signature_phrases ?? '',
  }

  try {
    // 2. Generar visión + guion con Claude
    const { vision, script } = await generateScript(idea.title, clientCtx)

    // 3. Guardar script en la tabla scripts
    const { data: savedScript, error: insertError } = await supabase
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

    if (insertError || !savedScript) {
      throw new Error(insertError?.message ?? 'Error al guardar script')
    }

    // 4. Actualizar content_idea: status → guionizar, script_id → savedScript.id
    await supabase
      .from('content_ideas')
      .update({ status: 'guionizar', script_id: savedScript.id })
      .eq('id', ideaId)

    return NextResponse.json({ ok: true, scriptId: savedScript.id })
  } catch (err) {
    console.error('[generate-script]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 },
    )
  }
}
