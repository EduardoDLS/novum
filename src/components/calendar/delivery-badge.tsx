'use client'

import { useState, useTransition } from 'react'
import { X, Trash2 } from 'lucide-react'
import {
  DELIVERY_STATUS_COLOR,
  DELIVERY_STATUS_LABEL,
  CONTENT_STATUS_ORDER,
  CONTENT_STATUS_LABEL,
  type DeliveryStatus,
  type ContentStatus,
} from '@/types/novum'
import { updateDeliveryFull, deleteDelivery } from '@/app/(dashboard)/hub-edicion/actions'

type DeliveryWithClient = {
  id: string
  status: DeliveryStatus
  notes: string | null
  content_idea_id: string | null
  clients: { name: string } | null
  content_ideas: { id: string; title: string; status: ContentStatus } | null
  profiles?: { full_name: string | null } | null
}

export function DeliveryBadge({ delivery }: { delivery: DeliveryWithClient }) {
  const [open, setOpen] = useState(false)
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(delivery.status)
  const [ideaStatus, setIdeaStatus] = useState<ContentStatus | ''>(
    delivery.content_ideas?.status ?? '',
  )
  const [pending, startTransition] = useTransition()

  const colorClass = DELIVERY_STATUS_COLOR[delivery.status]
  const title = delivery.content_ideas?.title ?? delivery.notes ?? 'Entrega'
  const clientName = delivery.clients?.name ?? ''
  const editorName = delivery.profiles?.full_name

  function handleSave() {
    startTransition(async () => {
      await updateDeliveryFull(
        delivery.id,
        deliveryStatus,
        delivery.content_ideas?.id ?? null,
        (ideaStatus as ContentStatus) || null,
      )
      setOpen(false)
    })
  }

  function handleDelete() {
    if (!confirm('¿Eliminar esta entrega?')) return
    startTransition(async () => { await deleteDelivery(delivery.id) })
  }

  return (
    <div className={`rounded text-[11px] leading-tight transition-opacity ${pending ? 'opacity-40' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full rounded px-2 py-1 text-left ${colorClass} ${open ? 'rounded-b-none' : ''}`}
      >
        <span className="block truncate font-medium">{clientName}</span>
        <span className="block truncate opacity-90">{title}</span>
        {editorName && (
          <span className="block truncate text-[10px] opacity-70">{editorName}</span>
        )}
        <span className="block truncate text-[10px] opacity-80 mt-0.5">
          {DELIVERY_STATUS_LABEL[delivery.status]}
        </span>
      </button>

      {open && (
        <div className="rounded-b border border-t-0 border-border bg-card p-2 space-y-2 shadow-elev-1">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Entrega</p>
            <select
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
              disabled={pending}
              className="w-full rounded border border-border bg-background px-2 py-1 text-[11px] focus:outline-none focus:border-ring"
            >
              {(['pendiente', 'en_progreso', 'entregado', 'publicado'] as DeliveryStatus[]).map((s) => (
                <option key={s} value={s}>{DELIVERY_STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>

          {delivery.content_ideas && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Video</p>
              <select
                value={ideaStatus}
                onChange={(e) => setIdeaStatus(e.target.value as ContentStatus)}
                disabled={pending}
                className="w-full rounded border border-border bg-background px-2 py-1 text-[11px] focus:outline-none focus:border-ring"
              >
                {CONTENT_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{CONTENT_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              disabled={pending}
              className="flex-1 rounded bg-foreground px-2 py-1 text-[11px] font-medium text-background hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {pending ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              onClick={handleDelete}
              disabled={pending}
              title="Eliminar entrega"
              className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
