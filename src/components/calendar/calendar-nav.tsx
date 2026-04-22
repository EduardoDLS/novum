'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  year: number
  month: number
  view: 'mes' | 'semana'
  week?: number
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function CalendarNav({ year, month, view, week }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function navigate(dir: -1 | 1) {
    const sp = new URLSearchParams(params.toString())
    if (view === 'mes') {
      let m = month + dir
      let y = year
      if (m < 1) { m = 12; y-- }
      if (m > 12) { m = 1; y++ }
      sp.set('year', String(y))
      sp.set('month', String(m))
    } else {
      const w = (week ?? 1) + dir
      sp.set('week', String(w))
    }
    router.push(`${pathname}?${sp.toString()}`)
  }

  function setView(v: 'mes' | 'semana') {
    const sp = new URLSearchParams(params.toString())
    sp.set('view', v)
    router.push(`${pathname}?${sp.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="t-h1 min-w-[160px] sm:min-w-[220px] text-center text-base sm:text-xl">
          {view === 'mes'
            ? `${MONTH_NAMES[month - 1]} ${year}`
            : `Semana ${week ?? 1} — ${year}`}
        </span>
        <Button variant="outline" size="icon" onClick={() => navigate(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-1 rounded-md border border-border p-0.5 self-start sm:self-auto">
        {(['mes', 'semana'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded px-3 py-1.5 text-sm transition-colors capitalize ${
              view === v
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}
