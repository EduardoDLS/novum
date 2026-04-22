import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { TeamClient } from './team-client'
import type { UserRole } from '@/types/novum'

export const dynamic = 'force-dynamic'

export default async function EquipoPage() {
  const { profile: me } = await requireRole(['admin'])
  const supabase = createClient()

  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url, created_at')
    .in('role', ['admin', 'editor', 'guionista'])
    .order('created_at')

  type MemberRow = { id: string; full_name: string | null; role: UserRole; avatar_url: string | null; created_at: string }
  const rows = (members ?? []) as MemberRow[]

  return (
    <div className="space-y-6 max-w-2xl">
      <header className="space-y-1">
        <h2 className="t-h1">Equipo</h2>
        <p className="text-sm text-muted-foreground">Gestiona los miembros internos y sus roles.</p>
      </header>
      <TeamClient members={rows} currentUserId={me.id} />
    </div>
  )
}
