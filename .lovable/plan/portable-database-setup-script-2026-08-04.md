# Portable database setup script

Goal: one self-contained SQL file you can hand to another Lovable project (or any Postgres/Supabase project) so it recreates this app's entire backend structure — no data, structure only.

## What you get

A single file: `docs/DB-SETUP.sql`

It rebuilds, in the correct dependency order:

1. **Custom types** — `app_role`, `friendship_status`, `layer_type`, `publish_status`
2. **Tables** (20) — pillars, topics, modules, classes, layers, profiles, user_roles, class_progress, xp_events, avatars, welcome_cards, friendships, friend_codes, mission_crosswords, mission_crossword_variants, mission_crossword_words, mission_quizzes, mission_quiz_questions, mission_quiz_choices
3. **Access grants** for every table (required, or the app cannot read/write)
4. **Row Level Security** enabled plus every access policy exactly as it exists today
5. **Database functions** — `has_role`, `handle_new_user`, `set_updated_at`, `get_leaderboard`, `get_friend_leaderboard`, `get_user_xp_breakdown`, `lookup_friend_code`
6. **Triggers** — the new-user signup trigger and all `updated_at` triggers
7. **Storage buckets** — `avatars`, `class-hero`, `welcome-cards` (public) plus their storage access policies

Every statement is written idempotently (`if not exists` / `drop ... if exists` guards) so it can be re-run safely.

## How to use it in the other project

Paste the file contents into that project's chat and ask it to run it as a database migration. Nothing else is needed — no edge functions exist in this project, and all backend logic lives either in these database functions or in the app's own server code.

## Also included in the file (as comments)

- A short note that no rows are seeded, so the CMS/Studio starts empty and the first user who signs up is auto-granted admin + editor.
- Auth settings that must be matched manually in the target project: email/password sign-in enabled, Google sign-in enabled, no anonymous sign-ups.

## Technical notes

- Definitions are read from the live database (`pg_catalog` / `information_schema` and `pg_policies`) rather than replayed from the 19 historical migration files, so the output reflects the current end state including later alterations.
- Function bodies keep `security definer` + `set search_path = public` exactly as-is; `has_role` keeps its `auth.uid()` self-check.
- Foreign keys to `auth.users` are preserved; `profiles.id` stays the auth user id.
- No `ALTER DATABASE` statements, no data, no `pg_dump` output.
