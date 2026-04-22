import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { CalendarNav } from '@/components/calendar/calendar-nav'
import { MonthGrid } from '@/components/calendar/month-grid'
import { WeekGrid } from '@/components/calendar/week-grid'
import { CreateDeliveryForm } from './create-delivery-form'
import { ProductionBoard, type BoardIdea } from './production-board'
import type { ContentStatus, DeliveryStatus } from '@/types/novum'

export const dynamic = 'force-dynamic'

type SearchParams = { year?: string; month?: string; week?: string; view?: string }

function getISOWeek(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

export default async function HubEdicionPage({ searchParams }: { searchParams: SearchParams }) {
  await requireRole(['admin', 'editor', 'guionista'])
  const supabase = createClient()

  const today = new Date()
  const view = (searchParams.view === 'semana' ? 'semana' : 'mes') as 'mes' | 'semana'
  const year = parseInt(searchParams.year ?? '') || today.getFullYear()
  const month = parseInt(searchParams.month ?? '') || today.getMonth() + 1
  const week = parseInt(searchParams.week ?? '') || getISOWeek(today)

  let dateFrom: string, dateTo: string
  if (view === 'mes') {
    dateFrom = `${year}-${String(month).padStart(2, '0')}-01`
    const last = new Date(year, month, 0).getDate()
    dateTo = `${year}-${String(month).padStart(2, '0')}-${String(last).padStart(2, '0')}`
  } else {
    const jan4 = new Date(year, 0, 4)
    const mon1 = new Date(jan4)
    mon1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
    const monday = new Date(mon1)
    monday.setDate(mon1.getDate() + (week - 1) * 7)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    dateFrom = monday.toISOString().slice(0, 10)
    dateTo = sunday.toISOString().slice(0, 10)
  }

  const [{ data: deliveries }, { data: clients }, { data: team }, { data: allIdeas }, { data: activeIdeas }] =
    await Promise.all([
      supabase
        .from('deliveries')
        .select('id, delivery_date, status, notes, clients(name), content_ideas(title), profiles(full_name)')
        .gte('delivery_date', dateFrom)
        .lte('delivery_date', dateTo)
        .order('delivery_date'),
      supabase.from('clients').select('id, name').order('name'),
      supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', ['admin', 'editor', 'guionista'])
        .order('full_name'),
      supabase
        .from('content_ideas')
        .select('id, title, client_id, status')
        .neq('status', 'publicado')
        .order('created_at', { ascending: false }),
      supabase
        .from('content_ideas')
        .select('id, title, status, assigned_to, clients(name)')
        .in('status', ['guionizar', 'grabacion', 'edicion', 'revision'])
        .order('created_at', { ascending: false }),
    ])

  type DeliveryRow = {
    id: string
    delivery_date: string
    status: DeliveryStatus
    notes: string | null
    clients: { name: string } | null
    content_ideas: { title: string } | null
    profiles: { full_name: string | null } | null
  }

  const rows = (deliveries ?? []) as unknown as DeliveryRow[]
  const clientList = (clients ?? []) as { id: string; name: string }[]
  const teamList = (team ?? []) as { id: string; full_name: string | null; role: string }[]
  const ideaList = (allIdeas ?? []) as { id: string; title: string; client_id: string; status: string }[]

  type ActiveIdeaRow = { id: string; title: string; status: ContentStatus; assigned_to: string | null; clients: { name: string } | null }

  const MEMBER_COLORS = [
    '#3b82f6', '#8b5cf6', '#f97316', '#ec4899', '#14b8a6',
    '#ef4444', '#6366f1', '#eab308', '#22c55e', '#06b6d4',
  ]
  const profileMap: Record<string, string> = {}
  const colorMap: Record<string, string> = {}
  teamList.forEach((m, i) => {
    profileMap[m.id] = m.full_name ?? 'Sin nombre'
    colorMap[m.id] = MEMBER_COLORS[i % MEMBER_COLORS.length]
  })

  const boardIdeas: BoardIdea[] = ((activeIdeas ?? []) as unknown as ActiveIdeaRow[]).map((i) => ({
    id: i.id,
    title: i.title,
    status: i.status,
    client_name: i.clients?.name ?? 'Cliente',
    editor_name: i.assigned_to ? profileMap[i.assigned_to] : null,
    editor_color: i.assigned_to ? colorMap[i.assigned_to] : null,
  }))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <header className="space-y-1">
          <h2 className="t-h1">Hub de Edición</h2>
          <p className="text-sm text-muted-foreground">
            {boardIdeas.length} video{boardIdeas.length !== 1 ? 's' : ''} en producción activa.
          </p>
        </header>
        <CreateDeliveryForm clients={clientList} team={teamList} ideas={ideaList} />
      </div>

      {/* Tablero de producción */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-caps">Tablero de producción</h3>
        <ProductionBoard ideas={boardIdeas} />
      </section>

      <CalendarNav year={year} month={month} view={view} week={week} />

      <div className="rounded-lg border border-border bg-card shadow-elev-1 overflow-hidden">
        {view === 'mes' ? (
          <MonthGrid year={year} month={month} deliveries={rows} />
        ) : (
          <WeekGrid year={year} week={week} deliveries={rows} />
        )}
      </div>
    </div>
  )
}
