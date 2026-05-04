
-- ============== ENUMS ==============
create type public.app_role as enum ('admin', 'editor');
create type public.layer_type as enum ('foundation', 'quiz', 'simulation', 'reflection');
create type public.publish_status as enum ('draft', 'published');

-- ============== PROFILES ==============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone signed in"
  on public.profiles for select to authenticated using (true);
create policy "Users update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users insert their own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

-- ============== ROLES ==============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create policy "Users can read their own roles"
  on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Admins can read all roles"
  on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============== handle_new_user ==============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============== updated_at helper ==============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- ============== CONTENT: pillars / topics / modules / classes / layers ==============
create table public.pillars (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  emoji text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  pillar_id uuid not null references public.pillars(id) on delete cascade,
  slug text not null,
  title text not null,
  subtitle text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pillar_id, slug)
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  slug text not null,
  title text not null,
  subtitle text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (topic_id, slug)
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null,
  title text not null,
  subtitle text,
  hero_image_url text,
  estimated_minutes int default 5,
  position int not null default 0,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, slug)
);

create table public.layers (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  position int not null default 0,
  type public.layer_type not null,
  title text not null,
  -- Flexible config: questions, video url, branching options, reflection prompts...
  config jsonb not null default '{}'::jsonb,
  xp_reward int not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.layers (class_id, position);

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['profiles','pillars','topics','modules','classes','layers']
  loop
    execute format('create trigger trg_%s_updated before update on public.%s for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- RLS for content
alter table public.pillars enable row level security;
alter table public.topics  enable row level security;
alter table public.modules enable row level security;
alter table public.classes enable row level security;
alter table public.layers  enable row level security;

-- Public read: everyone (signed-in or not) can read published content
-- For simplicity, all rows readable; classes filter by status in app.
create policy "Read pillars" on public.pillars for select using (true);
create policy "Read topics"  on public.topics  for select using (true);
create policy "Read modules" on public.modules for select using (true);
create policy "Read classes" on public.classes for select using (true);
create policy "Read layers"  on public.layers  for select using (true);

-- Editors and admins can manage content
create policy "Editors manage pillars" on public.pillars for all to authenticated
  using (public.has_role(auth.uid(),'editor') or public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'editor') or public.has_role(auth.uid(),'admin'));
create policy "Editors manage topics" on public.topics for all to authenticated
  using (public.has_role(auth.uid(),'editor') or public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'editor') or public.has_role(auth.uid(),'admin'));
create policy "Editors manage modules" on public.modules for all to authenticated
  using (public.has_role(auth.uid(),'editor') or public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'editor') or public.has_role(auth.uid(),'admin'));
create policy "Editors manage classes" on public.classes for all to authenticated
  using (public.has_role(auth.uid(),'editor') or public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'editor') or public.has_role(auth.uid(),'admin'));
create policy "Editors manage layers" on public.layers for all to authenticated
  using (public.has_role(auth.uid(),'editor') or public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'editor') or public.has_role(auth.uid(),'admin'));

-- ============== PLAYER PROGRESS ==============
create table public.class_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  completed_at timestamptz,
  xp_earned int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, class_id)
);
alter table public.class_progress enable row level security;
create trigger trg_class_progress_updated before update on public.class_progress
  for each row execute function public.set_updated_at();

create policy "Users read own progress" on public.class_progress for select to authenticated
  using (auth.uid() = user_id);
create policy "Users write own progress" on public.class_progress for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Users update own progress" on public.class_progress for update to authenticated
  using (auth.uid() = user_id);

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  layer_id uuid references public.layers(id) on delete set null,
  source text not null, -- foundation|quiz|simulation|reflection|bonus
  amount int not null,
  created_at timestamptz not null default now()
);
alter table public.xp_events enable row level security;
create policy "Users read own xp" on public.xp_events for select to authenticated
  using (auth.uid() = user_id);
create policy "Users write own xp" on public.xp_events for insert to authenticated
  with check (auth.uid() = user_id);
