import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { FileText, Video, Calendar, Users, ArrowRight, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function InicioPage() {
  const { profile } = await requireRole(['admin', 'editor', 'guionista'])
  const supabase = createClient()

  const today = new Date().toISOString().slice(0, 10)

  const [
    { data: scriptsPendientes },
    { data: entregasHoy },
    { data: ideasActivas },
    { data: clientes },
    { data: entregasProximas },
  ] = await Promise.all([
    supabase.from('scripts').select('id', { count: 'exact' }).eq('status', 'borrador'),
    supabase
      .from('deliveries')
      .select('id, status, notes, clients(name), content_ideas(title)')
      .eq('delivery_date', today),
    supabase
      .from('content_ideas')
      .select('id', { count: 'exact' })
      .not('status', 'in', '("publicado","baby_idea")'),
    supabase.from('clients').select('id', { count: 'exact' }),
    supabase
      .from('deliveries')
      .select('id, delivery_date, status, clients(name), content_ideas(title), profiles(full_name)')
      .gte('delivery_date', today)
      .order('delivery_date')
      .limit(5),
  ])

  const pendientesCount = scriptsPendientes?.length ?? 0
  const activasCount = ideasActivas?.length ?? 0
  const clientesCount = clientes?.length ?? 0

  type EntregaRow = {
    id: string
    delivery_date: string
    status: string
    clients: { name: string } | null
    content_ideas: { title: string } | null
    profiles: { full_name: string | null } | null
  }

  const proximas = (entregasProximas ?? []) as unknown as EntregaRow[]
  const hoy = (entregasHoy ?? []) as unknown as EntregaRow[]

  const STATUS_COLOR: Record<string, string> = {
    pendiente:   'bg-muted text-muted-foreground',
    en_progreso: 'bg-kanban-edicion-bg text-kanban-edicion',
    entregado:   'bg-kanban-grabacion-bg text-kanban-grabacion',
    publicado:   'bg-kanban-publicado-bg text-kanban-publicado',
  }
  const STATUS_LABEL: Record<string, string> = {
    pendiente: 'Pendiente', en_progreso: 'En progreso', entregado: 'Entregado', publicado: 'Publicado',
  }

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const nombre = profile.full_name?.split(' ')[0] ?? 'equipo'

  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <h2 className="t-h1">{saludo}, {nombre}.</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </header>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link href="/scripts" className="group rounded-lg border border-border bg-card p-5 shadow-elev-1 hover:border-novum-silver-strong transition-colors">
          <FileText className="h-5 w-5 text-muted-foreground mb-3" />
          <p className="t-metric text-3xl">{pendientesCount}</p>
          <p className="t-label mt-1 text-muted-foreground">Guiones pendientes</p>
          {pendientesCount > 0 && (
            <p className="text-xs text-kanban-edicion mt-2 flex items-center gap-1">
              Revisar <ArrowRight className="h-3 w-3" />
            </p>
          )}
        </Link>
        <div className="rounded-lg border border-border bg-card p-5 shadow-elev-1">
          <Calendar className="h-5 w-5 text-muted-foreground mb-3" />
          <p className="t-metric text-3xl">{hoy.length}</p>
          <p className="t-label mt-1 text-muted-foreground">Entregas hoy</p>
        </div>
        <Link href="/clientes" className="group rounded-lg border border-border bg-card p-5 shadow-elev-1 hover:border-novum-silver-strong transition-colors">
          <Users className="h-5 w-5 text-muted-foreground mb-3" />
          <p className="t-metric text-3xl">{clientesCount}</p>
          <p className="t-label mt-1 text-muted-foreground">Clientes activos</p>
        </Link>
        <div className="rounded-lg border border-border bg-card p-5 shadow-elev-1">
          <Video className="h-5 w-5 text-muted-foreground mb-3" />
          <p className="t-metric text-3xl">{activasCount}</p>
          <p className="t-label mt-1 text-muted-foreground">Ideas en producción</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Entregas de hoy */}
        <section className="rounded-lg border border-border bg-card p-5 shadow-elev-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Entregas de hoy</h3>
            <Link href="/hub-edicion" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              Ver calendario <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {hoy.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin entregas programadas para hoy.</p>
          ) : (
            <div className="space-y-2">
              {hoy.map((e) => (
                <div key={e.id} className="flex items-center gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{e.content_ideas?.title ?? e.clients?.name ?? 'Entrega'}</p>
                    <p className="text-xs text-muted-foreground">{e.clients?.name}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR[e.status]}`}>
                    {STATUS_LABEL[e.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Próximas entregas */}
        <section className="rounded-lg border border-border bg-card p-5 shadow-elev-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Próximas entregas</h3>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          {proximas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin entregas próximas registradas.</p>
          ) : (
            <div className="space-y-2">
              {proximas.map((e) => {
                const date = new Date(e.delivery_date + 'T12:00:00')
                const isToday = e.delivery_date === today
                return (
                  <div key={e.id} className="flex items-center gap-3 text-sm">
                    <div className={`shrink-0 w-12 text-center rounded p-1 ${isToday ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                      <p className="text-[10px] uppercase font-medium">
                        {date.toLocaleDateString('es-MX', { month: 'short' })}
                      </p>
                      <p className="text-base font-bold leading-none">
                        {date.toLocaleDateString('es-MX', { day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{e.content_ideas?.title ?? 'Entrega'}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.clients?.name}
                        {e.profiles?.full_name && ` · ${e.profiles.full_name}`}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR[e.status]}`}>
                      {STATUS_LABEL[e.status]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* Accesos rápidos */}
      <section className="space-y-3">
        <h3 className="font-medium text-muted-foreground text-sm uppercase tracking-caps">Accesos rápidos</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: '/scripts', label: 'Revisar guiones', icon: FileText },
            { href: '/hub-edicion', label: 'Hub de Edición', icon: Calendar },
            { href: '/clientes', label: 'Clientes', icon: Users },
            { href: '/recursos', label: 'Recursos', icon: Video },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm hover:border-novum-silver-strong transition-colors"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
