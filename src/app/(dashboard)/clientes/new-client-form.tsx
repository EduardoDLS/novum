'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClientWithAccount } from './client-create-actions'

type Credentials = { clientId: string; email: string; tempPassword: string }

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-1">
      <p className="t-label text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
        <span className="flex-1 text-sm font-mono text-foreground">{value}</span>
        <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          {copied ? <Check className="h-3.5 w-3.5 text-kanban-grabacion" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}

export function NewClientForm() {
  const [open, setOpen]               = useState(false)
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const [pending, startTransition]    = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const router  = useRouter()

  function handleSubmit(fd: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await createClientWithAccount(fd)
      if (!res.ok) { setError(res.error); return }
      setCredentials({ clientId: res.clientId, email: res.email, tempPassword: res.tempPassword })
      formRef.current?.reset()
    })
  }

  function handleGoToProfile() {
    if (!credentials) return
    setOpen(false)
    setCredentials(null)
    router.push(`/clientes/${credentials.clientId}`)
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Nuevo cliente
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-novum-dark-border bg-novum-dark-raised shadow-elev-2 p-6 space-y-5">

        {credentials ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Cliente creado</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Comparte estas credenciales con el cliente. La contraseña es temporal — deberá cambiarla desde su perfil.
            </p>
            <div className="space-y-3">
              <CopyField label="Email" value={credentials.email} />
              <CopyField label="Contraseña temporal" value={credentials.tempPassword} />
            </div>
            <Button onClick={handleGoToProfile} className="w-full">
              Ir al perfil del cliente
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Nuevo cliente</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form ref={formRef} action={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="t-label text-muted-foreground">Nombre completo *</label>
                <input
                  name="name" required maxLength={120}
                  placeholder="Ej: Juan Pérez"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="t-label text-muted-foreground">Email *</label>
                <input
                  name="email" type="email" required
                  placeholder="cliente@email.com"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                />
                <p className="text-xs text-muted-foreground">El cliente entra al portal con este email.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="t-label text-muted-foreground">Instagram handle</label>
                  <input
                    name="instagram_handle" maxLength={60}
                    placeholder="sin @"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="t-label text-muted-foreground">Nicho</label>
                  <input
                    name="niche" maxLength={120}
                    placeholder="Ej: Finanzas"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="t-label text-muted-foreground">Voz y tono</label>
                <textarea
                  name="voice_tone" maxLength={300} rows={2}
                  placeholder="Ej: Directo, empático, sin tecnicismos"
                  className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                />
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={pending} className="flex-1">
                  {pending ? 'Creando…' : 'Crear cliente'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
