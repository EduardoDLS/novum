import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { ApproveButton, RejectForm } from './script-actions-client'
import { GenerateScriptButton } from './generate-button'
import { ScriptEditor } from './script-editor'
import { RegenerateForm } from './regenerate-form'
import type { ScriptLine } from '@/types/novum'

export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  borrador: { label: 'Borrador', className: 'bg-muted text-muted-foreground' },
  aprobado: { label: 'Aprobado', className: 'bg-kanban-grabacion-bg text-kanban-grabacion' },
  rechazado: { label: 'Rechazado', className: 'bg-destructive/10 text-destructive' },
}

export default async function ScriptsPage() {
  await requireRole(['admin', 'editor', 'guionista'])
  const supabase = createClient()

  const [{ data: scripts }, { data: pendingIdeas }] = await Promise.all([
    supabase
      .from('scripts')
      .select('id, raw_idea, strategic_vision, script_content, status, rejection_note, client_notes, created_at, clients(name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('content_ideas')
      .select('id, title, created_at, clients(name)')
      .eq('status', 'baby_idea')
      .is('script_id', null)
      .order('created_at', { ascending: false }),
  ])

  const borradores = (scripts ?? []).filter((s) => s.status === 'borrador')
  const resto = (scripts ?? []).filter((s) => s.status !== 'borrador')
  const sinGuion = pendingIdeas ?? []

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="space-y-1">
        <h2 className="t-h1">Guiones</h2>
        <p className="text-sm text-muted-foreground">
          {borradores.length} pendiente{borradores.length !== 1 ? 's' : ''} de revisión
          {sinGuion.length > 0 && ` · ${sinGuion.length} sin generar`}.
        </p>
      </header>

      {sinGuion.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Ideas sin guion</h3>
          <div className="space-y-2">
            {sinGuion.map((idea) => (
              <div key={idea.id} className="flex items-center gap-4 rounded-lg border border-dashed border-border bg-card px-4 py-3 shadow-elev-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{idea.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {((idea.clients as unknown) as { name: string } | null)?.name ?? 'Cliente'} ·{' '}
                    {new Date(idea.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <GenerateScriptButton ideaId={idea.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      {sinGuion.length === 0 && (scripts ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay guiones generados aún. Aparecen aquí cuando un cliente agrega una Baby Idea.
        </p>
      )}

      {borradores.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-muted-foreground">Pendientes de revisión</h3>
          {borradores.map((script) => {
          const badge = STATUS_BADGE[script.status] ?? STATUS_BADGE.borrador
          const lines = script.script_content as ScriptLine[] | null

          return (
            <section
              key={script.id}
              className="rounded-lg border border-border bg-card p-6 shadow-elev-1 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {((script.clients as unknown) as { name: string } | null)?.name ?? 'Cliente'} ·{' '}
                    {new Date(script.created_at).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  <h3 className="font-medium text-foreground">{script.raw_idea}</h3>
                </div>
                <span
                  className={`t-label inline-flex items-center rounded-md px-2 py-0.5 text-[10px] ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>

              {script.strategic_vision && (
                <details className="group">
                  <summary className="t-label cursor-pointer text-muted-foreground hover:text-foreground">
                    Ver visión estratégica
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {script.strategic_vision}
                  </p>
                </details>
              )}

              {(script as { client_notes?: string | null }).client_notes && (
                <div className="rounded-md border border-novum-gold/30 bg-novum-gold/5 px-4 py-3 text-sm">
                  <span className="font-medium text-novum-gold">Notas del cliente: </span>
                  <span className="text-foreground">{(script as { client_notes?: string | null }).client_notes}</span>
                </div>
              )}

              {lines && lines.length > 0 && (
                <ScriptEditor scriptId={script.id} lines={lines} />
              )}

              {script.rejection_note && (
                <div className="rounded-md bg-destructive/5 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  <span className="font-medium">Nota de rechazo:</span> {script.rejection_note}
                </div>
              )}

              {script.status === 'borrador' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <ApproveButton scriptId={script.id} />
                    <RejectForm scriptId={script.id} />
                  </div>
                  <RegenerateForm scriptId={script.id} />
                </div>
              )}
            </section>
          )})}
        </div>
      )}

      {resto.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors select-none">
            <span className="inline-block transition-transform group-open:rotate-90">▶</span>
            Aprobados y rechazados ({resto.length})
          </summary>
          <div className="space-y-6 mt-4">
            {resto.map((script) => {
              const badge = STATUS_BADGE[script.status] ?? STATUS_BADGE.borrador
              const lines = script.script_content as ScriptLine[] | null

              return (
                <section
                  key={script.id}
                  className="rounded-lg border border-border bg-card p-6 shadow-elev-1 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {((script.clients as unknown) as { name: string } | null)?.name ?? 'Cliente'} ·{' '}
                        {new Date(script.created_at).toLocaleDateString('es-MX', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </p>
                      <h3 className="font-medium text-foreground">{script.raw_idea}</h3>
                    </div>
                    <span className={`t-label inline-flex items-center rounded-md px-2 py-0.5 text-[10px] ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  {script.strategic_vision && (
                    <details className="group/inner">
                      <summary className="t-label cursor-pointer text-muted-foreground hover:text-foreground">
                        Ver visión estratégica
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {script.strategic_vision}
                      </p>
                    </details>
                  )}

                  {(script as { client_notes?: string | null }).client_notes && (
                    <div className="rounded-md border border-novum-gold/30 bg-novum-gold/5 px-4 py-3 text-sm">
                      <span className="font-medium text-novum-gold">Notas del cliente: </span>
                      <span className="text-foreground">{(script as { client_notes?: string | null }).client_notes}</span>
                    </div>
                  )}

                  {lines && lines.length > 0 && <ScriptEditor scriptId={script.id} lines={lines} />}

                  {script.rejection_note && (
                    <div className="rounded-md bg-destructive/5 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                      <span className="font-medium">Nota de rechazo:</span> {script.rejection_note}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </details>
      )}
    </div>
  )
}
