-- Ensure layer_type enum has all needed values (no-op if already present)
do $$
begin
  if not exists (select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid where t.typname = 'layer_type' and e.enumlabel = 'simulation') then
    alter type public.layer_type add value 'simulation';
  end if;
  if not exists (select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid where t.typname = 'layer_type' and e.enumlabel = 'reflection') then
    alter type public.layer_type add value 'reflection';
  end if;
end$$;

-- ============ PILLARS ============
insert into public.pillars (slug, title, subtitle, emoji, position) values
  ('inner',  'The Inner World',  'Self-awareness, EQ, growth mindset', '🧠', 1),
  ('social', 'The Social World', 'Empathy, friendships, communication', '🗣️', 2),
  ('action', 'The Action World', 'Courage, focus, decisions, leadership', '⚡', 3),
  ('real',   'The Real World',   'Money, media, body, future skills', '🌍', 4)
on conflict (slug) do nothing;

-- ============ TOPICS ============
-- Inner World
insert into public.topics (pillar_id, slug, title, position)
select p.id, t.slug, t.title, t.pos
from public.pillars p
join (values
  ('self-eq', 'Self-Awareness & EQ', 1),
  ('self-talk', 'Inner Voice & Self-Talk', 2),
  ('values', 'Values & Identity', 3),
  ('growth', 'Growth Mindset', 4),
  ('purpose', 'Purpose & Meaning', 5)
) as t(slug, title, pos) on true
where p.slug = 'inner'
on conflict do nothing;

-- Social World
insert into public.topics (pillar_id, slug, title, position)
select p.id, t.slug, t.title, t.pos
from public.pillars p
join (values
  ('empathy', 'Empathy', 1),
  ('friendships', 'Friendships', 2),
  ('conflict', 'Conflict & Repair', 3),
  ('communication', 'Real Communication', 4),
  ('boundaries', 'Boundaries', 5)
) as t(slug, title, pos) on true
where p.slug = 'social'
on conflict do nothing;

-- Action World
insert into public.topics (pillar_id, slug, title, position)
select p.id, t.slug, t.title, t.pos
from public.pillars p
join (values
  ('courage', 'Courage', 1),
  ('focus', 'Focus & Discipline', 2),
  ('habits', 'Habits That Stick', 3),
  ('decision', 'Decision Making', 4),
  ('leadership', 'Leading Yourself', 5)
) as t(slug, title, pos) on true
where p.slug = 'action'
on conflict do nothing;

-- Real World
insert into public.topics (pillar_id, slug, title, position)
select p.id, t.slug, t.title, t.pos
from public.pillars p
join (values
  ('money', 'Money Sense', 1),
  ('media', 'Media & Attention', 2),
  ('body', 'Body & Energy', 3),
  ('world', 'Understanding the World', 4),
  ('future', 'Future-Self Skills', 5)
) as t(slug, title, pos) on true
where p.slug = 'real'
on conflict do nothing;

-- Add unique constraints to support seed-by-slug under parent
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'topics_pillar_slug_unique') then
    alter table public.topics add constraint topics_pillar_slug_unique unique (pillar_id, slug);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'modules_topic_slug_unique') then
    alter table public.modules add constraint modules_topic_slug_unique unique (topic_id, slug);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'classes_module_slug_unique') then
    alter table public.classes add constraint classes_module_slug_unique unique (module_id, slug);
  end if;
end$$;

-- ============ MODULES (under self-eq) ============
insert into public.modules (topic_id, slug, title, position)
select t.id, m.slug, m.title, m.pos
from public.topics t
join public.pillars p on p.id = t.pillar_id and p.slug = 'inner'
join (values
  ('emotion-fair',     'Meet Your Emotions',     1),
  ('spot-feelings',    'Spot Your Feelings',     2),
  ('name-it',          'Name It to Tame It',     3),
  ('feelings-friends', 'Feelings Have Friends',  4),
  ('feelings-change',  'Feelings Change',        5)
) as m(slug, title, pos) on true
where t.slug = 'self-eq'
on conflict (topic_id, slug) do nothing;

-- ============ CLASSES (under emotion-fair) ============
insert into public.classes (module_id, slug, title, subtitle, position, status)
select m.id, c.slug, c.title, c.subtitle, c.pos, c.status::publish_status
from public.modules m
join public.topics t on t.id = m.topic_id and t.slug = 'self-eq'
join (values
  ('fair-appears', 'The Fair Appears', 'Curiosity', 1, 'published'),
  ('happy-stall',  'The Happy Stall',  'Joy',       2, 'published'),
  ('sad-corner',   'The Sad Corner',   'Sadness',   3, 'draft'),
  ('fear-house',   'The Fear House',   'Fear',      4, 'draft')
) as c(slug, title, subtitle, pos, status) on true
where m.slug = 'emotion-fair'
on conflict (module_id, slug) do nothing;

-- ============ LAYERS ============
-- The Fair Appears
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, l.pos, l.type::layer_type, l.title, l.config::jsonb, l.xp
from public.classes c
join public.modules m on m.id = c.module_id
join (values
  (1, 'foundation',  'Welcome to the Emotion Fair',          '{"taskCode":"T01","videoUrl":"https://cdn.sementa.app/v/fair-appears.mp4","durationSec":90,"characterFocus":["Maya","Leo"],"skipAllowed":false}', 5),
  (2, 'quiz',        'Sort the feelings into the 4 main jars','{"taskCode":"T03","items":[{"label":"A warm hug","bucket":"Happy"},{"label":"Lost toy","bucket":"Sad"}],"buckets":[{"label":"Happy","colour":"#F5A623"},{"label":"Sad","colour":"#1565C0"}],"partialCredit":true,"hintAfter":2,"shuffle":true}', 10),
  (3, 'reflection',  'Spot 3 feelings around your house today','{"taskCode":"T13","title":"Feeling Detective","instruction":"Watch for 3 different feelings in your family today.","missionType":"Observe","windowDays":1,"parentNotice":"Your child is hunting for feelings today!","verifyForBonus":true}', 25),
  (4, 'reflection',  'Which feeling did you notice the most?', '{"taskCode":"T14","prompt":"Which feeling did you notice the most today?","inputType":"Both","journalLabel":"First Fair Visit"}', 10)
) as l(pos, type, title, config, xp) on true
where c.slug = 'fair-appears' and m.slug = 'emotion-fair'
and not exists (select 1 from public.layers x where x.class_id = c.id);

-- The Happy Stall
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, l.pos, l.type::layer_type, l.title, l.config::jsonb, l.xp
from public.classes c
join public.modules m on m.id = c.module_id
join (values
  (1, 'foundation', 'Dash discovers the Happy Stall', '{"taskCode":"T01","videoUrl":"https://cdn.sementa.app/v/happy-stall.mp4","durationSec":75,"characterFocus":["Dash"],"skipAllowed":false}', 5),
  (2, 'quiz',       'True or False — what makes happy GROW?', '{"taskCode":"T04","questions":[{"prompt":"Sharing happy feelings makes them grow.","correct":"True","options":["True","False"]},{"prompt":"Bragging is the same as celebrating.","correct":"False","options":["True","False"]},{"prompt":"Jumping with a friend doubles the joy.","correct":"True","options":["True","False"]}],"timeLimitSec":5,"speedBonusSec":2,"shuffle":true}', 10),
  (3, 'simulation', 'Dash wins 1st place — what should he do?', '{"taskCode":"T07","setupClipUrl":"https://cdn.sementa.app/v/dash-wins.mp4","decisionPrompt":"Dash is bursting with joy. What should he do?","options":[{"label":"Run in shouting","isOptimal":false},{"label":"Find Leo and celebrate together","isOptimal":true}],"showAllPaths":true}', 15),
  (4, 'reflection', 'Draw what made YOU happy this week', '{"taskCode":"T11","prompt":"Draw what made you happy this week.","voiceLayer":true,"parentLabel":"My Happy Moment"}', 12)
) as l(pos, type, title, config, xp) on true
where c.slug = 'happy-stall' and m.slug = 'emotion-fair'
and not exists (select 1 from public.layers x where x.class_id = c.id);

-- The Sad Corner
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, l.pos, l.type::layer_type, l.title, l.config::jsonb, l.xp
from public.classes c
join public.modules m on m.id = c.module_id
join (values
  (1, 'foundation', 'Maya finds the Sad Corner', '{"taskCode":"T01"}', 5),
  (2, 'quiz',       'Helpful or not helpful when a friend is sad?', '{"taskCode":"T05"}', 10),
  (3, 'reflection', 'What would you say to a sad friend?', '{"taskCode":"T10"}', 15),
  (4, 'reflection', 'Comfort someone this week', '{"taskCode":"T13"}', 25),
  (5, 'reflection', 'When did sadness visit you?', '{"taskCode":"T14"}', 10)
) as l(pos, type, title, config, xp) on true
where c.slug = 'sad-corner' and m.slug = 'emotion-fair'
and not exists (select 1 from public.layers x where x.class_id = c.id);

-- The Fear House
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, l.pos, l.type::layer_type, l.title, l.config::jsonb, l.xp
from public.classes c
join public.modules m on m.id = c.module_id
join (values
  (1, 'foundation', 'Pip enters the Fear House', '{"taskCode":"T01"}', 5),
  (2, 'simulation', 'A 2-minute calm-breathing journey', '{"taskCode":"T09"}', 12),
  (3, 'quiz',       'Helpful fears vs unhelpful fears', '{"taskCode":"T03"}', 10)
) as l(pos, type, title, config, xp) on true
where c.slug = 'fear-house' and m.slug = 'emotion-fair'
and not exists (select 1 from public.layers x where x.class_id = c.id);

-- ============ Auto-grant editor role to admin-invited users ============
-- Update handle_new_user to also auto-grant 'editor' if user_metadata has invited_role='editor'
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

  -- If invited as editor via admin invite, grant editor role
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

-- Ensure trigger exists on auth.users for new sign-ups
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end$$;