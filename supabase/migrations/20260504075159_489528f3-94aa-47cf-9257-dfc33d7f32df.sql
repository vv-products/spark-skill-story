
-- Set search_path on the trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- Revoke direct execute from public/anon/authenticated for SECURITY DEFINER funcs
revoke all on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
-- handle_new_user runs via trigger; has_role is called inside RLS policies as definer, no client EXECUTE needed
