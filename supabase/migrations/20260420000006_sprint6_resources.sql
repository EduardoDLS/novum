-- ==========================================================
-- Sprint 6: Hub de Recursos + Widget embebible
-- ==========================================================

-- ─── Token de embed para clientes ────────────────────────
alter table public.clients
  add column if not exists embed_token uuid default gen_random_uuid();

-- Backfill: asignar token a clientes existentes que no tengan
update public.clients set embed_token = gen_random_uuid() where embed_token is null;

-- ─── Enum tipo de recurso ─────────────────────────────────
do $$ begin
  create type public.resource_type as enum (
    'plantilla', 'referencia', 'asset', 'guia'
  );
exception
  when duplicate_object then null;
end $$;

-- ─── Tabla resources ──────────────────────────────────────
create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references public.clients(id) on delete cascade,
  name        text not null,
  type        public.resource_type not null default 'asset',
  url         text not null,
  tags        text[] default '{}',
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists resources_client_id_idx on public.resources(client_id);
create index if not exists resources_type_idx      on public.resources(type);

-- ─── RLS ─────────────────────────────────────────────────
alter table public.resources enable row level security;

-- El cliente ve sus recursos y los globales (client_id null).
drop policy if exists resources_select_own on public.resources;
create policy resources_select_own on public.resources
  for select using (
    client_id is null
    or exists (
      select 1 from public.clients c
      where c.id = resources.client_id
        and c.profile_id = auth.uid()
    )
  );

-- Los internos gestionan todo.
drop policy if exists resources_internal_all on public.resources;
create policy resources_internal_all on public.resources
  for all using (public.is_internal()) with check (public.is_internal());

-- ─── Storage bucket: recursos ────────────────────────────
-- Crear manualmente en Supabase Dashboard:
-- Storage → New bucket → "recursos" → Public: false
-- Policies del bucket (SQL):
--   INSERT: authenticated users with is_internal()
--   SELECT: authenticated users (own client resources)
-- (Ver README del proyecto para los pasos exactos)
