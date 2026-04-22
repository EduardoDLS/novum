'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, FileText, FolderOpen, Users, UserCog } from 'lucide-react'

const NAV = [
  { href: '/inicio',      label: 'Inicio',         icon: Home       },
  { href: '/hub-edicion', label: 'Hub de Edición',  icon: Calendar   },
  { href: '/clientes',    label: 'Clientes',         icon: Users      },
  { href: '/scripts',     label: 'Guiones',          icon: FileText   },
  { href: '/recursos',    label: 'Recursos',         icon: FolderOpen },
  { href: '/equipo',      label: 'Equipo',           icon: UserCog    },
]

export function DashboardSidebarNav({ pendingScripts }: { pendingScripts: number | null }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 space-y-0.5 py-2">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        const badge = href === '/scripts' ? pendingScripts : null
        return (
          <Link
            key={href}
            href={href}
            className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all ${
              active
                ? 'bg-white/[0.07] text-novum-warm'
                : 'text-novum-silver hover:bg-white/[0.05] hover:text-novum-warm'
            }`}
          >
            <Icon
              className={`h-[15px] w-[15px] shrink-0 transition-colors ${
                active ? 'text-novum-gold' : 'group-hover:text-novum-gold'
              }`}
            />
            <span className="flex-1">{label}</span>
            {badge != null && badge > 0 && (
              <span className="ml-auto rounded-full bg-novum-gold/20 px-1.5 py-0.5 text-[10px] font-semibold text-novum-gold leading-none">
                {badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
