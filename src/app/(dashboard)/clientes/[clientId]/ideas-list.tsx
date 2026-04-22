'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Check, X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CONTENT_STATUS_ORDER, CONTENT_STATUS_LABEL, type ContentStatus } from '@/types/novum'
import {
  updateIdeaStats,
  createIdeaForClient,
  updateIdeaForTeam,
  deleteIdeaForTeam,
  moveIdeaStatusFromProfile,
} from '../actions'

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
  revision:   'bg-kanban-revision-bg text-kanban-revision',
  publicado:  'bg-kanban-publicado-bg text-kanban-publicado',
}

const MOVABLE = CONTENT_STATUS_ORDER

// ─── Crear nueva idea ────────────────────────────────────────────────────────
function CreateIdeaForm({ clientId, onDone }: { clientId: string; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(fd: FormData) {
    setError(null)
    fd.append('clientId', clientId)
    startTransition(async () => {
      const res = await createIdeaForClient(fd)
      if (!res.ok) { setError(res.error); return }
      onDone()
    })
  }

  return (
    <form action={handleSubmit} className="rounded-md border border-border bg-card p-3 space-y-3">
      <input
        name="title"
        required
        autoFocus
        maxLength={280}
        placeholder="Título del video…"
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
      />
      <div className="flex items-center gap-2">
        <select
          name="status"
          defaultValue="baby_idea"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-ring"
        >
          {MOVABLE.map((s) => (
            <option key={s} value={s}>{CONTENT_STATUS_LABEL[s]}</option>
          ))}
        </select>
        <Button type="submit" size="sm" disabled={pending}>{pending ? 'Creando…' : 'Crear'}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}><X className="h-3.5 w-3.5" /></Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  )
}

// ─── Tarjeta de idea ─────────────────────────────────────────────────────────
function IdeaItem({ idea }: { idea: IdeaRow }) {
  const [mode, setMode] = useState<'view' | 'edit-meta' | 'edit-stats'>('view')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const idx = MOVABLE.indexOf(idea.status)
  const prevStatus = idx > 0 ? MOVABLE[idx - 1] : null
  const nextStatus = idx < MOVABLE.length - 1 ? MOVABLE[idx + 1] : null

  function move(status: ContentStatus) {
    startTransition(async () => { await moveIdeaStatusFromProfile(idea.id, status) })
  }

  function handleEditMeta(fd: FormData) {
    setError(null)
    fd.append('ideaId', idea.id)
    startTransition(async () => {
      const res = await updateIdeaForTeam(fd)
      if (!res.ok) { setError(res.error); return }
      setMode('view')
    })
  }

  function handleEditStats(fd: FormData) {
    setError(null)
    fd.append('ideaId', idea.id)
    startTransition(async () => {
      const res = await updateIdeaStats(fd)
      if (!res.ok) { setError(res.error); return }
      setMode('view')
    })
  }

  function handleDelete() {
    if (!confirm('¿Eliminar este video? Esta acción no se puede deshacer.')) return
    startTransition(async () => { await deleteIdeaForTeam(idea.id) })
  }

  return (
    <div className={`rounded-md border border-border bg-card overflow-hidden transition-opacity ${pending ? 'opacity-50' : ''}`}>
      {/* Fila principal */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Mover atrás */}
        {prevStatus ? (
          <button onClick={() => move(prevStatus)} disabled={pending} title={`Mover a ${CONTENT_STATUS_LABEL[prevStatus]}`}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 shrink-0">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        ) : <span className="w-3.5 shrink-0" />}

        <span className="flex-1 truncate text-sm text-foreground">{idea.title}</span>

        <div className="flex items-center gap-1.5 shrink-0">
          {idea.views_count != null && mode === 'view' && (
            <span className="text-xs text-muted-foreground">{idea.views_count.toLocaleString('es-MX')} views</span>
          )}
          {idea.video_url && mode === 'view' && (
            <a href={idea.video_url} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR[idea.status]}`}>
            {CONTENT_STATUS_LABEL[idea.status]}
          </span>
          {mode === 'view' && (
            <>
              <button onClick={() => setMode('edit-meta')} title="Editar"
                className="text-muted-foreground hover:text-foreground transition-colors">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {idea.status === 'publicado' && (
                <button onClick={() => setMode('edit-stats')} title="Editar views/URL"
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={handleDelete} disabled={pending} title="Eliminar"
                className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mover adelante */}
        {nextStatus ? (
          <button onClick={() => move(nextStatus)} disabled={pending} title={`Mover a ${CONTENT_STATUS_LABEL[nextStatus]}`}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 shrink-0">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : <span className="w-3.5 shrink-0" />}
      </div>

      {/* Editar título y estado */}
      {mode === 'edit-meta' && (
        <form action={handleEditMeta} className="border-t border-border px-3 py-3 space-y-2 bg-muted/30">
          <input
            name="title"
            defaultValue={idea.title}
            required
            maxLength={280}
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-ring"
          />
          <div className="flex items-center gap-2">
            <select name="status" defaultValue={idea.status}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-ring">
              {MOVABLE.map((s) => (
                <option key={s} value={s}>{CONTENT_STATUS_LABEL[s]}</option>
              ))}
            </select>
            <Button type="submit" size="sm" disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setMode('view')}><X className="h-3.5 w-3.5" /></Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </form>
      )}

      {/* Editar views / URL */}
      {mode === 'edit-stats' && (
        <form action={handleEditStats} className="border-t border-border px-3 py-3 space-y-2 bg-muted/30">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="t-label text-muted-foreground">Views</label>
              <input name="views_count" type="number" min="0" defaultValue={idea.views_count ?? ''}
                placeholder="45000"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-ring" />
            </div>
            <div className="space-y-1">
              <label className="t-label text-muted-foreground">URL del video</label>
              <input name="video_url" type="url" defaultValue={idea.video_url ?? ''}
                placeholder="https://instagram.com/p/…"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-ring" />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setMode('view')}><X className="h-3.5 w-3.5" /></Button>
          </div>
        </form>
      )}
    </div>
  )
}

// ─── Lista principal ─────────────────────────────────────────────────────────
export function IdeasList({ clientId, ideas }: { clientId: string; ideas: IdeaRow[] }) {
  const [creating, setCreating] = useState(false)

  const enProceso = ideas.filter((i) => i.status !== 'publicado')
  const publicadas = ideas.filter((i) => i.status === 'publicado')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Videos ({ideas.length})</h3>
        {!creating && (
          <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
            <Plus className="h-3.5 w-3.5" />
            Nuevo video
          </Button>
        )}
      </div>

      {creating && <CreateIdeaForm clientId={clientId} onDone={() => setCreating(false)} />}

      {enProceso.length > 0 && (
        <div className="space-y-1.5">
          <p className="t-label text-muted-foreground">En producción ({enProceso.length})</p>
          {enProceso.map((i) => <IdeaItem key={i.id} idea={i} />)}
        </div>
      )}

      {publicadas.length > 0 && (
        <div className="space-y-1.5">
          <p className="t-label text-muted-foreground">Publicados ({publicadas.length})</p>
          {publicadas.map((i) => <IdeaItem key={i.id} idea={i} />)}
        </div>
      )}

      {ideas.length === 0 && !creating && (
        <p className="text-sm text-muted-foreground">Sin videos. Crea el primero con el botón de arriba.</p>
      )}
    </div>
  )
}
