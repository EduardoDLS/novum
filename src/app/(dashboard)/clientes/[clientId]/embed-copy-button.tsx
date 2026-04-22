'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmbedCopyButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const embedUrl = `${window.location.origin}/embed/${token}`
    navigator.clipboard.writeText(embedUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate rounded bg-muted px-3 py-1.5 text-xs text-muted-foreground">
        /embed/{token}
      </code>
      <Button size="sm" variant="outline" onClick={handleCopy}>
        {copied ? <Check className="h-3.5 w-3.5 text-kanban-grabacion" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copiado' : 'Copiar'}
      </Button>
    </div>
  )
}
