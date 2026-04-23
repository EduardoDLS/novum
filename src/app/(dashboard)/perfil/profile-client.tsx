'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AvatarUpload } from './avatar-upload'
import { updateProfileName } from './actions'
import { ChangePassword } from '@/app/(cliente)/cuenta/change-password'
import type { UserRole } from '@/types/novum'

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  editor: 'Editor',
  guionista: 'Guionista',
  cliente: 'Cliente',
}

type Props = {
  userId: string
  fullName: string | null
  avatarUrl: string | null
  role: UserRole
}

export function ProfileClient({ userId, fullName, avatarUrl, role }: Props) {
  const [name, setName] = useState(fullName ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSaveName() {
    setError(null)
    startTransition(async () => {
      const res = await updateProfileName(name)
      if (!res.ok) { setError(res.error); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <div className="space-y-6">
      <AvatarUpload userId={userId} currentUrl={avatarUrl} name={fullName} />

      <div className="space-y-1">
        <label className="t-label text-muted-foreground">Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
        />
      </div>

      <div className="space-y-1">
        <label className="t-label text-muted-foreground">Rol</label>
        <p className="text-sm text-foreground">{ROLE_LABEL[role]}</p>
        <p className="text-xs text-muted-foreground">Solo un admin puede cambiar tu rol.</p>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSaveName} disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar nombre'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-kanban-grabacion">
            <Check className="h-3 w-3" /> Guardado
          </span>
        )}
      </div>

      <div className="border-t border-border pt-5">
        <ChangePassword />
      </div>
    </div>
  )
}
