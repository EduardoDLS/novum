-- ==========================================================
-- Sprint 7: Mejoras de flujo + Instagram Analytics
-- ==========================================================

-- ─── Métricas manuales de Instagram en clients ───────────
alter table public.clients
  add column if not exists instagram_photo_url text,
  add column if not exists avg_views_reel      integer,
  add column if not exists engagement_rate     numeric(5,2);

-- ─── Update clients RLS policy para nuevos campos ────────
drop policy if exists clients_update_own on public.clients;
create policy clients_update_own on public.clients
  for update using (public.is_internal())
  with check (public.is_internal());
