## Plan: CMS Avatars

Studio admin uploads avatar images. Kids pick one (image-only, no procedural builder) after sign-in and can change it from /profile.

### Database

New migration:
- Table `public.avatars`:
  - `id uuid pk default gen_random_uuid()`
  - `image_url text not null`
  - `position int not null default 0`
  - `active bool not null default true`
  - `created_at`, `updated_at` timestamptz
- RLS:
  - SELECT: public (anyone)
  - ALL: editors/admins via `has_role`
- Storage bucket `avatars` (public). RLS on `storage.objects`:
  - SELECT public for `bucket_id = 'avatars'`
  - INSERT/UPDATE/DELETE for editors/admins
- Add `profiles.avatar_id uuid` (nullable). Keep existing `avatar_config` for back-compat but stop using it for new flow.

### Studio CMS

New file `src/studio/avatars.ts` — list/create/update/delete + `uploadAvatarImage` (mirrors `welcomeCards.ts`).

New screen `src/studio/screens/Avatars.tsx`:
- Grid of avatar cards (square image, active toggle, position, delete).
- "+ New Avatar" button creates a row, opens file picker for upload.
- Drag-free reordering via position number.

Wire up:
- `StudioContext` View union: add `{ kind: "avatars" }`.
- `Layout.tsx` NAV: add "Avatars" entry.
- `routes/studio.tsx` Router switch: render `AvatarsScreen`.

### Kid-facing picker

New file `src/game/avatarPicker.ts` — `listActiveAvatars()`, `setUserAvatar(userId, avatarId)`, `loadUserAvatar(userId)`.

New component `src/game/AvatarPicker.tsx`:
- Fetches active avatars, renders responsive grid of round image tiles.
- On tap: writes `profiles.avatar_id` and shows confetti.
- Two modes: `mode="onboarding"` (full-screen, must pick to continue) and `mode="edit"` (inline, optional).

Integration points:
1. **After sign-in** — in `GamePlayer.tsx` (or wherever the home gates auth), if `user && !profile.avatar_id`, render `<AvatarPicker mode="onboarding" />` instead of home content until a pick is saved.
2. **/profile** — replace `AvatarProfilePage` body's avatar section with `<AvatarPicker mode="edit" />`. Keep display name / bio / age fields. Remove the procedural tabs (skin/hair/etc.) and `Avatar.tsx` SVG usage on this page.
3. **Display everywhere** — anywhere we currently render `<Avatar config={...} />` (Leaderboard, Chrome header, etc.), switch to an `<img src={profile.avatar_image_url}>` round tile. Helper: `src/game/AvatarImage.tsx` that takes `imageUrl | null` and falls back to a neutral placeholder.

### Files touched

- New: migration, `src/studio/avatars.ts`, `src/studio/screens/Avatars.tsx`, `src/game/avatarPicker.ts`, `src/game/AvatarPicker.tsx`, `src/game/AvatarImage.tsx`
- Edited: `src/studio/StudioContext.tsx`, `src/studio/Layout.tsx`, `src/routes/studio.tsx`, `src/game/AvatarProfilePage.tsx`, `src/game/GamePlayer.tsx`, `src/game/profileApi.ts` (add `avatar_id` + joined image url), `src/game/Leaderboard.tsx`, `src/game/Chrome.tsx`

### Notes

- Procedural avatar builder code (`src/game/avatar/*`) stays in repo but is no longer mounted — safe to delete in a follow-up.
- Bucket is public so `<img src>` works without signed URLs.
