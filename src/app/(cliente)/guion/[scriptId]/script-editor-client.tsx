'use client'

import { useState, useTransition } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateScriptAsClient } from '../actions'
import type { ScriptLine } from '@/types/novum'

const FIELDS: { key: keyof ScriptLine; label: string; wide?: boolean }[] = [
  { key: 'parte',      label: 'Parte' },
  { key: 'script',     label: 'Script', wide: true },
  { key: 'modulacion', label: 'Modulación' },
  { key: 'emocion',    label: 'Emoción' },
]

export function ScriptEditorClient({ scriptId, lines: initial }: { scriptId: string; lines: ScriptLine[] }) {
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
      const res = await updateScriptAsClient(scriptId, lines)
      if (!res.ok) { setError(res.error); return }
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Guion</h3>
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
              <Pencil className="h-3 w-3" /> Editar guion
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

      <div className="overflow-x-auto rounded-lg border border-border shadow-elev-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {FIELDS.map(({ label }) => (
                <th key={label} className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="border-b border-border last:border-0 bg-card">
                {FIELDS.map(({ key, wide }) => (
                  <td key={key} className={`px-4 py-3 align-top ${wide ? 'min-w-[220px]' : 'min-w-[110px]'}`}>
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
