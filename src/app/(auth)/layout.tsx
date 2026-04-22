import { Wordmark } from '@/components/brand/wordmark'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.06) 0%, transparent 60%), #0E1013' }}>
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <Wordmark className="h-6 w-auto text-novum-warm" />
        </div>
        <div className="rounded-xl border border-novum-dark-border bg-novum-charcoal-raised shadow-elev-3 p-8">
          {children}
        </div>
      </div>
      <p className="mt-8 text-xs text-novum-silver-strong">Novum Agency · Plataforma interna</p>
    </div>
  )
}
