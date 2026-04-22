'use client'

import { useTransition, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { approveScript, rejectScript } from './actions'

export function ApproveButton({ scriptId }: { scriptId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await approveScript(scriptId)
        })
      }
    >
      <Check className="h-3.5 w-3.5" />
      {pending ? 'Aprobando…' : 'Aprobar'}
    </Button>
  )
}

export function RejectForm({ scriptId }: { scriptId: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <X className="h-3.5 w-3.5" />
        Rechazar
      </Button>
    )
  }

  return (
    <form
      action={(fd) => {
        setError(null)
        fd.append('scriptId', scriptId)
        startTransition(async () => {
          const res = await rejectScript(fd)
          if (!res.ok) {
            setError(res.error)
            return
          }
          setOpen(false)
        })
      }}
      className="space-y-2"
    >
      <textarea
        name="note"
        required
        rows={2}
        placeholder="Motivo del rechazo…"
        className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
        autoFocus
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="destructive" disabled={pending}>
          {pending ? 'Guardando…' : 'Confirmar rechazo'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
