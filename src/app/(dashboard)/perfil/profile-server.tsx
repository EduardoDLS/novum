import { requireUser } from '@/lib/auth'
import { ProfileClient } from './profile-client'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const { profile, user } = await requireUser()

  return (
    <div className="space-y-6 max-w-lg">
      <header className="space-y-1">
        <h2 className="t-h1">Mi perfil</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </header>
      <div className="rounded-lg border border-border bg-card p-6 shadow-elev-1 space-y-6">
        <ProfileClient
          userId={profile.id}
          fullName={profile.full_name}
          avatarUrl={profile.avatar_url}
          role={profile.role}
        />
      </div>
    </div>
  )
}
