import { LoginForm } from '../login/login-form'

export default function PortalPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="t-h1">Bienvenido a tu portal</h1>
        <p className="text-sm text-muted-foreground">
          Inicia sesión para ver el estado de tu producción.
        </p>
      </div>
      <LoginForm next="" />
    </div>
  )
}
