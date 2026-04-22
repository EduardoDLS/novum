import { DeliveryBadge } from './delivery-badge'
import type { DeliveryStatus } from '@/types/novum'

type DeliveryWithClient = {
  id: string
  delivery_date: string
  status: DeliveryStatus
  notes: string | null
  clients: { name: string } | null
  content_ideas: { title: string } | null
}

type Props = {
  year: number
  month: number
  deliveries: DeliveryWithClient[]
}

const DAY_LABELS_FULL  = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const DAY_LABELS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function MonthGrid({ year, month, deliveries }: Props) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const totalDays = lastDay.getDate()

  // Lunes = 0 ... Domingo = 6
  const startOffset = (firstDay.getDay() + 6) % 7

  const byDate: Record<string, DeliveryWithClient[]> = {}
  deliveries.forEach((d) => {
    const key = d.delivery_date.slice(0, 10)
    if (!byDate[key]) byDate[key] = []
    byDate[key].push(d)
  })

  const today = new Date().toISOString().slice(0, 10)

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_LABELS_FULL.map((d, i) => (
          <div key={d} className="t-label py-2 text-center text-muted-foreground">
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{DAY_LABELS_SHORT[i]}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const dateKey = day
            ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : null
          const dayDeliveries = dateKey ? (byDate[dateKey] ?? []) : []
          const isToday = dateKey === today

          return (
            <div
              key={i}
              className={`min-h-[56px] sm:min-h-[96px] border-b border-r border-border p-1 sm:p-1.5 ${
                !day ? 'bg-muted/30' : ''
              }`}
            >
              {day && (
                <>
                  <span
                    className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? 'bg-foreground text-background font-bold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {dayDeliveries.map((d) => (
                      <DeliveryBadge key={d.id} delivery={d} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
