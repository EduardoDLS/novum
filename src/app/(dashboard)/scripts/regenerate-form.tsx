'use client'

import { useState } from 'react'
import { RefreshCw, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RegenerateForm({ scriptId }: { scriptId: string }) {
  const [open, setOpen]   = useState(false)
  const [notes, setNotes] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleRegenerate() {
    setState('loading')
    try {
      const res = await fetch('/api/regenerate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId, notes: notes.trim() || undefined }),
      })
      if (res.ok) {
        setState('done')
        setTimeout(() => window.location.reload(), 1000)
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        Regenerar con IA
      </button>

      {open && (
        <div className="space-y-2 rounded-lg border border-dashed border-border bg-muted/20 p-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas opcionales para la IA (ej: más directo, cambiar el hook, enfocarse en el miedo al fracaso…)"
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
          {state === 'error' && (
            <p className="text-xs text-destructive">Error al regenerar. Intenta de nuevo.</p>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRegenerate}
            disabled={state === 'loading' || state === 'done'}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${state === 'loading' ? 'animate-spin' : ''}`} />
            {state === 'idle' && 'Regenerar guion'}
            {state === 'loading' && 'Regenerando…'}
            {state === 'done' && 'Listo, recargando…'}
            {state === 'error' && 'Reintentar'}
          </Button>
        </div>
      )}
    </div>
  )
}
