-- ==========================================================
-- Sprint 3: Pipeline IA — tabla scripts + contexto cliente
-- ==========================================================

-- ─── Columnas de contexto IA en clients ──────────────────
alter table public.clients
  add column if not exists niche            text,
  add column if not exists voice_tone       text,
  add column if not exists content_pillars  text[] default '{}';

-- ─── Enum de estado del guion ────────────────────────────
do $$ begin
  create type public.script_status as enum (
    'borrador', 'aprobado', 'rechazado'
  );
exception
  when duplicate_object then null;
end $$;

-- ─── Tabla scripts ────────────────────────────────────────
create table if not exists public.scripts (
  id                uuid primary key default gen_random_uuid(),
  content_idea_id   uuid not null references public.content_ideas(id) on delete cascade,
  client_id         uuid not null references public.clients(id) on delete cascade,
  raw_idea          text not null,
  strategic_vision  text,
  script_content    jsonb,
  status            public.script_status not null default 'borrador',
  rejection_note    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists scripts_content_idea_id_idx on public.scripts(content_idea_id);
create index if not exists scripts_client_id_idx       on public.scripts(client_id);
create index if not exists scripts_status_idx          on public.scripts(status);

create trigger scripts_set_updated_at
  before update on public.scripts
  for each row execute function public.set_updated_at();

-- Ahora que scripts existe, agrega la FK en content_ideas
alter table public.content_ideas
  add constraint content_ideas_script_id_fk
  foreign key (script_id) references public.scripts(id) on delete set null;

-- ─── RLS ─────────────────────────────────────────────────
alter table public.scripts enable row level security;

-- El cliente puede leer sus propios guiones.
drop policy if exists scripts_select_own on public.scripts;
create policy scripts_select_own on public.scripts
  for select using (
    exists (
      select 1 from public.clients c
      where c.id = scripts.client_id
        and c.profile_id = auth.uid()
    )
  );

-- Los internos tienen control total.
drop policy if exists scripts_internal_all on public.scripts;
create policy scripts_internal_all on public.scripts
  for all using (public.is_internal()) with check (public.is_internal());

-- El sistema (service_role) puede insertar y actualizar sin restricción.
-- service_role bypasses RLS automáticamente.
