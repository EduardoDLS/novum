'use client'

import { useState, useTransition } from 'react'
import { MessageSquare, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { submitScriptFeedback } from '../actions'

export function FeedbackForm({ scriptId, existing }: { scriptId: string; existing: string | null }) {
  const [open, setOpen]   = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(fd: FormData) {
    setError(null)
    fd.append('scriptId', scriptId)
    startTransition(async () => {
      const res = await submitScriptFeedback(fd)
      if (!res.ok) { setError(res.error); return }
      setSaved(true)
      setOpen(false)
    })
  }

  if (saved || existing) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Tus notas para el equipo</p>
        {saved ? (
          <p className="flex items-center gap-1 text-sm text-kanban-grabacion">
            <Check className="h-3.5 w-3.5" /> Notas enviadas al equipo.
          </p>
        ) : (
          <p className="text-sm text-foreground">{existing}</p>
        )}
        {!saved && (
          <button
            onClick={() => { setOpen(true); setSaved(false) }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Editar notas
          </button>
        )}
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageSquare className="h-4 w-4" />
        Dejar notas para el equipo
      </button>
    )
  }

  return (
    <form action={handleSubmit} className="rounded-lg border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-medium text-foreground">Notas para el equipo</p>
      <p className="text-xs text-muted-foreground">
        Si quieres que cambien algo del guion, escríbelo aquí. El equipo lo verá antes de regenerar.
      </p>
      <textarea
        name="notes"
        required
        rows={3}
        defaultValue={existing ?? ''}
        placeholder="Ej: el gancho está bien pero el cierre necesita más energía…"
        className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Enviando…' : 'Enviar notas'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
