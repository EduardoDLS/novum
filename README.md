# Novum

Plataforma de gestión de contenido para agencias creativas.

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (PostgreSQL + Auth + RLS)
- Tailwind CSS + shadcn/ui
- Claude API (Sprint 3)

## Estado

**Sprint 1 listo** — Auth con roles (`admin`, `editor`, `guionista`, `cliente`), tabla `profiles` con RLS, middleware de rutas por rol, layouts separados para equipo interno y portal cliente.

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear proyecto en Supabase

1. Crea un proyecto en https://supabase.com
2. Copia `Project URL`, `anon key` y `service_role key` de **Project Settings → API**
3. Crea `.env.local` copiando `.env.example`:

```bash
cp .env.example .env.local
```

### 3. Correr la migración

Opción A — desde el SQL editor de Supabase:
1. Abre `supabase/migrations/20260419000001_init_profiles.sql`
2. Pégalo en el SQL editor y ejecuta

Opción B — con Supabase CLI local:

```bash
npx supabase link --project-ref <tu-project-ref>
npx supabase db push
```

### 4. Promover un usuario a admin

1. Ir a `/register` y crear la primera cuenta (queda como `cliente`)
2. En el SQL editor de Supabase:

```sql
update public.profiles
set role = 'admin'
where id = '<uuid del usuario>';
```

### 5. Arrancar el servidor

```bash
npm run dev
```

- `http://localhost:3000/login` — iniciar sesión
- Roles internos (`admin` / `editor` / `guionista`) → se redirigen a `/hub-edicion`
- Rol `cliente` → se redirige a `/kanban`

## Estructura

```
src/
  app/
    (auth)/          login, register, server actions
    (dashboard)/     equipo interno (hub-edicion, clientes, scripts, recursos)
    (cliente)/       portal cliente (kanban, calendario)
    auth/callback/   OAuth callback
    page.tsx         redirect según rol
    layout.tsx       root
  components/
    ui/              shadcn/ui (button, input, label, card)
    nav/             sign-out-button
  lib/
    supabase/        client / server / middleware helpers
    auth.ts          requireUser / requireRole
    utils.ts         cn()
  types/
    novum.ts         UserRole, Profile, homeForRole
    database.ts      tipos de Supabase (reemplazar con `supabase gen types`)
  middleware.ts      matcher + updateSession

supabase/
  migrations/        SQL de Sprint 1 (profiles + RLS)
  seed.sql           notas para promover el primer admin
```

## Próximos sprints

| Sprint | Entregable |
| ------ | ---------- |
| 2 | Kanban del cliente (5 columnas) + Baby Idea form |
| 3 | Integración Claude API (guiones) + cola de revisión |
| 4 | Hub de Edición con calendario y entregas |
| 5 | Perfiles de cliente con métricas y podio de viralidad |
| 6 | Hub de Recursos + widget embebible + pulido UI |
