'use client'

import { useRef, useState, useTransition } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createBabyIdea } from '@/app/(cliente)/kanban/actions'

export function BabyIdeaForm() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createBabyIdea(formData)
      if (!result.ok) {
        setError(result.error)
        return
      }
      formRef.current?.reset()
      setOpen(false)
      setGenerating(true)
      fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: result.ideaId }),
      }).finally(() => setGenerating(false))
    })
  }

  if (generating) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-kanban-baby-idea/40 bg-kanban-baby-idea-bg px-3 py-2.5 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 animate-pulse text-kanban-baby-idea" />
        Generando guion con IA…
      </div>
    )
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:text-foreground"
        onClick={() => {
          setOpen(true)
          setTimeout(() => textareaRef.current?.focus(), 0)
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        Agregar idea
      </Button>
    )
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-2 rounded-md border border-border bg-card p-3 shadow-elev-1"
    >
      <textarea
        ref={textareaRef}
        name="title"
        required
        maxLength={280}
        rows={3}
        placeholder="Describe tu Baby Idea…"
        className="w-full resize-none rounded-sm bg-transparent text-sm leading-snug outline-none placeholder:text-muted-foreground"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            setOpen(false)
            setError(null)
          }}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
