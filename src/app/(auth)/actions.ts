'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { homeForRole, type UserRole } from '@/types/novum'

const credentialsSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

const registerSchema = credentialsSchema.extend({
  full_name: z.string().min(2, 'Ingresa tu nombre completo'),
  role: z.enum(['cliente', 'editor', 'guionista', 'admin']),
})

export type FormState = { error?: string } | undefined

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) return { error: error.message }

  const adminClient = createServiceClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const next = (formData.get('next') as string | null) ?? null
  revalidatePath('/', 'layout')
  redirect(next || homeForRole((profile?.role ?? 'cliente') as UserRole))
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    full_name: formData.get('full_name'),
    role: formData.get('role'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const admin = createServiceClient()
  let createError: string | null = null
  try {
    const { error } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        full_name: parsed.data.full_name,
        role: parsed.data.role as UserRole,
      },
    })
    if (error) createError = error.message
  } catch (e) {
    createError = e instanceof Error ? e.message : 'Error al crear la cuenta'
  }

  if (createError) {
    if (createError.toLowerCase().includes('already')) {
      return { error: 'Ya existe una cuenta con ese email.' }
    }
    return { error: createError }
  }

  revalidatePath('/', 'layout')
  redirect('/login?registered=1')
}

export async function logoutAction() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
