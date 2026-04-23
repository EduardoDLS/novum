import Link from 'next/link'
import { LoginForm } from '../login/login-form'

export default function PortalPage({
  searchParams,
}: {
  searchParams: { registered?: string }
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="t-h1">Bienvenido a tu portal</h1>
        <p className="text-sm text-muted-foreground">
          Inicia sesión para ver el estado de tu producción.
        </p>
      </div>
      {searchParams.registered && (
        <div className="rounded-md border border-kanban-grabacion/30 bg-kanban-grabacion/10 px-4 py-3 text-sm text-kanban-grabacion text-center">
          Cuenta creada. Ya puedes iniciar sesión.
        </div>
      )}
      <LoginForm next="" />
      <p className="text-center text-sm text-muted-foreground">
        ¿Primera vez?{' '}
        <Link href="/portal/registro" className="text-foreground underline underline-offset-4">
          Crear cuenta
        </Link>
      </p>
    </div>
  )
}
