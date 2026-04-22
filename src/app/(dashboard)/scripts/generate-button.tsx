'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function GenerateScriptButton({ ideaId, label = 'Generar guion' }: { ideaId: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleGenerate() {
    setState('loading')
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId }),
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
    <Button
      size="sm"
      variant="outline"
      onClick={handleGenerate}
      disabled={state === 'loading' || state === 'done'}
    >
      {state === 'loading' ? (
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      {state === 'idle' && label}
      {state === 'loading' && 'Generando…'}
      {state === 'done' && 'Generado'}
      {state === 'error' && 'Reintentar'}
    </Button>
  )
}
