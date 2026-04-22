import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoginForm } from './login-form'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  return (
    <Card className="shadow-elev-1">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="t-h1">Inicia sesión</CardTitle>
        <CardDescription>
          Accede al panel de producción de Novum.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <LoginForm next={searchParams.next ?? ''} />
        <p className="text-center text-sm text-muted-foreground">
          ¿Eres cliente nuevo?{' '}
          <Link href="/register" className="text-foreground underline underline-offset-4">
            Crear cuenta
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
