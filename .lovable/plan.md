## Problem

The home-screen leaderboard (podium + list of ranks 4+) still renders the old procedural SVG avatars. The RPC already returns `avatar_image_url` for every player, and the standalone `Leaderboard.tsx` component was updated last turn — but the home page uses a separate `PodiumLeaderboard` component inside `src/game/GamePlayer.tsx` that was not updated.

## Fix

In `src/game/GamePlayer.tsx`, inside `PodiumLeaderboard`:

1. Podium tiles (top 3): if `entry.avatar_image_url` is set, render `<img src={entry.avatar_image_url} className="h-full w-full object-cover" />` inside the existing 48px round frame; otherwise fall back to the procedural `<Avatar config={cfg} />`.
2. Rank 4+ rows: same fallback pattern inside the existing 36px round frame.
3. Add a `bg-muted` background to the round frames so the placeholder isn't transparent while the image loads.

No other files, no DB changes — the RPC and `LeaderboardEntry` type already carry `avatar_image_url`.
