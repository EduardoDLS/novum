'use client'

import { useTransition } from 'react'
import { LogOut } from 'lucide-react'
import { logoutAction } from '@/app/(auth)/actions'

export function SignOutButton() {
  const [pending, startTransition] = useTransition()

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => logoutAction())}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-novum-silver hover:bg-white/[0.05] hover:text-destructive transition-colors disabled:opacity-50"
    >
      <LogOut className="h-[15px] w-[15px] shrink-0" />
      {pending ? 'Saliendo…' : 'Salir'}
    </button>
  )
}
