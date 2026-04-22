'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export type ProfileActionResult = { ok: true } | { ok: false; error: string }

export async function updateAvatarUrl(url: string): Promise<ProfileActionResult> {
  const { profile } = await requireUser()
  const supabase = createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: url })
    .eq('id', profile.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/perfil')
  revalidatePath('/inicio')
  revalidatePath('/kanban')
  return { ok: true }
}

export async function updateProfileName(name: string): Promise<ProfileActionResult> {
  const { profile } = await requireUser()
  if (!name.trim()) return { ok: false, error: 'El nombre no puede estar vacío.' }

  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: name.trim() })
    .eq('id', profile.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/perfil')
  return { ok: true }
}
