'use client'

import Image from 'next/image'
import { useRef, useState, useTransition } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { updateAvatarUrl } from './actions'

type Props = {
  userId: string
  currentUrl: string | null
  name: string | null
}

export function AvatarUpload({ userId, currentUrl, name }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [, startTransition] = useTransition()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('La imagen no puede superar 2 MB.'); return }
    if (!file.type.startsWith('image/')) { setError('Solo se aceptan imágenes.'); return }

    setError(null)
    setUploading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatares')
      .upload(path, file, { upsert: true })

    if (uploadError) { setError(uploadError.message); setUploading(false); return }

    const { data } = supabase.storage.from('avatares').getPublicUrl(path)
    const url = `${data.publicUrl}?t=${Date.now()}`
    setPreview(url)

    startTransition(async () => {
      const res = await updateAvatarUrl(url)
      if (!res.ok) setError(res.error)
      setUploading(false)
    })
  }

  const initials = (name ?? 'U').charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
          {preview ? (
            <Image src={preview} alt="Avatar" fill className="object-cover" unoptimized />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">{initials}</span>
          )}
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-foreground text-background hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{name ?? 'Sin nombre'}</p>
        <p className="text-xs text-muted-foreground">JPG, PNG o WebP · máx. 2 MB</p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  )
}
