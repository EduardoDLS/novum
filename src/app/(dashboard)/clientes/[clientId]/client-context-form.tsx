'use client'

import { useState, useTransition } from 'react'
import { Pencil, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateClientContext } from '../actions'

type Props = {
  clientId: string
  name: string
  instagramHandle: string | null
  followersCount: number | null
  niche: string | null
  voiceTone: string | null
  contentPillars: string[]
  bioContext: string | null
  communicationStyle: string | null
  signaturePhrases: string | null
}

export function ClientContextForm({
  clientId,
  name,
  instagramHandle,
  followersCount,
  niche,
  voiceTone,
  contentPillars,
  bioContext,
  communicationStyle,
  signaturePhrases,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(fd: FormData) {
    setError(null)
    fd.append('clientId', clientId)
    startTransition(async () => {
      const res = await updateClientContext(fd)
      if (!res.ok) { setError(res.error); return }
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Contexto de IA</h3>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1 text-xs text-kanban-grabacion">
                <Check className="h-3 w-3" /> Guardado
              </span>
            )}
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
          {[
            { label: 'Instagram', value: instagramHandle ? `@${instagramHandle}` : null },
            { label: 'Seguidores', value: followersCount?.toLocaleString('es-MX') ?? null },
            { label: 'Nicho', value: niche },
            { label: 'Voz y tono', value: voiceTone },
            { label: 'Pilares', value: contentPillars.length ? contentPillars.join(', ') : null },
            { label: 'Contexto adicional', value: bioContext },
            { label: 'Estilo en cámara', value: communicationStyle },
            { label: 'Frases propias', value: signaturePhrases },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="t-label text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 text-foreground">{value ?? <span className="text-muted-foreground">—</span>}</dd>
            </div>
          ))}
        </dl>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <h3 className="font-medium">Editar contexto de IA</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nombre" name="name" defaultValue={name} required />
        <Field label="Instagram handle" name="instagram_handle" defaultValue={instagramHandle ?? ''} placeholder="sin @" />
        <Field label="Seguidores" name="followers_count" type="number" defaultValue={followersCount ?? ''} />
        <Field label="Nicho" name="niche" defaultValue={niche ?? ''} placeholder="Ej: Finanzas personales" />
        <div className="sm:col-span-2">
          <Textarea label="Voz y tono" name="voice_tone" defaultValue={voiceTone ?? ''} placeholder="Ej: Directo, empático, sin tecnicismos" rows={2} />
        </div>
        <div className="sm:col-span-2">
          <Field label="Pilares de contenido" name="content_pillars" defaultValue={contentPillars.join(', ')} placeholder="Separados por coma: Inversión, Hábitos, Motivación" />
        </div>
        <div className="sm:col-span-2">
          <Textarea label="Contexto adicional" name="bio_context" defaultValue={bioContext ?? ''} placeholder="Info relevante sobre el cliente para la IA" rows={3} />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            label="Estilo de comunicación en cámara"
            name="communication_style"
            defaultValue={communicationStyle ?? ''}
            placeholder="Ej: Habla rápido y con mucha energía, usa humor ácido, hace pausas dramáticas, es muy directo y no le da vueltas a las cosas, conecta desde la vulnerabilidad"
            rows={3}
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            label="Frases y expresiones propias"
            name="signature_phrases"
            defaultValue={signaturePhrases ?? ''}
            placeholder="Ej: 'wacha', 'no me vengas con cuentos', 'y eso es un hecho', 'la neta', referencias a su ciudad o cultura, términos técnicos que usa siempre"
            rows={3}
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
      </div>
    </form>
  )
}

function Field({ label, name, defaultValue, placeholder, type = 'text', required = false }: {
  label: string; name: string; defaultValue?: string | number; placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <div className="space-y-1">
      <label className="t-label text-muted-foreground">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue as string}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
      />
    </div>
  )
}

function Textarea({ label, name, defaultValue, placeholder, rows = 2 }: {
  label: string; name: string; defaultValue?: string; placeholder?: string; rows?: number
}) {
  return (
    <div className="space-y-1">
      <label className="t-label text-muted-foreground">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
      />
    </div>
  )
}
