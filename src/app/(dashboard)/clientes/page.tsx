import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Instagram, Users } from 'lucide-react'
import { NewClientForm } from './new-client-form'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  await requireRole(['admin', 'editor', 'guionista'])
  const supabase = createClient()

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, instagram_handle, followers_count, niche, content_ideas(status)')
    .order('name')

  type ClientRow = {
    id: string
    name: string
    instagram_handle: string | null
    followers_count: number | null
    niche: string | null
    content_ideas: { status: string }[]
  }

  const rows = (clients ?? []) as unknown as ClientRow[]

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="t-h1">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            {rows.length} cliente{rows.length !== 1 ? 's' : ''} registrado{rows.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <NewClientForm />
      </header>

      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aún no hay clientes. Se crean automáticamente cuando alguien se registra con rol cliente.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((client) => {
          const activos = client.content_ideas.filter(
            (i) => i.status !== 'publicado',
          ).length
          const publicados = client.content_ideas.filter(
            (i) => i.status === 'publicado',
          ).length

          return (
            <Link
              key={client.id}
              href={`/clientes/${client.id}`}
              className="group rounded-lg border border-border bg-card p-5 shadow-elev-1 transition-colors hover:border-novum-silver-strong"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <h3 className="font-medium truncate text-foreground">{client.name}</h3>
                  {client.instagram_handle && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Instagram className="h-3 w-3" />
                      @{client.instagram_handle}
                    </div>
                  )}
                  {client.niche && (
                    <p className="text-xs text-muted-foreground truncate">{client.niche}</p>
                  )}
                </div>
                {client.followers_count != null && (
                  <div className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {client.followers_count.toLocaleString('es-MX')}
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-4 border-t border-border pt-3">
                <div className="text-center">
                  <p className="t-metric text-2xl">{activos}</p>
                  <p className="t-label text-muted-foreground">En producción</p>
                </div>
                <div className="text-center">
                  <p className="t-metric text-2xl">{publicados}</p>
                  <p className="t-label text-muted-foreground">Publicados</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
