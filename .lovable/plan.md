# Moving a clone to your own Supabase project

You're right on the main point: `docs/DB-SETUP.sql` already covers schema, roles, RLS, grants, triggers and functions, and the rest of the project settings (auth providers, Google OAuth, redirect URLs, email confirmation) are things you do in your own Supabase dashboard.

Two clarifications on what's actually left:

## 1. Storage buckets — already scripted, files are not

`docs/DB-SETUP.sql` (section 15) already creates the three buckets — `avatars`, `class-hero`, `welcome-cards` — as public, and creates the read/write policies on `storage.objects` (public read, editor/admin write). So bucket *setup* is not missing.

What's missing is the **files inside them** and the **content rows** that point at those files. Those don't travel with the SQL script.

## 2. One code change is still required

`src/game/PlayerAuth.tsx` signs in with Google through the Lovable auth broker (`@/integrations/lovable`). That broker only exists on Lovable Cloud — enabling Google in an external Supabase project is not enough on its own. The clone needs `supabase.auth.signInWithOAuth("google", { redirectTo: window.location.origin })` instead. Email/password needs no change.

Also worth noting: the signup trigger grants `admin` + `editor` to the *first* account created in the new project, so the first sign-up must be the intended owner.

## Deliverable

A single document, `docs/EXTERNAL-SUPABASE-SETUP.md`, focused on the gaps rather than repeating the SQL:

1. **Setup order** — create project → run `docs/DB-SETUP.sql` → configure auth in the dashboard → set env vars → first sign-up becomes admin.
2. **Env var table** — client (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`) vs server (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), and which key must never reach the browser.
3. **Google sign-in change** — drop-in replacement for `signInWithGoogle()` in `PlayerAuth.tsx` that keeps the same signature, plus the redirect URLs to whitelist.
4. **Moving storage files** — a copy script that lists objects in each bucket on the old project (service-role key) and re-uploads them to the same bucket/path on the new project, so existing `image_url` values stay valid. Notes on the alternative: re-upload manually through Studio (Avatars / Welcome Cards / Class hero) and let it write fresh URLs.
5. **Moving content rows** — export/import order that respects foreign keys (`pillars → topics → modules → classes → layers`, then `mission_crosswords → variants → words`, `mission_quizzes → questions → choices`, then `avatars`, `welcome_cards`). Note that user data (`profiles`, `xp_events`, `class_progress`, `friendships`, `friend_codes`, `user_roles`) cannot be copied as-is because it references `auth.users` ids from the old project.
6. **Regenerating `src/integrations/supabase/types.ts`** against the new project.
7. **Verification checklist** — sign up, admin role present, `/studio` loads, image upload works, mission XP appears on the leaderboard, a co-op mission syncs across two browsers.

## Optional (say if you want it)

Make Google sign-in auto-switch: use the Lovable broker when its env is present, otherwise fall back to plain `supabase.auth.signInWithOAuth`. Then the same codebase runs on both Lovable Cloud and an external Supabase project with zero edits after cloning.
