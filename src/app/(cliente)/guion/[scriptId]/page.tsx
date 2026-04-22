import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { FeedbackForm } from './feedback-form'
import { ScriptEditorClient } from './script-editor-client'
import type { ScriptLine } from '@/types/novum'

export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  borrador: { label: 'En revisión', className: 'bg-muted text-muted-foreground' },
  aprobado: { label: 'Aprobado', className: 'bg-kanban-grabacion-bg text-kanban-grabacion' },
  rechazado: { label: 'Rechazado', className: 'bg-destructive/10 text-destructive' },
}

export default async function ClientScriptPage({ params }: { params: { scriptId: string } }) {
  const { profile } = await requireRole(['cliente'])
  const supabase = createClient()

  // El cliente solo puede ver guiones de sus propias ideas (RLS lo garantiza)
  const { data: script } = await supabase
    .from('scripts')
    .select('id, raw_idea, strategic_vision, script_content, status, client_notes, content_idea_id')
    .eq('id', params.scriptId)
    .single()

  if (!script) notFound()

  // Verificar que la idea pertenece al cliente autenticado
  const { data: idea } = await supabase
    .from('content_ideas')
    .select('id, title, client_id, clients(profile_id)')
    .eq('id', script.content_idea_id)
    .single()

  type IdeaWithClient = { id: string; title: string; client_id: string; clients: { profile_id: string | null } | null }
  const ideaRow = idea as unknown as IdeaWithClient | null
  if (!ideaRow || (ideaRow.clients?.profile_id !== profile.id)) notFound()

  const lines = script.script_content as ScriptLine[] | null
  const badge = STATUS_BADGE[script.status] ?? STATUS_BADGE.borrador

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/kanban"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al kanban
        </Link>
      </div>

      <header className="space-y-2">
        <div className="flex items-start gap-3">
          <h2 className="t-h1 flex-1">{ideaRow.title}</h2>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </header>

      {script.strategic_vision && (
        <section className="rounded-lg border border-border bg-card p-5 shadow-elev-1 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-caps">Visión estratégica</h3>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{script.strategic_vision}</p>
        </section>
      )}

      {lines && lines.length > 0 ? (
        <section className="space-y-3">
          <ScriptEditorClient scriptId={script.id} lines={lines} />
        </section>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">El guion está siendo generado, vuelve en unos momentos.</p>
        </div>
      )}

      {script.status === 'rechazado' && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive font-medium mb-1">Guion rechazado</p>
          <p className="text-sm text-muted-foreground">Tu equipo revisará y generará una nueva versión pronto.</p>
        </div>
      )}

      {script.status !== 'aprobado' && (
        <FeedbackForm
          scriptId={script.id}
          existing={(script as { client_notes?: string | null }).client_notes ?? null}
        />
      )}
    </div>
  )
}
