-- Sprint 8: notas del cliente en scripts
alter table public.scripts
  add column if not exists client_notes text;
