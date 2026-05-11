
# Sementa Club — MVP (Friends only)

A new in-app space where kids connect with their real friends through a personal join code, QR, or share link. Once two kids are friends (mutual accept), the leaderboard can be filtered to show just them and their friends. Location/school clubs and mission co-op are intentionally deferred to a later iteration.

## What we're building

1. **New route `/club`** — the "Sementa Club" tab (already in the bottom nav, currently pointing to `/profile`; we'll repoint it).
2. **Your join card** — shows the kid's avatar + display name, a friendly 6-character join code (e.g. `MAYA-7K2`), a QR code of the share link, and a "Copy link / Share" button (uses native share sheet on mobile).
3. **Add a friend** — input field to type/paste a code, or scan QR via the device camera. Sends a friend request.
4. **Requests inbox** — incoming requests with Accept / Decline; outgoing pending requests (cancel).
5. **Friends list** — avatars + names of accepted friends, with a remove option.
6. **Friend-filtered leaderboard** — on the existing leaderboard (currently in `Leaderboard.tsx` / shown on profile), add a toggle: **All players ⇄ Friends only**. "Friends only" includes the kid + their accepted friends, ranked by XP.
7. **Deep link `/club/join/:code`** — opening a shared link auto-fills the code and prompts "Send friend request to {name}?".

## What's deferred (stated, not built)

- Location-based clubs and school clubs (browse + kid-created).
- Co-op mission sessions and mission invites with shared progress.
- Notifications/badges beyond a simple count on the inbox tab.

These will be follow-up plans once the friends MVP is in users' hands.

## Backend changes (Lovable Cloud)

Two new tables + one helper function. All RLS-protected.

- **`friend_codes`** — one row per user. Fields: `user_id` (PK, FK to profiles), `code` (unique, short, human-readable). Auto-created on first visit to `/club` if missing. Anyone signed in can read (so codes can be looked up); only the owner can rotate.
- **`friendships`** — Fields: `requester_id`, `addressee_id`, `status` (`pending` | `accepted` | `declined`), unique on the unordered pair. RLS: a user can read/write rows where they are requester or addressee.
- **`get_friend_leaderboard(_limit)`** — security-definer SQL function returning the same shape as the existing `get_leaderboard`, restricted to the caller + accepted friends.

No changes to existing tables.

## Frontend changes

- New file `src/routes/club.tsx` (route shell, wraps in `PlayerAuthProvider` + `PlayerShell` like `/profile`).
- New file `src/routes/club.join.$code.tsx` for the deep-link accept flow.
- New folder `src/game/club/` with: `ClubPage.tsx` (tabs: My Code · Friends · Requests), `JoinCard.tsx` (QR + code + share), `AddFriend.tsx` (input + scan), `FriendsList.tsx`, `RequestsInbox.tsx`, `clubApi.ts` (typed Supabase calls).
- Add a `scope: "all" | "friends"` toggle to `Leaderboard.tsx`; when "friends", call the new RPC.
- Update `src/game/Chrome.tsx` `NAV_ITEMS`: change "Sementa Club" `to: "/profile"` → `to: "/club"` (and adjust the active-state dedupe so My Growth stays on `/profile`).

## Libraries

- `qrcode.react` for the QR image (tiny, no native deps).
- Camera scanning: use the browser's built-in `BarcodeDetector` where supported; otherwise show "paste the code" fallback (avoids a heavy scanner dependency for v1).

## Visual style

Matches existing app: soft purple/pink gradient backdrop, white rounded cards (`rounded-3xl`, `shadow-card`), `bg-primary` purple for primary actions, friendly emoji accents (👋 add friend, ⭐ XP, 🤝 friends). Bottom-nav glass bar stays as-is.

## Done when

- A kid can open `/club`, see their code + QR, share a link.
- A second kid can paste the code (or open the link) and send a request.
- The first kid sees the request, accepts, and both appear in each other's Friends list.
- On the leaderboard, toggling "Friends" filters to just them + accepted friends.

