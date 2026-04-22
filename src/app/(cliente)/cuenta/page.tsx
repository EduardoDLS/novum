import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { ProfileClient } from '@/app/(dashboard)/perfil/profile-client'
import { ChangePassword } from './change-password'
import { ClientContextForm } from '@/app/(dashboard)/clientes/[clientId]/client-context-form'

export const dynamic = 'force-dynamic'

export default async function ClientePerfilPage() {
  const { profile, user } = await requireRole(['cliente'])
  const supabase = createClient()

  const { data: clientData } = await supabase
    .from('clients')
    .select('id, name, instagram_handle, followers_count, niche, voice_tone, content_pillars, bio_context, communication_style, signature_phrases')
    .eq('profile_id', profile.id)
    .single()

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

      {clientData && (
        <div className="rounded-xl border border-novum-dark-border bg-novum-dark-raised p-6 shadow-elev-2">
          <ClientContextForm
            clientId={clientData.id}
            name={clientData.name}
            instagramHandle={clientData.instagram_handle}
            followersCount={clientData.followers_count}
            niche={clientData.niche}
            voiceTone={clientData.voice_tone}
            contentPillars={clientData.content_pillars ?? []}
            bioContext={clientData.bio_context}
            communicationStyle={clientData.communication_style}
            signaturePhrases={clientData.signature_phrases}
          />
        </div>
      )}
    </div>
  )
}
