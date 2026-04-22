'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Check, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ChangePassword() {
  const [open, setOpen]       = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [saved, setSaved]     = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const newPass    = fd.get('new_password') as string
    const confirmPass = fd.get('confirm_password') as string

    if (newPass.length < 8) { setError('Mínimo 8 caracteres.'); return }
    if (newPass !== confirmPass) { setError('Las contraseñas no coinciden.'); return }

    setLoading(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { error: supaErr } = await supabase.auth.updateUser({ password: newPass })
    setLoading(false)

    if (supaErr) { setError(supaErr.message); return }
    setSaved(true)
    setOpen(false)
    setTimeout(() => setSaved(false), 4000)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Contraseña</span>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-kanban-grabacion">
              <Check className="h-3 w-3" /> Actualizada
            </span>
          )}
          <button
            onClick={() => { setOpen((v) => !v); setError(null) }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {open ? 'Cancelar' : 'Cambiar contraseña'}
          </button>
        </div>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="t-label text-muted-foreground">Nueva contraseña</label>
            <input
              name="new_password" type="password" required minLength={8}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="t-label text-muted-foreground">Confirmar contraseña</label>
            <input
              name="confirm_password" type="password" required
              placeholder="Repite la contraseña"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? 'Guardando…' : 'Actualizar contraseña'}
          </Button>
        </form>
      )}
    </div>
  )
}
