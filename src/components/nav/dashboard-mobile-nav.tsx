'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, FileText, FolderOpen, Users, UserCog } from 'lucide-react'

const NAV = [
  { href: '/inicio',      icon: Home      },
  { href: '/hub-edicion', icon: Calendar  },
  { href: '/clientes',    icon: Users     },
  { href: '/scripts',     icon: FileText  },
  { href: '/recursos',    icon: FolderOpen },
  { href: '/equipo',      icon: UserCog   },
]

export function DashboardMobileNav({ pendingScripts }: { pendingScripts: number | null }) {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden flex items-center justify-around border-t border-novum-dark-border px-1 py-2"
      style={{ background: 'rgba(10,12,15,0.97)', backdropFilter: 'blur(12px)' }}
    >
      {NAV.map(({ href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        const isScripts = href === '/scripts'
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition-colors ${
              active ? 'text-novum-gold' : 'text-novum-silver hover:text-novum-warm'
            }`}
          >
            <Icon className="h-5 w-5" />
            {isScripts && pendingScripts != null && pendingScripts > 0 && (
              <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-novum-gold text-[9px] font-bold text-black flex items-center justify-center leading-none">
                {pendingScripts > 9 ? '9+' : pendingScripts}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
