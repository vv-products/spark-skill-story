insert into storage.buckets (id, name, public)
values ('class-hero', 'class-hero', true)
on conflict (id) do nothing;

create policy "Public read class hero images"
  on storage.objects for select
  using (bucket_id = 'class-hero');

create policy "Editors upload class hero images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'class-hero'
    and (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin')));

create policy "Editors update class hero images"
  on storage.objects for update to authenticated
  using (bucket_id = 'class-hero'
    and (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin')));

create policy "Editors delete class hero images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'class-hero'
    and (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin')));