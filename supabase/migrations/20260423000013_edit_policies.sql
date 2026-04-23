-- Allow cliente to UPDATE title of their own baby_idea
drop policy if exists content_ideas_update_own_baby on public.content_ideas;
create policy content_ideas_update_own_baby on public.content_ideas
  for update using (
    status = 'baby_idea'
    and exists (
      select 1 from public.clients c
      where c.id = content_ideas.client_id
        and c.profile_id = auth.uid()
    )
  ) with check (
    status = 'baby_idea'
    and exists (
      select 1 from public.clients c
      where c.id = content_ideas.client_id
        and c.profile_id = auth.uid()
    )
  );
