'use client'

import { useState, useTransition } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createDelivery } from './actions'

type Client    = { id: string; name: string }
type TeamMember = { id: string; full_name: string | null; role: string }
type Idea      = { id: string; title: string; client_id: string; status: string }

type Props = {
  clients: Client[]
  team: TeamMember[]
  ideas: Idea[]
}

export function CreateDeliveryForm({ clients, team, ideas }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const clientIdeas = ideas.filter(
    (i) => i.client_id === selectedClient && i.status !== 'publicado',
  )

  function handleSubmit(fd: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await createDelivery(fd)
      if (!res.ok) { setError(res.error); return }
      setOpen(false)
      setSelectedClient('')
    })
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nueva entrega
      </Button>
    )
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-lg border border-border bg-card p-5 shadow-elev-2 space-y-4 w-full max-w-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Nueva entrega</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Cliente */}
      <div className="space-y-1">
        <label className="t-label text-muted-foreground">Cliente</label>
        <select
          name="client_id"
          required
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
        >
          <option value="">Selecciona un cliente…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Idea vinculada */}
      <div className="space-y-1">
        <label className="t-label text-muted-foreground">Video / idea</label>
        <select
          name="content_idea_id"
          disabled={!selectedClient}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring disabled:opacity-50"
        >
          <option value="">{selectedClient ? 'Sin vincular (opcional)' : 'Primero selecciona un cliente'}</option>
          {clientIdeas.map((i) => (
            <option key={i.id} value={i.id}>
              {i.title} · {i.status.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Editor asignado */}
      <div className="space-y-1">
        <label className="t-label text-muted-foreground">Editor asignado</label>
        <select
          name="editor_id"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
        >
          <option value="">Sin asignar</option>
          {team.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name ?? 'Sin nombre'} · {m.role}
            </option>
          ))}
        </select>
      </div>

      {/* Fecha */}
      <div className="space-y-1">
        <label className="t-label text-muted-foreground">Fecha de entrega</label>
        <input
          type="date"
          name="delivery_date"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
        />
      </div>

      {/* Notas */}
      <div className="space-y-1">
        <label className="t-label text-muted-foreground">Notas (opcional)</label>
        <input
          type="text"
          name="notes"
          maxLength={200}
          placeholder="Descripción, formato, referencias…"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => { setOpen(false); setSelectedClient('') }}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
