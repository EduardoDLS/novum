import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { homeForRole, type UserRole } from '@/types/novum'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      const target = next || homeForRole((profile?.role ?? 'cliente') as UserRole)
      return NextResponse.redirect(`${origin}${target}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
