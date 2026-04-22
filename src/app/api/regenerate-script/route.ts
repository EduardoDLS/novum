import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { regenerateScriptRecord } from '@/lib/ai/trigger-generation'
import { isInternalRole } from '@/types/novum'

export const maxDuration = 60

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !isInternalRole(profile.role)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  let scriptId: string
  let notes: string | undefined
  try {
    const body = await request.json()
    scriptId = body.scriptId
    notes = body.notes
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!scriptId) return NextResponse.json({ error: 'scriptId requerido' }, { status: 400 })

  try {
    await regenerateScriptRecord(scriptId, notes)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[regenerate-script]', err)
    return NextResponse.json({ error: 'Error al regenerar' }, { status: 500 })
  }
}
