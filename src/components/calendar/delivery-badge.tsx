'use client'

import { useTransition } from 'react'
import { DELIVERY_STATUS_COLOR, DELIVERY_STATUS_LABEL, type DeliveryStatus } from '@/types/novum'
import { updateDeliveryStatus } from '@/app/(dashboard)/hub-edicion/actions'

type DeliveryWithClient = {
  id: string
  status: DeliveryStatus
  notes: string | null
  clients: { name: string } | null
  content_ideas: { title: string } | null
  profiles?: { full_name: string | null } | null
}

export function DeliveryBadge({ delivery }: { delivery: DeliveryWithClient }) {
  const [pending, startTransition] = useTransition()

  const NEXT_STATUS: Record<DeliveryStatus, DeliveryStatus> = {
    pendiente: 'en_progreso',
    en_progreso: 'entregado',
    entregado: 'publicado',
    publicado: 'publicado',
  }

  function advance() {
    const next = NEXT_STATUS[delivery.status]
    if (next === delivery.status) return
    startTransition(async () => {
      await updateDeliveryStatus(delivery.id, next)
    })
  }

  const colorClass = DELIVERY_STATUS_COLOR[delivery.status]
  const label = DELIVERY_STATUS_LABEL[delivery.status]
  const title = delivery.content_ideas?.title ?? delivery.notes ?? 'Entrega'
  const clientName = delivery.clients?.name ?? ''
  const editorName = delivery.profiles?.full_name

  return (
    <button
      onClick={advance}
      disabled={pending || delivery.status === 'publicado'}
      title={`${clientName} — ${title}\nClic para avanzar estado`}
      className={`w-full rounded px-2 py-1 text-left text-[11px] leading-tight transition-opacity disabled:cursor-default disabled:opacity-70 ${colorClass}`}
    >
      <span className="block truncate font-medium">{clientName}</span>
      <span className="block truncate opacity-90">{title}</span>
      {editorName && (
        <span className="block truncate text-[10px] opacity-70">{editorName}</span>
      )}
      <span className="block truncate text-[10px] opacity-80 mt-0.5">{label}</span>
    </button>
  )
}
