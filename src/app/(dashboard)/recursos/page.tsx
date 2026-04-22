import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { RESOURCE_TYPE_LABEL } from '@/types/novum'
import type { ResourceType } from '@/types/novum'
import { ResourcesClient } from './resources-client'

export const dynamic = 'force-dynamic'

export default async function RecursosPage({
  searchParams,
}: {
  searchParams: { type?: string; client_id?: string }
}) {
  await requireRole(['admin', 'editor', 'guionista'])
  const supabase = createClient()

  const [{ data: resources }, { data: clients }] = await Promise.all([
    supabase
      .from('resources')
      .select('id, client_id, name, type, url, tags, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('id, name')
      .order('name'),
  ])

  const rows = (resources ?? []) as {
    id: string
    client_id: string | null
    name: string
    type: ResourceType
    url: string
    tags: string[]
    created_at: string
  }[]

  const clientRows = (clients ?? []) as { id: string; name: string }[]

  // Filtros
  const typeFilter = searchParams.type as ResourceType | undefined
  const clientFilter = searchParams.client_id

  const filtered = rows.filter((r) => {
    if (typeFilter && r.type !== typeFilter) return false
    if (clientFilter === 'global' && r.client_id !== null) return false
    if (clientFilter && clientFilter !== 'global' && r.client_id !== clientFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="t-h1">Hub de Recursos</h2>
        <p className="text-sm text-muted-foreground">
          Plantillas, referencias y assets para tus clientes.
        </p>
      </header>

      <ResourcesClient
        resources={filtered}
        clients={clientRows}
        typeFilter={typeFilter}
        clientFilter={clientFilter}
        typeLabels={RESOURCE_TYPE_LABEL}
      />
    </div>
  )
}
