'use client'

import { useState, useTransition } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateScriptContent } from './actions'
import type { ScriptLine } from '@/types/novum'

const FIELDS: { key: keyof ScriptLine; label: string; wide?: boolean }[] = [
  { key: 'parte',      label: 'Parte' },
  { key: 'script',     label: 'Script', wide: true },
  { key: 'modulacion', label: 'Modulación' },
  { key: 'emocion',    label: 'Emoción' },
]

export function ScriptEditor({ scriptId, lines: initial }: { scriptId: string; lines: ScriptLine[] }) {
  const [editing, setEditing]   = useState(false)
  const [lines, setLines]       = useState<ScriptLine[]>(initial)
  const [error, setError]       = useState<string | null>(null)
  const [saved, setSaved]       = useState(false)
  const [pending, startTransition] = useTransition()

  function updateLine(i: number, field: keyof ScriptLine, value: string) {
    setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l))
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const res = await updateScriptContent(scriptId, lines)
      if (!res.ok) { setError(res.error); return }
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Guion</span>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-kanban-grabacion">
              <Check className="h-3 w-3" /> Guardado
            </span>
          )}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-3 w-3" /> Editar líneas
            </button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={pending}>
                {pending ? 'Guardando…' : 'Guardar'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setLines(initial); setEditing(false) }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {FIELDS.map(({ label }) => (
                <th key={label} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lines.map((line, i) => (
              <tr key={i} className="bg-card">
                {FIELDS.map(({ key, wide }) => (
                  <td key={key} className={`px-3 py-2.5 align-top ${wide ? 'min-w-[240px]' : 'min-w-[120px]'}`}>
                    {editing ? (
                      <textarea
                        value={line[key]}
                        onChange={(e) => updateLine(i, key, e.target.value)}
                        rows={wide ? 3 : 2}
                        className="w-full resize-none bg-transparent text-sm leading-snug outline-none focus:ring-1 focus:ring-ring rounded"
                      />
                    ) : (
                      <span className="leading-relaxed text-foreground">{line[key]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
