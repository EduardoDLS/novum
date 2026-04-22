-- ==========================================================
-- Sprint 4: Hub de Edición — tabla deliveries
-- ==========================================================

do $$ begin
  create type public.delivery_status as enum (
    'pendiente', 'en_progreso', 'entregado', 'publicado'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.deliveries (
  id                uuid primary key default gen_random_uuid(),
  content_idea_id   uuid references public.content_ideas(id) on delete set null,
  client_id         uuid not null references public.clients(id) on delete cascade,
  editor_id         uuid references public.profiles(id) on delete set null,
  delivery_date     date not null,
  status            public.delivery_status not null default 'pendiente',
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists deliveries_delivery_date_idx   on public.deliveries(delivery_date);
create index if not exists deliveries_client_id_idx       on public.deliveries(client_id);
create index if not exists deliveries_editor_id_idx       on public.deliveries(editor_id);
create index if not exists deliveries_status_idx          on public.deliveries(status);

create trigger deliveries_set_updated_at
  before update on public.deliveries
  for each row execute function public.set_updated_at();

-- ─── RLS ─────────────────────────────────────────────────
alter table public.deliveries enable row level security;

-- El cliente ve solo sus propias entregas.
drop policy if exists deliveries_select_own on public.deliveries;
create policy deliveries_select_own on public.deliveries
  for select using (
    exists (
      select 1 from public.clients c
      where c.id = deliveries.client_id
        and c.profile_id = auth.uid()
    )
  );

-- Los internos tienen control total.
drop policy if exists deliveries_internal_all on public.deliveries;
create policy deliveries_internal_all on public.deliveries
  for all using (public.is_internal()) with check (public.is_internal());
