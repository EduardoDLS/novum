-- ==========================================================
-- Sprint 2: Kanban del cliente
-- Tablas: clients, content_ideas
-- Trigger: auto-crear clients cuando profile.role='cliente'
-- RLS: cliente ve/edita solo lo suyo; internos todo
-- ==========================================================

-- Helper: rol interno (admin | editor | guionista).
-- Usa SECURITY DEFINER para evitar recursión como public.is_admin().
create or replace function public.is_internal()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'editor', 'guionista')
  )
$$;

-- ─── Enum de estado kanban ────────────────────────────────
do $$ begin
  create type public.content_status as enum (
    'baby_idea', 'guionizar', 'grabacion', 'edicion', 'publicado'
  );
exception
  when duplicate_object then null;
end $$;

-- ─── Tabla clients ────────────────────────────────────────
create table if not exists public.clients (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid unique references public.profiles(id) on delete cascade,
  name              text not null,
  instagram_handle  text,
  bio_context       text,
  followers_count   integer,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- ─── Tabla content_ideas ──────────────────────────────────
create table if not exists public.content_ideas (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients(id) on delete cascade,
  title         text not null,
  status        public.content_status not null default 'baby_idea',
  assigned_to   uuid references public.profiles(id) on delete set null,
  script_id     uuid,
  publish_date  date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists content_ideas_client_id_idx on public.content_ideas(client_id);
create index if not exists content_ideas_status_idx    on public.content_ideas(status);

create trigger content_ideas_set_updated_at
  before update on public.content_ideas
  for each row execute function public.set_updated_at();

-- ─── Trigger: auto-crear clients cuando un profile es 'cliente' ─
create or replace function public.handle_new_client_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'cliente' then
    insert into public.clients (profile_id, name)
    values (new.id, coalesce(new.full_name, (select email from auth.users where id = new.id), 'Cliente'))
    on conflict (profile_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_created_client on public.profiles;
create trigger on_profile_created_client
  after insert on public.profiles
  for each row execute function public.handle_new_client_profile();

-- Backfill: crear clients para cada profile existente con role='cliente'
insert into public.clients (profile_id, name)
select p.id, coalesce(p.full_name, u.email, 'Cliente')
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'cliente'
  and not exists (select 1 from public.clients c where c.profile_id = p.id);

-- ==========================================================
-- RLS
-- ==========================================================

alter table public.clients        enable row level security;
alter table public.content_ideas  enable row level security;

-- clients: el cliente ve y actualiza su propio registro.
drop policy if exists clients_select_own on public.clients;
create policy clients_select_own on public.clients
  for select using (profile_id = auth.uid());

drop policy if exists clients_update_own on public.clients;
create policy clients_update_own on public.clients
  for update using (profile_id = auth.uid());

-- clients: los internos ven y gestionan todo.
drop policy if exists clients_internal_all on public.clients;
create policy clients_internal_all on public.clients
  for all using (public.is_internal()) with check (public.is_internal());

-- content_ideas: el cliente ve sus propias ideas (join por clients.profile_id).
drop policy if exists content_ideas_select_own on public.content_ideas;
create policy content_ideas_select_own on public.content_ideas
  for select using (
    exists (
      select 1 from public.clients c
      where c.id = content_ideas.client_id
        and c.profile_id = auth.uid()
    )
  );

-- content_ideas: el cliente puede crear Baby Ideas sobre su propio client.
drop policy if exists content_ideas_insert_own_baby on public.content_ideas;
create policy content_ideas_insert_own_baby on public.content_ideas
  for insert with check (
    status = 'baby_idea'
    and exists (
      select 1 from public.clients c
      where c.id = content_ideas.client_id
        and c.profile_id = auth.uid()
    )
  );

-- content_ideas: el cliente puede borrar solo las suyas aún en baby_idea.
drop policy if exists content_ideas_delete_own_baby on public.content_ideas;
create policy content_ideas_delete_own_baby on public.content_ideas
  for delete using (
    status = 'baby_idea'
    and exists (
      select 1 from public.clients c
      where c.id = content_ideas.client_id
        and c.profile_id = auth.uid()
    )
  );

-- content_ideas: los internos tienen control total.
drop policy if exists content_ideas_internal_all on public.content_ideas;
create policy content_ideas_internal_all on public.content_ideas
  for all using (public.is_internal()) with check (public.is_internal());
