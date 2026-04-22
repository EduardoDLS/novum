import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RegisterForm } from './register-form'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function RegisterPage() {
  return (
    <Card className="shadow-elev-1">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="t-h1">Crear cuenta</CardTitle>
        <CardDescription>
          Crea tu cuenta y elige tu rol en Novum.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-foreground underline underline-offset-4">
            Iniciar sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
