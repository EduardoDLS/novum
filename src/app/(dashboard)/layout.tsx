import Link from 'next/link'
import Image from 'next/image'
import { Home, Calendar, FileText, FolderOpen, Users, UserCog } from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/components/nav/sign-out-button'
import { Wordmark } from '@/components/brand/wordmark'
import { DashboardMobileNav } from '@/components/nav/dashboard-mobile-nav'
import { DashboardSidebarNav } from '@/components/nav/dashboard-sidebar-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole(['admin', 'editor', 'guionista'])
  const supabase = createClient()
  const { count: pendingScripts } = await supabase
    .from('scripts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'borrador')

  const NAV = [
    { href: '/inicio',      label: 'Inicio',        icon: Home,       badge: null },
    { href: '/hub-edicion', label: 'Hub de Edición', icon: Calendar,   badge: null },
    { href: '/clientes',    label: 'Clientes',       icon: Users,      badge: null },
    { href: '/scripts',     label: 'Guiones',        icon: FileText,   badge: pendingScripts || null },
    { href: '/recursos',    label: 'Recursos',       icon: FolderOpen, badge: null },
    { href: '/equipo',      label: 'Equipo',         icon: UserCog,    badge: null },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — solo desktop */}
      <aside
        className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-novum-dark-border"
        style={{ background: 'linear-gradient(180deg, #0A0C0F 0%, #0E1013 100%)' }}
      >
        <div className="px-5 pt-6 pb-5">
          <Wordmark className="h-[18px] w-auto text-novum-warm" />
          <div className="mt-3 h-px bg-gradient-to-r from-novum-gold/40 via-novum-gold/10 to-transparent" />
        </div>

        <DashboardSidebarNav items={NAV} />

        <div className="border-t border-novum-dark-border px-3 py-3 space-y-1">
          <Link
            href="/perfil"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-white/[0.05] transition-colors group"
          >
            <div className="h-7 w-7 shrink-0 rounded-full overflow-hidden border border-novum-dark-border bg-novum-dark-elevated flex items-center justify-center">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="Avatar" width={28} height={28} className="object-cover" unoptimized />
              ) : (
                <span className="text-[11px] font-bold text-novum-gold">
                  {(profile.full_name ?? 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate text-novum-warm">{profile.full_name || 'Mi perfil'}</p>
              <p className="text-[10px] text-novum-silver-strong capitalize">{profile.role}</p>
            </div>
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Header móvil */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex h-12 items-center justify-between px-4 border-b border-novum-dark-border"
        style={{ background: 'rgba(10,12,15,0.97)', backdropFilter: 'blur(12px)' }}>
        <Link href="/inicio">
          <Wordmark className="h-[15px] w-auto text-novum-warm" />
        </Link>
        <Link href="/perfil" className="flex items-center gap-2">
          <div className="h-7 w-7 shrink-0 rounded-full overflow-hidden border border-novum-dark-border bg-novum-dark-elevated flex items-center justify-center">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt="Avatar" width={28} height={28} className="object-cover" unoptimized />
            ) : (
              <span className="text-[11px] font-bold text-novum-gold">
                {(profile.full_name ?? 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-4 md:px-8 pt-16 md:pt-10 pb-24 md:pb-10">
          {children}
        </div>
      </main>

      {/* Nav móvil inferior */}
      <DashboardMobileNav pendingScripts={pendingScripts ?? null} />
    </div>
  )
}
