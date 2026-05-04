do $$
begin
  if not exists (select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid where t.typname = 'publish_status' and e.enumlabel = 'in_review') then
    alter type public.publish_status add value 'in_review';
  end if;
end$$;