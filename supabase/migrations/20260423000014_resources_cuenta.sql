-- Agregar tipo 'cuenta' al enum resource_type
alter type public.resource_type add value if not exists 'cuenta';

-- Agregar campos de credenciales a resources
alter table public.resources
  add column if not exists account_email    text,
  add column if not exists account_password text;
