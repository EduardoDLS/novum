-- Agrega el estado 'revision' (revisión WhatsApp) entre 'edicion' y 'publicado'
-- IMPORTANTE: En PostgreSQL, ADD VALUE no puede ejecutarse dentro de una transacción.
-- Ejecutar este script directamente en el SQL Editor de Supabase.

ALTER TYPE public.content_status ADD VALUE IF NOT EXISTS 'revision' AFTER 'edicion';
