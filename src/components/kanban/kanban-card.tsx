'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Trash2, FileText, User, Calendar, Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ContentIdea } from '@/types/novum'
import { deleteBabyIdea, updateBabyIdea } from '@/app/(cliente)/kanban/actions'

const DELIVERY_STATUS_COLOR: Record<string, string> = {
  pendiente:   'bg-muted text-muted-foreground',
  en_progreso: 'bg-kanban-edicion-bg text-kanban-edicion',
  entregado:   'bg-kanban-grabacion-bg text-kanban-grabacion',
  publicado:   'bg-kanban-publicado-bg text-kanban-publicado',
}

const DELIVERY_STATUS_LABEL: Record<string, string> = {
  pendiente:   'Pendiente',
  en_progreso: 'En progreso',
  entregado:   'Entregado',
  publicado:   'Publicado',
}

type DeliveryInfo = { status: string; delivery_date: string; editor_id: string | null }

type Props = {
  idea: ContentIdea
  canDelete: boolean
  delivery?: DeliveryInfo
  editorName?: string
}

export function KanbanCard({ idea, canDelete, delivery, editorName }: Props) {
  const [editing, setEditing] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const publishLabel = idea.publish_date
    ? new Date(idea.publish_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
    : null

  const deliveryLabel = delivery?.delivery_date
    ? new Date(delivery.delivery_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
    : null

  const showScript = idea.script_id && idea.status !== 'baby_idea'

  function handleEdit(fd: FormData) {
    setEditError(null)
    fd.append('ideaId', idea.id)
    startTransition(async () => {
      const res = await updateBabyIdea(fd)
      if (!res.ok) { setEditError(res.error ?? 'Error al guardar.'); return }
      setEditing(false)
    })
  }

  if (editing) {
    return (
      <article className="rounded-md border border-border bg-card p-3 shadow-elev-1 space-y-2">
        <form action={handleEdit} className="space-y-2">
          <textarea
            name="title"
            required
            autoFocus
            maxLength={280}
            rows={3}
            defaultValue={idea.title}
            className="w-full resize-none rounded-sm bg-transparent text-sm leading-snug outline-none placeholder:text-muted-foreground border border-border px-2 py-1.5 focus:border-ring"
          />
          {editError && <p className="text-xs text-destructive">{editError}</p>}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</Button>
            <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => { setEditing(false); setEditError(null) }}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      </article>
    )
  }

  return (
    <article className="group rounded-md border border-border bg-card p-3 shadow-elev-1 transition-colors hover:border-novum-silver-strong space-y-2">
      <p className="text-sm leading-snug text-foreground">{idea.title}</p>

      {(editorName || deliveryLabel) && (
        <div className="flex flex-wrap gap-2">
          {editorName && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {editorName}
            </span>
          )}
          {deliveryLabel && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {deliveryLabel}
            </span>
          )}
        </div>
      )}

      {delivery && (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${DELIVERY_STATUS_COLOR[delivery.status]}`}>
          {DELIVERY_STATUS_LABEL[delivery.status]}
        </span>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        {publishLabel ? (
          <Badge variant="muted" className="uppercase tracking-caps text-[10px]">
            {publishLabel}
          </Badge>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1">
          {showScript && (
            <Link
              href={`/guion/${idea.script_id}`}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors sm:opacity-0 sm:group-hover:opacity-100"
            >
              <FileText className="h-3 w-3" />
              Guion
            </Link>
          )}
          {canDelete && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground transition-opacity sm:opacity-0 sm:group-hover:opacity-100 hover:text-foreground"
                disabled={pending}
                onClick={() => setEditing(true)}
                aria-label="Editar idea"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground transition-opacity sm:opacity-0 sm:group-hover:opacity-100 hover:text-destructive"
                disabled={pending}
                onClick={() => startTransition(async () => { await deleteBabyIdea(idea.id) })}
                aria-label="Eliminar idea"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
