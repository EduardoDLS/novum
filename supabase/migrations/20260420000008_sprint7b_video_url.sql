-- Sprint 7b: video_url en content_ideas
alter table public.content_ideas
  add column if not exists video_url text;
