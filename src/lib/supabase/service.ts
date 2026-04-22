import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Solo para uso server-side en API routes y tareas del sistema.
// Nunca exponer al cliente — bypasses RLS.
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
