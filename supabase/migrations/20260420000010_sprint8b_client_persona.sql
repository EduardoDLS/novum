-- Sprint 8b: campos de persona para guionización personalizada
alter table public.clients
  add column if not exists communication_style text,
  add column if not exists signature_phrases   text;
