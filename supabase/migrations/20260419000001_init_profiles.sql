-- Sprint 1: perfiles y roles
-- Extiende auth.users con una tabla `profiles` que guarda rol y datos de equipo/cliente.

create type public.user_role as enum ('admin', 'editor', 'guionista', 'cliente');

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        public.user_role not null default 'cliente',
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

-- Trigger: cuando nace un usuario en auth.users se crea su profile con rol por defecto.
-- El rol se puede pasar por `raw_user_meta_data.role` al registrarse; si no, queda como 'cliente'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'cliente'
    ),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger de updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Helper security-definer: checa admin sin disparar RLS sobre profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

-- RLS
alter table public.profiles enable row level security;

-- Cada usuario ve su propio profile
create policy "profile_self_select"
  on public.profiles for select
  using (auth.uid() = id);

-- Los admins ven todos
create policy "profile_admin_select"
  on public.profiles for select
  using (public.is_admin());

-- Cada usuario puede actualizar su propio profile.
-- Nota: evitar role-escalation se maneja con un trigger o vía admin-only update.
create policy "profile_self_update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Los admins pueden actualizar cualquier profile (incluyendo role)
create policy "profile_admin_update"
  on public.profiles for update
  using (public.is_admin());

-- Sólo admins pueden borrar profiles
create policy "profile_admin_delete"
  on public.profiles for delete
  using (public.is_admin());
