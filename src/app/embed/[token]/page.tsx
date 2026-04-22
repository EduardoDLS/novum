import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ContentStatus } from '@/types/novum'
import { CONTENT_STATUS_LABEL, CONTENT_STATUS_ORDER } from '@/types/novum'

export const dynamic = 'force-dynamic'

type IdeaRow = {
  id: string
  title: string
  status: ContentStatus
  publish_date: string | null
}

export default async function EmbedPage({ params }: { params: { token: string } }) {
  const supabase = createClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, embed_token')
    .eq('embed_token', params.token)
    .single()

  if (!client) notFound()

  const { data: ideas } = await supabase
    .from('content_ideas')
    .select('id, title, status, publish_date')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  const rows = (ideas ?? []) as IdeaRow[]

  const columns = CONTENT_STATUS_ORDER.map((status) => ({
    status,
    label: CONTENT_STATUS_LABEL[status],
    ideas: rows.filter((i) => i.status === status),
  }))

  const STATUS_COLOR: Record<ContentStatus, string> = {
    baby_idea: 'border-l-kanban-baby-idea',
    guionizar: 'border-l-kanban-guionizar',
    grabacion: 'border-l-kanban-grabacion',
    edicion:   'border-l-kanban-edicion',
    revision:  'border-l-kanban-revision',
    publicado: 'border-l-kanban-publicado',
  }

  return (
    <div className="min-h-screen bg-background p-6 font-sans">
      <header className="mb-6 space-y-1">
        <h1 className="text-xl font-semibold text-foreground">{client.name}</h1>
        <p className="text-sm text-muted-foreground">Estado de producción de contenido</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {columns.map((col) => (
          <div key={col.status} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-caps">
                {col.label}
              </span>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {col.ideas.length}
              </span>
            </div>
            <div className="space-y-2">
              {col.ideas.map((idea) => (
                <div
                  key={idea.id}
                  className={`rounded-md border border-border border-l-2 ${STATUS_COLOR[idea.status]} bg-card p-3 shadow-elev-1`}
                >
                  <p className="text-sm text-foreground leading-snug">{idea.title}</p>
                  {idea.publish_date && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(idea.publish_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
              ))}
              {col.ideas.length === 0 && (
                <div className="rounded-md border border-dashed border-border p-3">
                  <p className="text-xs text-muted-foreground text-center">—</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">Powered by Novum</p>
      </footer>
    </div>
  )
}
