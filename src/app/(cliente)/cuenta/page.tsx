import { requireRole } from '@/lib/auth'
import { ProfileClient } from '@/app/(dashboard)/perfil/profile-client'
import { ChangePassword } from './change-password'

export const dynamic = 'force-dynamic'

export default async function ClientePerfilPage() {
  const { profile, user } = await requireRole(['cliente'])

  return (
    <div className="space-y-6 max-w-lg">
      <header className="space-y-1">
        <h2 className="t-h1">Mi cuenta</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </header>

      <div className="rounded-xl border border-novum-dark-border bg-novum-dark-raised p-6 shadow-elev-2 space-y-6">
        <ProfileClient
          userId={profile.id}
          fullName={profile.full_name}
          avatarUrl={profile.avatar_url}
          role={profile.role}
        />
        <div className="h-px bg-border" />
        <ChangePassword />
      </div>
    </div>
  )
}
