'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ExternalLink, X, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ResourceType } from '@/types/novum'
import { createResource, deleteResource } from './actions'

type ResourceRow = {
  id: string
  client_id: string | null
  name: string
  type: ResourceType
  url: string
  tags: string[]
  account_email: string | null
  account_password: string | null
  created_at: string
}

type Props = {
  resources: ResourceRow[]
  clients: { id: string; name: string }[]
  typeFilter?: ResourceType
  clientFilter?: string
  typeLabels: Record<ResourceType, string>
}

const TYPE_COLORS: Record<ResourceType, string> = {
  plantilla:  'bg-kanban-guionizar-bg text-kanban-guionizar',
  referencia: 'bg-kanban-edicion-bg text-kanban-edicion',
  asset:      'bg-kanban-grabacion-bg text-kanban-grabacion',
  guia:       'bg-kanban-publicado-bg text-kanban-publicado',
  cuenta:     'bg-kanban-revision-bg text-kanban-revision',
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground transition-colors"
      title="Copiar"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

function PasswordField({ value }: { value: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-xs text-foreground flex-1 truncate">
        {visible ? value : '••••••••'}
      </span>
      <button
        onClick={() => setVisible((v) => !v)}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        title={visible ? 'Ocultar' : 'Mostrar'}
      >
        {visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
      </button>
      <CopyButton value={value} />
    </div>
  )
}

function ResourceCard({
  r,
  clientName,
  typeLabels,
  onDelete,
  deleting,
}: {
  r: ResourceRow
  clientName: string | undefined
  typeLabels: Record<ResourceType, string>
  onDelete: (id: string) => void
  deleting: boolean
}) {
  const isCuenta = r.type === 'cuenta'

  return (
    <div className={`group rounded-lg border border-border bg-card p-4 shadow-elev-1 space-y-3 transition-opacity ${deleting ? 'opacity-40' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <p className="font-medium text-sm truncate">{r.name}</p>
          <p className="text-xs text-muted-foreground">{clientName ?? 'Global'}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[r.type]}`}>
          {typeLabels[r.type]}
        </span>
      </div>

      {/* Credenciales para cuentas */}
      {isCuenta && (r.account_email || r.account_password) && (
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2.5 space-y-2">
          {r.account_email && (
            <div className="flex items-center justify-between gap-2">
              <span className="t-label text-muted-foreground shrink-0">Correo</span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs text-foreground truncate">{r.account_email}</span>
                <CopyButton value={r.account_email} />
              </div>
            </div>
          )}
          {r.account_password && (
            <div className="flex items-center justify-between gap-2">
              <span className="t-label text-muted-foreground shrink-0">Contraseña</span>
              <div className="flex-1 min-w-0">
                <PasswordField value={r.account_password} />
              </div>
            </div>
          )}
        </div>
      )}

      {r.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {r.tags.map((tag) => (
            <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-border">
        {r.url ? (
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            {isCuenta ? 'Ir a plataforma' : 'Abrir'}
          </a>
        ) : (
          <span />
        )}
        <button
          onClick={() => onDelete(r.id)}
          disabled={deleting}
          className="ml-auto text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
          title="Eliminar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function ResourcesClient({ resources, clients, typeFilter, clientFilter, typeLabels }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<ResourceType>('asset')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(window.location.search)
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/recursos?${params.toString()}`)
  }

  function handleCreate(fd: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await createResource(fd)
      if (!res.ok) { setError(res.error); return }
      setShowForm(false)
      setFormType('asset')
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      await deleteResource(id)
      setDeletingId(null)
      router.refresh()
    })
  }

  const types: ResourceType[] = ['plantilla', 'referencia', 'asset', 'guia', 'cuenta']
  const isCuenta = formType === 'cuenta'

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setFilter('type', null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!typeFilter ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          Todos
        </button>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter('type', typeFilter === t ? null : t)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${typeFilter === t ? TYPE_COLORS[t] : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {typeLabels[t]}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <select
            value={clientFilter ?? ''}
            onChange={(e) => setFilter('client_id', e.target.value || null)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-ring"
          >
            <option value="">Todos los clientes</option>
            <option value="global">Globales</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </Button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-elev-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm">Nuevo recurso</h3>
            <button onClick={() => { setShowForm(false); setFormType('asset') }} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form action={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="t-label text-muted-foreground">Nombre</label>
                <input
                  name="name"
                  required
                  placeholder={isCuenta ? 'Ej: Netflix cliente, Dropbox…' : 'Nombre del recurso'}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="t-label text-muted-foreground">Tipo</label>
                <select
                  name="type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as ResourceType)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                >
                  {types.map((t) => (
                    <option key={t} value={t}>{typeLabels[t]}</option>
                  ))}
                </select>
              </div>

              {/* Campos de cuenta */}
              {isCuenta && (
                <>
                  <div className="space-y-1">
                    <label className="t-label text-muted-foreground">Correo</label>
                    <input
                      name="account_email"
                      type="text"
                      placeholder="correo@ejemplo.com"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="t-label text-muted-foreground">Contraseña</label>
                    <input
                      name="account_password"
                      type="text"
                      placeholder="Contraseña de la cuenta"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="t-label text-muted-foreground">Link de plataforma (opcional)</label>
                    <input
                      name="url"
                      type="url"
                      placeholder="https://netflix.com"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                    />
                  </div>
                </>
              )}

              {/* Campos de recurso normal */}
              {!isCuenta && (
                <div className="sm:col-span-2 space-y-1">
                  <label className="t-label text-muted-foreground">URL</label>
                  <input
                    name="url"
                    type="url"
                    required
                    placeholder="https://..."
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="t-label text-muted-foreground">Tags (separados por coma)</label>
                <input
                  name="tags"
                  placeholder="reels, guion, b-roll"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="t-label text-muted-foreground">Cliente (opcional)</label>
                <select
                  name="client_id"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                >
                  <option value="">Global (todos los clientes)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setShowForm(false); setFormType('asset') }}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de recursos */}
      {resources.length === 0 && (
        <p className="text-sm text-muted-foreground">Sin recursos. Agrega el primero.</p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {resources.map((r) => {
          const clientName = clients.find((c) => c.id === r.client_id)?.name
          return (
            <ResourceCard
              key={r.id}
              r={r}
              clientName={clientName}
              typeLabels={typeLabels}
              onDelete={handleDelete}
              deleting={deletingId === r.id}
            />
          )
        })}
      </div>
    </div>
  )
}
