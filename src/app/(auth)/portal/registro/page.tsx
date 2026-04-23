'use client'

import Link from 'next/link'
import { useFormState, useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerClienteAction, type FormState } from '../../actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creando cuenta…' : 'Crear cuenta'}
    </Button>
  )
}

export default function PortalRegistroPage() {
  const [state, formAction] = useFormState<FormState, FormData>(registerClienteAction, undefined)

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="t-h1">Crea tu cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Accede a tu portal de producción.
        </p>
      </div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nombre completo</Label>
          <Input id="full_name" name="full_name" required placeholder="Tu nombre" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="tu@email.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </div>
        {state?.error && (
          <p className="text-sm text-destructive" role="alert">{state.error}</p>
        )}
        <SubmitButton />
      </form>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/portal" className="text-foreground underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
