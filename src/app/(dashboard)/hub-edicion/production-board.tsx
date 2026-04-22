'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { CONTENT_STATUS_ORDER, CONTENT_STATUS_LABEL, type ContentStatus } from '@/types/novum'
import { moveIdeaStatus, deleteIdeaFromHub } from './actions'

const BOARD_STATUSES: ContentStatus[] = ['guionizar', 'grabacion', 'edicion', 'revision']

const DOT: Record<string, string> = {
  guionizar: 'bg-kanban-guionizar',
  grabacion: 'bg-kanban-grabacion',
  edicion:   'bg-kanban-edicion',
  revision:  'bg-kanban-revision',
}

const CARD_BG: Record<string, string> = {
  guionizar: 'bg-kanban-guionizar-bg border-l-2 border-kanban-guionizar',
  grabacion: 'bg-kanban-grabacion-bg border-l-2 border-kanban-grabacion',
  edicion:   'bg-kanban-edicion-bg border-l-2 border-kanban-edicion',
  revision:  'bg-kanban-revision-bg border-l-2 border-kanban-revision',
}

export type BoardIdea = {
  id: string
  title: string
  client_name: string
  status: ContentStatus
  editor_name?: string | null
  editor_color?: string | null
}

function IdeaCard({ idea }: { idea: BoardIdea }) {
  const [pending, startTransition] = useTransition()

  function handleMove(status: ContentStatus) {
    startTransition(async () => { await moveIdeaStatus(idea.id, status) })
  }

  function handleDelete() {
    if (!confirm('¿Eliminar este video? Esta acción no se puede deshacer.')) return
    startTransition(async () => { await deleteIdeaFromHub(idea.id) })
  }

  return (
    <div className={`rounded-md p-3 space-y-2 transition-opacity ${pending ? 'opacity-40' : ''} ${CARD_BG[idea.status] ?? 'bg-card'}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 flex-1">{idea.title}</p>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40 shrink-0 mt-0.5"
          title="Eliminar video"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground">{idea.client_name}</p>

      <div className="flex items-center gap-2 pt-0.5">
        {idea.editor_name && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: idea.editor_color ?? '#6b7280' }}
            />
            <span className="truncate">{idea.editor_name}</span>
          </span>
        )}
        <select
          value={idea.status}
          disabled={pending}
          onChange={(e) => handleMove(e.target.value as ContentStatus)}
          className="ml-auto text-[11px] rounded border border-border bg-background px-1.5 py-0.5 text-muted-foreground focus:outline-none focus:border-ring cursor-pointer disabled:opacity-40"
        >
          {CONTENT_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>{CONTENT_STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function ProductionBoard({ ideas }: { ideas: BoardIdea[] }) {
  const byStatus = BOARD_STATUSES.map((status) => ({
    status,
    ideas: ideas.filter((i) => i.status === status),
  }))

  if (ideas.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin videos en producción activa.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {byStatus.map(({ status, ideas: col }) => (
        <div key={status} className="space-y-2">
          <div className="flex items-center gap-2 py-1">
            <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[status]}`} />
            <span className="t-label text-muted-foreground">{CONTENT_STATUS_LABEL[status]}</span>
            <span className="ml-auto text-xs text-muted-foreground">{col.length}</span>
          </div>
          <div className="space-y-2 min-h-[48px]">
            {col.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}
            {col.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">Sin items</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
