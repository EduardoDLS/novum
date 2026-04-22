'use client'

import Image from 'next/image'
import { useState, useTransition } from 'react'
import { Instagram, Pencil, Check, TrendingUp, Eye, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateInstagramAnalytics } from '../actions'

type Props = {
  clientId: string
  instagramHandle: string | null
  instagramPhotoUrl: string | null
  avgViewsReel: number | null
  engagementRate: number | null
  followersCount: number | null
}

export function InstagramAnalytics({
  clientId,
  instagramHandle,
  instagramPhotoUrl,
  avgViewsReel,
  engagementRate,
  followersCount,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  // Foto: primero la guardada, luego intenta unavatar, luego fallback
  const photoSrc = instagramPhotoUrl
    || (instagramHandle ? `https://unavatar.io/instagram/${instagramHandle}` : null)

  const profileUrl = instagramHandle ? `https://instagram.com/${instagramHandle}` : null

  function handleSubmit(fd: FormData) {
    setError(null)
    fd.append('clientId', clientId)
    startTransition(async () => {
      const res = await updateInstagramAnalytics(fd)
      if (!res.ok) { setError(res.error); return }
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Instagram Analytics</h3>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-kanban-grabacion">
              <Check className="h-3 w-3" /> Guardado
            </span>
          )}
          {!editing && (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Perfil + métricas */}
      <div className="flex items-start gap-4">
        {/* Foto de perfil */}
        <div className="shrink-0">
          {photoSrc ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-border">
              <Image
                src={photoSrc}
                alt={instagramHandle ?? 'Perfil'}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted">
              <Instagram className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Handle y métricas */}
        <div className="flex-1 space-y-3">
          {instagramHandle ? (
            <a
              href={profileUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
            >
              <Instagram className="h-4 w-4" />
              @{instagramHandle}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">Sin Instagram configurado.</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold">
                {followersCount != null ? followersCount.toLocaleString('es-MX') : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Seguidores</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Eye className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold">
                {avgViewsReel != null ? avgViewsReel.toLocaleString('es-MX') : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Avg views reel</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold">
                {engagementRate != null ? `${engagementRate}%` : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Engagement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de edición */}
      {editing && (
        <form action={handleSubmit} className="space-y-3 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Actualiza las métricas manualmente. La foto se carga automáticamente desde Instagram si dejas el campo vacío.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1">
              <label className="t-label text-muted-foreground">URL foto de perfil (opcional)</label>
              <input
                name="instagram_photo_url"
                type="url"
                defaultValue={instagramPhotoUrl ?? ''}
                placeholder="https://… (dejar vacío para usar Instagram)"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="t-label text-muted-foreground">Avg views por reel</label>
              <input
                name="avg_views_reel"
                type="number"
                min="0"
                defaultValue={avgViewsReel ?? ''}
                placeholder="Ej: 45000"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="t-label text-muted-foreground">Engagement rate (%)</label>
              <input
                name="engagement_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                defaultValue={engagementRate ?? ''}
                placeholder="Ej: 4.5"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
          </div>
        </form>
      )}
    </div>
  )
}
