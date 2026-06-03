-- Bucket público para imágenes de premios
insert into storage.buckets (id, name, public)
values ('prize-images', 'prize-images', true)
on conflict (id) do nothing;

-- Lectura pública (landing page)
create policy "prize_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'prize-images');

-- Solo usuarios autenticados pueden subir
create policy "prize_images_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'prize-images');

-- Solo usuarios autenticados pueden eliminar
create policy "prize_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'prize-images');
