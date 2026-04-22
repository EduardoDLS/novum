import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { ClientContextForm } from './client-context-form'
import { EmbedCopyButton } from './embed-copy-button'
import { InstagramAnalytics } from './instagram-analytics'
import { IdeasList } from './ideas-list'
import { Instagram, Users, Video, CheckCircle, FileText } from 'lucide-react'
import type { ContentStatus } from '@/types/novum'

export const dynamic = 'force-dynamic'

const MEDAL = ['🥇', '🥈', '🥉']

export default async function ClientProfilePage({
  params,
}: {
  params: { clientId: string }
}) {
  await requireRole(['admin', 'editor', 'guionista'])
  const supabase = createClient()

  const [{ data: client }, { data: ideas }, { data: scripts }] = await Promise.all([
    supabase
      .from('clients')
      .select('id, name, instagram_handle, followers_count, niche, voice_tone, content_pillars, bio_context, embed_token, instagram_photo_url, avg_views_reel, engagement_rate, communication_style, signature_phrases')
      .eq('id', params.clientId)
      .single(),
    supabase
      .from('content_ideas')
      .select('id, title, status, views_count, video_url, publish_date')
      .eq('client_id', params.clientId)
      .order('created_at', { ascending: false }),
    supabase
      .from('scripts')
      .select('id, status')
      .eq('client_id', params.clientId),
  ])

  if (!client) notFound()

  type IdeaRow = { id: string; title: string; status: ContentStatus; views_count: number | null; video_url: string | null; publish_date: string | null }
  const ideaRows = (ideas ?? []) as IdeaRow[]
  const scriptRows = scripts ?? []

  const publicados = ideaRows.filter((i) => i.status === 'publicado')
  const enProduccion = ideaRows.filter((i) => i.status !== 'publicado' && i.status !== 'baby_idea')
  const babyIdeas = ideaRows.filter((i) => i.status === 'baby_idea')
  const guionesAprobados = scriptRows.filter((s) => s.status === 'aprobado').length

  const podio = [...publicados]
    .filter((i) => i.views_count != null)
    .sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0))
    .slice(0, 3)

  const metrics = [
    { label: 'Publicados', value: publicados.length, icon: CheckCircle },
    { label: 'En producción', value: enProduccion.length, icon: Video },
    { label: 'Baby Ideas', value: babyIdeas.length, icon: FileText },
    { label: 'Guiones aprobados', value: guionesAprobados, icon: FileText },
  ]

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <header className="space-y-2">
        <h2 className="t-h1">{client.name}</h2>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {client.instagram_handle && (
            <span className="flex items-center gap-1">
              <Instagram className="h-3.5 w-3.5" />
              @{client.instagram_handle}
            </span>
          )}
          {client.followers_count != null && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {client.followers_count.toLocaleString('es-MX')} seguidores
            </span>
          )}
          {client.niche && <span>{client.niche}</span>}
        </div>
      </header>

      {/* Métricas de producción */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4 shadow-elev-1 text-center">
            <p className="t-metric text-3xl">{value}</p>
            <p className="t-label mt-1 text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Instagram Analytics */}
      <section className="rounded-lg border border-border bg-card p-5 shadow-elev-1">
        <InstagramAnalytics
          clientId={client.id}
          instagramHandle={client.instagram_handle}
          instagramPhotoUrl={client.instagram_photo_url ?? null}
          avgViewsReel={client.avg_views_reel ?? null}
          engagementRate={client.engagement_rate ? Number(client.engagement_rate) : null}
          followersCount={client.followers_count}
        />
      </section>

      {/* Podio de viralidad */}
      {podio.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-5 shadow-elev-1 space-y-3">
          <h3 className="font-medium">Podio de viralidad</h3>
          <div className="space-y-2">
            {podio.map((idea, i) => (
              <div key={idea.id} className="flex items-center gap-3 text-sm">
                <span className="text-lg w-6 text-center">{MEDAL[i]}</span>
                <span className="flex-1 truncate text-foreground">{idea.title}</span>
                {idea.views_count != null && (
                  <span className="shrink-0 font-medium text-foreground">
                    {idea.views_count.toLocaleString('es-MX')} views
                  </span>
                )}
              </div>
            ))}
          </div>
          {publicados.filter((i) => i.views_count == null).length > 0 && (
            <p className="text-xs text-muted-foreground">
              {publicados.filter((i) => i.views_count == null).length} publicado{publicados.filter((i) => i.views_count == null).length !== 1 ? 's' : ''} sin views registrados.
            </p>
          )}
        </section>
      )}

      {/* Widget embed */}
      {client.embed_token && (
        <section className="rounded-lg border border-border bg-card p-5 shadow-elev-1 space-y-3">
          <h3 className="font-medium">Widget embebible</h3>
          <p className="text-sm text-muted-foreground">Comparte este link con tu cliente para que vea el estado de su producción.</p>
          <EmbedCopyButton token={client.embed_token} />
        </section>
      )}

      {/* Contexto IA */}
      <section className="rounded-lg border border-border bg-card p-5 shadow-elev-1">
        <ClientContextForm
          clientId={client.id}
          name={client.name}
          instagramHandle={client.instagram_handle}
          followersCount={client.followers_count}
          niche={client.niche}
          voiceTone={client.voice_tone}
          contentPillars={client.content_pillars ?? []}
          bioContext={client.bio_context}
          communicationStyle={(client as { communication_style?: string | null }).communication_style ?? null}
          signaturePhrases={(client as { signature_phrases?: string | null }).signature_phrases ?? null}
        />
      </section>

      {/* Ideas y videos */}
      <section className="space-y-3">
        <IdeasList clientId={params.clientId} ideas={ideaRows} />
      </section>
    </div>
  )
}
