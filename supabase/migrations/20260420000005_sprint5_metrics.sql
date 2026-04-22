-- ==========================================================
-- Sprint 5: Métricas y podio de viralidad
-- ==========================================================

-- Vistas en content_ideas para el podio
alter table public.content_ideas
  add column if not exists views_count integer;
