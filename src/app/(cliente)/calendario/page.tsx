import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { DELIVERY_STATUS_COLOR, DELIVERY_STATUS_LABEL, type DeliveryStatus } from '@/types/novum'
import { CalendarDays } from 'lucide-react'

export const dynamic = 'force-dynamic'

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default async function CalendarioClientePage() {
  const { profile } = await requireRole(['cliente'])
  const supabase = createClient()

  const { data: deliveries } = await supabase
    .from('deliveries')
    .select('id, delivery_date, status, notes, content_ideas(title)')
    .order('delivery_date', { ascending: true })

  type Row = {
    id: string
    delivery_date: string
    status: DeliveryStatus
    notes: string | null
    content_ideas: { title: string } | null
  }

  const rows = (deliveries ?? []) as unknown as Row[]
  const byMonth: Record<string, Row[]> = {}
  rows.forEach((d) => {
    const key = d.delivery_date.slice(0, 7)
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(d)
  })

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = rows.filter((d) => d.delivery_date >= today && d.status !== 'publicado')
  const nombre = profile.full_name?.split(' ')[0] ?? ''

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="rounded-xl border border-novum-dark-border overflow-hidden shadow-elev-2"
        style={{ background: 'linear-gradient(135deg, #151719 0%, #1B1E22 100%)' }}>
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-novum-dark-elevated border border-novum-dark-border flex items-center justify-center shrink-0">
            <CalendarDays className="h-5 w-5 text-novum-gold" />
          </div>
          <div>
            <h2 className="t-h1 text-novum-warm">Calendario</h2>
            <p className="text-sm text-novum-silver">
              {upcoming.length > 0
                ? `${upcoming.length} entrega${upcoming.length !== 1 ? 's' : ''} próxima${upcoming.length !== 1 ? 's' : ''}`
                : 'Sin entregas próximas programadas'}
              {nombre ? `, ${nombre}.` : '.'}
            </p>
          </div>
        </div>
      </div>

      {rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-novum-dark-border p-10 text-center space-y-2">
          <CalendarDays className="h-8 w-8 text-novum-gold/40 mx-auto" />
          <p className="text-sm text-novum-silver">Aún no tienes fechas programadas.</p>
          <p className="text-xs text-novum-silver-strong">Aparecerán aquí cuando tu equipo agende una entrega.</p>
        </div>
      )}

      {Object.entries(byMonth).map(([monthKey, items]) => {
        const [y, m] = monthKey.split('-')
        const monthName = `${MONTH_NAMES[parseInt(m) - 1]} ${y}`
        return (
          <section key={monthKey} className="space-y-2">
            <h3 className="t-label text-novum-silver-strong">{monthName}</h3>
            <div className="space-y-2">
              {items.map((d) => {
                const date = new Date(d.delivery_date + 'T12:00:00')
                const isPast = d.delivery_date < today
                const isToday = d.delivery_date === today
                const colorClass = DELIVERY_STATUS_COLOR[d.status]
                const label = DELIVERY_STATUS_LABEL[d.status]
                const title = d.content_ideas?.title ?? d.notes ?? 'Video'

                return (
                  <div
                    key={d.id}
                    className={`flex items-center gap-4 rounded-xl border bg-novum-dark-raised px-4 py-3 shadow-elev-1 transition-opacity ${
                      isToday ? 'border-novum-gold/40' : 'border-novum-dark-border'
                    } ${isPast && d.status !== 'publicado' ? 'opacity-40' : ''}`}
                  >
                    <div className={`w-11 text-center shrink-0 rounded-lg py-1.5 ${isToday ? 'bg-novum-gold/15' : 'bg-novum-dark-elevated'}`}>
                      <p className={`text-xl font-bold leading-none ${isToday ? 'text-novum-gold' : 'text-novum-warm'}`}>
                        {date.getDate()}
                      </p>
                      <p className="t-label text-novum-silver-strong mt-0.5">
                        {date.toLocaleDateString('es-MX', { weekday: 'short' }).slice(0, 3)}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-novum-warm">{title}</p>
                      {isToday && <p className="text-xs text-novum-gold mt-0.5">Hoy</p>}
                    </div>
                    <span className={`t-label rounded-full px-2.5 py-0.5 text-[10px] shrink-0 ${colorClass}`}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
