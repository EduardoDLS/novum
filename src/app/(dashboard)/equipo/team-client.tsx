'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, X, Check, Shield, Pencil, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { inviteTeamMember, changeRole, removeTeamMember } from './actions'
import type { UserRole } from '@/types/novum'

type Member = { id: string; full_name: string | null; role: UserRole; avatar_url: string | null; created_at: string }

function CredentialRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
      <span className="t-label text-muted-foreground w-32 shrink-0">{label}</span>
      <span className="flex-1 font-mono text-sm text-foreground truncate">{value}</span>
      <button onClick={copy} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" title="Copiar">
        {copied ? <Check className="h-3.5 w-3.5 text-kanban-grabacion" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}

const ROLE_LABEL: Record<string, string> = { admin: 'Admin', editor: 'Editor', guionista: 'Guionista', cliente: 'Cliente' }
const ROLE_COLOR: Record<string, string> = {
  admin: 'bg-kanban-publicado-bg text-kanban-publicado',
  editor: 'bg-kanban-edicion-bg text-kanban-edicion',
  guionista: 'bg-kanban-grabacion-bg text-kanban-grabacion',
  cliente: 'bg-muted text-muted-foreground',
}

export function TeamClient({ members, currentUserId }: { members: Member[]; currentUserId: string }) {
  const [showInvite, setShowInvite] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [inviteResult, setInviteResult] = useState<{ email: string; password: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function handleInvite(fd: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await inviteTeamMember(fd)
      if (!res.ok) { setError(res.error); return }
      setShowInvite(false)
      if (res.tempPassword && res.email) {
        setInviteResult({ email: res.email, password: res.tempPassword })
      }
    })
  }

  function handleChangeRole(fd: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await changeRole(fd)
      if (!res.ok) { setError(res.error); return }
      setEditingId(null)
    })
  }

  function handleRemove(id: string) {
    if (!confirm('¿Eliminar este miembro? Esta acción no se puede deshacer.')) return
    startTransition(async () => { await removeTeamMember(id) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{members.length} miembro{members.length !== 1 ? 's' : ''} en el equipo.</p>
        <Button size="sm" onClick={() => setShowInvite(true)}>
          <Plus className="h-3.5 w-3.5" /> Agregar miembro
        </Button>
      </div>

      {/* Credenciales del nuevo miembro */}
      {inviteResult && (
        <div className="rounded-lg border border-kanban-grabacion/30 bg-kanban-grabacion/10 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-kanban-grabacion">Cuenta creada — comparte estas credenciales</p>
            <button onClick={() => setInviteResult(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            <CredentialRow label="Email" value={inviteResult.email} />
            <CredentialRow label="Contraseña temporal" value={inviteResult.password} />
          </div>
          <p className="text-xs text-muted-foreground">
            El miembro debe cambiar la contraseña desde su perfil al ingresar. Esta información no volverá a mostrarse.
          </p>
        </div>
      )}

      {/* Formulario de invitación */}
      {showInvite && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-elev-2 space-y-4 max-w-md">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Nuevo miembro del equipo</h3>
            <button onClick={() => setShowInvite(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form action={handleInvite} className="space-y-3">
            <div className="space-y-1">
              <label className="t-label text-muted-foreground">Nombre completo</label>
              <input name="full_name" required placeholder="Ana García"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring" />
            </div>
            <div className="space-y-1">
              <label className="t-label text-muted-foreground">Email</label>
              <input name="email" type="email" required placeholder="ana@agencia.com"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring" />
            </div>
            <div className="space-y-1">
              <label className="t-label text-muted-foreground">Rol</label>
              <select name="role" defaultValue="editor"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring">
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="guionista">Guionista</option>
              </select>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Se creará la cuenta con una contraseña temporal. Compártela con el miembro para que inicie sesión y la cambie desde su perfil.
            </p>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending}>{pending ? 'Creando…' : 'Crear cuenta'}</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowInvite(false)}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de miembros */}
      <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 bg-card px-4 py-3 sm:px-5 sm:py-4">
            {/* Avatar placeholder */}
            <div className="h-9 w-9 shrink-0 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
              {(m.full_name ?? 'U').charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {m.full_name ?? 'Sin nombre'}
                {m.id === currentUserId && <span className="ml-2 text-xs text-muted-foreground">(tú)</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(m.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>

            {/* Rol o form de edición */}
            {editingId === m.id ? (
              <form action={handleChangeRole} className="flex items-center gap-2">
                <input type="hidden" name="profileId" value={m.id} />
                <select name="role" defaultValue={m.role}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-ring">
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="guionista">Guionista</option>
                  <option value="cliente">Cliente</option>
                </select>
                <Button type="submit" size="icon" variant="ghost" className="h-7 w-7" disabled={pending}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${ROLE_COLOR[m.role]}`}>
                  {ROLE_LABEL[m.role]}
                </span>
                {m.id !== currentUserId && (
                  <>
                    <button onClick={() => setEditingId(m.id)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleRemove(m.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
                {m.id === currentUserId && <Shield className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
