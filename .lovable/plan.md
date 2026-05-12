## Problem

On the home screen ("My World"), Zoe shows different levels in two places:

- **"Your Level" stat card (top)** uses `Math.floor(totalXp / 200) + 1` → 550 XP = Level 3
- **Leaderboard podium / list (bottom)** uses the database/`levelFromXp` formula `floor(totalXp / 100) + 1` → 550 XP = Level 6

Two different XP-per-level values produce two different displayed levels for the same person.

## Fix

Make the "Your Level" card use the same `levelFromXp(xp)` helper from `src/game/profileApi.ts` (100 XP per level) that the leaderboard and `get_leaderboard` RPC already use.

### Change

`src/game/GamePlayer.tsx` line ~285 — replace the inline `Math.floor(progress.totalXp / 200) + 1` calculation with `levelFromXp(progress.totalXp)`, and import `levelFromXp` from `./profileApi`.

Result: Zoe (and every player) shows the same level number in both the home stat card and the leaderboard.

### Why 100 XP per level (not 200)

- `levelFromXp` in `profileApi.ts` is the canonical helper.
- The Postgres functions `get_leaderboard` and `get_friend_leaderboard` both compute `FLOOR(total_xp / 100.0) + 1`.
- Only the home stat card was the outlier.
