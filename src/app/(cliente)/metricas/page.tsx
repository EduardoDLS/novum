import Image from 'next/image'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Instagram, TrendingUp, Eye, Users, Video, CheckCircle, Zap } from 'lucide-react'
import type { ContentStatus } from '@/types/novum'

export const dynamic = 'force-dynamic'

const MEDAL = ['🥇', '🥈', '🥉']

const STATUS_LABEL: Record<ContentStatus, string> = {
  baby_idea: 'Baby Idea',
  guionizar: 'Guionizando',
  grabacion: 'Grabación',
  edicion: 'Edición',
  publicado: 'Publicado',
}

const STATUS_DOT: Record<ContentStatus, string> = {
  baby_idea:  'bg-kanban-baby-idea',
  guionizar:  'bg-kanban-guionizar',
  grabacion:  'bg-kanban-grabacion',
  edicion:    'bg-kanban-edicion',
  publicado:  'bg-kanban-publicado',
}

export default async function MetricasPage() {
  const { profile } = await requireRole(['cliente'])
  const supabase = createClient()

  const [{ data: clientData }, { data: ideas }] = await Promise.all([
    supabase
      .from('clients')
      .select('id, name, instagram_handle, instagram_photo_url, followers_count, avg_views_reel, engagement_rate')
      .eq('profile_id', profile.id)
      .single(),
    supabase
      .from('content_ideas')
      .select('id, title, status, views_count, publish_date, created_at')
      .order('created_at', { ascending: false }),
  ])

  type IdeaRow = { id: string; title: string; status: ContentStatus; views_count: number | null; publish_date: string | null; created_at: string }
  const ideaList = (ideas ?? []) as IdeaRow[]

  const publicados   = ideaList.filter((i) => i.status === 'publicado')
  const enProceso    = ideaList.filter((i) => i.status !== 'publicado')
  const conViews     = publicados.filter((i) => i.views_count != null)
  const totalViews   = conViews.reduce((s, i) => s + (i.views_count ?? 0), 0)
  const podio        = [...conViews].sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0)).slice(0, 5)

  // Videos publicados este mes
  const now = new Date()
  const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const publicadosMes = publicados.filter((i) => i.publish_date?.startsWith(mesActual)).length

  const instagram_handle = clientData?.instagram_handle
  const photoSrc = clientData?.instagram_photo_url
    || (instagram_handle ? `https://unavatar.io/instagram/${instagram_handle}` : null)

  const nombre = profile.full_name?.split(' ')[0] ?? 'tus métricas'

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Hero del perfil */}
      <div className="rounded-xl border border-novum-dark-border overflow-hidden shadow-elev-2"
        style={{ background: 'linear-gradient(135deg, #151719 0%, #1B1E22 100%)' }}>
        <div className="p-6 flex items-center gap-5">
          <div className="relative">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-novum-gold/40 bg-novum-dark-elevated flex items-center justify-center shadow-gold">
              {photoSrc ? (
                <Image src={photoSrc} alt={instagram_handle ?? 'Perfil'} fill className="object-cover" unoptimized />
              ) : (
                <Instagram className="h-7 w-7 text-novum-gold/60" />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-kanban-grabacion border-2 border-novum-charcoal" />
          </div>
          <div className="space-y-0.5">
            <h2 className="t-h1 text-novum-warm">{clientData?.name ?? nombre}</h2>
            {instagram_handle && (
              <a
                href={`https://instagram.com/${instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-novum-silver hover:text-novum-gold transition-colors"
              >
                <Instagram className="h-3.5 w-3.5" />
                @{instagram_handle}
              </a>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-novum-dark-border border-t border-novum-dark-border">
          {[
            { label: 'Seguidores', value: clientData?.followers_count != null ? clientData.followers_count.toLocaleString('es-MX') : '—', icon: Users },
            { label: 'Avg views / reel', value: clientData?.avg_views_reel != null ? clientData.avg_views_reel.toLocaleString('es-MX') : '—', icon: Eye },
            { label: 'Engagement', value: clientData?.engagement_rate != null ? `${clientData.engagement_rate}%` : '—', icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center py-4 px-3 text-center">
              <Icon className="h-4 w-4 text-novum-gold/70 mb-1.5" />
              <p className="text-xl font-bold text-novum-warm leading-none">{value}</p>
              <p className="t-label text-novum-silver-strong mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Producción del mes */}
      <section className="space-y-3">
        <h3 className="t-label text-novum-silver-strong">Producción</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Publicados', value: publicados.length, icon: CheckCircle, color: 'text-kanban-publicado' },
            { label: 'Este mes', value: publicadosMes, icon: Zap, color: 'text-novum-gold' },
            { label: 'En proceso', value: enProceso.length, icon: Video, color: 'text-kanban-edicion' },
            { label: 'Total views', value: totalViews > 0 ? (totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews) : '—', icon: Eye, color: 'text-kanban-grabacion' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-novum-dark-border bg-novum-dark-raised p-4 shadow-elev-1 space-y-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <p className={`text-2xl font-bold leading-none ${color}`}>{value}</p>
              <p className="t-label text-novum-silver-strong">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline activo */}
      {enProceso.length > 0 && (
        <section className="space-y-3">
          <h3 className="t-label text-novum-silver-strong">En producción ahora</h3>
          <div className="rounded-xl border border-novum-dark-border bg-novum-dark-raised overflow-hidden shadow-elev-1 divide-y divide-novum-dark-border">
            {enProceso.slice(0, 5).map((idea) => (
              <div key={idea.id} className="flex items-center gap-3 px-4 py-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[idea.status]}`} />
                <span className="flex-1 text-sm text-novum-warm truncate">{idea.title}</span>
                <span className="t-label text-novum-silver-strong shrink-0">{STATUS_LABEL[idea.status]}</span>
              </div>
            ))}
            {enProceso.length > 5 && (
              <div className="px-4 py-2 text-xs text-novum-silver-strong">
                +{enProceso.length - 5} ideas más en proceso
              </div>
            )}
          </div>
        </section>
      )}

      {/* Podio de viralidad */}
      {podio.length > 0 && (
        <section className="space-y-3">
          <h3 className="t-label text-novum-silver-strong">Tus videos más vistos</h3>
          <div className="space-y-2">
            {podio.map((idea, i) => {
              const pct = podio[0].views_count ? ((idea.views_count ?? 0) / podio[0].views_count!) * 100 : 0
              return (
                <div key={idea.id} className="rounded-xl border border-novum-dark-border bg-novum-dark-raised p-4 shadow-elev-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-7 shrink-0">{MEDAL[i] ?? `#${i + 1}`}</span>
                    <p className="flex-1 text-sm font-medium text-novum-warm truncate">{idea.title}</p>
                    <p className="shrink-0 text-sm font-bold text-novum-gold">
                      {(idea.views_count ?? 0).toLocaleString('es-MX')}
                      <span className="text-xs font-normal text-novum-silver-strong ml-1">views</span>
                    </p>
                  </div>
                  {/* Barra de progreso */}
                  <div className="h-1 rounded-full bg-novum-dark-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-novum-gold/80 to-novum-gold/40 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {idea.publish_date && (
                    <p className="text-xs text-novum-silver-strong">
                      Publicado el {new Date(idea.publish_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {podio.length === 0 && publicados.length === 0 && (
        <div className="rounded-xl border border-dashed border-novum-dark-border p-10 text-center space-y-2">
          <TrendingUp className="h-8 w-8 text-novum-gold/40 mx-auto" />
          <p className="text-sm font-medium text-novum-silver">Tus métricas aparecerán aquí</p>
          <p className="text-xs text-novum-silver-strong">Una vez que publiques tu primer video, podrás ver su rendimiento.</p>
        </div>
      )}
    </div>
  )
}
