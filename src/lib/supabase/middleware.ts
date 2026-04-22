import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import { homeForRole, isInternalRole, type UserRole } from '@/types/novum'

const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback']
const PUBLIC_PREFIXES = ['/embed']
const DASHBOARD_PREFIXES = ['/inicio', '/hub-edicion', '/clientes', '/scripts', '/recursos', '/equipo', '/perfil']
const CLIENT_PREFIXES = ['/kanban', '/calendario', '/guion', '/metricas', '/cuenta']

function matches(path: string, prefixes: string[]) {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`))
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublic = matches(path, PUBLIC_ROUTES) || matches(path, PUBLIC_PREFIXES)

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = (profile?.role ?? 'cliente') as UserRole

    if (isPublic && path !== '/auth/callback') {
      const url = request.nextUrl.clone()
      url.pathname = homeForRole(role)
      return NextResponse.redirect(url)
    }

    if (matches(path, DASHBOARD_PREFIXES) && !isInternalRole(role)) {
      const url = request.nextUrl.clone()
      url.pathname = homeForRole(role)
      return NextResponse.redirect(url)
    }

    if (matches(path, CLIENT_PREFIXES) && role !== 'cliente') {
      const url = request.nextUrl.clone()
      url.pathname = homeForRole(role)
      return NextResponse.redirect(url)
    }
  }

  return response
}
