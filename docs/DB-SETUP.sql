-- =====================================================================
-- SEMENTA — portable backend setup (structure only, no data)
-- =====================================================================
-- Paste this whole file into another Lovable project's chat and ask it to
-- run it as a database migration. It recreates every custom type, table,
-- grant, row-level-security policy, database function, trigger and storage
-- bucket this app needs.
--
-- Notes
--  * No rows are inserted. The Studio/CMS starts empty and the FIRST user
--    who signs up is automatically granted the admin + editor roles by the
--    handle_new_user() trigger below.
--  * There are no edge functions in this project — all backend logic is
--    either in the database functions below or in the app's own server code.
--  * Auth settings to match manually in the target project:
--      - email + password sign-in enabled
--      - Google sign-in enabled (configure the Google provider)
--      - anonymous sign-ups disabled
--  * Every statement is guarded so the file can be re-run safely.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Custom types
-- ---------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('admin', 'editor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.friendship_status as enum ('pending', 'accepted', 'declined');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.layer_type as enum ('foundation', 'quiz', 'simulation', 'reflection');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.publish_status as enum ('draft', 'published', 'in_review');
exception when duplicate_object then null; end $$;


-- ---------------------------------------------------------------------
-- 2. Shared helper functions (needed by policies + triggers)
-- ---------------------------------------------------------------------

-- Generic updated_at stamper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end;
$$;

-- Role check. Deliberately also asserts the caller is asking about itself,
-- so a signed-in user can never probe another user's roles.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
set search_path = public
as $$
  select _user_id = auth.uid()
    and exists (
      select 1
      from public.user_roles
      where user_id = _user_id
        and role = _role
    )
$$;


-- ---------------------------------------------------------------------
-- 3. Roles table (separate from profiles — never store roles on profiles)
-- ---------------------------------------------------------------------
create table if not exists public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all    on public.user_roles to service_role;

alter table public.user_roles enable row level security;

drop policy if exists "Users can read their own roles" on public.user_roles;
create policy "Users can read their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 4. Avatars (picker artwork, managed in the CMS)
-- ---------------------------------------------------------------------
create table if not exists public.avatars (
  id         uuid primary key default gen_random_uuid(),
  image_url  text not null,
  position   integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.avatars to anon;
grant select, insert, update, delete on public.avatars to authenticated;
grant all on public.avatars to service_role;

alter table public.avatars enable row level security;

drop policy if exists "Anyone can read avatars" on public.avatars;
create policy "Anyone can read avatars" on public.avatars for select using (true);

drop policy if exists "Editors manage avatars" on public.avatars;
create policy "Editors manage avatars" on public.avatars for all to authenticated
  using (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin'));


-- ---------------------------------------------------------------------
-- 5. Profiles (one row per auth user)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  avatar_config jsonb,
  bio           text,
  age           integer,
  avatar_id     uuid references public.avatars(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone signed in" on public.profiles;
create policy "Profiles are viewable by everyone signed in"
  on public.profiles for select to authenticated using (true);

drop policy if exists "Users insert their own profile" on public.profiles;
create policy "Users insert their own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);


-- ---------------------------------------------------------------------
-- 6. Content hierarchy: pillars > topics > modules > classes > layers
-- ---------------------------------------------------------------------
create table if not exists public.pillars (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  title      text not null,
  subtitle   text,
  emoji      text,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.topics (
  id         uuid primary key default gen_random_uuid(),
  pillar_id  uuid not null references public.pillars(id) on delete cascade,
  slug       text not null,
  title      text not null,
  subtitle   text,
  position   integer not null default 0,
  age_groups text[] not null default array['Explorer','Builder','Leader'],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pillar_id, slug)
);

create table if not exists public.modules (
  id         uuid primary key default gen_random_uuid(),
  topic_id   uuid not null references public.topics(id) on delete cascade,
  slug       text not null,
  title      text not null,
  subtitle   text,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (topic_id, slug)
);

create table if not exists public.classes (
  id                uuid primary key default gen_random_uuid(),
  module_id         uuid not null references public.modules(id) on delete cascade,
  slug              text not null,
  title             text not null,
  subtitle          text,
  hero_image_url    text,
  estimated_minutes integer default 5,
  position          integer not null default 0,
  status            public.publish_status not null default 'draft',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (module_id, slug)
);

create table if not exists public.layers (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references public.classes(id) on delete cascade,
  position   integer not null default 0,
  type       public.layer_type not null,
  title      text not null,
  config     jsonb not null default '{}'::jsonb,
  xp_reward  integer not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists layers_class_id_position_idx on public.layers (class_id, "position");

-- Grants + RLS for all five content tables: world-readable, editor-writable.
do $$
declare t text;
begin
  foreach t in array array['pillars','topics','modules','classes','layers'] loop
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "Read %s" on public.%I', t, t);
    execute format('create policy "Read %s" on public.%I for select using (true)', t, t);

    execute format('drop policy if exists "Editors manage %s" on public.%I', t, t);
    execute format($f$create policy "Editors manage %s" on public.%I for all to authenticated
      using (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin'))
      with check (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin'))$f$, t, t);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 7. Progress + XP
-- ---------------------------------------------------------------------
create table if not exists public.class_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  class_id     uuid not null references public.classes(id) on delete cascade,
  completed_at timestamptz,
  xp_earned    integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, class_id)
);

grant select, insert, update on public.class_progress to authenticated;
grant all on public.class_progress to service_role;

alter table public.class_progress enable row level security;

drop policy if exists "Users read own progress" on public.class_progress;
create policy "Users read own progress" on public.class_progress
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users write own progress" on public.class_progress;
create policy "Users write own progress" on public.class_progress
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users update own progress" on public.class_progress;
create policy "Users update own progress" on public.class_progress
  for update to authenticated using (auth.uid() = user_id);


create table if not exists public.xp_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  class_id   uuid references public.classes(id) on delete set null,
  layer_id   uuid references public.layers(id) on delete set null,
  source     text not null,
  amount     integer not null,
  created_at timestamptz not null default now()
);

grant select, insert on public.xp_events to authenticated;
grant all on public.xp_events to service_role;

alter table public.xp_events enable row level security;

drop policy if exists "Users read own xp" on public.xp_events;
create policy "Users read own xp" on public.xp_events
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users write own xp" on public.xp_events;
create policy "Users write own xp" on public.xp_events
  for insert to authenticated with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 8. Social: friendships + friend codes
-- ---------------------------------------------------------------------
create table if not exists public.friendships (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status       public.friendship_status not null default 'pending',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint friendships_distinct check (requester_id <> addressee_id)
);

create unique index if not exists friendships_unique_pair
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists friendships_requester_idx on public.friendships (requester_id);
create index if not exists friendships_addressee_idx on public.friendships (addressee_id);

grant select, insert, update, delete on public.friendships to authenticated;
grant all on public.friendships to service_role;

alter table public.friendships enable row level security;

drop policy if exists "Read own friendships" on public.friendships;
create policy "Read own friendships" on public.friendships for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "Send friend request" on public.friendships;
create policy "Send friend request" on public.friendships for insert to authenticated
  with check (auth.uid() = requester_id);

drop policy if exists "Update own friendship" on public.friendships;
create policy "Update own friendship" on public.friendships for update to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "Delete own friendship" on public.friendships;
create policy "Delete own friendship" on public.friendships for delete to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);


create table if not exists public.friend_codes (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  code       text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.friend_codes to authenticated;
grant all on public.friend_codes to service_role;

alter table public.friend_codes enable row level security;

drop policy if exists "Authenticated can read codes" on public.friend_codes;
create policy "Authenticated can read codes" on public.friend_codes
  for select to authenticated using (true);

drop policy if exists "Users insert their own code" on public.friend_codes;
create policy "Users insert their own code" on public.friend_codes
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users update their own code" on public.friend_codes;
create policy "Users update their own code" on public.friend_codes
  for update to authenticated using (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 9. Welcome cards (home screen hero, managed in the CMS)
-- ---------------------------------------------------------------------
create table if not exists public.welcome_cards (
  id              uuid primary key default gen_random_uuid(),
  hero_image_url  text,
  headline        text not null,
  subtitle        text,
  cta_label       text not null default 'Start →',
  cta_destination text not null default '/',
  active          boolean not null default true,
  position        integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

grant select on public.welcome_cards to anon;
grant select, insert, update, delete on public.welcome_cards to authenticated;
grant all on public.welcome_cards to service_role;

alter table public.welcome_cards enable row level security;

drop policy if exists "Anyone can read welcome cards" on public.welcome_cards;
create policy "Anyone can read welcome cards" on public.welcome_cards for select using (true);

drop policy if exists "Editors manage welcome cards" on public.welcome_cards;
create policy "Editors manage welcome cards" on public.welcome_cards for all to authenticated
  using (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin'));


-- ---------------------------------------------------------------------
-- 10. Mission authoring: crosswords
-- ---------------------------------------------------------------------
create table if not exists public.mission_crosswords (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  title      text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mission_crossword_variants (
  id           uuid primary key default gen_random_uuid(),
  crossword_id uuid not null references public.mission_crosswords(id) on delete cascade,
  difficulty   text not null check (difficulty in ('easy','medium','hard')),
  label        text not null,
  rows         integer not null default 5,
  cols         integer not null default 6,
  xp_reward    integer not null default 50,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (crossword_id, difficulty)
);

create table if not exists public.mission_crossword_words (
  id         uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.mission_crossword_variants(id) on delete cascade,
  number     integer not null,
  direction  text not null check (direction in ('A','D')),
  row        integer not null,
  col        integer not null,
  answer     text not null,
  clue       text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_xword_words_variant on public.mission_crossword_words (variant_id);


-- ---------------------------------------------------------------------
-- 11. Mission authoring: quizzes
-- ---------------------------------------------------------------------
create table if not exists public.mission_quizzes (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  pace           text not null check (pace in ('self-paced','quick')),
  base_xp        integer not null default 25,
  per_right_xp   integer not null default 5,
  time_limit_sec integer,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.mission_quiz_questions (
  id         uuid primary key default gen_random_uuid(),
  quiz_id    uuid not null references public.mission_quizzes(id) on delete cascade,
  position   integer not null default 0,
  prompt     text not null,
  explain    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mission_quiz_choices (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.mission_quiz_questions(id) on delete cascade,
  position    integer not null default 0,
  label       text not null,
  is_correct  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_quiz_q_quiz on public.mission_quiz_questions (quiz_id);
create index if not exists idx_quiz_choice_q on public.mission_quiz_choices (question_id);

-- Grants + RLS for all six mission-authoring tables: world-readable, editor-writable.
do $$
declare t text; label text;
begin
  foreach t in array array[
    'mission_crosswords','mission_crossword_variants','mission_crossword_words',
    'mission_quizzes','mission_quiz_questions','mission_quiz_choices'
  ] loop
    label := replace(t, 'mission_', '');
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "Read %s" on public.%I', label, t);
    execute format('create policy "Read %s" on public.%I for select using (true)', label, t);

    execute format('drop policy if exists "Editors manage %s" on public.%I', label, t);
    execute format($f$create policy "Editors manage %s" on public.%I for all to authenticated
      using (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin'))
      with check (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin'))$f$, label, t);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 12. Application functions (leaderboards, XP breakdown, friend lookup)
-- ---------------------------------------------------------------------

-- Global leaderboard. Ranks by level, then stars, then total XP.
-- Admins/editors are excluded so staff accounts don't sit at the top.
create or replace function public.get_leaderboard(_limit integer default 20)
returns table (
  user_id uuid, display_name text, avatar_config jsonb, avatar_image_url text,
  age integer, bio text, total_xp bigint, level integer, stars bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id, p.display_name, p.avatar_config, a.image_url, p.age, p.bio,
    coalesce(sum(x.amount), 0)::bigint as total_xp,
    (floor(coalesce(sum(x.amount), 0) / 100.0) + 1)::int as level,
    count(x.id)::bigint as stars
  from public.profiles p
  left join public.avatars a on a.id = p.avatar_id
  left join public.xp_events x on x.user_id = p.id
  where not exists (
    select 1 from public.user_roles ur
    where ur.user_id = p.id and ur.role in ('admin'::app_role, 'editor'::app_role)
  )
  group by p.id, a.image_url
  order by level desc, stars desc, total_xp desc, p.display_name asc nulls last
  limit greatest(_limit, 1);
$$;

-- Friends-only leaderboard (the caller plus accepted friends).
create or replace function public.get_friend_leaderboard(_limit integer default 50)
returns table (
  user_id uuid, display_name text, avatar_config jsonb, avatar_image_url text,
  age integer, bio text, total_xp bigint, level integer, stars bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with me as (select auth.uid() as uid),
  friend_ids as (
    select (select uid from me) as id
    union
    select case when f.requester_id = (select uid from me) then f.addressee_id else f.requester_id end
    from public.friendships f, me
    where f.status = 'accepted'
      and ((select uid from me) in (f.requester_id, f.addressee_id))
  )
  select
    p.id, p.display_name, p.avatar_config, a.image_url, p.age, p.bio,
    coalesce(sum(x.amount), 0)::bigint as total_xp,
    (floor(coalesce(sum(x.amount), 0) / 100.0) + 1)::int as level,
    count(x.id)::bigint as stars
  from public.profiles p
  join friend_ids fi on fi.id = p.id
  left join public.avatars a on a.id = p.avatar_id
  left join public.xp_events x on x.user_id = p.id
  group by p.id, a.image_url
  order by level desc, stars desc, total_xp desc, p.display_name asc nulls last
  limit greatest(_limit, 1);
$$;

-- XP breakdown per source (used by the leaderboard drill-down drawer).
create or replace function public.get_user_xp_breakdown(_user_id uuid)
returns table (source text, events bigint, total_xp bigint)
language sql
stable
security definer
set search_path = public
as $$
  select x.source, count(*)::bigint as events, coalesce(sum(x.amount),0)::bigint as total_xp
  from public.xp_events x
  where x.user_id = _user_id
  group by x.source
  order by total_xp desc;
$$;

-- Resolve a friend code to a minimal public profile card.
create or replace function public.lookup_friend_code(_code text)
returns table (user_id uuid, display_name text, avatar_image_url text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.display_name, a.image_url
  from public.friend_codes fc
  join public.profiles p on p.id = fc.user_id
  left join public.avatars a on a.id = p.avatar_id
  where upper(fc.code) = upper(_code)
  limit 1;
$$;

grant execute on function public.get_leaderboard(integer)          to anon, authenticated;
grant execute on function public.get_friend_leaderboard(integer)   to authenticated;
grant execute on function public.get_user_xp_breakdown(uuid)       to authenticated;
grant execute on function public.lookup_friend_code(text)          to authenticated;
grant execute on function public.has_role(uuid, public.app_role)   to anon, authenticated;


-- ---------------------------------------------------------------------
-- 13. New-user bootstrap
-- ---------------------------------------------------------------------
-- Creates the profile row on signup. The very first account also becomes
-- admin + editor. Invited accounts can be pre-tagged with an invited_role
-- in their signup metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first boolean;
  invited_role text;
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  select count(*) = 0 into is_first from public.user_roles;
  if is_first then
    insert into public.user_roles (user_id, role) values (new.id, 'admin'), (new.id, 'editor')
    on conflict do nothing;
  end if;

  invited_role := new.raw_user_meta_data->>'invited_role';
  if invited_role = 'editor' then
    insert into public.user_roles (user_id, role) values (new.id, 'editor')
    on conflict do nothing;
  elsif invited_role = 'admin' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin'), (new.id, 'editor')
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------
-- 14. updated_at triggers
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'avatars','class_progress','classes','friend_codes','friendships','layers',
    'mission_crossword_variants','mission_crosswords','mission_quiz_questions',
    'mission_quizzes','modules','pillars','profiles','topics','welcome_cards'
  ] loop
    execute format('drop trigger if exists set_updated_at_%s on public.%I', t, t);
    execute format(
      'create trigger set_updated_at_%s before update on public.%I for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 15. Storage buckets + policies
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true),
  ('class-hero', 'class-hero', true),
  ('welcome-cards', 'welcome-cards', true)
on conflict (id) do update set public = true;

-- Public read on all three buckets; only editors/admins may write.
do $$
declare b text;
begin
  foreach b in array array['avatars','class-hero','welcome-cards'] loop
    execute format('drop policy if exists "Public read %s bucket" on storage.objects', b);
    execute format(
      'create policy "Public read %s bucket" on storage.objects for select using (bucket_id = %L)', b, b);

    execute format('drop policy if exists "Editors upload %s bucket" on storage.objects', b);
    execute format($f$create policy "Editors upload %s bucket" on storage.objects
      for insert to authenticated
      with check (bucket_id = %L and (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin')))$f$, b, b);

    execute format('drop policy if exists "Editors update %s bucket" on storage.objects', b);
    execute format($f$create policy "Editors update %s bucket" on storage.objects
      for update to authenticated
      using (bucket_id = %L and (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin')))$f$, b, b);

    execute format('drop policy if exists "Editors delete %s bucket" on storage.objects', b);
    execute format($f$create policy "Editors delete %s bucket" on storage.objects
      for delete to authenticated
      using (bucket_id = %L and (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin')))$f$, b, b);
  end loop;
end $$;

-- =====================================================================
-- End of setup.
-- =====================================================================
