# Moving a clone to your own Supabase project

Goal: a cloned copy of this app runs fully on an external Supabase project — same tables, roles, RLS, functions, storage, auth and realtime — with no dependency on Lovable Cloud.

## What already ports cleanly

- All app data access goes through one generated client (`src/integrations/supabase/client.ts`), which reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`. Point those at the new project and the whole app follows.
- `docs/DB-SETUP.sql` already recreates the backend end to end: enums, ~20 tables, grants, RLS policies, `updated_at` triggers, the signup trigger, the leaderboard/XP/friend-code functions, and the three storage buckets with their policies. It is idempotent, so it can be re-run safely.
- Multiplayer missions use Supabase Realtime broadcast channels only (no DB replication config needed).

## What needs attention

1. **Google sign-in.** `src/game/PlayerAuth.tsx` signs in through the Lovable auth broker (`@/integrations/lovable`). On an external project that broker is not available — Google must go through `supabase.auth.signInWithOAuth` with the provider enabled in the new project's dashboard, plus redirect URLs configured. Email/password needs no change.
2. **Environment variables.** The clone needs `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (anon), `VITE_SUPABASE_PROJECT_ID`, plus server-side `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` (only if server-side admin work is added later).
3. **Generated types.** `src/integrations/supabase/types.ts` is generated against the current project; on the new project it should be regenerated (or kept as-is since the schema is identical).
4. **Auth settings that live outside SQL.** Site URL + redirect URLs, email confirmation on/off, Google provider credentials, and (optional) leaked-password protection are project settings, not migrations.
5. **First admin.** The signup trigger grants `admin` + `editor` to the very first account created in the new project — so the first sign-up must be the intended owner, or roles get inserted manually.
6. **Storage.** Buckets `avatars`, `class-hero`, `welcome-cards` are created public by the SQL script; existing uploaded files are not copied (content and images would need re-uploading through Studio, or a manual file copy).
7. **Content data.** The setup script is schema-only. Pillars/topics/modules/classes/quizzes/crosswords start empty and are re-authored in `/studio` (or exported/imported separately if the current content should carry over).

## Deliverable

A single new document, `docs/EXTERNAL-SUPABASE-SETUP.md`, containing:

- Step-by-step setup order: create project → run `docs/DB-SETUP.sql` in the SQL editor → configure auth → set env vars → first sign-up becomes admin → verify.
- Exact env var table (client vs server, which key goes where).
- Auth configuration checklist (Site URL, redirect URLs, Google OAuth client setup, email confirmation).
- The Google sign-in code change required for non-Lovable-Cloud hosting, with a drop-in replacement snippet for `PlayerAuth.tsx` that keeps the same `signInWithGoogle()` signature.
- Storage bucket + file-migration notes and, optionally, how to move existing content rows.
- A verification checklist: sign up, admin role present, `/studio` loads, image upload works, mission XP appears on leaderboard, a co-op mission syncs between two browsers.

## Optional code change (say if you want it now)

Make Google sign-in switch automatically: use the Lovable broker when its env is present, otherwise fall back to `supabase.auth.signInWithOAuth("google", { redirectTo: window.location.origin })`. This makes the same codebase work on both Lovable Cloud and an external Supabase project with no edits after cloning.
