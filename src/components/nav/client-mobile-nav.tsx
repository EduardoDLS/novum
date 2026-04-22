'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, TrendingUp, CalendarDays, UserCircle } from 'lucide-react'

const NAV = [
  { href: '/kanban',    icon: LayoutGrid,   label: 'Producción' },
  { href: '/metricas',  icon: TrendingUp,   label: 'Métricas'   },
  { href: '/calendario', icon: CalendarDays, label: 'Calendario' },
  { href: '/cuenta',    icon: UserCircle,   label: 'Cuenta'     },
]

export function ClientMobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 sm:hidden flex items-center justify-around border-t border-novum-dark-border px-1 py-1"
      style={{ background: 'rgba(14,16,19,0.97)', backdropFilter: 'blur(12px)' }}
    >
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 min-w-[60px] min-h-[48px] justify-center rounded-lg transition-colors ${
              active ? 'text-novum-gold' : 'text-novum-silver'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
