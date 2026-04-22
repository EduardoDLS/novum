import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import type { ContentIdea } from '@/types/novum'

export const dynamic = 'force-dynamic'

export default async function KanbanPage() {
  const { profile } = await requireRole(['cliente'])
  const supabase = createClient()

  const [{ data: ideas, error }, { data: deliveries }, { data: profilesData }] = await Promise.all([
    supabase
      .from('content_ideas')
      .select('id, client_id, title, status, assigned_to, script_id, publish_date, views_count, created_at, updated_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('deliveries')
      .select('content_idea_id, status, delivery_date, editor_id')
      .not('content_idea_id', 'is', null),
    supabase
      .from('profiles')
      .select('id, full_name')
      .in('role', ['admin', 'editor', 'guionista']),
  ])

  const ideaList = (ideas ?? []) as ContentIdea[]

  type DeliveryMap = Record<string, { status: string; delivery_date: string; editor_id: string | null }>
  type ProfileMap  = Record<string, string>

  const deliveryMap: DeliveryMap = {}
  for (const d of deliveries ?? []) {
    if (d.content_idea_id) deliveryMap[d.content_idea_id] = d
  }
  const profileMap: ProfileMap = {}
  for (const p of profilesData ?? []) {
    profileMap[p.id] = p.full_name ?? 'Sin nombre'
  }

  const enProceso  = ideaList.filter((i) => i.status !== 'publicado' && i.status !== 'baby_idea').length
  const publicados = ideaList.filter((i) => i.status === 'publicado').length
  const nombre     = profile.full_name?.split(' ')[0] ?? 'bienvenido'

  // Próxima entrega
  const today = new Date().toISOString().slice(0, 10)
  const proximaEntrega = Object.values(deliveryMap)
    .filter((d) => d.delivery_date >= today && d.status !== 'publicado')
    .sort((a, b) => a.delivery_date.localeCompare(b.delivery_date))[0]

  return (
    <div className="space-y-6">
      {/* Header con resumen */}
      <div className="rounded-xl border border-novum-dark-border overflow-hidden shadow-elev-2"
        style={{ background: 'linear-gradient(135deg, #151719 0%, #1B1E22 100%)' }}>
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <p className="text-xs text-novum-silver-strong uppercase tracking-widest mb-1">Producción</p>
            <h2 className="t-h1 text-novum-warm">Hola, {nombre}.</h2>
            {proximaEntrega ? (
              <p className="text-sm text-novum-silver mt-1">
                Próxima entrega:{' '}
                <span className="text-novum-gold font-medium">
                  {new Date(proximaEntrega.delivery_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
                </span>
              </p>
            ) : (
              <p className="text-sm text-novum-silver mt-1">Agrega tu primera idea en la columna Baby Idea.</p>
            )}
          </div>
          <div className="flex gap-4 text-center self-start sm:shrink-0">
            <div>
              <p className="text-2xl font-bold text-novum-warm">{enProceso}</p>
              <p className="t-label text-novum-silver-strong">En proceso</p>
            </div>
            <div className="w-px bg-novum-dark-border" />
            <div>
              <p className="text-2xl font-bold text-novum-gold">{publicados}</p>
              <p className="t-label text-novum-silver-strong">Publicados</p>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          No pudimos cargar tus ideas. {error.message}
        </div>
      ) : (
        <KanbanBoard ideas={ideaList} deliveryMap={deliveryMap} profileMap={profileMap} />
      )}
    </div>
  )
}
