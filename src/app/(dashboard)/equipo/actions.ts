'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/novum'

export type TeamActionResult =
  | { ok: true; tempPassword?: string; email?: string }
  | { ok: false; error: string }

const InviteSchema = z.object({
  email: z.string().email('Email inválido.'),
  full_name: z.string().trim().min(1).max(120),
  role: z.enum(['admin', 'editor', 'guionista']),
})

const ChangeRoleSchema = z.object({
  profileId: z.string().uuid(),
  role: z.enum(['admin', 'editor', 'guionista', 'cliente']),
})

export async function inviteTeamMember(formData: FormData): Promise<TeamActionResult> {
  await requireRole(['admin'])

  const parsed = InviteSchema.safeParse({
    email: formData.get('email'),
    full_name: formData.get('full_name'),
    role: formData.get('role'),
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }

  const service = createServiceClient()

  // Crear usuario con contraseña temporal que deberá cambiar
  const tempPassword = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10).toUpperCase() + '!1'

  const { data: newUser, error: createError } = await service.auth.admin.createUser({
    email: parsed.data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name },
  })

  if (createError) return { ok: false, error: createError.message }
  if (!newUser.user) return { ok: false, error: 'No se pudo crear el usuario.' }

  const { error: profileError } = await service
    .from('profiles')
    .update({ role: parsed.data.role as UserRole, full_name: parsed.data.full_name })
    .eq('id', newUser.user.id)

  if (profileError) return { ok: false, error: profileError.message }

  revalidatePath('/equipo')
  return { ok: true, tempPassword, email: parsed.data.email }
}

export async function changeRole(formData: FormData): Promise<TeamActionResult> {
  const { profile: me } = await requireRole(['admin'])

  const parsed = ChangeRoleSchema.safeParse({
    profileId: formData.get('profileId'),
    role: formData.get('role'),
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }
  if (parsed.data.profileId === me.id) return { ok: false, error: 'No puedes cambiar tu propio rol.' }

  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role: parsed.data.role as UserRole })
    .eq('id', parsed.data.profileId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/equipo')
  return { ok: true }
}

export async function removeTeamMember(profileId: string): Promise<TeamActionResult> {
  const { profile: me } = await requireRole(['admin'])
  if (profileId === me.id) return { ok: false, error: 'No puedes eliminarte a ti mismo.' }

  const service = createServiceClient()
  const { error } = await service.auth.admin.deleteUser(profileId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/equipo')
  return { ok: true }
}
