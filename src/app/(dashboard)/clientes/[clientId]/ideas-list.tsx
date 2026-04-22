'use client'

import { useState, useTransition } from 'react'
import { ExternalLink, Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateIdeaStats } from '../actions'
import type { ContentStatus } from '@/types/novum'

type IdeaRow = {
  id: string
  title: string
  status: ContentStatus
  views_count: number | null
  video_url: string | null
  publish_date: string | null
}

const STATUS_COLOR: Record<ContentStatus, string> = {
  baby_idea: 'bg-kanban-baby-idea-bg text-kanban-baby-idea',
  guionizar:  'bg-kanban-guionizar-bg text-kanban-guionizar',
  grabacion:  'bg-kanban-grabacion-bg text-kanban-grabacion',
  edicion:    'bg-kanban-edicion-bg text-kanban-edicion',
  publicado:  'bg-kanban-publicado-bg text-kanban-publicado',
}

function IdeaItem({ idea }: { idea: IdeaRow }) {
  const [editing, setEditing] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [saved, setSaved]     = useState(false)
  const [pending, startTransition] = useTransition()

  const isPublicado = idea.status === 'publicado'

  function handleSave(fd: FormData) {
    setError(null)
    fd.append('ideaId', idea.id)
    startTransition(async () => {
      const res = await updateIdeaStats(fd)
      if (!res.ok) { setError(res.error); return }
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <div className="rounded-md border border-border bg-card shadow-elev-1 overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className="flex-1 truncate text-sm text-foreground">{idea.title}</span>
        <div className="flex items-center gap-2 shrink-0">
          {saved && <span className="text-xs text-kanban-grabacion flex items-center gap-1"><Check className="h-3 w-3" /> Guardado</span>}
          {idea.views_count != null && !editing && (
            <span className="text-xs font-medium text-muted-foreground">{idea.views_count.toLocaleString('es-MX')} views</span>
          )}
          {idea.video_url && !editing && (
            <a href={idea.video_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR[idea.status]}`}>
            {idea.status.replace('_', ' ')}
          </span>
          {isPublicado && !editing && (
            <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {editing && (
        <form action={handleSave} className="border-t border-border px-3 py-3 space-y-2 bg-muted/30">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="t-label text-muted-foreground">Views</label>
              <input
                name="views_count"
                type="number"
                min="0"
                defaultValue={idea.views_count ?? ''}
                placeholder="Ej: 45000"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="t-label text-muted-foreground">URL del video</label>
              <input
                name="video_url"
                type="url"
                defaultValue={idea.video_url ?? ''}
                placeholder="https://instagram.com/p/..."
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-ring"
              />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export function IdeasList({ ideas }: { ideas: IdeaRow[] }) {
  const publicadas  = ideas.filter((i) => i.status === 'publicado')
  const enProceso   = ideas.filter((i) => i.status !== 'publicado')

  return (
    <div className="space-y-4">
      {enProceso.length > 0 && (
        <div className="space-y-2">
          <h4 className="t-label text-muted-foreground">En producción ({enProceso.length})</h4>
          <div className="space-y-1">
            {enProceso.map((i) => <IdeaItem key={i.id} idea={i} />)}
          </div>
        </div>
      )}
      {publicadas.length > 0 && (
        <div className="space-y-2">
          <h4 className="t-label text-muted-foreground">Publicados ({publicadas.length}) — edita views y URL haciendo clic en <Pencil className="inline h-3 w-3" /></h4>
          <div className="space-y-1">
            {publicadas.map((i) => <IdeaItem key={i.id} idea={i} />)}
          </div>
        </div>
      )}
      {ideas.length === 0 && (
        <p className="text-sm text-muted-foreground">Sin ideas registradas.</p>
      )}
    </div>
  )
}
