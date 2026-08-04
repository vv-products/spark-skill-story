# Product Documentation File

Create a single markdown document that captures every feature and user flow currently in the app, written from the codebase as it actually stands (routes, components, database tables and functions).

Output: `docs/PRODUCT-OVERVIEW.md` in the project, plus a downloadable copy in the documents area so you can share it outside the app.

## Document outline

**1. Overview & tech**
Kid-facing learning game ("Sementa") + an internal Studio CMS, TanStack Start + Lovable Cloud backend.

**2. Content model**
Pillars → Topics → Modules → Classes → Layers (tasks). Tables: `pillars`, `topics`, `modules`, `classes`, `layers`, `class_progress`, publish status and age groups, plus how the catalog is loaded and shaped client-side.

**3. Unlocking rules**
- Pillars: all four open from day one
- Topics: unlock when the first module of the previous topic is complete
- Modules: sequential
- Classes: sequential within a module
- Class status states: completed / in progress / current / locked

**4. Player flows (route by route)**
- Home / My World: stat card, level + stars, missions row, Shop card, leaderboard
- My Journey `/journey`: illustrated scene, four characters (Maya, Leo, Dash, Pip), nearest-body tap selection, CTA into each world
- World page `/world/$slug`: hero with mascot + progress ring, world XP, streak, continue/start card, next-unlock teaser, filter pills (All / In progress / Completed / Locked), three-level drill-down topics → modules → classes, topic preview sheet, completion confetti + toast, pillar quick-jump dots, skeleton loading and not-found fallback
- Class player `/play/$slug`: intro, video, quiz, branching, reflection, complete screens; read-aloud
- Profile / My Growth `/profile` + `/profile/edit`: profile hero, leaderboard filters (Everyone / Friends / Near me), avatar editor
- Shop `/shop`: XP (flask) currency, frames, titles, themes, boosts
- Sementa Club `/club`, `/club/join/$code`: friend code, QR, share link, requests inbox, friends list

**5. Missions**
One section per mission with mode (solo / co-op / competitive), rules, difficulty tiers, music, XP formula, and rarity:
Emotions Crossword, Emotions Quiz, Emotions Quick-Fire, Emotion Catcher, Emotion Duel, Reaction Race, Empathy Relay, Mood Match. Plus the shared FriendGate + MultiplayerLobby (realtime presence, broadcast, late-join sync) and mission accessibility settings (larger text, colour-blind highlights, sound/vibration).

**6. XP, levels, leaderboard**
`xp_events` as the single source of XP, level = XP/100, stars = number of XP events, ties broken by stars, leaderboard SQL functions (`get_leaderboard`, `get_friend_leaderboard`, `get_user_xp_breakdown`), Flask XP orbs for the shop.

**7. Studio CMS `/studio`**
Dashboard, Library, Module, Class Editor, Quiz Editor, Crossword Builder, Missions registry, Avatars, Welcome Cards, Task Types reference; role gating via `user_roles` + `has_role`.

**8. Navigation & shell**
Bottom nav (glass, auto-hide on scroll, signed-in only), desktop sidebar, full-bleed handling, bottom-nav clearance padding.

**9. Backend reference**
Table list with purpose and access rules, database functions, auth flow and profile creation trigger.

**10. Known gaps / deferred**
Friends' progress on topics, per-world leaderboard, "Near me" location & school clubs, pillar-themed world backgrounds, reflection journal and parent notes.

## Notes

Documentation only — no application code changes.
