-- Políticas de lectura pública para el widget embebible (acceso anónimo)

-- Clientes: anon puede leer por embed_token
drop policy if exists clients_embed_public on public.clients;
create policy clients_embed_public on public.clients
  for select to anon
  using (embed_token is not null);

-- Ideas: anon puede leer ideas de clientes con embed_token activo
drop policy if exists content_ideas_embed_public on public.content_ideas;
create policy content_ideas_embed_public on public.content_ideas
  for select to anon
  using (
    exists (
      select 1 from public.clients c
      where c.id = content_ideas.client_id
        and c.embed_token is not null
    )
  );
