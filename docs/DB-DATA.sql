-- Sementa: content + mission DATA import (id-free)
-- Run AFTER docs/DB-SETUP.sql on the target project.
-- No ids, no timestamps: the target database generates its own uuid/created_at/updated_at.
-- Parent links are resolved by slug / position lookups, so hierarchy stays intact.
-- Contains NO user data (no profiles, roles, xp events, progress, friendships, friend codes).
-- Re-runnable: every statement skips rows that already exist.
-- NOTE: avatar / welcome-card / class hero image urls still point at the source project's
-- public storage. Copy those files into the clone's buckets and update the urls for
-- full independence.

begin;


-- ---------- pillars (4 rows) ----------
insert into public.pillars (slug, title, subtitle, emoji, position)
select 'inner', 'The Inner World', 'Self-awareness, EQ, growth mindset', '🧠', 1
where not exists (select 1 from public.pillars where slug = 'inner');
insert into public.pillars (slug, title, subtitle, emoji, position)
select 'social', 'The Social World', 'Empathy, friendships, communication', '🗣️', 2
where not exists (select 1 from public.pillars where slug = 'social');
insert into public.pillars (slug, title, subtitle, emoji, position)
select 'action', 'The Action World', 'Courage, focus, decisions, leadership', '⚡', 3
where not exists (select 1 from public.pillars where slug = 'action');
insert into public.pillars (slug, title, subtitle, emoji, position)
select 'real', 'The Real World', 'Money, media, body, future skills', '🌍', 4
where not exists (select 1 from public.pillars where slug = 'real');

-- ---------- topics (20 rows) ----------
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'self-awareness-eq', 'Self-Awareness & Emotional Intelligence', 'Name it to tame it', 1, '{"Leader","Explorer","Builder"}'::text[]
from public.pillars p
where p.slug = 'inner'
  and not exists (select 1 from public.topics where slug = 'self-awareness-eq');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'confidence', 'Confidence & Self-Esteem', 'Building the I-Can muscle', 2, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'inner'
  and not exists (select 1 from public.topics where slug = 'confidence');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'stress-wellbeing', 'Stress & Wellbeing', 'The pause button', 3, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'inner'
  and not exists (select 1 from public.topics where slug = 'stress-wellbeing');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'discipline-habits', 'Discipline & Habits', 'Morning momentum', 4, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'inner'
  and not exists (select 1 from public.topics where slug = 'discipline-habits');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'resilience', 'Resilience & Adaptability', 'Bouncing back', 5, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'inner'
  and not exists (select 1 from public.topics where slug = 'resilience');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'communication', 'Communication Skills', null, 1, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'social'
  and not exists (select 1 from public.topics where slug = 'communication');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'social-skills', 'Social Skills & Relationships', 'The friendship recipe', 2, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'social'
  and not exists (select 1 from public.topics where slug = 'social-skills');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'teamwork', 'Teamwork & Collaboration', null, 3, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'social'
  and not exists (select 1 from public.topics where slug = 'teamwork');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'conflict', 'Conflict Resolution', null, 4, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'social'
  and not exists (select 1 from public.topics where slug = 'conflict');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'ethics', 'Ethics, Responsibility & Values', null, 5, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'social'
  and not exists (select 1 from public.topics where slug = 'ethics');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'decision-making', 'Decision Making', 'A or B?', 1, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'action'
  and not exists (select 1 from public.topics where slug = 'decision-making');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'critical-thinking', 'Critical Thinking & Problem Solving', 'Asking why', 2, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'action'
  and not exists (select 1 from public.topics where slug = 'critical-thinking');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'time-management', 'Time Management & Productivity', null, 3, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'action'
  and not exists (select 1 from public.topics where slug = 'time-management');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'goal-setting', 'Goal Setting & Personal Growth', 'Chasing small wins', 4, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'action'
  and not exists (select 1 from public.topics where slug = 'goal-setting');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'creativity', 'Creativity & Innovation', null, 5, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'action'
  and not exists (select 1 from public.topics where slug = 'creativity');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'leadership', 'Leadership', 'Being a good example', 1, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'real'
  and not exists (select 1 from public.topics where slug = 'leadership');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'entrepreneurship', 'Entrepreneurship', null, 2, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'real'
  and not exists (select 1 from public.topics where slug = 'entrepreneurship');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'financial-literacy', 'Financial Literacy', 'Coins and jars', 3, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'real'
  and not exists (select 1 from public.topics where slug = 'financial-literacy');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'digital-literacy', 'Digital Literacy & Online Behavior', 'Screens are tools', 4, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'real'
  and not exists (select 1 from public.topics where slug = 'digital-literacy');
insert into public.topics (pillar_id, slug, title, subtitle, position, age_groups)
select p.id, 'public-speaking', 'Public Speaking & Presentation', null, 5, '{"Explorer","Builder","Leader"}'::text[]
from public.pillars p
where p.slug = 'real'
  and not exists (select 1 from public.topics where slug = 'public-speaking');

-- ---------- modules (100 rows) ----------
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'using-my-words-communication-skills', 'Using My Words', null, 1
from public.topics t
where t.slug = 'communication'
  and not exists (select 1 from public.modules where slug = 'using-my-words-communication-skills');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'i-feel-statements-communication-skills', 'I Feel Statements', null, 2
from public.topics t
where t.slug = 'communication'
  and not exists (select 1 from public.modules where slug = 'i-feel-statements-communication-skills');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'my-voice-my-power-communication-skills', 'My Voice My Power', null, 3
from public.topics t
where t.slug = 'communication'
  and not exists (select 1 from public.modules where slug = 'my-voice-my-power-communication-skills');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'body-language-speaks-loudly-communication-skills', 'Body Language Speaks Loudly', null, 4
from public.topics t
where t.slug = 'communication'
  and not exists (select 1 from public.modules where slug = 'body-language-speaks-loudly-communication-skills');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'when-words-hurt-communication-skills', 'When Words Hurt', null, 5
from public.topics t
where t.slug = 'communication'
  and not exists (select 1 from public.modules where slug = 'when-words-hurt-communication-skills');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'the-i-can-muscle-confidence-self-este', 'The I Can Muscle', null, 1
from public.topics t
where t.slug = 'confidence'
  and not exists (select 1 from public.modules where slug = 'the-i-can-muscle-confidence-self-este');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'my-unique-superpowers-confidence-self-este', 'My Unique Superpowers', null, 2
from public.topics t
where t.slug = 'confidence'
  and not exists (select 1 from public.modules where slug = 'my-unique-superpowers-confidence-self-este');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'mistakes-are-data-confidence-self-este', 'Mistakes Are Data', null, 3
from public.topics t
where t.slug = 'confidence'
  and not exists (select 1 from public.modules where slug = 'mistakes-are-data-confidence-self-este');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'the-bully-in-my-head-confidence-self-este', 'The Bully in My Head', null, 4
from public.topics t
where t.slug = 'confidence'
  and not exists (select 1 from public.modules where slug = 'the-bully-in-my-head-confidence-self-este');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'being-a-friend-to-myself-confidence-self-este', 'Being a Friend to Myself', null, 5
from public.topics t
where t.slug = 'confidence'
  and not exists (select 1 from public.modules where slug = 'being-a-friend-to-myself-confidence-self-este');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'what-is-a-conflict-conflict-resolution', 'What is a Conflict?', null, 1
from public.topics t
where t.slug = 'conflict'
  and not exists (select 1 from public.modules where slug = 'what-is-a-conflict-conflict-resolution');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'saying-sorry-and-meaning-it-conflict-resolution', 'Saying Sorry and Meaning It', null, 2
from public.topics t
where t.slug = 'conflict'
  and not exists (select 1 from public.modules where slug = 'saying-sorry-and-meaning-it-conflict-resolution');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'the-peace-method-conflict-resolution', 'The PEACE Method', null, 3
from public.topics t
where t.slug = 'conflict'
  and not exists (select 1 from public.modules where slug = 'the-peace-method-conflict-resolution');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'understanding-bullying-conflict-resolution', 'Understanding Bullying', null, 4
from public.topics t
where t.slug = 'conflict'
  and not exists (select 1 from public.modules where slug = 'understanding-bullying-conflict-resolution');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'bystander-to-upstander-conflict-resolution', 'Bystander to Upstander', null, 5
from public.topics t
where t.slug = 'conflict'
  and not exists (select 1 from public.modules where slug = 'bystander-to-upstander-conflict-resolution');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'imagination-play-creativity-innovatio', 'Imagination Play', null, 1
from public.topics t
where t.slug = 'creativity'
  and not exists (select 1 from public.modules where slug = 'imagination-play-creativity-innovatio');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'there-are-many-right-answers-creativity-innovatio', 'There Are Many Right Answers', null, 2
from public.topics t
where t.slug = 'creativity'
  and not exists (select 1 from public.modules where slug = 'there-are-many-right-answers-creativity-innovatio');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'making-something-from-nothing-creativity-innovatio', 'Making Something from Nothing', null, 3
from public.topics t
where t.slug = 'creativity'
  and not exists (select 1 from public.modules where slug = 'making-something-from-nothing-creativity-innovatio');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'what-if-questions-creativity-innovatio', 'What If Questions', null, 4
from public.topics t
where t.slug = 'creativity'
  and not exists (select 1 from public.modules where slug = 'what-if-questions-creativity-innovatio');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'sharing-my-ideas-creativity-innovatio', 'Sharing My Ideas', null, 5
from public.topics t
where t.slug = 'creativity'
  and not exists (select 1 from public.modules where slug = 'sharing-my-ideas-creativity-innovatio');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'asking-why-critical-thinking-pr', 'Asking Why', null, 1
from public.topics t
where t.slug = 'critical-thinking'
  and not exists (select 1 from public.modules where slug = 'asking-why-critical-thinking-pr');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'is-that-true-critical-thinking-pr', 'Is That True?', null, 2
from public.topics t
where t.slug = 'critical-thinking'
  and not exists (select 1 from public.modules where slug = 'is-that-true-critical-thinking-pr');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'solving-everyday-problems-critical-thinking-pr', 'Solving Everyday Problems', null, 3
from public.topics t
where t.slug = 'critical-thinking'
  and not exists (select 1 from public.modules where slug = 'solving-everyday-problems-critical-thinking-pr');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'two-sides-to-every-story-critical-thinking-pr', 'Two Sides to Every Story', null, 4
from public.topics t
where t.slug = 'critical-thinking'
  and not exists (select 1 from public.modules where slug = 'two-sides-to-every-story-critical-thinking-pr');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'thinking-differently-critical-thinking-pr', 'Thinking Differently', null, 5
from public.topics t
where t.slug = 'critical-thinking'
  and not exists (select 1 from public.modules where slug = 'thinking-differently-critical-thinking-pr');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'a-or-b-decision-making', 'A or B?', null, 1
from public.topics t
where t.slug = 'decision-making'
  and not exists (select 1 from public.modules where slug = 'a-or-b-decision-making');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'thinking-before-acting-decision-making', 'Thinking Before Acting', null, 2
from public.topics t
where t.slug = 'decision-making'
  and not exists (select 1 from public.modules where slug = 'thinking-before-acting-decision-making');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'when-choices-are-hard-decision-making', 'When Choices Are Hard', null, 3
from public.topics t
where t.slug = 'decision-making'
  and not exists (select 1 from public.modules where slug = 'when-choices-are-hard-decision-making');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'learning-from-my-choices-decision-making', 'Learning from My Choices', null, 4
from public.topics t
where t.slug = 'decision-making'
  and not exists (select 1 from public.modules where slug = 'learning-from-my-choices-decision-making');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'asking-for-help-to-decide-decision-making', 'Asking for Help to Decide', null, 5
from public.topics t
where t.slug = 'decision-making'
  and not exists (select 1 from public.modules where slug = 'asking-for-help-to-decide-decision-making');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'screens-are-tools-digital-literacy-onl', 'Screens Are Tools', null, 1
from public.topics t
where t.slug = 'digital-literacy'
  and not exists (select 1 from public.modules where slug = 'screens-are-tools-digital-literacy-onl');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'safe-online-digital-literacy-onl', 'Safe Online', null, 2
from public.topics t
where t.slug = 'digital-literacy'
  and not exists (select 1 from public.modules where slug = 'safe-online-digital-literacy-onl');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'kindness-online-digital-literacy-onl', 'Kindness Online', null, 3
from public.topics t
where t.slug = 'digital-literacy'
  and not exists (select 1 from public.modules where slug = 'kindness-online-digital-literacy-onl');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'fact-or-fiction-digital-literacy-onl', 'Fact or Fiction?', null, 4
from public.topics t
where t.slug = 'digital-literacy'
  and not exists (select 1 from public.modules where slug = 'fact-or-fiction-digital-literacy-onl');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'screen-time-and-me-digital-literacy-onl', 'Screen Time and Me', null, 5
from public.topics t
where t.slug = 'digital-literacy'
  and not exists (select 1 from public.modules where slug = 'screen-time-and-me-digital-literacy-onl');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'morning-momentum-discipline-habits', 'Morning Momentum', null, 1
from public.topics t
where t.slug = 'discipline-habits'
  and not exists (select 1 from public.modules where slug = 'morning-momentum-discipline-habits');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'finishing-what-i-start-discipline-habits', 'Finishing What I Start', null, 2
from public.topics t
where t.slug = 'discipline-habits'
  and not exists (select 1 from public.modules where slug = 'finishing-what-i-start-discipline-habits');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'the-feelings-journal-discipline-habits', 'The Feelings Journal', null, 3
from public.topics t
where t.slug = 'discipline-habits'
  and not exists (select 1 from public.modules where slug = 'the-feelings-journal-discipline-habits');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'gratitude-as-a-practice-discipline-habits', 'Gratitude as a Practice', null, 4
from public.topics t
where t.slug = 'discipline-habits'
  and not exists (select 1 from public.modules where slug = 'gratitude-as-a-practice-discipline-habits');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'my-weekly-rhythm-discipline-habits', 'My Weekly Rhythm', null, 5
from public.topics t
where t.slug = 'discipline-habits'
  and not exists (select 1 from public.modules where slug = 'my-weekly-rhythm-discipline-habits');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'the-lemonade-stand-entrepreneurship', 'The Lemonade Stand', null, 1
from public.topics t
where t.slug = 'entrepreneurship'
  and not exists (select 1 from public.modules where slug = 'the-lemonade-stand-entrepreneurship');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'spotting-problems-entrepreneurship', 'Spotting Problems', null, 2
from public.topics t
where t.slug = 'entrepreneurship'
  and not exists (select 1 from public.modules where slug = 'spotting-problems-entrepreneurship');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'my-first-idea-entrepreneurship', 'My First Idea', null, 3
from public.topics t
where t.slug = 'entrepreneurship'
  and not exists (select 1 from public.modules where slug = 'my-first-idea-entrepreneurship');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'making-and-selling-entrepreneurship', 'Making and Selling', null, 4
from public.topics t
where t.slug = 'entrepreneurship'
  and not exists (select 1 from public.modules where slug = 'making-and-selling-entrepreneurship');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'failing-and-trying-again-entrepreneurship', 'Failing and Trying Again', null, 5
from public.topics t
where t.slug = 'entrepreneurship'
  and not exists (select 1 from public.modules where slug = 'failing-and-trying-again-entrepreneurship');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'fair-play-ethics-responsibilit', 'Fair Play', null, 1
from public.topics t
where t.slug = 'ethics'
  and not exists (select 1 from public.modules where slug = 'fair-play-ethics-responsibilit');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'kindness-is-a-superpower-ethics-responsibilit', 'Kindness is a Superpower', null, 2
from public.topics t
where t.slug = 'ethics'
  and not exists (select 1 from public.modules where slug = 'kindness-is-a-superpower-ethics-responsibilit');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'everyone-has-a-story-ethics-responsibilit', 'Everyone Has a Story', null, 3
from public.topics t
where t.slug = 'ethics'
  and not exists (select 1 from public.modules where slug = 'everyone-has-a-story-ethics-responsibilit');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'we-are-all-different-and-that-s-good-ethics-responsibilit', 'We Are All Different and That''s Good', null, 4
from public.topics t
where t.slug = 'ethics'
  and not exists (select 1 from public.modules where slug = 'we-are-all-different-and-that-s-good-ethics-responsibilit');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'my-responsibilities-ethics-responsibilit', 'My Responsibilities', null, 5
from public.topics t
where t.slug = 'ethics'
  and not exists (select 1 from public.modules where slug = 'my-responsibilities-ethics-responsibilit');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'coins-and-jars-financial-literacy', 'Coins and Jars', null, 1
from public.topics t
where t.slug = 'financial-literacy'
  and not exists (select 1 from public.modules where slug = 'coins-and-jars-financial-literacy');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'needs-vs-wants-financial-literacy', 'Needs vs. Wants', null, 2
from public.topics t
where t.slug = 'financial-literacy'
  and not exists (select 1 from public.modules where slug = 'needs-vs-wants-financial-literacy');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'where-does-money-come-from-financial-literacy', 'Where Does Money Come From?', null, 3
from public.topics t
where t.slug = 'financial-literacy'
  and not exists (select 1 from public.modules where slug = 'where-does-money-come-from-financial-literacy');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'my-first-budget-financial-literacy', 'My First Budget', null, 4
from public.topics t
where t.slug = 'financial-literacy'
  and not exists (select 1 from public.modules where slug = 'my-first-budget-financial-literacy');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'saving-for-something-financial-literacy', 'Saving for Something', null, 5
from public.topics t
where t.slug = 'financial-literacy'
  and not exists (select 1 from public.modules where slug = 'saving-for-something-financial-literacy');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'chasing-small-wins-goal-setting-persona', 'Chasing Small Wins', null, 1
from public.topics t
where t.slug = 'goal-setting'
  and not exists (select 1 from public.modules where slug = 'chasing-small-wins-goal-setting-persona');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'my-dream-board-goal-setting-persona', 'My Dream Board', null, 2
from public.topics t
where t.slug = 'goal-setting'
  and not exists (select 1 from public.modules where slug = 'my-dream-board-goal-setting-persona');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'steps-to-the-top-goal-setting-persona', 'Steps to the Top', null, 3
from public.topics t
where t.slug = 'goal-setting'
  and not exists (select 1 from public.modules where slug = 'steps-to-the-top-goal-setting-persona');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'when-i-don-t-reach-my-goal-goal-setting-persona', 'When I Don''t Reach My Goal', null, 4
from public.topics t
where t.slug = 'goal-setting'
  and not exists (select 1 from public.modules where slug = 'when-i-don-t-reach-my-goal-goal-setting-persona');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'how-i-learn-best-goal-setting-persona', 'How I Learn Best', null, 5
from public.topics t
where t.slug = 'goal-setting'
  and not exists (select 1 from public.modules where slug = 'how-i-learn-best-goal-setting-persona');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'being-a-good-example-leadership', 'Being a Good Example', null, 1
from public.topics t
where t.slug = 'leadership'
  and not exists (select 1 from public.modules where slug = 'being-a-good-example-leadership');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'using-my-voice-for-good-leadership', 'Using My Voice for Good', null, 2
from public.topics t
where t.slug = 'leadership'
  and not exists (select 1 from public.modules where slug = 'using-my-voice-for-good-leadership');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'the-upstander-leader-leadership', 'The Upstander Leader', null, 3
from public.topics t
where t.slug = 'leadership'
  and not exists (select 1 from public.modules where slug = 'the-upstander-leader-leadership');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'leading-in-small-ways-leadership', 'Leading in Small Ways', null, 4
from public.topics t
where t.slug = 'leadership'
  and not exists (select 1 from public.modules where slug = 'leading-in-small-ways-leadership');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'what-kind-of-leader-am-i-leadership', 'What Kind of Leader Am I?', null, 5
from public.topics t
where t.slug = 'leadership'
  and not exists (select 1 from public.modules where slug = 'what-kind-of-leader-am-i-leadership');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'show-and-tell-bravery-public-speaking-pres', 'Show and Tell Bravery', null, 1
from public.topics t
where t.slug = 'public-speaking'
  and not exists (select 1 from public.modules where slug = 'show-and-tell-bravery-public-speaking-pres');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'my-voice-matters-public-speaking-pres', 'My Voice Matters', null, 2
from public.topics t
where t.slug = 'public-speaking'
  and not exists (select 1 from public.modules where slug = 'my-voice-matters-public-speaking-pres');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'telling-a-story-public-speaking-pres', 'Telling a Story', null, 3
from public.topics t
where t.slug = 'public-speaking'
  and not exists (select 1 from public.modules where slug = 'telling-a-story-public-speaking-pres');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'nerves-are-normal-public-speaking-pres', 'Nerves Are Normal', null, 4
from public.topics t
where t.slug = 'public-speaking'
  and not exists (select 1 from public.modules where slug = 'nerves-are-normal-public-speaking-pres');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'my-first-presentation-public-speaking-pres', 'My First Presentation', null, 5
from public.topics t
where t.slug = 'public-speaking'
  and not exists (select 1 from public.modules where slug = 'my-first-presentation-public-speaking-pres');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'bouncing-back-resilience-adaptabil', 'Bouncing Back', null, 1
from public.topics t
where t.slug = 'resilience'
  and not exists (select 1 from public.modules where slug = 'bouncing-back-resilience-adaptabil');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'frustration-station-resilience-adaptabil', 'Frustration Station', null, 2
from public.topics t
where t.slug = 'resilience'
  and not exists (select 1 from public.modules where slug = 'frustration-station-resilience-adaptabil');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'feelings-change-and-that-s-ok-resilience-adaptabil', 'Feelings Change and That''s OK', null, 3
from public.topics t
where t.slug = 'resilience'
  and not exists (select 1 from public.modules where slug = 'feelings-change-and-that-s-ok-resilience-adaptabil');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'asking-for-help-is-brave-resilience-adaptabil', 'Asking for Help is Brave', null, 4
from public.topics t
where t.slug = 'resilience'
  and not exists (select 1 from public.modules where slug = 'asking-for-help-is-brave-resilience-adaptabil');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'my-bounce-back-toolkit-resilience-adaptabil', 'My Bounce-Back Toolkit', null, 5
from public.topics t
where t.slug = 'resilience'
  and not exists (select 1 from public.modules where slug = 'my-bounce-back-toolkit-resilience-adaptabil');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'meet-your-emotions-self-awareness-emoti', 'Meet Your Emotions', null, 1
from public.topics t
where t.slug = 'self-awareness-eq'
  and not exists (select 1 from public.modules where slug = 'meet-your-emotions-self-awareness-emoti');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'emotion-detectives-self-awareness-emoti', 'Emotion Detectives', null, 2
from public.topics t
where t.slug = 'self-awareness-eq'
  and not exists (select 1 from public.modules where slug = 'emotion-detectives-self-awareness-emoti');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'the-emotion-thermometer-self-awareness-emoti', 'The Emotion Thermometer', null, 3
from public.topics t
where t.slug = 'self-awareness-eq'
  and not exists (select 1 from public.modules where slug = 'the-emotion-thermometer-self-awareness-emoti');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'where-do-i-feel-it-self-awareness-emoti', 'Where Do I Feel It?', null, 4
from public.topics t
where t.slug = 'self-awareness-eq'
  and not exists (select 1 from public.modules where slug = 'where-do-i-feel-it-self-awareness-emoti');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'my-emotion-story-self-awareness-emoti', 'My Emotion Story', null, 5
from public.topics t
where t.slug = 'self-awareness-eq'
  and not exists (select 1 from public.modules where slug = 'my-emotion-story-self-awareness-emoti');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'the-friendship-recipe-social-skills-relati', 'The Friendship Recipe', null, 1
from public.topics t
where t.slug = 'social-skills'
  and not exists (select 1 from public.modules where slug = 'the-friendship-recipe-social-skills-relati');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'making-new-friends-social-skills-relati', 'Making New Friends', null, 2
from public.topics t
where t.slug = 'social-skills'
  and not exists (select 1 from public.modules where slug = 'making-new-friends-social-skills-relati');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'sharing-and-taking-turns-social-skills-relati', 'Sharing and Taking Turns', null, 3
from public.topics t
where t.slug = 'social-skills'
  and not exists (select 1 from public.modules where slug = 'sharing-and-taking-turns-social-skills-relati');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'when-friendships-change-social-skills-relati', 'When Friendships Change', null, 4
from public.topics t
where t.slug = 'social-skills'
  and not exists (select 1 from public.modules where slug = 'when-friendships-change-social-skills-relati');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'friendship-and-technology-social-skills-relati', 'Friendship and Technology', null, 5
from public.topics t
where t.slug = 'social-skills'
  and not exists (select 1 from public.modules where slug = 'friendship-and-technology-social-skills-relati');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'the-pause-button-stress-wellbeing', 'The Pause Button', null, 1
from public.topics t
where t.slug = 'stress-wellbeing'
  and not exists (select 1 from public.modules where slug = 'the-pause-button-stress-wellbeing');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'worry-and-what-to-do-with-it-stress-wellbeing', 'Worry and What to Do With It', null, 2
from public.topics t
where t.slug = 'stress-wellbeing'
  and not exists (select 1 from public.modules where slug = 'worry-and-what-to-do-with-it-stress-wellbeing');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'when-i-feel-overwhelmed-stress-wellbeing', 'When I Feel Overwhelmed', null, 3
from public.topics t
where t.slug = 'stress-wellbeing'
  and not exists (select 1 from public.modules where slug = 'when-i-feel-overwhelmed-stress-wellbeing');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'my-body-needs-this-too-stress-wellbeing', 'My Body Needs This Too', null, 4
from public.topics t
where t.slug = 'stress-wellbeing'
  and not exists (select 1 from public.modules where slug = 'my-body-needs-this-too-stress-wellbeing');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'good-days-and-hard-days-stress-wellbeing', 'Good Days and Hard Days', null, 5
from public.topics t
where t.slug = 'stress-wellbeing'
  and not exists (select 1 from public.modules where slug = 'good-days-and-hard-days-stress-wellbeing');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'playing-together-teamwork-collaborati', 'Playing Together', null, 1
from public.topics t
where t.slug = 'teamwork'
  and not exists (select 1 from public.modules where slug = 'playing-together-teamwork-collaborati');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'being-a-team-player-teamwork-collaborati', 'Being a Team Player', null, 2
from public.topics t
where t.slug = 'teamwork'
  and not exists (select 1 from public.modules where slug = 'being-a-team-player-teamwork-collaborati');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'when-the-team-disagrees-teamwork-collaborati', 'When the Team Disagrees', null, 3
from public.topics t
where t.slug = 'teamwork'
  and not exists (select 1 from public.modules where slug = 'when-the-team-disagrees-teamwork-collaborati');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'everyone-has-a-role-teamwork-collaborati', 'Everyone Has a Role', null, 4
from public.topics t
where t.slug = 'teamwork'
  and not exists (select 1 from public.modules where slug = 'everyone-has-a-role-teamwork-collaborati');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'winning-and-losing-together-teamwork-collaborati', 'Winning and Losing Together', null, 5
from public.topics t
where t.slug = 'teamwork'
  and not exists (select 1 from public.modules where slug = 'winning-and-losing-together-teamwork-collaborati');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'now-vs-later-time-management-prod', 'Now vs. Later', null, 1
from public.topics t
where t.slug = 'time-management'
  and not exists (select 1 from public.modules where slug = 'now-vs-later-time-management-prod');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'finishing-what-i-start-time-management-prod', 'Finishing What I Start', null, 2
from public.topics t
where t.slug = 'time-management'
  and not exists (select 1 from public.modules where slug = 'finishing-what-i-start-time-management-prod');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'my-weekly-rhythm-time-management-prod', 'My Weekly Rhythm', null, 3
from public.topics t
where t.slug = 'time-management'
  and not exists (select 1 from public.modules where slug = 'my-weekly-rhythm-time-management-prod');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'when-i-don-t-feel-like-it-time-management-prod', 'When I Don''t Feel Like It', null, 4
from public.topics t
where t.slug = 'time-management'
  and not exists (select 1 from public.modules where slug = 'when-i-don-t-feel-like-it-time-management-prod');
insert into public.modules (topic_id, slug, title, subtitle, position)
select t.id, 'my-time-my-choice-time-management-prod', 'My Time My Choice', null, 5
from public.topics t
where t.slug = 'time-management'
  and not exists (select 1 from public.modules where slug = 'my-time-my-choice-time-management-prod');

-- ---------- classes (40 rows) ----------
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'a-or-b-01', 'Every Choice Has a Consequence', 'Maya learns that even tiny choices — like which path to take — lead somewhere different.', 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/class-hero/3999d5cb-05e9-4608-998c-f901ab83076f/1778139703711.jpg', 5, 1, 'published'::publish_status
from public.modules m
where m.slug = 'a-or-b-decision-making'
  and not exists (select 1 from public.classes where slug = 'a-or-b-01');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'a-or-b-02', 'The Pause Button', 'Dash acts before thinking and knocks over Maya''s tower. What would have happened with a pause?', null, 5, 2, 'published'::publish_status
from public.modules m
where m.slug = 'a-or-b-decision-making'
  and not exists (select 1 from public.classes where slug = 'a-or-b-02');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'a-or-b-03', 'What Do I Really Want?', 'Maya realises that what she wants RIGHT NOW and what she wants MOST are often different things.', null, 5, 3, 'published'::publish_status
from public.modules m
where m.slug = 'a-or-b-decision-making'
  and not exists (select 1 from public.classes where slug = 'a-or-b-03');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'a-or-b-04', 'Thinking About Others', 'Dash''s choice affects Pip badly. The group explores: what happens when we think about others before deciding?', null, 5, 4, 'published'::publish_status
from public.modules m
where m.slug = 'a-or-b-decision-making'
  and not exists (select 1 from public.classes where slug = 'a-or-b-04');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'a-or-b-05', 'Big Choices and Small Choices', 'Not every choice needs a lot of thinking. Maya and Leo sort their daily choices by size.', null, 5, 5, 'published'::publish_status
from public.modules m
where m.slug = 'a-or-b-decision-making'
  and not exists (select 1 from public.classes where slug = 'a-or-b-05');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'a-or-b-06', 'When Both Choices Feel Wrong', 'Maya is stuck between two options she doesn''t like. The group learns: there''s always something to do, even when it''s hard.', null, 5, 6, 'published'::publish_status
from public.modules m
where m.slug = 'a-or-b-decision-making'
  and not exists (select 1 from public.classes where slug = 'a-or-b-06');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'a-or-b-07', 'Learning from a Wrong Choice', 'Dash makes a choice he regrets. But regret isn''t the end — it''s information.', null, 5, 7, 'published'::publish_status
from public.modules m
where m.slug = 'a-or-b-decision-making'
  and not exists (select 1 from public.classes where slug = 'a-or-b-07');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'a-or-b-08', 'Asking for Help to Decide', 'Maya tries to decide something alone when it''s too big. Leo shows her that asking for help is part of good thinking.', null, 5, 8, 'published'::publish_status
from public.modules m
where m.slug = 'a-or-b-decision-making'
  and not exists (select 1 from public.classes where slug = 'a-or-b-08');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'a-or-b-09', 'Being Fair to Everyone', 'The group must make a choice that affects all four of them. Who gets a say? How do they decide?', null, 5, 9, 'published'::publish_status
from public.modules m
where m.slug = 'a-or-b-decision-making'
  and not exists (select 1 from public.classes where slug = 'a-or-b-09');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'a-or-b-10', 'My Decision Toolkit', 'Maya and the child build a personal decision toolkit — the steps they''ll use every time from now on.', null, 5, 10, 'published'::publish_status
from public.modules m
where m.slug = 'a-or-b-decision-making'
  and not exists (select 1 from public.classes where slug = 'a-or-b-10');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'being-a-good-example-01', 'What is a Leader?', 'The group debates: does a leader have to be the loudest, fastest, or most popular? Or something else?', 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/class-hero/bd6b0396-4d7a-4ba8-af7f-7396f72dfba9/1778139733226.png', 5, 1, 'published'::publish_status
from public.modules m
where m.slug = 'being-a-good-example-leadership'
  and not exists (select 1 from public.classes where slug = 'being-a-good-example-01');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'being-a-good-example-02', 'Leading Without Being Asked', 'Dash litters by accident and nobody says anything. Leo picks it up without being told — and something shifts.', null, 5, 2, 'published'::publish_status
from public.modules m
where m.slug = 'being-a-good-example-leadership'
  and not exists (select 1 from public.classes where slug = 'being-a-good-example-02');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'being-a-good-example-03', 'When No One Is Watching', 'Maya finds something that isn''t hers. Nobody would know if she kept it. What does she do?', null, 5, 3, 'published'::publish_status
from public.modules m
where m.slug = 'being-a-good-example-leadership'
  and not exists (select 1 from public.classes where slug = 'being-a-good-example-03');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'being-a-good-example-04', 'Helping Someone Who Is Struggling', 'Pip is falling behind and feels too embarrassed to ask for help. The group decides what a good example looks like here.', null, 5, 4, 'published'::publish_status
from public.modules m
where m.slug = 'being-a-good-example-leadership'
  and not exists (select 1 from public.classes where slug = 'being-a-good-example-04');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'being-a-good-example-05', 'Standing Up for What''s Right', 'Dash is about to do something unkind to impress others. Leo must decide: stay quiet or speak up?', null, 5, 5, 'published'::publish_status
from public.modules m
where m.slug = 'being-a-good-example-leadership'
  and not exists (select 1 from public.classes where slug = 'being-a-good-example-05');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'being-a-good-example-06', 'Leaders Make Mistakes Too', 'Maya makes a mistake while leading the group project. She covers it up — and things get worse. Owning it is the real lesson.', null, 5, 6, 'published'::publish_status
from public.modules m
where m.slug = 'being-a-good-example-leadership'
  and not exists (select 1 from public.classes where slug = 'being-a-good-example-06');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'being-a-good-example-07', 'Sharing the Spotlight', 'Maya always wants to go first and be the best. Leo shows her what happens when a leader lifts others up instead.', null, 5, 7, 'published'::publish_status
from public.modules m
where m.slug = 'being-a-good-example-leadership'
  and not exists (select 1 from public.classes where slug = 'being-a-good-example-07');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'being-a-good-example-08', 'Kindness as Leadership', 'A new classmate is alone at lunch. Maya notices but nearly walks past. Leo shows what one act of kindness can do.', null, 5, 8, 'published'::publish_status
from public.modules m
where m.slug = 'being-a-good-example-leadership'
  and not exists (select 1 from public.classes where slug = 'being-a-good-example-08');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'being-a-good-example-09', 'What Other Leaders Do', 'The group looks at examples of leadership in everyday life — siblings, teachers, friends — and pulls out what they have in common.', null, 5, 9, 'published'::publish_status
from public.modules m
where m.slug = 'being-a-good-example-leadership'
  and not exists (select 1 from public.classes where slug = 'being-a-good-example-09');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'being-a-good-example-10', 'The Leader I Am Starting to Be', 'Maya and Leo look back at everything they''ve done — and the child decides what kind of leader they want to be.', null, 5, 10, 'published'::publish_status
from public.modules m
where m.slug = 'being-a-good-example-leadership'
  and not exists (select 1 from public.classes where slug = 'being-a-good-example-10');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'the-fair-appears-80063a1e', 'The Fair Appears', 'Curiosity', 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/class-hero/80063a1e-38d0-472e-9c28-08e90b0d4234/1778140339985.png', 5, 1, 'published'::publish_status
from public.modules m
where m.slug = 'meet-your-emotions-self-awareness-emoti'
  and not exists (select 1 from public.classes where slug = 'the-fair-appears-80063a1e');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'the-happy-stall-79f23309', 'The Happy Stall', 'Joy', 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/class-hero/79f23309-bcda-4901-a346-659bf1e6c392/1778140325122.png', 5, 2, 'published'::publish_status
from public.modules m
where m.slug = 'meet-your-emotions-self-awareness-emoti'
  and not exists (select 1 from public.classes where slug = 'the-happy-stall-79f23309');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'the-sad-corner-bfa92978', 'The Sad Corner', 'Sadness', null, 5, 3, 'published'::publish_status
from public.modules m
where m.slug = 'meet-your-emotions-self-awareness-emoti'
  and not exists (select 1 from public.classes where slug = 'the-sad-corner-bfa92978');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'the-fear-house-26e19f4a', 'The Fear House', 'Fear', null, 5, 4, 'published'::publish_status
from public.modules m
where m.slug = 'meet-your-emotions-self-awareness-emoti'
  and not exists (select 1 from public.classes where slug = 'the-fear-house-26e19f4a');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'the-anger-volcano-48c5865c', 'The Anger Volcano', 'Anger', null, 5, 5, 'draft'::publish_status
from public.modules m
where m.slug = 'meet-your-emotions-self-awareness-emoti'
  and not exists (select 1 from public.classes where slug = 'the-anger-volcano-48c5865c');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'the-surprise-tent-d96a30c2', 'The Surprise Tent', 'Surprise', null, 5, 6, 'draft'::publish_status
from public.modules m
where m.slug = 'meet-your-emotions-self-awareness-emoti'
  and not exists (select 1 from public.classes where slug = 'the-surprise-tent-d96a30c2');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'the-worry-spinner-e1bf4dde', 'The Worry Spinner', 'Worry', null, 5, 7, 'draft'::publish_status
from public.modules m
where m.slug = 'meet-your-emotions-self-awareness-emoti'
  and not exists (select 1 from public.classes where slug = 'the-worry-spinner-e1bf4dde');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'the-proud-parade-f912940f', 'The Proud Parade', 'Pride', null, 5, 8, 'draft'::publish_status
from public.modules m
where m.slug = 'meet-your-emotions-self-awareness-emoti'
  and not exists (select 1 from public.classes where slug = 'the-proud-parade-f912940f');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'the-feelings-mix-be746fba', 'The Feelings Mix', 'Mixed Feelings', null, 5, 9, 'draft'::publish_status
from public.modules m
where m.slug = 'meet-your-emotions-self-awareness-emoti'
  and not exists (select 1 from public.classes where slug = 'the-feelings-mix-be746fba');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'my-emotion-story-562d88ec', 'My Emotion Story', 'Reflection', null, 5, 10, 'draft'::publish_status
from public.modules m
where m.slug = 'meet-your-emotions-self-awareness-emoti'
  and not exists (select 1 from public.classes where slug = 'my-emotion-story-562d88ec');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'using-my-words-01', 'Words Are Power', 'Leo discovers that using words — instead of going quiet — is a real superpower.', 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/class-hero/1faae0be-7b32-4eef-95e4-1e7b23deffa9/1778139670916.png', 5, 1, 'published'::publish_status
from public.modules m
where m.slug = 'using-my-words-communication-skills'
  and not exists (select 1 from public.classes where slug = 'using-my-words-01');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'using-my-words-02', 'Big Feelings, Small Words', 'Leo learns to name exactly what he is feeling, even when the feeling is huge.', null, 5, 2, 'published'::publish_status
from public.modules m
where m.slug = 'using-my-words-communication-skills'
  and not exists (select 1 from public.classes where slug = 'using-my-words-02');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'using-my-words-03', 'My Body Talks Too', 'Dash shows Leo how his body already tells people how he feels — and why words help even more.', null, 5, 3, 'published'::publish_status
from public.modules m
where m.slug = 'using-my-words-communication-skills'
  and not exists (select 1 from public.classes where slug = 'using-my-words-03');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'using-my-words-04', 'The I Feel Formula', 'Leo practises the "I feel…" sentence — the safest, kindest way to speak up.', null, 5, 4, 'published'::publish_status
from public.modules m
where m.slug = 'using-my-words-communication-skills'
  and not exists (select 1 from public.classes where slug = 'using-my-words-04');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'using-my-words-05', 'Saying It Without Shouting', 'Maya loses her temper and Leo helps her find calmer words — by using his own.', null, 5, 5, 'published'::publish_status
from public.modules m
where m.slug = 'using-my-words-communication-skills'
  and not exists (select 1 from public.classes where slug = 'using-my-words-05');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'using-my-words-06', 'When Words Are Hard', 'Pip is too scared to speak up. Leo and the child figure out how to help.', null, 5, 6, 'published'::publish_status
from public.modules m
where m.slug = 'using-my-words-communication-skills'
  and not exists (select 1 from public.classes where slug = 'using-my-words-06');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'using-my-words-07', 'Asking for What I Need', 'Leo realises that asking clearly for what he needs is not being selfish — it is being brave.', null, 5, 7, 'published'::publish_status
from public.modules m
where m.slug = 'using-my-words-communication-skills'
  and not exists (select 1 from public.classes where slug = 'using-my-words-07');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'using-my-words-08', 'Words That Hurt and Words That Help', 'The group explores the difference — and Leo apologises for something he said to Dash.', null, 5, 8, 'published'::publish_status
from public.modules m
where m.slug = 'using-my-words-communication-skills'
  and not exists (select 1 from public.classes where slug = 'using-my-words-08');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'using-my-words-09', 'Listening Is Part of Talking', 'Leo learns that using your words also means giving others space to use theirs.', null, 5, 9, 'published'::publish_status
from public.modules m
where m.slug = 'using-my-words-communication-skills'
  and not exists (select 1 from public.classes where slug = 'using-my-words-09');
insert into public.classes (module_id, slug, title, subtitle, hero_image_url, estimated_minutes, position, status)
select m.id, 'using-my-words-10', 'My Words, My Brave', 'Leo faces his biggest moment — speaking up in front of the whole group — and does it.', null, 5, 10, 'published'::publish_status
from public.modules m
where m.slug = 'using-my-words-communication-skills'
  and not exists (select 1 from public.classes where slug = 'using-my-words-10');

-- ---------- layers (173 rows) ----------
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Two Paths in the Woods', '{"prompt": "Maya reaches a fork. Both paths look fine. The animation shows what happens on each \u2014 one leads to treasure, one to a muddy puddle. Neither is \"wrong\" \u2014 but they''re different.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'a-or-b-01'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Follow the Consequence', '{"prompt": "Tap-along: four choice panels. Child taps A or B for Maya. Each choice cascades into a small consequence shown in the next panel.", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'a-or-b-01'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'Your Choice Story', '{"prompt": "\"Tell Pip about a choice you made today \u2014 even a tiny one. What happened because of it?\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'a-or-b-01'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Dash Dashes In', '{"prompt": "Dash sees a ball, leaps, crashes into Maya''s block tower \u2014 which she''d been building all morning. Dash feels awful. What if he''d paused?", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'a-or-b-02'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'simulation'::layer_type, 'Pause with Pip', '{"prompt": "Pip teaches the 3-second pause: breathe in, count \"1\u2026 2\u2026 3\u2026\", then decide. Visual: a traffic light going from red \u2192 yellow \u2192 green.", "taskCode": "T09"}'::jsonb, 12
from public.classes c
where c.slug = 'a-or-b-02'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'simulation'::layer_type, 'Pause or Rush?', '{"prompt": "Three quick scenarios. Child taps: Pause (yellow light) or Rush (green). Each plays out. All three ''Pause'' paths lead to better outcomes.", "taskCode": "T07"}'::jsonb, 15
from public.classes c
where c.slug = 'a-or-b-02'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'quiz'::layer_type, 'Pause Check', '{"prompt": "Q1: What happened when Dash didn''t pause? Q2: What are the 3 steps of the pause? Q3: Name one time a pause might help you.", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'a-or-b-02'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'The Cookie Dilemma', '{"prompt": "Maya wants to eat all the cookies NOW \u2014 but she also wants to save some for the party tomorrow. Dash eats his immediately. Maya has to decide.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'a-or-b-03'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Now vs. Later', '{"prompt": "Split screen: three \"now vs. later\" scenarios. Left shows the NOW choice result, right shows the LATER result. Child taps which matters more each time.", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'a-or-b-03'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'My Now and My Later', '{"prompt": "Draw two boxes: something you want RIGHT NOW and something you want MORE. What''s the difference?", "taskCode": "T11"}'::jsonb, 12
from public.classes c
where c.slug = 'a-or-b-03'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'One ''Later'' Choice', '{"prompt": "Today, choose to wait for something instead of taking it straight away \u2014 and notice how it feels.", "taskCode": "T13"}'::jsonb, 25
from public.classes c
where c.slug = 'a-or-b-03'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Dash Takes the Last Spot', '{"prompt": "There is one spot left in the game. Dash grabs it without checking \u2014 and Pip is left out. Pip''s face tells the whole story.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'a-or-b-04'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'How Did That Make Them Feel?', '{"prompt": "Four characters'' faces appear. Child drags the correct emotion label onto each face: how did Pip feel? How did Dash feel after? How did Leo feel watching? How did Maya feel?", "taskCode": "T03"}'::jsonb, 10
from public.classes c
where c.slug = 'a-or-b-04'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'simulation'::layer_type, 'What Should Dash Do Now?', '{"prompt": "Story resumes. Dash realises what happened. Options: (A) Ignore it and keep playing. (B) Offer to share the spot by taking turns. (C) Ask the group to re-draw. Both B and C are good paths.", "taskCode": "T07"}'::jsonb, 15
from public.classes c
where c.slug = 'a-or-b-04'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Thinking About Others', '{"prompt": "\"Tell Pip: before your next big decision, what one question could you ask yourself about how it might affect someone else?\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'a-or-b-04'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Not All Choices Are the Same', '{"prompt": "Maya lists her choices for the day: what to wear, what to eat, who to invite to her project, whether to tell the truth about a mistake. Leo helps her see which ones need more thinking.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'a-or-b-05'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Choice Size Sort', '{"prompt": "Eight choice cards appear (mix of big and small). Child matches each to: Small (just decide quickly) or Big (stop and think). Illustrated.", "taskCode": "T03"}'::jsonb, 10
from public.classes c
where c.slug = 'a-or-b-05'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'Order the Thinking Steps', '{"prompt": "For a BIG choice, drag steps into order: (1) Stop and breathe \u2192 (2) What do I want? \u2192 (3) Who else is affected? \u2192 (4) What are my options? \u2192 (5) Choose and go.", "taskCode": "T12"}'::jsonb, 15
from public.classes c
where c.slug = 'a-or-b-05'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Maya''s Hard Day', '{"prompt": "Maya can tell her friend she can''t come to her party (friend will be sad) OR go but miss her family dinner (family will be disappointed). Both feel awful. What does she do?", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'a-or-b-06'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'simulation'::layer_type, 'Help Maya Choose', '{"prompt": "Three paths: (A) Do nothing \u2014 avoid deciding. (B) Make a choice and explain it kindly. (C) Ask a grown-up to help decide. All three play out.", "taskCode": "T07"}'::jsonb, 15
from public.classes c
where c.slug = 'a-or-b-06'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'A Hard Choice I Faced', '{"prompt": "Record: \"Tell me about a time you had to choose between two hard things. What did you do?\"", "taskCode": "T10"}'::jsonb, 15
from public.classes c
where c.slug = 'a-or-b-06'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Hard Choices', '{"prompt": "\"What makes a choice hard? Tell Pip the one thing that makes deciding difficult for you.\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'a-or-b-06'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Dash''s Big Regret', '{"prompt": "Dash lies about breaking something to avoid getting in trouble. It works \u2014 for one day. Then things unravel. Dash feels worse. But the mistake becomes a lesson.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'a-or-b-07'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'The Regret vs. The Lesson', '{"prompt": "Split screen: left shows Dash feeling bad and staying stuck in regret. Right shows Dash using the mistake as information and doing better next time. Child taps which version of Dash they want to be.", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'a-or-b-07'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'quiz'::layer_type, 'Mistake Check', '{"prompt": "Q1: Why did Dash feel worse after lying? Q2: What is the difference between a mistake and being a bad person? Q3: What is one thing a mistake can teach you?", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'a-or-b-07'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Own One Mistake', '{"prompt": "Tell a grown-up about one small mistake you made this week \u2014 and one thing you learned from it.", "taskCode": "T13"}'::jsonb, 25
from public.classes c
where c.slug = 'a-or-b-07'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Maya''s Solo Mission', '{"prompt": "Maya has a huge decision and is too proud to ask anyone. She goes in circles. Leo gently asks: \"Who could help you think about this?\" Everything shifts.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'a-or-b-08'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Who Can Help?', '{"prompt": "Tap-along: five situations. Child taps who Maya should ask for help \u2014 a parent, a teacher, a friend, or can she decide alone? Different characters appear as options.", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'a-or-b-08'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'My Decision Helpers', '{"prompt": "Draw the faces of three people you trust who could help you make a hard choice. Add their name or a symbol next to each.", "taskCode": "T11"}'::jsonb, 12
from public.classes c
where c.slug = 'a-or-b-08'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'One Pizza, Four Friends', '{"prompt": "There is one slice of pizza left. All four friends want it. What is the fairest way to decide \u2014 and who gets a voice?", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'a-or-b-09'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'simulation'::layer_type, 'Decide Together', '{"prompt": "Story pauses. Options: (A) Maya takes it \u2014 she was quickest. (B) They vote. (C) They share it equally. All three paths play out and show how everyone feels afterward.", "taskCode": "T07"}'::jsonb, 15
from public.classes c
where c.slug = 'a-or-b-09'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'quiz'::layer_type, 'After the Decision', '{"prompt": "Emotion faces for each character appear. Child maps how each character felt after each decision path. Builds empathy through consequence.", "taskCode": "T03"}'::jsonb, 10
from public.classes c
where c.slug = 'a-or-b-09'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Fair Feels Like', '{"prompt": "\"What does ''being fair'' mean to you? Tell Pip \u2014 and think of one example from your life.\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'a-or-b-09'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Maya''s Toolkit Moment', '{"prompt": "Maya faces her biggest choice of the module. She uses every tool she has learned \u2014 pause, think, consider others, ask for help \u2014 and makes a decision she feels proud of.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'a-or-b-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'reflection'::layer_type, 'Build My Toolkit', '{"prompt": "Drag 5 decision tools into Maya''s toolbox in the right order: Pause \u2192 Name what I want \u2192 Think about others \u2192 List my options \u2192 Decide and go.", "taskCode": "T12"}'::jsonb, 15
from public.classes c
where c.slug = 'a-or-b-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'My Toolkit Card', '{"prompt": "Draw your own Decision Toolkit card \u2014 five tools, one drawing for each. This is yours to keep.", "taskCode": "T11"}'::jsonb, 12
from public.classes c
where c.slug = 'a-or-b-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Use the Toolkit', '{"prompt": "The next time you have a decision to make \u2014 big or small \u2014 use at least one tool from your kit. Tell a grown-up which one you used.", "taskCode": "T13"}'::jsonb, 25
from public.classes c
where c.slug = 'a-or-b-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 5, 'reflection'::layer_type, 'Module Reflection', '{"prompt": "\"What is the hardest part of making a decision? And what tool from your kit will you use most? Tell Pip.\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'a-or-b-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 5);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'The Leader Debate', '{"prompt": "Maya says a leader is the strongest. Leo says a leader is the kindest. Dash says it''s whoever runs fastest. Pip has no idea. Nobody agrees \u2014 which kicks off the whole module.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'being-a-good-example-01'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Leader or Not a Leader?', '{"prompt": "Eight illustrated scenarios. Child matches each to: Real Leader or Just Looks Like One. Example: \"Takes credit for the group''s work\" vs \"Stays late to help someone finish.\"", "taskCode": "T03"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-01'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'quiz'::layer_type, 'Leader Check', '{"prompt": "Q1: What does Maya think makes a leader? Q2: What does Leo think? Q3: What do YOU think is the most important thing a leader does?", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-01'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'My Leader', '{"prompt": "\"Think of someone you think is a good leader. What do they DO that makes you think that? Tell Pip.\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-01'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Leo Picks It Up', '{"prompt": "The whole group walks past the litter. Leo looks at it, looks around \u2014 nobody''s watching \u2014 and picks it up anyway. Dash notices and is genuinely surprised.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'being-a-good-example-02'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Do It vs. Wait to Be Asked', '{"prompt": "Split screen: three scenarios. Left \u2014 child waits to be told. Right \u2014 child acts without being asked. Child taps which made the bigger difference.", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-02'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'Capture the Moment', '{"prompt": "Take a photo of something you helped with, tidied, or made better \u2014 before anyone asked you to. Submit it here.", "taskCode": "T13"}'::jsonb, 25
from public.classes c
where c.slug = 'being-a-good-example-02'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Do One Thing Without Being Asked', '{"prompt": "Today, do one helpful thing at home or at school WITHOUT being asked \u2014 and don''t tell anyone unless they notice.", "taskCode": "T13"}'::jsonb, 25
from public.classes c
where c.slug = 'being-a-good-example-02'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Maya Finds a Wallet', '{"prompt": "Maya finds a small wallet at the park. Nobody is around. Inside is some money and a note with an address. What does she do?", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'being-a-good-example-03'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'simulation'::layer_type, 'What Should Maya Do?', '{"prompt": "Story pauses. Options: (A) Keep it \u2014 nobody will ever know. (B) Leave it \u2014 not her problem. (C) Try to return it \u2014 even though it''s hard. Three paths play out.", "taskCode": "T07"}'::jsonb, 15
from public.classes c
where c.slug = 'being-a-good-example-03'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'Your Honest Moment', '{"prompt": "Record: \"Tell me about a time you did something right even though nobody was watching. How did it feel?\"", "taskCode": "T10"}'::jsonb, 15
from public.classes c
where c.slug = 'being-a-good-example-03'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Integrity', '{"prompt": "\"What does it feel like when you do the right thing and nobody even notices? Is it still worth it? Tell Pip.\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-03'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Pip Falls Behind', '{"prompt": "The group is making progress on a project. Pip is stuck and won''t ask for help \u2014 she''s too embarrassed. Leo notices. Does he say something?", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'being-a-good-example-04'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Read Pip''s Feelings', '{"prompt": "Pip''s face changes across four moments in the story. Child maps the correct emotion to each: Embarrassed \u2192 Relieved \u2192 Grateful \u2192 Proud. Body map included.", "taskCode": "T03"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-04'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'simulation'::layer_type, 'How Should Leo Help?', '{"prompt": "Story pauses. Options: (A) Ignore it \u2014 not his job. (B) Tell the teacher without asking Pip first. (C) Quietly offer to help Pip himself. Each plays out.", "taskCode": "T07"}'::jsonb, 15
from public.classes c
where c.slug = 'being-a-good-example-04'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Help Someone Today', '{"prompt": "Today, notice if someone near you is struggling \u2014 and offer to help in a small way. Tell a grown-up what you did.", "taskCode": "T13"}'::jsonb, 25
from public.classes c
where c.slug = 'being-a-good-example-04'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Leo''s Moment', '{"prompt": "Dash is about to say something mean about Pip to get a laugh from others. Leo is right there. Speaking up means risking being laughed at too.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'being-a-good-example-05'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Bystander vs. Upstander', '{"prompt": "Split screen: Leo stays quiet (bystander) vs. Leo speaks up (upstander). Both play out. Child sees what happens to Pip in each version.", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-05'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'Upstander in Action', '{"prompt": "Draw Leo in the moment he speaks up. What is he saying? Add a speech bubble with his brave words.", "taskCode": "T11"}'::jsonb, 12
from public.classes c
where c.slug = 'being-a-good-example-05'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'quiz'::layer_type, 'Upstander Check', '{"prompt": "Q1: What is the difference between a bystander and an upstander? Q2: Why is speaking up hard? Q3: What could you say if you saw someone being treated unfairly?", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-05'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Maya''s Cover-Up', '{"prompt": "Maya makes an error in the group''s plan \u2014 and instead of admitting it, she blames a missing supply. Things get worse. Leo suspects. The tension builds.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'being-a-good-example-06'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'simulation'::layer_type, 'Should Maya Come Clean?', '{"prompt": "Story pauses. Options: (A) Keep covering it up. (B) Quietly fix it alone and hope nobody notices. (C) Tell the group honestly and ask for help fixing it.", "taskCode": "T07"}'::jsonb, 15
from public.classes c
where c.slug = 'being-a-good-example-06'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'Owning a Mistake', '{"prompt": "Record: \"Tell me about a time you made a mistake and had to decide whether to own up to it. What happened?\"", "taskCode": "T10"}'::jsonb, 15
from public.classes c
where c.slug = 'being-a-good-example-06'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Mistakes and Leadership', '{"prompt": "\"Does making a mistake mean you''re a bad leader? What makes the difference? Tell Pip.\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-06'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Maya Takes Over', '{"prompt": "The group is putting on a small show. Maya keeps adjusting everyone''s parts to make hers bigger. Leo steps back so Pip can shine \u2014 and the show becomes amazing.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'being-a-good-example-07'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Who Gets to Shine?', '{"prompt": "Tap-along: five moments in the show. Child taps when Maya is lifting others up vs. when she''s taking over. Builds awareness of the difference.", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-07'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'Put the Steps in Order', '{"prompt": "Drag-and-drop: steps to help someone else shine \u2014 Notice what they''re good at \u2192 Tell them \u2192 Give them the opportunity \u2192 Cheer them on \u2192 Celebrate their win.", "taskCode": "T12"}'::jsonb, 15
from public.classes c
where c.slug = 'being-a-good-example-07'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Shine the Light on Someone Else', '{"prompt": "This week, say something genuinely kind about what someone ELSE did well \u2014 in front of at least one other person.", "taskCode": "T13"}'::jsonb, 25
from public.classes c
where c.slug = 'being-a-good-example-07'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'The Lonely Lunch Table', '{"prompt": "Maya and Leo pass a child sitting alone. Maya nearly keeps walking. Leo stops. The story follows both choices \u2014 and shows what one moment of kindness does to a whole day.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'being-a-good-example-08'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'simulation'::layer_type, 'Open Your Eyes with Pip', '{"prompt": "A 40-second guided visual with Pip: \"Close your eyes. Think of someone who might be feeling alone or left out near you. What does their face look like? How might they feel? Now breathe out.\"", "taskCode": "T09"}'::jsonb, 12
from public.classes c
where c.slug = 'being-a-good-example-08'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'simulation'::layer_type, 'What Should Maya Do?', '{"prompt": "Story resumes at the choice moment. Options: (A) Walk past \u2014 it''s not her job. (B) Walk past but feel guilty. (C) Sit down and say hello. All three paths play out.", "taskCode": "T07"}'::jsonb, 15
from public.classes c
where c.slug = 'being-a-good-example-08'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Your Kindness Moment', '{"prompt": "\"Is there someone near you who might be lonely or left out? What''s one small thing you could do? Tell Pip \u2014 just between you two.\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-08'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Leaders All Around Us', '{"prompt": "The whole group looks at five real-life everyday leaders: an older sibling who comforts a crying child, a classmate who includes the new kid, a teacher who admits she was wrong, a friend who keeps a secret safe, a child who says \"this isn''t fair\" in a moment of injustice.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'being-a-good-example-09'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Match the Leadership Quality', '{"prompt": "Five illustrated leader scenarios. Child matches each to the quality it shows: Courage, Kindness, Honesty, Fairness, Responsibility.", "taskCode": "T03"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-09'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'quiz'::layer_type, 'How Does Leadership Feel?', '{"prompt": "Six emotion faces. Child maps: \"How does the LEADER feel when they do the right thing?\" and \"How does the PERSON THEY HELPED feel?\" Two separate emotion maps side by side.", "taskCode": "T03"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-09'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Leaders Near Me', '{"prompt": "\"Who is a quiet leader in your life \u2014 someone who does good things without making a big deal of it? Tell Pip about them.\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-09'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Maya and Leo Look Back', '{"prompt": "Maya and Leo sit together and list everything the group did across the module: picked up litter, spoke up, helped Pip, shared the spotlight, owned mistakes. \"That,\" says Leo, \"is a leader.\"", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'being-a-good-example-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'reflection'::layer_type, 'My Leadership Shield', '{"prompt": "Draw your own leadership shield with four sections: one thing you did that was brave, one kind thing you did, one mistake you owned, one person you helped. This is yours.", "taskCode": "T11"}'::jsonb, 12
from public.classes c
where c.slug = 'being-a-good-example-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'My Leader Promise', '{"prompt": "Record: \"The kind of leader I am starting to be is\u2026 One thing I promise to keep doing is\u2026\"", "taskCode": "T10"}'::jsonb, 15
from public.classes c
where c.slug = 'being-a-good-example-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'One Leadership Act This Week', '{"prompt": "Choose one leadership quality from your shield and do it on purpose this week \u2014 without being asked or expecting praise.", "taskCode": "T13"}'::jsonb, 25
from public.classes c
where c.slug = 'being-a-good-example-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 5, 'reflection'::layer_type, 'Module Reflection', '{"prompt": "\"What does being a good example REALLY mean to you now \u2014 compared to what you thought at the start? Tell Pip.\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'being-a-good-example-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 5);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'All the feelings we met at the fair', '{"caption": "Curiosity. Joy. Sadness. Fear. Anger. Surprise. Worry. Pride. Mixed. You met them all.", "taskCode": "T02", "videoUrl": "https://cdn.sementa.app/v/c10-recap-montage.mp4", "durationSec": 30, "characterFocus": ["Maya", "Leo", "Dash", "Pip"]}'::jsonb, 3
from public.classes c
where c.slug = 'my-emotion-story-562d88ec'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Match each character to their feeling', '{"items": [{"label": "Maya \u2014 struggled with perfectionism", "bucket": "Pride & Frustration"}, {"label": "Leo \u2014 cared too much about others", "bucket": "Worry & Sadness"}, {"label": "Dash \u2014 reacted before thinking", "bucket": "Anger & Joy"}, {"label": "Pip \u2014 overthought everything", "bucket": "Fear & Worry"}], "buckets": [{"label": "Pride & Frustration", "colour": "#7B2FBE"}, {"label": "Worry & Sadness", "colour": "#1565C0"}, {"label": "Anger & Joy", "colour": "#C62828"}, {"label": "Fear & Worry", "colour": "#6A1B9A"}], "shuffle": false, "taskCode": "T03", "partialCredit": true}'::jsonb, 10
from public.classes c
where c.slug = 'my-emotion-story-562d88ec'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'simulation'::layer_type, 'A friend looks upset at the fair — what do you do?', '{"options": [{"label": "Walk past \u2014 it is not your business", "isOptimal": false, "outcomeText": "Your friend stays sad. You feel a little guilty later."}, {"label": "Sit next to them quietly and ask if they are OK", "isOptimal": true, "outcomeText": "Your friend looks up and smiles. Just being there helped."}, {"label": "Tell everyone your friend is upset so people come over", "isOptimal": false, "outcomeText": "Your friend feels embarrassed. Too much attention felt worse."}], "taskCode": "T07", "setupClipUrl": "https://cdn.sementa.app/v/c10-friend-upset.mp4", "showAllPaths": true, "decisionPrompt": "You are alone at the fair and spot a friend sitting by themselves looking sad. What do you do?"}'::jsonb, 15
from public.classes c
where c.slug = 'my-emotion-story-562d88ec'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Record your own Emotion Fair story', '{"maxSec": 90, "prompt": "Record a short story about your favourite moment from the Emotion Fair. Which feeling did you learn the most about?", "taskCode": "T10", "parentLabel": "My Emotion Fair Story", "characterResponse": "Maya"}'::jsonb, 15
from public.classes c
where c.slug = 'my-emotion-story-562d88ec'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 5, 'reflection'::layer_type, 'Name one feeling out loud every day this week', '{"title": "Daily Feelings Shout-Out", "taskCode": "T13", "windowDays": 7, "instruction": "Every day this week, name one feeling you have out loud to someone in your family. Just one feeling, once a day.", "missionType": "Practice", "parentNotice": "Your child has a week-long feelings mission! Each day they will name a feeling out loud \u2014 listen out for it!", "verifyForBonus": true}'::jsonb, 25
from public.classes c
where c.slug = 'my-emotion-story-562d88ec'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 5);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 6, 'reflection'::layer_type, 'What is your favourite feeling and why?', '{"prompt": "Out of all the feelings you explored \u2014 Happy, Sad, Scared, Angry, Surprised, Worried, Proud \u2014 which one was most interesting to learn about? Why?", "taskCode": "T14", "inputType": "Both", "journalLabel": "My Emotion Story"}'::jsonb, 10
from public.classes c
where c.slug = 'my-emotion-story-562d88ec'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 6);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Dash erupts at the Anger Volcano', '{"taskCode": "T01", "videoUrl": "https://cdn.sementa.app/v/c05-anger-volcano.mp4", "transcript": "Dash loses the game and ERUPTS \u2014 he knocks over the stall and storms off. Leo follows him. Together they discover that anger is not bad \u2014 it is what you DO with anger that matters.", "durationSec": 90, "skipAllowed": false, "characterFocus": ["Dash"]}'::jsonb, 5
from public.classes c
where c.slug = 'the-anger-volcano-48c5865c'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'foundation'::layer_type, 'The 5-second pause trick', '{"caption": "Before you react\u2026 1\u2026 2\u2026 3\u2026 4\u2026 5. NOW decide.", "taskCode": "T02", "videoUrl": "https://cdn.sementa.app/v/c05-pause-trick.mp4", "durationSec": 25, "characterFocus": ["Dash"]}'::jsonb, 3
from public.classes c
where c.slug = 'the-anger-volcano-48c5865c'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'quiz'::layer_type, 'True or False — what helps anger cool down?', '{"shuffle": true, "taskCode": "T04", "questions": [{"prompt": "Taking 5 deep breaths can help anger shrink.", "correct": "True", "options": ["True", "False"]}, {"prompt": "Hitting something makes the anger go away for good.", "correct": "False", "options": ["True", "False"]}, {"prompt": "Telling someone why you are angry can help.", "correct": "True", "options": ["True", "False"]}, {"prompt": "Screaming at your friend makes things better.", "correct": "False", "options": ["True", "False"]}, {"prompt": "Moving your body can help release anger energy.", "correct": "True", "options": ["True", "False"]}], "timeLimitSec": 5, "speedBonusSec": 2}'::jsonb, 10
from public.classes c
where c.slug = 'the-anger-volcano-48c5865c'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'simulation'::layer_type, 'Dash is about to lose it — what does he do?', '{"options": [{"label": "Shout at Leo and walk away", "isOptimal": false, "outcomeText": "Leo feels hurt. Dash still feels angry AND now feels guilty too."}, {"label": "Count to 5 and take a big breath", "isOptimal": true, "outcomeText": "The volcano cools. Dash can now talk about what happened."}, {"label": "Pretend nothing happened and keep playing", "isOptimal": false, "outcomeText": "The anger stays inside like a lid on a boiling pot. It comes out later."}], "taskCode": "T07", "setupClipUrl": "https://cdn.sementa.app/v/c05-dash-angry.mp4", "showAllPaths": true, "decisionPrompt": "Dash feels the volcano rising. What should he do RIGHT NOW?"}'::jsonb, 15
from public.classes c
where c.slug = 'the-anger-volcano-48c5865c'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 5, 'reflection'::layer_type, 'Try the pause before you react', '{"title": "The Pause Challenge", "taskCode": "T13", "windowDays": 7, "instruction": "This week, when you feel angry, try the 5-second pause before you do anything. Then tell a grown-up how it went.", "missionType": "Practice", "parentNotice": "Your child is practising the 5-second pause this week \u2014 help them notice moments to use it!", "verifyForBonus": true}'::jsonb, 25
from public.classes c
where c.slug = 'the-anger-volcano-48c5865c'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 5);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 6, 'reflection'::layer_type, 'What does anger feel like in your body?', '{"prompt": "What does anger feel like in your body? What usually makes you feel that way?", "taskCode": "T14", "inputType": "Both", "journalLabel": "My Anger Map"}'::jsonb, 10
from public.classes c
where c.slug = 'the-anger-volcano-48c5865c'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 6);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Welcome to the Emotion Fair', '{"taskCode": "T01", "videoUrl": "https://www.youtube.com/watch?v=Kv6qKvCtszA", "transcript": "Maya and Leo arrive at a magical fair where every stall is a different feeling. Dash zooms past knocking things over \u2014 curious about everything. Pip peeks nervously from behind Maya. Together they discover that ALL feelings are welcome here.", "durationSec": 42, "skipAllowed": false, "characterFocus": ["Maya", "Leo", "Dash", "Pip"]}'::jsonb, 5
from public.classes c
where c.slug = 'the-fair-appears-80063a1e'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Sort the feelings into the 4 big jars', '{"items": [{"label": "Getting a warm hug", "bucket": "Happy"}, {"label": "Losing your favourite toy", "bucket": "Sad"}, {"label": "A big dog suddenly barks", "bucket": "Scared"}, {"label": "Someone takes your turn", "bucket": "Angry"}, {"label": "Finding a surprise present", "bucket": "Happy"}, {"label": "Missing your grandma", "bucket": "Sad"}], "buckets": [{"label": "Happy", "colour": "#F5A623"}, {"label": "Sad", "colour": "#1565C0"}, {"label": "Scared", "colour": "#6A1B9A"}, {"label": "Angry", "colour": "#C62828"}], "shuffle": true, "taskCode": "T03", "hintAfter": 2, "partialCredit": true}'::jsonb, 10
from public.classes c
where c.slug = 'the-fair-appears-80063a1e'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'Feeling Detective Mission', '{"title": "Feeling Detective", "taskCode": "T13", "windowDays": 1, "instruction": "Watch for 3 different feelings in your family today. Can you spot them?", "missionType": "Observe", "parentNotice": "Your child is a Feeling Detective today \u2014 ask them what emotions they spotted!", "verifyForBonus": true}'::jsonb, 25
from public.classes c
where c.slug = 'the-fair-appears-80063a1e'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Which feeling did you notice most?', '{"prompt": "Which feeling did you notice the most today? Where did you feel it in your body?", "taskCode": "T14", "inputType": "Both", "journalLabel": "My First Fair Visit"}'::jsonb, 10
from public.classes c
where c.slug = 'the-fair-appears-80063a1e'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Pip enters the Fear House', '{"taskCode": "T01", "videoUrl": "https://cdn.sementa.app/v/c04-fear-house.mp4", "transcript": "Pip is too scared to enter the Fear House alone. Maya holds her paw and goes in with her. Inside they discover that fear is actually trying to protect you \u2014 it is your body saying be careful.", "durationSec": 85, "skipAllowed": false, "characterFocus": ["Pip"]}'::jsonb, 5
from public.classes c
where c.slug = 'the-fear-house-26e19f4a'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'simulation'::layer_type, 'A 2-minute calm breathing journey', '{"guide": "Pip", "script": "Breathe in as Pip grows bigger\u2026 hold\u2026 breathe out as Pip shrinks back down. You are safe. Fear is just your body looking after you.", "audioUrl": "https://cdn.sementa.app/audio/c04-pip-breathing.mp3", "taskCode": "T09", "visualUrl": "https://cdn.sementa.app/v/c04-breathing-visual.mp4", "durationSec": 120}'::jsonb, 12
from public.classes c
where c.slug = 'the-fear-house-26e19f4a'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'quiz'::layer_type, 'Helpful fears vs. unhelpful fears', '{"items": [{"label": "Fear of touching a hot stove", "bucket": "Helpful"}, {"label": "Fear of trying a new food", "bucket": "Unhelpful"}, {"label": "Fear of running into traffic", "bucket": "Helpful"}, {"label": "Fear of making a mistake", "bucket": "Unhelpful"}, {"label": "Fear of a very big dog chasing you", "bucket": "Helpful"}, {"label": "Fear of asking a question in class", "bucket": "Unhelpful"}], "buckets": [{"label": "Helpful", "colour": "#2E7D32"}, {"label": "Unhelpful", "colour": "#C62828"}], "shuffle": true, "taskCode": "T03", "hintAfter": 2, "partialCredit": true}'::jsonb, 10
from public.classes c
where c.slug = 'the-fear-house-26e19f4a'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'quiz'::layer_type, 'Where do you feel fear in your body?', '{"prompt": "Tap all the places where you feel fear in your body.", "taskCode": "T06", "bodyRegions": ["head", "chest", "stomach", "legs", "hands"], "characterComment": {"legs": "Wobbly legs are your body getting ready to run \u2014 just in case!", "chest": "Pip feels it here too \u2014 a fast heartbeat!", "stomach": "That butterfly feeling? That is fear saying hello."}}'::jsonb, 8
from public.classes c
where c.slug = 'the-fear-house-26e19f4a'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 5, 'reflection'::layer_type, 'What helps you feel less scared?', '{"prompt": "What is something that scares you? What helps you feel less scared?", "taskCode": "T14", "inputType": "Both", "journalLabel": "My Brave Moment"}'::jsonb, 10
from public.classes c
where c.slug = 'the-fear-house-26e19f4a'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 5);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Everyone feels TWO things at once', '{"taskCode": "T01", "videoUrl": "https://cdn.sementa.app/v/c09-feelings-mix.mp4", "transcript": "It is the last day of the Emotion Fair. Everyone is excited it was so fun \u2014 AND sad that it is ending. Dash is proud he won a race AND embarrassed he cried earlier. They discover you can feel two things at exactly the same time, and BOTH feelings are real.", "durationSec": 85, "skipAllowed": false, "characterFocus": ["Maya", "Leo", "Dash", "Pip"]}'::jsonb, 5
from public.classes c
where c.slug = 'the-feelings-mix-be746fba'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'foundation'::layer_type, 'It is OK to feel more than one thing', '{"caption": "Happy AND nervous. Excited AND scared. You are not confused \u2014 you are human.", "taskCode": "T02", "videoUrl": "https://cdn.sementa.app/v/c09-two-feelings.mp4", "durationSec": 20, "characterFocus": ["Pip"]}'::jsonb, 3
from public.classes c
where c.slug = 'the-feelings-mix-be746fba'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'quiz'::layer_type, 'One event — two feelings. Can both be true?', '{"cards": [{"answer": "Excited AND Nervous \u2014 both true", "situation": "Starting at a new school"}, {"answer": "Sad AND Happy for them \u2014 both true", "situation": "Your best friend moves away"}, {"answer": "Proud AND Guilty \u2014 both true", "situation": "Winning but your friend loses"}, {"answer": "Sad AND Ready \u2014 both true", "situation": "The holidays ending"}], "shuffle": true, "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'the-feelings-mix-be746fba'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'quiz'::layer_type, 'Mark where you feel TWO emotions at once', '{"prompt": "Think of a time you felt two feelings together. Tap where you felt EACH one in your body.", "taskCode": "T06", "bodyRegions": ["head", "chest", "stomach", "legs", "hands"], "multiSelect": true, "characterComment": {"head": "When your head feels foggy, it might be two feelings at once.", "chest": "Two feelings in the chest at once \u2014 your heart is very busy!", "stomach": "Mixed feelings often land in the stomach first."}}'::jsonb, 8
from public.classes c
where c.slug = 'the-feelings-mix-be746fba'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 5, 'reflection'::layer_type, 'Notice a moment of two feelings today', '{"title": "Two-Feelings Spotter", "taskCode": "T13", "windowDays": 1, "instruction": "Today, try to catch a moment when you feel TWO things at the same time. Tell a grown-up about it tonight.", "missionType": "Observe", "parentNotice": "Your child is spotting mixed feelings today \u2014 ask them if they caught any!", "verifyForBonus": true}'::jsonb, 25
from public.classes c
where c.slug = 'the-feelings-mix-be746fba'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 5);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 6, 'reflection'::layer_type, 'When did you last feel two feelings together?', '{"prompt": "Can you remember a time you felt two different feelings at exactly the same time? What were they? What caused them?", "taskCode": "T14", "inputType": "Both", "journalLabel": "My Feelings Mix"}'::jsonb, 10
from public.classes c
where c.slug = 'the-feelings-mix-be746fba'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 6);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Dash discovers the Happy Stall', '{"taskCode": "T01", "videoUrl": "https://cdn.sementa.app/v/c02-happy-stall.mp4", "transcript": "Dash wins a race at the fair and is bursting with joy \u2014 but he does not know what to do with such a big feeling. Leo helps him find the Happy Stall, where they learn that sharing joy makes it grow even bigger.", "durationSec": 75, "skipAllowed": false, "characterFocus": ["Dash", "Leo"]}'::jsonb, 5
from public.classes c
where c.slug = 'the-happy-stall-79f23309'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'True or False — what makes happy GROW?', '{"shuffle": true, "taskCode": "T04", "questions": [{"prompt": "Sharing happy feelings makes them grow.", "correct": "True", "options": ["True", "False"]}, {"prompt": "Bragging is the same as celebrating.", "correct": "False", "options": ["True", "False"]}, {"prompt": "Jumping with a friend doubles the joy.", "correct": "True", "options": ["True", "False"]}, {"prompt": "Keeping joy to yourself makes it last longer.", "correct": "False", "options": ["True", "False"]}], "timeLimitSec": 5, "speedBonusSec": 2}'::jsonb, 10
from public.classes c
where c.slug = 'the-happy-stall-79f23309'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'simulation'::layer_type, 'Dash wins 1st place — what should he do?', '{"options": [{"label": "Run in shouting and push everyone aside", "isOptimal": false, "outcomeText": "The other animals feel left out. Dash feels lonely at the top."}, {"label": "Find Leo and celebrate together", "isOptimal": true, "outcomeText": "Leo jumps for joy with Dash. The happiness doubles!"}, {"label": "Hide the trophy so no one feels bad", "isOptimal": false, "outcomeText": "Dash feels flat. Hiding joy does not protect others \u2014 it just shrinks yours."}], "taskCode": "T07", "setupClipUrl": "https://cdn.sementa.app/v/c02-dash-wins.mp4", "showAllPaths": true, "decisionPrompt": "Dash is bursting with joy after winning. What should he do?"}'::jsonb, 15
from public.classes c
where c.slug = 'the-happy-stall-79f23309'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Draw what made YOU happy this week', '{"prompt": "Draw or stamp what made you happy this week.", "taskCode": "T11", "voiceLayer": true, "parentLabel": "My Happy Moment"}'::jsonb, 12
from public.classes c
where c.slug = 'the-happy-stall-79f23309'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 5, 'reflection'::layer_type, 'When do you feel happiest?', '{"prompt": "When do you feel happiest? What does happy feel like in your body?", "taskCode": "T14", "inputType": "Both", "journalLabel": "My Happy Story"}'::jsonb, 10
from public.classes c
where c.slug = 'the-happy-stall-79f23309'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 5);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Maya leads the Proud Parade', '{"taskCode": "T01", "videoUrl": "https://cdn.sementa.app/v/c08-proud-parade.mp4", "transcript": "Maya finally finishes her tower \u2014 the one that kept falling down. She feels something warm and tall in her chest. That is pride. But when she starts telling EVERYONE how amazing she is, her friends start looking away. Leo helps her see the difference between proud and boastful.", "durationSec": 80, "skipAllowed": false, "characterFocus": ["Maya"]}'::jsonb, 5
from public.classes c
where c.slug = 'the-proud-parade-f912940f'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Proud or boastful?', '{"shuffle": true, "taskCode": "T04", "questions": [{"prompt": "Sharing your work with a smile.", "correct": "Proud", "options": ["Proud", "Boastful"]}, {"prompt": "Telling everyone yours is the best.", "correct": "Boastful", "options": ["Proud", "Boastful"]}, {"prompt": "Feeling good inside about what you did.", "correct": "Proud", "options": ["Proud", "Boastful"]}, {"prompt": "Saying others are not as good as you.", "correct": "Boastful", "options": ["Proud", "Boastful"]}, {"prompt": "Saying thank you when someone says well done.", "correct": "Proud", "options": ["Proud", "Boastful"]}], "timeLimitSec": 5}'::jsonb, 10
from public.classes c
where c.slug = 'the-proud-parade-f912940f'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'simulation'::layer_type, 'Maya finishes her drawing — how does she share it?', '{"options": [{"label": "Show it to Leo and say I worked really hard on this", "isOptimal": true, "outcomeText": "Leo smiles and says it is brilliant. Maya feels warm and connected."}, {"label": "Hold it up and announce it is the best drawing ever", "isOptimal": false, "outcomeText": "Some friends roll their eyes. Maya feels proud but alone."}, {"label": "Hide it because she is worried people will not like it", "isOptimal": false, "outcomeText": "Maya misses the chance to feel proud. Her effort goes unseen."}], "taskCode": "T07", "setupClipUrl": "https://cdn.sementa.app/v/c08-maya-drawing.mp4", "showAllPaths": true, "decisionPrompt": "Maya is so proud of her drawing. What should she do?"}'::jsonb, 15
from public.classes c
where c.slug = 'the-proud-parade-f912940f'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Draw something you are proud of', '{"prompt": "Draw something you worked hard on and feel proud of.", "taskCode": "T11", "voiceLayer": true, "parentLabel": "My Proud Moment"}'::jsonb, 12
from public.classes c
where c.slug = 'the-proud-parade-f912940f'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 5, 'reflection'::layer_type, 'Tell one person something you are proud of today', '{"title": "Proud Share Mission", "taskCode": "T13", "windowDays": 1, "instruction": "Today, tell one person \u2014 a parent, friend, or teacher \u2014 something you are proud of. Notice how it feels.", "missionType": "Share", "parentNotice": "Your child has a Proud Share mission today \u2014 give them a moment to tell you something they are proud of!", "verifyForBonus": true}'::jsonb, 25
from public.classes c
where c.slug = 'the-proud-parade-f912940f'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 5);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 6, 'reflection'::layer_type, 'What does proud feel like?', '{"prompt": "What does proud feel like in your body? What is something you did recently that made you feel proud?", "taskCode": "T14", "inputType": "Both", "journalLabel": "My Proud Story"}'::jsonb, 10
from public.classes c
where c.slug = 'the-proud-parade-f912940f'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 6);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Maya finds the Sad Corner', '{"taskCode": "T01", "videoUrl": "https://cdn.sementa.app/v/c03-sad-corner.mp4", "transcript": "Maya cannot find her drawing and feels a wave of sadness. Pip sits beside her quietly. Together they learn that sadness is not dangerous \u2014 it is a signal that something mattered to you.", "durationSec": 80, "skipAllowed": false, "characterFocus": ["Maya", "Pip"]}'::jsonb, 5
from public.classes c
where c.slug = 'the-sad-corner-bfa92978'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Helpful or not helpful when a friend is sad?', '{"cards": [{"helpful": true, "situation": "Sit quietly next to them"}, {"helpful": false, "situation": "Tell them to cheer up immediately"}, {"helpful": true, "situation": "Ask if they want to talk"}, {"helpful": false, "situation": "Laugh at them for crying"}, {"helpful": true, "situation": "Give them a gentle hug"}, {"helpful": false, "situation": "Tell them their feelings are silly"}], "shuffle": true, "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'the-sad-corner-bfa92978'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'What would you say to a sad friend?', '{"maxSec": 60, "prompt": "Record a message you would say to a friend who is feeling sad.", "taskCode": "T10", "parentLabel": "Kind Words", "characterResponse": "Pip"}'::jsonb, 15
from public.classes c
where c.slug = 'the-sad-corner-bfa92978'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Comfort someone this week', '{"title": "Kindness Mission", "taskCode": "T13", "windowDays": 7, "instruction": "This week, notice when someone around you feels sad. Do one kind thing for them.", "missionType": "Act", "parentNotice": "Your child has a kindness mission this week \u2014 ask them how it went!", "verifyForBonus": true}'::jsonb, 25
from public.classes c
where c.slug = 'the-sad-corner-bfa92978'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 5, 'reflection'::layer_type, 'When did sadness visit you?', '{"prompt": "When did you last feel sad? What helped you feel better?", "taskCode": "T14", "inputType": "Both", "journalLabel": "My Sad Moment"}'::jsonb, 10
from public.classes c
where c.slug = 'the-sad-corner-bfa92978'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 5);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Leo gets the biggest surprise at the tent', '{"taskCode": "T01", "videoUrl": "https://cdn.sementa.app/v/c06-surprise-tent.mp4", "transcript": "Leo opens the Surprise Tent and finds all his friends inside waiting for him. His eyes go wide \u2014 his heart leaps. But then he wonders: can a surprise be scary too? Together they explore the difference between a good surprise and an unwanted one.", "durationSec": 70, "skipAllowed": false, "characterFocus": ["Leo"]}'::jsonb, 5
from public.classes c
where c.slug = 'the-surprise-tent-d96a30c2'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Good surprise or tricky surprise?', '{"shuffle": true, "taskCode": "T04", "questions": [{"prompt": "Your friend jumps out and shouts BOO.", "correct": "Tricky", "options": ["Good", "Tricky"]}, {"prompt": "Your family throws you a secret party.", "correct": "Good", "options": ["Good", "Tricky"]}, {"prompt": "Someone moves your things without asking.", "correct": "Tricky", "options": ["Good", "Tricky"]}, {"prompt": "You find a lost toy you forgot about.", "correct": "Good", "options": ["Good", "Tricky"]}, {"prompt": "Your plans change without anyone telling you.", "correct": "Tricky", "options": ["Good", "Tricky"]}], "timeLimitSec": 6}'::jsonb, 10
from public.classes c
where c.slug = 'the-surprise-tent-d96a30c2'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'quiz'::layer_type, 'How do these characters feel?', '{"cards": [{"answer": "Surprised and Happy", "situation": "Leo opens the tent and sees all his friends"}, {"answer": "Surprised and Scared", "situation": "Pip hears a loud bang behind her"}, {"answer": "Surprised and Angry", "situation": "Dash finds someone already used his favourite stall"}, {"answer": "Surprised and Relieved", "situation": "Maya finds her missing drawing on the ground"}], "shuffle": true, "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'the-surprise-tent-d96a30c2'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Draw your most surprising moment ever', '{"prompt": "Draw the most surprising thing that has ever happened to you.", "taskCode": "T11", "voiceLayer": true, "parentLabel": "My Big Surprise"}'::jsonb, 12
from public.classes c
where c.slug = 'the-surprise-tent-d96a30c2'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 5, 'reflection'::layer_type, 'What was the last thing that surprised you?', '{"prompt": "What was the last thing that surprised you? Was it a good surprise or a tricky one? How did your body feel?", "taskCode": "T14", "inputType": "Both", "journalLabel": "My Surprise Story"}'::jsonb, 10
from public.classes c
where c.slug = 'the-surprise-tent-d96a30c2'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 5);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Pip gets stuck on the Worry Spinner', '{"taskCode": "T01", "videoUrl": "https://cdn.sementa.app/v/c07-worry-spinner.mp4", "transcript": "Pip cannot get off the Worry Spinner \u2014 her thoughts keep going round and round. What if it rains? What if she gets lost? What if nobody likes her drawing? Maya takes her hand and teaches her the Worry Jar trick: catch the worry, look at it, then decide if it needs action \u2014 or can be let go.", "durationSec": 85, "skipAllowed": false, "characterFocus": ["Pip", "Maya"]}'::jsonb, 5
from public.classes c
where c.slug = 'the-worry-spinner-e1bf4dde'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'simulation'::layer_type, 'Pip''s worry jar breathing journey', '{"guide": "Pip", "script": "Imagine your worry as a little cloud. Breathe it in\u2026 now put it gently in the jar\u2026 screw on the lid. It is safe in there. You are safe out here. Breathe out slowly.", "audioUrl": "https://cdn.sementa.app/audio/c07-worry-jar.mp3", "taskCode": "T09", "visualUrl": "https://cdn.sementa.app/v/c07-worry-visual.mp4", "durationSec": 90}'::jsonb, 12
from public.classes c
where c.slug = 'the-worry-spinner-e1bf4dde'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'quiz'::layer_type, 'Things I can control vs. things I cannot', '{"items": [{"label": "Whether it rains tomorrow", "bucket": "Cannot Control"}, {"label": "How I react when something goes wrong", "bucket": "Can Control"}, {"label": "What other people think of me", "bucket": "Cannot Control"}, {"label": "Whether I try my best", "bucket": "Can Control"}, {"label": "If my friend is in a bad mood", "bucket": "Cannot Control"}, {"label": "How kind I am today", "bucket": "Can Control"}], "buckets": [{"label": "Can Control", "colour": "#2E7D32"}, {"label": "Cannot Control", "colour": "#888888"}], "shuffle": true, "taskCode": "T03", "hintAfter": 2, "partialCredit": true}'::jsonb, 10
from public.classes c
where c.slug = 'the-worry-spinner-e1bf4dde'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Tell Pip one worry you have right now', '{"maxSec": 60, "prompt": "Record a message to Pip. Tell her one worry you have and what you are going to do with it.", "taskCode": "T10", "parentLabel": "My Worry Jar", "characterResponse": "Pip"}'::jsonb, 15
from public.classes c
where c.slug = 'the-worry-spinner-e1bf4dde'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 5, 'reflection'::layer_type, 'What do you do when you feel worried?', '{"prompt": "What do you usually worry about? What do you do that helps the worry feel smaller?", "taskCode": "T14", "inputType": "Both", "journalLabel": "My Worry Toolkit"}'::jsonb, 10
from public.classes c
where c.slug = 'the-worry-spinner-e1bf4dde'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 5);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Leo Goes Quiet', '{"prompt": "Leo has something important to tell Pip but keeps going silent. The child watches what happens when feelings have no words.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'using-my-words-01'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'foundation'::layer_type, 'Why Words Matter', '{"prompt": "20-second clip: Leo''s thoughts appear as bubbles \u2014 the moment he speaks one out loud, the bubble floats free.", "taskCode": "T02"}'::jsonb, 3
from public.classes c
where c.slug = 'using-my-words-01'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'quiz'::layer_type, 'Words Check', '{"prompt": "Q1: Why did Leo go quiet? Q2: What happened when Leo finally spoke? Q3: What is one word for how Leo felt?", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-01'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Your Turn', '{"prompt": "Pip asks: \"Has a feeling ever gotten stuck inside you? What did it feel like?\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-01'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'The Feeling Mountain', '{"prompt": "Leo''s feelings pile up like boulders. Pip names each one \u2014 happy, sad, scared, angry, surprised, disgusted \u2014 and the mountain shrinks.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'using-my-words-02'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Sort the Feelings', '{"prompt": "Six emotion faces appear. Child drags each one into Leo''s body \u2014 where does he feel it? Chest, tummy, head, hands.", "taskCode": "T03"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-02'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'quiz'::layer_type, 'Feelings Quiz', '{"prompt": "Q1: How many core feelings did Pip name? Q2: Where did Leo feel \"scared\" in his body? Q3: What feeling shrinks when you name it?", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-02'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Feeling Finder Mission', '{"prompt": "Tonight before bed, tell someone in your house ONE feeling you had today and WHERE you felt it in your body.", "taskCode": "T13"}'::jsonb, 25
from public.classes c
where c.slug = 'using-my-words-02'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Dash Can''t Sit Still', '{"prompt": "Dash is excited but nobody knows \u2014 he just runs circles. Leo shows Dash how to say \"I''m excited!\" and everything changes.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'using-my-words-03'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Show vs. Tell', '{"prompt": "Split screen: Left \u2014 Dash acting out his feeling with no words (confusion). Right \u2014 Dash using words (everyone helps). Child taps the better path.", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-03'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'Draw Leo''s Body', '{"prompt": "Leo is nervous about something. Use the drawing tool to colour where YOU think Leo feels nervous in his body.", "taskCode": "T11"}'::jsonb, 12
from public.classes c
where c.slug = 'using-my-words-03'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Body Talk', '{"prompt": "\"What does YOUR body do when you''re excited? Nervous? Draw it or tell Pip.\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-03'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Leo Learns a Magic Sentence', '{"prompt": "Maya teaches Leo: \"I feel [feeling] when [thing happens].\" Leo practises it three times in the story.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'using-my-words-04'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Finish Leo''s Sentence', '{"prompt": "Tap-along panels: Leo''s speech bubble is blank. Child taps the right feeling word to complete each \"I feel\u2026\" sentence. Three panels.", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-04'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'quiz'::layer_type, 'Formula Check', '{"prompt": "Q1: What are the two parts of the I Feel sentence? Q2: Leo says \"I feel __ when you take my things.\" What word fits the blank? Q3: Why is \"I feel\" safer than \"You always\"?", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-04'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Record Your I Feel', '{"prompt": "Record a voice message using the I Feel formula about something that happened at school or home today.", "taskCode": "T10"}'::jsonb, 15
from public.classes c
where c.slug = 'using-my-words-04'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 5, 'reflection'::layer_type, 'I Feel in Real Life', '{"prompt": "Today, use the I Feel sentence once with a real person \u2014 a family member, a friend, or your teacher.", "taskCode": "T13"}'::jsonb, 25
from public.classes c
where c.slug = 'using-my-words-04'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 5);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Maya''s Big Voice', '{"prompt": "Maya gets frustrated and shouts at Leo. He looks hurt. The story pauses \u2014 what could Maya have said instead?", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'using-my-words-05'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'simulation'::layer_type, 'What Should Maya Do?', '{"prompt": "Story pauses. Options: (A) Shout louder. (B) Walk away and say nothing. (C) Take a breath and say \"I feel frustrated when\u2026\". Each path plays out.", "taskCode": "T07"}'::jsonb, 15
from public.classes c
where c.slug = 'using-my-words-05'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'Calm Words', '{"prompt": "\"Think of a time you felt like shouting. What calmer words could you have used instead? Tell Pip.\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-05'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Pip Is Frozen', '{"prompt": "Pip desperately wants to tell Leo something but freezes every time she opens her mouth. Leo and the child must help.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'using-my-words-06'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'simulation'::layer_type, 'Breathe First with Pip', '{"prompt": "Pip leads a 45-second breathing exercise: \"Breathe in for 4, hold for 2, breathe out for 4.\" Calm visual of a growing flower. When calm, words come easier.", "taskCode": "T09"}'::jsonb, 12
from public.classes c
where c.slug = 'using-my-words-06'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'simulation'::layer_type, 'Help Pip Speak', '{"prompt": "Story pauses. Pip is scared. Options: (A) Give up and say nothing. (B) Take one breath then say one word. (C) Write it on a note instead of speaking.", "taskCode": "T07"}'::jsonb, 15
from public.classes c
where c.slug = 'using-my-words-06'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Brave Pip Voice Note', '{"prompt": "Record a voice message: \"One time I found it hard to speak up was\u2026 and what I did or could do is\u2026\"", "taskCode": "T10"}'::jsonb, 15
from public.classes c
where c.slug = 'using-my-words-06'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Leo Waits and Waits', '{"prompt": "Leo is hungry but doesn''t say so. He waits, gets grumpy, and the day goes wrong. Dash shows him: \"Just ask!\"", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'using-my-words-07'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Match the Need to the Word', '{"prompt": "Six illustrated needs (hungry, tired, scared, lonely, confused, hurt) appear. Child matches each to the correct \"asking\" sentence Leo could use.", "taskCode": "T03"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-07'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'quiz'::layer_type, 'Asking Check', '{"prompt": "Q1: What happened to Leo when he didn''t ask for what he needed? Q2: Is asking for help brave or selfish? Q3: What is one thing you sometimes need but find hard to ask for?", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-07'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Ask for One Thing', '{"prompt": "Today, ask clearly for one thing you need from a family member \u2014 using words, not hints.", "taskCode": "T13"}'::jsonb, 25
from public.classes c
where c.slug = 'using-my-words-07'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Leo''s Unkind Word', '{"prompt": "Leo says something unkind to Dash without thinking. Dash droops. Leo learns that some words can''t be unsaid \u2014 but a real apology helps.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'using-my-words-08'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Hurtful vs. Helpful', '{"prompt": "Split screen examples: same situation, two different word choices. Child taps which side made things better each time. Three rounds.", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-08'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'Words I Want to Use More', '{"prompt": "Draw a speech bubble. Inside it, write or draw 3 helpful words you want to use more this week.", "taskCode": "T11"}'::jsonb, 12
from public.classes c
where c.slug = 'using-my-words-08'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Apology Practice', '{"prompt": "\"Is there a word you said that you wish you could take back? What would you say instead now? Tell Pip \u2014 just between you two.\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-08'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Maya Doesn''t Listen', '{"prompt": "Maya is so excited to share her idea that she talks over Leo the whole time. Leo''s face falls. The story explores what real listening looks like.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'using-my-words-09'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'quiz'::layer_type, 'Good Listener Tap-Along', '{"prompt": "Four panels of Leo and Maya talking. Child taps the panel where Maya is being a GOOD listener. Wrong taps show a gentle consequence.", "taskCode": "T05"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-09'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'Build the Listening Steps', '{"prompt": "Drag-and-drop: put the 4 listening steps in order \u2014 Stop talking \u2192 Look at the person \u2192 Wait for a pause \u2192 Respond with what you heard.", "taskCode": "T12"}'::jsonb, 15
from public.classes c
where c.slug = 'using-my-words-09'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'Who Listened to You?', '{"prompt": "\"Think of a time someone really listened to you. How did it make you feel? Tell Pip.\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-09'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 1, 'foundation'::layer_type, 'Leo''s Big Moment', '{"prompt": "Leo must speak up in front of Maya, Dash, and Pip to save the day. He''s terrified \u2014 but he remembers everything he''s learned.", "taskCode": "T01"}'::jsonb, 5
from public.classes c
where c.slug = 'using-my-words-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 1);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 2, 'simulation'::layer_type, 'Help Leo Choose', '{"prompt": "Three moments in the story where Leo can speak up or stay silent. Child guides all three. All paths play out \u2014 courage always leads somewhere good.", "taskCode": "T07"}'::jsonb, 15
from public.classes c
where c.slug = 'using-my-words-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 2);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 3, 'reflection'::layer_type, 'Your Brave Words', '{"prompt": "Record: \"The bravest thing I''ve said this module was\u2026 and I felt\u2026 afterwards.\"", "taskCode": "T10"}'::jsonb, 15
from public.classes c
where c.slug = 'using-my-words-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 3);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 4, 'reflection'::layer_type, 'One Brave Conversation', '{"prompt": "This week, have one conversation where you say something you''d normally keep inside \u2014 with a parent, friend, or sibling.", "taskCode": "T13"}'::jsonb, 25
from public.classes c
where c.slug = 'using-my-words-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 4);
insert into public.layers (class_id, position, type, title, config, xp_reward)
select c.id, 5, 'reflection'::layer_type, 'Module Reflection', '{"prompt": "\"What is the most important thing you learned about using your words? If you could tell Leo one thing, what would it be?\"", "taskCode": "T14"}'::jsonb, 10
from public.classes c
where c.slug = 'using-my-words-10'
  and not exists (select 1 from public.layers l where l.class_id = c.id and l.position = 5);

-- ---------- mission_crosswords (1 rows) ----------
insert into public.mission_crosswords (slug, title)
select 'emotions', 'Emotions Crossword'
where not exists (select 1 from public.mission_crosswords where slug = 'emotions');

-- ---------- mission_crossword_variants (3 rows) ----------
insert into public.mission_crossword_variants (crossword_id, difficulty, label, rows, cols, xp_reward)
select c.id, 'easy', 'Easy', 3, 5, 25
from public.mission_crosswords c
where c.slug = 'emotions'
  and not exists (select 1 from public.mission_crossword_variants v where v.crossword_id = c.id and v.difficulty = 'easy');
insert into public.mission_crossword_variants (crossword_id, difficulty, label, rows, cols, xp_reward)
select c.id, 'hard', 'Hard', 5, 6, 100
from public.mission_crosswords c
where c.slug = 'emotions'
  and not exists (select 1 from public.mission_crossword_variants v where v.crossword_id = c.id and v.difficulty = 'hard');
insert into public.mission_crossword_variants (crossword_id, difficulty, label, rows, cols, xp_reward)
select c.id, 'medium', 'Medium', 5, 6, 50
from public.mission_crosswords c
where c.slug = 'emotions'
  and not exists (select 1 from public.mission_crossword_variants v where v.crossword_id = c.id and v.difficulty = 'medium');

-- ---------- mission_crossword_words (13 rows) ----------
insert into public.mission_crossword_words (variant_id, number, direction, row, col, answer, clue, position)
select v.id, 1, 'A', 0, 0, 'SAD', 'Unhappy (3)', 0
from public.mission_crossword_variants v
join public.mission_crosswords c on c.id = v.crossword_id
where c.slug = 'emotions' and v.difficulty = 'easy'
  and not exists (select 1 from public.mission_crossword_words w where w.variant_id = v.id and w.position = 0);
insert into public.mission_crossword_words (variant_id, number, direction, row, col, answer, clue, position)
select v.id, 2, 'A', 2, 0, 'YAY', 'A cheer when you''re happy (3)', 1
from public.mission_crossword_variants v
join public.mission_crosswords c on c.id = v.crossword_id
where c.slug = 'emotions' and v.difficulty = 'easy'
  and not exists (select 1 from public.mission_crossword_words w where w.variant_id = v.id and w.position = 1);
insert into public.mission_crossword_words (variant_id, number, direction, row, col, answer, clue, position)
select v.id, 1, 'D', 0, 0, 'SHY', 'Quiet — doesn''t say much (3)', 2
from public.mission_crossword_variants v
join public.mission_crosswords c on c.id = v.crossword_id
where c.slug = 'emotions' and v.difficulty = 'easy'
  and not exists (select 1 from public.mission_crossword_words w where w.variant_id = v.id and w.position = 2);
insert into public.mission_crossword_words (variant_id, number, direction, row, col, answer, clue, position)
select v.id, 1, 'A', 0, 0, 'HAPPY', 'Feeling great with a big smile (5)', 0
from public.mission_crossword_variants v
join public.mission_crosswords c on c.id = v.crossword_id
where c.slug = 'emotions' and v.difficulty = 'hard'
  and not exists (select 1 from public.mission_crossword_words w where w.variant_id = v.id and w.position = 0);
insert into public.mission_crossword_words (variant_id, number, direction, row, col, answer, clue, position)
select v.id, 3, 'A', 1, 0, 'BORED', 'Feeling uninterested or tired of something (5)', 1
from public.mission_crossword_variants v
join public.mission_crosswords c on c.id = v.crossword_id
where c.slug = 'emotions' and v.difficulty = 'hard'
  and not exists (select 1 from public.mission_crossword_words w where w.variant_id = v.id and w.position = 1);
insert into public.mission_crossword_words (variant_id, number, direction, row, col, answer, clue, position)
select v.id, 4, 'A', 2, 1, 'HOPE', 'A feeling that good things will happen (4)', 2
from public.mission_crossword_variants v
join public.mission_crosswords c on c.id = v.crossword_id
where c.slug = 'emotions' and v.difficulty = 'hard'
  and not exists (select 1 from public.mission_crossword_words w where w.variant_id = v.id and w.position = 2);
insert into public.mission_crossword_words (variant_id, number, direction, row, col, answer, clue, position)
select v.id, 5, 'A', 3, 2, 'UGLY', 'Not nice to look at (4)', 3
from public.mission_crossword_variants v
join public.mission_crosswords c on c.id = v.crossword_id
where c.slug = 'emotions' and v.difficulty = 'hard'
  and not exists (select 1 from public.mission_crossword_words w where w.variant_id = v.id and w.position = 3);
insert into public.mission_crossword_words (variant_id, number, direction, row, col, answer, clue, position)
select v.id, 6, 'A', 4, 2, 'DULL', 'Boring; not exciting (4)', 4
from public.mission_crossword_variants v
join public.mission_crosswords c on c.id = v.crossword_id
where c.slug = 'emotions' and v.difficulty = 'hard'
  and not exists (select 1 from public.mission_crossword_words w where w.variant_id = v.id and w.position = 4);
insert into public.mission_crossword_words (variant_id, number, direction, row, col, answer, clue, position)
select v.id, 2, 'D', 0, 2, 'PROUD', 'Pleased with what you did (5)', 5
from public.mission_crossword_variants v
join public.mission_crosswords c on c.id = v.crossword_id
where c.slug = 'emotions' and v.difficulty = 'hard'
  and not exists (select 1 from public.mission_crossword_words w where w.variant_id = v.id and w.position = 5);
insert into public.mission_crossword_words (variant_id, number, direction, row, col, answer, clue, position)
select v.id, 1, 'A', 0, 0, 'HAPPY', 'Feeling great with a big smile (5)', 0
from public.mission_crossword_variants v
join public.mission_crosswords c on c.id = v.crossword_id
where c.slug = 'emotions' and v.difficulty = 'medium'
  and not exists (select 1 from public.mission_crossword_words w where w.variant_id = v.id and w.position = 0);
insert into public.mission_crossword_words (variant_id, number, direction, row, col, answer, clue, position)
select v.id, 3, 'A', 1, 0, 'BORED', 'Feeling uninterested or tired of something (5)', 1
from public.mission_crossword_variants v
join public.mission_crosswords c on c.id = v.crossword_id
where c.slug = 'emotions' and v.difficulty = 'medium'
  and not exists (select 1 from public.mission_crossword_words w where w.variant_id = v.id and w.position = 1);
insert into public.mission_crossword_words (variant_id, number, direction, row, col, answer, clue, position)
select v.id, 4, 'A', 4, 2, 'DULL', 'Boring; not exciting (4)', 2
from public.mission_crossword_variants v
join public.mission_crosswords c on c.id = v.crossword_id
where c.slug = 'emotions' and v.difficulty = 'medium'
  and not exists (select 1 from public.mission_crossword_words w where w.variant_id = v.id and w.position = 2);
insert into public.mission_crossword_words (variant_id, number, direction, row, col, answer, clue, position)
select v.id, 2, 'D', 0, 2, 'PROUD', 'Pleased with what you did (5)', 3
from public.mission_crossword_variants v
join public.mission_crosswords c on c.id = v.crossword_id
where c.slug = 'emotions' and v.difficulty = 'medium'
  and not exists (select 1 from public.mission_crossword_words w where w.variant_id = v.id and w.position = 3);

-- ---------- mission_quizzes (2 rows) ----------
insert into public.mission_quizzes (slug, title, pace, base_xp, per_right_xp, time_limit_sec)
select 'emotions-quickfire', 'Emotions Quick-Fire', 'quick', 50, 8, 8
where not exists (select 1 from public.mission_quizzes where slug = 'emotions-quickfire');
insert into public.mission_quizzes (slug, title, pace, base_xp, per_right_xp, time_limit_sec)
select 'emotions-quiz', 'Emotions Quiz', 'self-paced', 25, 5, null
where not exists (select 1 from public.mission_quizzes where slug = 'emotions-quiz');

-- ---------- mission_quiz_questions (20 rows) ----------
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 0, '😊 = ?', null
from public.mission_quizzes q
where q.slug = 'emotions-quickfire'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 0);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 1, '😢 = ?', null
from public.mission_quizzes q
where q.slug = 'emotions-quickfire'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 1);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 2, '😠 = ?', null
from public.mission_quizzes q
where q.slug = 'emotions-quickfire'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 2);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 3, '😨 = ?', null
from public.mission_quizzes q
where q.slug = 'emotions-quickfire'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 3);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 4, 'Opposite of HAPPY?', null
from public.mission_quizzes q
where q.slug = 'emotions-quickfire'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 4);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 5, 'Opposite of CALM?', null
from public.mission_quizzes q
where q.slug = 'emotions-quickfire'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 5);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 6, '🥳 most fits…', null
from public.mission_quizzes q
where q.slug = 'emotions-quickfire'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 6);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 7, 'Heart races, palms sweat. You feel…', null
from public.mission_quizzes q
where q.slug = 'emotions-quickfire'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 7);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 8, 'You did your best. You feel…', null
from public.mission_quizzes q
where q.slug = 'emotions-quickfire'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 8);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 9, 'Big yawn, heavy eyes = ?', null
from public.mission_quizzes q
where q.slug = 'emotions-quickfire'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 9);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 0, 'You finally finish a really hard puzzle. What do you feel?', 'Proud — that warm ''I did it!'' feeling after working hard.'
from public.mission_quizzes q
where q.slug = 'emotions-quiz'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 0);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 1, 'Your tummy gets jumpy before standing up to speak in class. That''s…', 'Nervous feelings often show up as jumpy or fluttery in your body.'
from public.mission_quizzes q
where q.slug = 'emotions-quiz'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 1);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 2, 'Your friend gets the toy you wanted. The squeezy feeling inside is…', 'Jealousy — wanting what someone else has.'
from public.mission_quizzes q
where q.slug = 'emotions-quiz'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 2);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 3, 'You drop something fragile and feel your face go hot. That''s likely…', null
from public.mission_quizzes q
where q.slug = 'emotions-quiz'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 3);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 4, 'When someone shares with you and you feel warm inside, that''s…', null
from public.mission_quizzes q
where q.slug = 'emotions-quiz'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 4);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 5, 'A best way to calm a big angry feeling is…', 'Slow breathing helps your body settle when feelings get big.'
from public.mission_quizzes q
where q.slug = 'emotions-quiz'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 5);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 6, 'Feeling small and unsure about trying something new is…', null
from public.mission_quizzes q
where q.slug = 'emotions-quiz'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 6);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 7, 'Your friend looks sad. The kindest first step is…', null
from public.mission_quizzes q
where q.slug = 'emotions-quiz'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 7);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 8, 'Butterflies + smile before your birthday party = ', null
from public.mission_quizzes q
where q.slug = 'emotions-quiz'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 8);
insert into public.mission_quiz_questions (quiz_id, position, prompt, explain)
select q.id, 9, 'When emotions feel too big, who can help?', 'Talking to a trusted adult helps make big feelings smaller.'
from public.mission_quizzes q
where q.slug = 'emotions-quiz'
  and not exists (select 1 from public.mission_quiz_questions qq where qq.quiz_id = q.id and qq.position = 9);

-- ---------- mission_quiz_choices (80 rows) ----------
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Happy', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 0
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Sad', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 0
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Angry', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 0
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Tired', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 0
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Excited', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 1
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Sad', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 1
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Brave', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 1
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Calm', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 1
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Sleepy', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 2
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Proud', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 2
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Angry', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 2
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Shy', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 2
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Scared', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 3
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Bored', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 3
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Happy', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 3
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Cool', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 3
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Glad', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 4
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Sad', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 4
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Joyful', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 4
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Cheery', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 4
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Quiet', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 5
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Still', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 5
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Frantic', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 5
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Peaceful', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 5
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Bored', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 6
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Excited', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 6
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Lonely', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 6
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Sleepy', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 6
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Calm', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 7
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Sleepy', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 7
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Nervous', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 7
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Bored', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 7
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Proud', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 8
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Jealous', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 8
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Angry', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 8
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Tired', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 8
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Excited', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 9
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Sleepy', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 9
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Shy', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 9
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Brave', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quickfire' and qq.position = 9
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Bored', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 0
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Proud', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 0
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Scared', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 0
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Jealous', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 0
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Anger', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 1
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Hunger', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 1
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Nervous', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 1
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Sleepy', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 1
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Jealous', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 2
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Proud', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 2
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Calm', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 2
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Surprised', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 2
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Joy', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 3
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Embarrassed', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 3
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Sleepy', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 3
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Brave', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 3
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Grateful', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 4
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Bored', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 4
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Angry', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 4
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Scared', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 4
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Yell at someone', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 5
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Throw a toy', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 5
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Take 3 slow breaths', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 5
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Hide forever', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 5
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Confident', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 6
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Shy', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 6
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Angry', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 6
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Sleepy', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 6
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Tell them to cheer up', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 7
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Ignore them', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 7
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Ask ''Are you okay?''', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 7
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Take their toy', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 7
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Excited', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 8
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'Bored', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 8
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'Sad', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 8
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'Angry', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 8
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 0, 'Nobody', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 9
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 0);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 1, 'A trusted grown-up', true
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 9
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 1);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 2, 'My pillow only', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 9
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 2);
insert into public.mission_quiz_choices (question_id, position, label, is_correct)
select qq.id, 3, 'I should hide them', false
from public.mission_quiz_questions qq
join public.mission_quizzes q on q.id = qq.quiz_id
where q.slug = 'emotions-quiz' and qq.position = 9
  and not exists (select 1 from public.mission_quiz_choices ch where ch.question_id = qq.id and ch.position = 3);

-- ---------- avatars (8 rows) ----------
insert into public.avatars (image_url, position, active)
select 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/a38504a9-8793-49af-9c19-4bf2f47f7c70.png', 0, true
where not exists (select 1 from public.avatars where image_url = 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/a38504a9-8793-49af-9c19-4bf2f47f7c70.png');
insert into public.avatars (image_url, position, active)
select 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/3fdfe19d-a701-4ae0-834d-a479363e5b70.png', 0, true
where not exists (select 1 from public.avatars where image_url = 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/3fdfe19d-a701-4ae0-834d-a479363e5b70.png');
insert into public.avatars (image_url, position, active)
select 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/a25247bf-fd49-4829-b737-75608b2792d4.png', 0, true
where not exists (select 1 from public.avatars where image_url = 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/a25247bf-fd49-4829-b737-75608b2792d4.png');
insert into public.avatars (image_url, position, active)
select 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/5d996707-6b91-47eb-a92b-50ff2b511ffc.png', 0, true
where not exists (select 1 from public.avatars where image_url = 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/5d996707-6b91-47eb-a92b-50ff2b511ffc.png');
insert into public.avatars (image_url, position, active)
select 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/0537a686-1f97-440d-9f63-350d36b2ac5c.png', 0, true
where not exists (select 1 from public.avatars where image_url = 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/0537a686-1f97-440d-9f63-350d36b2ac5c.png');
insert into public.avatars (image_url, position, active)
select 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/65b3ed7d-7199-4283-aad1-456d9c89f821.png', 0, true
where not exists (select 1 from public.avatars where image_url = 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/65b3ed7d-7199-4283-aad1-456d9c89f821.png');
insert into public.avatars (image_url, position, active)
select 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/44aa8c7d-dc69-4851-8641-d010c65a7ab5.png', 0, true
where not exists (select 1 from public.avatars where image_url = 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/44aa8c7d-dc69-4851-8641-d010c65a7ab5.png');
insert into public.avatars (image_url, position, active)
select 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/0e2f4ecb-80cd-4a96-85e0-df18180c852f.png', 0, true
where not exists (select 1 from public.avatars where image_url = 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/avatars/0e2f4ecb-80cd-4a96-85e0-df18180c852f.png');

-- ---------- welcome_cards (4 rows) ----------
insert into public.welcome_cards (hero_image_url, headline, subtitle, cta_label, cta_destination, active, position)
select 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/welcome-cards/00b12175-625d-4419-96c4-b8027ef650ac/1778156558666.png', 'Leo needs your help today...', null, 'Start →', '/', true, 1
where not exists (select 1 from public.welcome_cards where headline = 'Leo needs your help today...' and position = 1);
insert into public.welcome_cards (hero_image_url, headline, subtitle, cta_label, cta_destination, active, position)
select 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/welcome-cards/d1155c84-c990-4c63-8688-10e4a57a4d65/1778156266761.png', 'Maya is waiting for you', null, 'Start →', '/', true, 2
where not exists (select 1 from public.welcome_cards where headline = 'Maya is waiting for you' and position = 2);
insert into public.welcome_cards (hero_image_url, headline, subtitle, cta_label, cta_destination, active, position)
select 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/welcome-cards/c7a8aebf-383d-4f3c-adbd-058fca210ce6/1778156116082.png', 'Dash needs you!', null, 'Go to Dash →', '/', true, 3
where not exists (select 1 from public.welcome_cards where headline = 'Dash needs you!' and position = 3);
insert into public.welcome_cards (hero_image_url, headline, subtitle, cta_label, cta_destination, active, position)
select 'https://xwmoxnjjmlxrhocxlfmw.supabase.co/storage/v1/object/public/welcome-cards/b7f39963-0f8e-4835-b75c-122811cd47bb/1778155798672.png', 'I''m Pip. I need your help!', null, 'Help Pip →', '/', true, 4
where not exists (select 1 from public.welcome_cards where headline = 'I''m Pip. I need your help!' and position = 4);

commit;
