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
  week: number
  deliveries: DeliveryWithClient[]
}

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function getWeekDates(year: number, week: number): Date[] {
  const jan4 = new Date(year, 0, 4)
  const mondayOfWeek1 = new Date(jan4)
  mondayOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))

  const monday = new Date(mondayOfWeek1)
  monday.setDate(mondayOfWeek1.getDate() + (week - 1) * 7)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export function WeekGrid({ year, week, deliveries }: Props) {
  const dates = getWeekDates(year, week)
  const today = new Date().toISOString().slice(0, 10)

  const byDate: Record<string, DeliveryWithClient[]> = {}
  deliveries.forEach((d) => {
    const key = d.delivery_date.slice(0, 10)
    if (!byDate[key]) byDate[key] = []
    byDate[key].push(d)
  })

  return (
    <div className="grid grid-cols-7 rounded-lg border border-border overflow-hidden">
      {dates.map((date, i) => {
        const dateKey = date.toISOString().slice(0, 10)
        const dayDeliveries = byDate[dateKey] ?? []
        const isToday = dateKey === today

        return (
          <div key={i} className={`min-h-[200px] ${i < 6 ? 'border-r border-border' : ''}`}>
            <div
              className={`border-b border-border px-2 py-2 text-center ${
                isToday ? 'bg-foreground text-background' : 'bg-muted/30'
              }`}
            >
              <p className="t-label">{DAY_LABELS[i]}</p>
              <p className={`text-lg font-bold leading-tight ${isToday ? '' : 'text-foreground'}`}>
                {date.getDate()}
              </p>
            </div>
            <div className="space-y-1 p-1.5">
              {dayDeliveries.map((d) => (
                <DeliveryBadge key={d.id} delivery={d} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
