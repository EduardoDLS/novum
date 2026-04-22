import Link from 'next/link'
import Image from 'next/image'
import { requireRole } from '@/lib/auth'
import { SignOutButton } from '@/components/nav/sign-out-button'
import { Wordmark } from '@/components/brand/wordmark'
import { ClientMobileNav } from '@/components/nav/client-mobile-nav'

const NAV = [
  { href: '/kanban',    label: 'Producción' },
  { href: '/metricas',  label: 'Métricas'   },
  { href: '/calendario', label: 'Calendario' },
  { href: '/cuenta',    label: 'Mi cuenta'  },
]

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole(['cliente'])

  return (
    <div className="min-h-screen bg-background">
      <header
        className="border-b border-novum-dark-border sticky top-0 z-20 backdrop-blur-sm"
        style={{ background: 'rgba(14,16,19,0.92)' }}
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex h-12 sm:h-14 items-center justify-between">
          {/* Logo + nav desktop */}
          <div className="flex items-center gap-8">
            <Link href="/kanban" aria-label="Novum">
              <Wordmark className="h-[15px] w-auto text-novum-warm" />
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-3 py-1.5 text-sm text-novum-silver hover:bg-white/[0.05] hover:text-novum-warm transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Avatar + salir */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/cuenta" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-7 w-7 shrink-0 rounded-full overflow-hidden border border-novum-dark-border bg-novum-dark-elevated flex items-center justify-center">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt="Avatar" width={28} height={28} className="object-cover" unoptimized />
                ) : (
                  <span className="text-[11px] font-bold text-novum-gold">
                    {(profile.full_name ?? 'C').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs text-novum-silver hidden sm:block">{profile.full_name || 'Cliente'}</span>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 pb-24 sm:py-8 sm:pb-8">{children}</main>

      <ClientMobileNav />
    </div>
  )
}
