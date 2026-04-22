import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile, UserRole } from '@/types/novum'

export async function requireUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name, avatar_url, created_at, updated_at')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  return { user, profile: profile as Profile }
}

export async function requireRole(roles: UserRole[]) {
  const { user, profile } = await requireUser()
  if (!roles.includes(profile.role)) {
    redirect(profile.role === 'cliente' ? '/kanban' : '/hub-edicion')
  }
  return { user, profile }
}
