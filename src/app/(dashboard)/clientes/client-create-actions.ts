'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'

export type CreateClientResult =
  | { ok: true; clientId: string; email: string; tempPassword: string }
  | { ok: false; error: string }

const CreateClientSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(120),
  email: z.string().email('Email inválido.'),
  instagram_handle: z.string().trim().max(60).optional().or(z.literal('')),
  niche: z.string().trim().max(120).optional().or(z.literal('')),
  voice_tone: z.string().trim().max(300).optional().or(z.literal('')),
})

export async function createClientWithAccount(formData: FormData): Promise<CreateClientResult> {
  await requireRole(['admin'])

  const parsed = CreateClientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    instagram_handle: formData.get('instagram_handle') || '',
    niche: formData.get('niche') || '',
    voice_tone: formData.get('voice_tone') || '',
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dato inválido.' }

  const service = createServiceClient()

  const tempPassword =
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10).toUpperCase() +
    '!1'

  const { data: authData, error: authError } = await service.auth.admin.createUser({
    email: parsed.data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.name },
  })

  if (authError) return { ok: false, error: authError.message }
  if (!authData.user) return { ok: false, error: 'No se pudo crear el usuario.' }

  const userId = authData.user.id

  const { error: profileError } = await service
    .from('profiles')
    .update({ role: 'cliente', full_name: parsed.data.name })
    .eq('id', userId)

  if (profileError) {
    await service.auth.admin.deleteUser(userId)
    return { ok: false, error: profileError.message }
  }

  const { data: clientRecord, error: clientError } = await service
    .from('clients')
    .upsert(
      {
        profile_id: userId,
        name: parsed.data.name,
        instagram_handle: parsed.data.instagram_handle || null,
        niche: parsed.data.niche || null,
        voice_tone: parsed.data.voice_tone || null,
      },
      { onConflict: 'profile_id' },
    )
    .select('id')
    .single()

  if (clientError || !clientRecord) {
    await service.auth.admin.deleteUser(userId)
    return { ok: false, error: clientError?.message ?? 'Error al crear el cliente.' }
  }

  revalidatePath('/clientes')
  return { ok: true, clientId: clientRecord.id, email: parsed.data.email, tempPassword }
}
