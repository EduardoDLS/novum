import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { triggerScriptGeneration } from '@/lib/ai/trigger-generation'

export const maxDuration = 60

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let ideaId: string
  try {
    const body = await request.json()
    ideaId = body.ideaId
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!ideaId) return NextResponse.json({ error: 'ideaId requerido' }, { status: 400 })

  try {
    await triggerScriptGeneration(ideaId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[generate-script]', err)
    return NextResponse.json({ error: 'Error al generar guion' }, { status: 500 })
  }
}
