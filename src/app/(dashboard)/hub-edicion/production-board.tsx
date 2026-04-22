'use client'

import { useTransition } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CONTENT_STATUS_ORDER, CONTENT_STATUS_LABEL, type ContentStatus } from '@/types/novum'
import { moveIdeaStatus } from './actions'

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
}

function IdeaCard({ idea }: { idea: BoardIdea }) {
  const [pending, startTransition] = useTransition()
  const allStatuses = CONTENT_STATUS_ORDER
  const idx = allStatuses.indexOf(idea.status)
  const prevStatus = idx > 1 ? allStatuses[idx - 1] : null
  const nextStatus = idx < allStatuses.length - 1 ? allStatuses[idx + 1] : null

  function move(status: ContentStatus) {
    startTransition(async () => { await moveIdeaStatus(idea.id, status) })
  }

  return (
    <div className={`rounded-md p-3 space-y-1.5 transition-opacity ${pending ? 'opacity-40' : ''} ${CARD_BG[idea.status] ?? 'bg-card'}`}>
      <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">{idea.title}</p>
      <p className="text-xs text-muted-foreground">{idea.client_name}</p>
      {idea.editor_name && (
        <p className="text-xs text-muted-foreground">Editor: {idea.editor_name}</p>
      )}
      <div className="flex items-center gap-1 pt-1">
        {prevStatus && prevStatus !== 'baby_idea' && (
          <button
            onClick={() => move(prevStatus)}
            disabled={pending}
            className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="h-3 w-3" />
            {CONTENT_STATUS_LABEL[prevStatus]}
          </button>
        )}
        <span className="flex-1" />
        {nextStatus && (
          <button
            onClick={() => move(nextStatus)}
            disabled={pending}
            className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            {CONTENT_STATUS_LABEL[nextStatus]}
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}

export function ProductionBoard({ ideas }: { ideas: BoardIdea[] }) {
  const byStatus = BOARD_STATUSES.map((status) => ({
    status,
    ideas: ideas.filter((i) => i.status === status),
  }))

  const totalActive = ideas.length

  if (totalActive === 0) {
    return (
      <p className="text-sm text-muted-foreground">Sin videos en producción activa.</p>
    )
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
