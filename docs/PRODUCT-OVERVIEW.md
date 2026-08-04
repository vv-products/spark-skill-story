# Sementa — Product Overview

A complete reference of every feature and user flow currently implemented.

---

## 1. Overview & tech

Sementa is a kid-facing social-emotional learning game plus an internal content studio (CMS) used by the team to author lessons and missions.

- **Framework**: TanStack Start v1 (React 19, Vite 7, file-based routing in `src/routes`)
- **Styling**: Tailwind v4 with semantic design tokens in `src/styles.css`
- **Backend**: Lovable Cloud (Postgres + auth + realtime), accessed through `@/integrations/supabase/client`
- **Two surfaces**:
  - Player app (`/`, `/journey`, `/world/:slug`, `/play/:slug`, `/profile`, `/club`, `/shop`, `/mission/*`)
  - Studio CMS (`/studio`) — role-gated

---

## 2. Content model

The learning content is a five-level tree:

```text
Pillar        (4 fixed worlds)
 └─ Topic     (progressively unlocked)
     └─ Module    (sequential, ~5 per topic)
         └─ Class     (sequential within a module)
             └─ Layer     (an individual task/screen: intro, video, quiz, branching, reflection…)
```

**Tables**: `pillars`, `topics`, `modules`, `classes`, `layers`.

- Every level has `slug`, `title`, `subtitle`, `position` for ordering.
- `classes` carry a `status` (`publish_status` enum) and `estimated_minutes`.
- `topics`/`modules` carry `age_groups` so content can be targeted by age band.
- Progress per class is written to `class_progress` (completion, XP earned, layers touched, last-touched timestamp).

The client loads the whole tree once via `loadFullCatalog()` in `src/studio/catalog.ts` and reshapes it into `HPillar → HTopic → HModule → HClass → HLayer` objects that both the player app and the Studio share.

### The four pillars

| Slug | World | Guide | Tagline |
|---|---|---|---|
| `inner` | Inner World | Maya | Brave enough to try, strong enough to fail |
| `social` | Social World | Leo | Kind heart, learning to speak up |
| `action` | Action World | Dash | Full speed ahead, learning to pause |
| `real` | Real World | Pip | Small steps, giant leaps |

Each has its own accent colour, glow and mascot image, centralised in `src/game/pillarTheme.ts`.

---

## 3. Unlocking rules

Implemented in `src/game/unlocks.ts`. Only classes with status `Published` count anywhere.

- **Pillars** — all four are open from day one. The child chooses where to begin.
- **Topics** — Topic N unlocks once the **first module** of Topic N−1 is complete. This deliberately avoids bottlenecking: a child does not need to finish all five modules of Topic 1 to move on.
- **Modules** — strictly sequential inside a topic: Module N needs Module N−1 complete.
- **Classes** — strictly sequential inside a module: Class N needs Class N−1 complete.

**Class status states** surfaced in the UI:

| Status | Meaning |
|---|---|
| `completed` | In the completed set → shows ✓ and a Replay affordance |
| `in_progress` | Started (layers touched > 0) → shows Continue |
| `current` | Unlocked, not started → the next thing to play |
| `locked` | Previous class not finished → disabled |

Derived helpers also available: `worldProgress`, `topicProgress`, `moduleProgress`, `nextClassInModule`, `nextLockedTopic`, `mostRecentInProgressClass`, `firstPlayableClass`, `moduleEstimatedMinutes`, `topicEstimatedMinutes`.

---

## 4. Player flows, route by route

### 4.1 Home / My World — `/`

- Player stat card: display name, avatar, total XP, **level**, **stars**
- "Your Missions" row — cards for every mission, each showing last score / XP earned once played, and a ✦ Rare badge on quick-fire
- **Shop** card (between Fun Activities and Leaderboard) linking to `/shop`
- Leaderboard preview
- Welcome cards content driven from the `welcome_cards` table

### 4.2 My Journey — `/journey`

- Full-bleed illustrated scene (edge-to-edge on tablet, fills the area beside the sidebar on desktop) on the app background colour
- Four characters composited onto a single aspect-ratio scene box so their anchor points stay identical from phone to desktop: Pip on the bench armrest, Leo and Maya in front of the bench, Dash front-and-centre
- Tapping uses **nearest-body detection** on the scene container rather than image bounding boxes, so overlapping characters still select correctly
- Name pills render on a top layer (z-50) so no character can hide them
- Each character's CTA ("Explore Dash's world →") links to `/world/<pillar-slug>`; the CTA sits above the bottom nav on mobile/tablet

### 4.3 World page — `/world/:slug`

The richest screen in the app (`src/game/WorldPage.tsx` + `src/game/world/*`).

**Hero**
- Pillar-tinted gradient band with the guide's mascot image
- World name + tagline
- `ProgressRing` — percentage of all published classes in the world completed
- Stats under the ring: `X / Y classes`, XP earned in this world, current streak
- `PillarDots` — four dots for quick-jumping between worlds, active one highlighted

**Momentum**
- `ContinueCard` — resumes the most recently touched in-progress class; falls back to "Start Topic 1 → Module 1 → Class 1" when nothing is started; becomes a "World complete!" card at 100%
- Next-unlock teaser chip, e.g. "Finish 1 more class to unlock Topic 3"

**Three-level drill-down**
1. **Topics** — pills that double as progress bars. Filter pills above the list: All • In progress • Completed • Locked (persisted per pillar in localStorage). Each topic has an info icon that opens `TopicPreviewSheet` (module count, estimated total time, module names with lock state).
2. **Modules** — selecting a topic slides the others away and reveals its module pills with progress and estimated minutes.
3. **Classes** — selecting a module reveals `ClassPill`s: number, title, status icon (✓ / ▶ / 🔒), XP earned, estimated minutes. Playable classes navigate to `/play/:slug`.

Transitions animate with fade/slide utilities.

**Feedback & states**
- Confetti burst + toast when a module or topic has newly hit 100% since the last visit (diffed against a `localStorage` set)
- `WorldSkeleton` loading state, an 8-second safety timeout so the page can never hang, and a "world not found / load failed" fallback
- Per-pillar `head()` metadata (title, description, og tags, canonical) for SEO

### 4.4 Class player — `/play/:slug`

Plays a class layer by layer. Screen types implemented in `src/game/screens/`:

| Screen | Purpose |
|---|---|
| `IntroScreen` | Sets up the class |
| `VideoScreen` | Video layer |
| `QuizScreen` | Multiple-choice check |
| `BranchingScreen` | Choose-your-path scenario |
| `ReflectionScreen` | Free reflection prompt |
| `CompleteScreen` | Wrap-up, XP award |

Read-aloud support via `useReadAloud`. Progress is written back to `class_progress`.

### 4.5 My Growth — `/profile` and `/profile/edit`

- Profile hero: avatar, name, level, stars, total XP
- Leaderboard with three filters: **Everyone**, **Friends**, **Near me** ("Near me" shows a coming-soon state until location/school data exists)
- XP breakdown drawer by mission and mode (solo vs co-op) so mission XP can be verified
- `/profile/edit` holds the avatar editor (`AvatarPicker`, `Avatar`, config in `src/game/avatar/`)

### 4.6 Shop — `/shop`

Currency is **XP** shown with an Erlenmeyer flask icon (internally "flask orbs", `src/game/shop/flaskOrbs.ts`).

- Earn rate: **1 unit per 5 XP** from missions
- Balance = lifetime earned − spent, kept in `localStorage`, broadcast via an `orbs:changed` event

| Item | Category | Cost |
|---|---|---|
| Galaxy Frame | Avatar Frame | 40 |
| Flame Frame | Avatar Frame | 60 |
| Rainbow Frame | Avatar Frame | 90 |
| Title: Explorer | Title | 30 |
| Title: Empath | Title | 50 |
| Title: Sage | Title | 120 |
| 2× XP Booster | Boost | 80 |
| Sunset Theme | Theme | 70 |
| Ocean Theme | Theme | 70 |

### 4.7 Sementa Club — `/club` and `/club/join/:code`

- **Friend code** minted per user in `friend_codes`, with rotate support
- **QR code** and shareable link (`shareUrlFor`), plus copy / native share buttons
- **Add friend** by typing a code (`lookup_friend_code` SQL function resolves it safely)
- **Requests** tab with Accept / Decline; **Friends** tab lists accepted friends
- `friendships` table with a `friendship_status` enum and a unique-pair index
- Joining via a shared link opens `/club/join/CODE` showing the inviter's avatar
- Friendships power the Friends leaderboard filter and gate all multiplayer missions

---

## 5. Missions

Eight missions, all writing to `xp_events` and minting shop XP.

### Solo / optional co-op

**Emotions Crossword** — `/mission/emotions-crossword`
- Difficulty variants: Easy (3 words, +25 XP), Medium (4 words, +50), Hard (6 words, +100)
- Solo, or co-op with a friend over a shared code: live cell and cursor sync
- Presence + `sync-request`/`sync-state` + resync on tab visibility so late joiners and refreshers get the current grid and active clue
- Co-op scoreboard counting correct letters/words per player, +20 XP co-op bonus
- Rewards screen with a badge (Sprout Solver / Puzzle Pal / Emotion Master)

**Emotions Quiz** — `/mission/emotions-quiz` (self-paced)
- 10 emotion MCQs, no timer, soothing ambient pad
- +25 XP base, +5 per correct answer

**Emotions Quick-Fire** — `/mission/emotions-quickfire` (rare)
- Same question bank, 8 seconds per question, fast arpeggio music, streaks
- +50 XP base, +8 per correct answer
- Marked ✦ Rare on the home card

Both quiz paces open with a Solo / Play-against-a-friend chooser; co-op broadcasts running scores live and adds +15 XP.

**Emotion Catcher** — `/mission/emotions-catcher`
- Answer tiles fly right-to-left; tap the ones matching the prompt. 45-second round, 3 lives.
- XP: `40 + score + streak bonus`, multiplied by difficulty

| Difficulty | Spawn | Flight time | Correct-answer chance | XP × |
|---|---|---|---|---|
| Easy 🌱 | 950 ms | 2.0–3.0 s | 65% | 0.8 |
| Medium ⚡ | 650 ms | 1.4–2.2 s | 45% | 1.0 |
| Hard 🔥 | 420 ms | 0.9–1.5 s | 30% | 1.4 |

### Friends-only competitive

**Emotion Duel** — `/mission/emotion-duel`
- Head-to-head, 10 questions, 8 seconds each
- XP: `30 + your score + 50 win / 20 tie`

**Reaction Race** — `/mission/reaction-race`
- Fastest correct tap wins each round
- XP: `25 + wins × 8 + 40 win / 15 tie`

### Friends-only co-op

**Empathy Relay** — `/mission/empathy-relay`
- Alternating turns over 8 questions; the team must get 6 right combined
- XP: `30 + team correct × 8 + 40 on success`

**Mood Match** — `/mission/mood-match`
- Both players pick the emotion they feel; you score when you sync
- XP: `25 + score × 10`

### Shared multiplayer infrastructure

`src/game/missions/multiplayer/MultiplayerLobby.tsx`
- **FriendGate** blocks anyone with zero accepted friends and routes them to `/club`
- **MultiplayerLobby** creates/joins a room by code, resolves host/guest deterministically, exposes a shareable `?code=` link, and hands the caller a Realtime channel plus peer list
- Rooms use Supabase Realtime presence + broadcast

### Mission settings (accessibility)

`src/game/missions/missionSettings.ts`, persisted in localStorage:
- Larger text mode
- Colour-blind-friendly highlights (icons + safer hues instead of red/green only)
- Sound on/off
- Vibration on/off
- Music toggle on intro and play screens; music is procedural Web Audio (fast arpeggio for quick missions, slow ambient pad for calm ones) — no external API needed

---

## 6. XP, levels and leaderboard

- **`xp_events`** is the single source of truth: every class completion and mission run inserts a row with `amount` and a `source` string like `mission:emotion-duel:win`.
- **Level** = `floor(total XP / 100) + 1`
- **Stars** = number of XP-earning events (how many things you've done)
- **Ranking order**: level DESC → stars DESC → total XP DESC → name

SQL functions:

| Function | Purpose |
|---|---|
| `get_leaderboard` | Global ranking with level and stars |
| `get_friend_leaderboard` | Same, scoped to accepted friends |
| `get_user_xp_breakdown` | XP grouped by mission and mode, for verification |
| `lookup_friend_code` | Safe code → profile resolution |
| `has_role` | Security-definer role check |
| `handle_new_user` | Creates a profile row on signup |
| `set_updated_at` | Timestamp trigger |

Mission XP flows into the leaderboard automatically because the leaderboard functions sum `xp_events`.

---

## 7. Studio CMS — `/studio`

Role-gated through `user_roles` + `has_role` (`app_role` enum), with `AuthGate`.

| Screen | What it does |
|---|---|
| Dashboard | At-a-glance content counts and recent activity |
| Library | Browse and manage pillars / topics / modules |
| Module | Module detail with its class list |
| Class Editor | Build a class layer by layer (all task types) |
| Task Types reference | Documentation of every layer type |
| Quiz Editor | Create/update emotions quiz questions, choices, correct answers (`mission_quizzes`, `mission_quiz_questions`, `mission_quiz_choices`) |
| Crossword Builder | Define grid, word lists, clues and difficulty variants (`mission_crosswords`, `mission_crossword_variants`, `mission_crossword_words`) |
| Missions | Registry of all eight missions: type, rarity, modes, music, base/bonus XP, content counts, preview links |
| Avatars | Manage avatar assets (`avatars`) |
| Welcome Cards | Home-screen welcome content (`welcome_cards`) |

CMS-authored quiz and crossword content is fetched at runtime, with the original hardcoded sets kept as fallback.

---

## 8. Navigation & shell

`src/game/PlayerShell.tsx` + `src/game/Chrome.tsx`

- **Bottom nav** (mobile/tablet): 5 items with circular icon backgrounds, active item filled purple, translucent glass with a purple→white→pink gradient, fixed to the viewport bottom
- **Auto-hide**: slides down when scrolling down, back up when scrolling up, reappears after a brief idle period or on route change
- Only renders when signed in, so the login screen stays clean
- **Desktop**: sidebar instead of the bottom nav
- **Clearance**: a 7rem bottom pad is applied to the content area on authenticated non-bleed pages so nothing hides behind the floating nav; bleed pages (Journey) opt out and handle their own spacing

---

## 9. Backend reference

| Table | Purpose |
|---|---|
| `profiles` | Display name, avatar config/image, age, bio |
| `user_roles` | Role assignments (never on `profiles`) |
| `pillars` / `topics` / `modules` / `classes` / `layers` | Content tree |
| `class_progress` | Per-user per-class completion, XP, layers touched, last touched |
| `xp_events` | Append-only XP ledger |
| `friend_codes` | One shareable code per user |
| `friendships` | Friend requests and accepted friendships |
| `avatars` | Avatar asset catalogue |
| `welcome_cards` | Home welcome content |
| `mission_quizzes` / `mission_quiz_questions` / `mission_quiz_choices` | CMS-authored quiz content |
| `mission_crosswords` / `mission_crossword_variants` / `mission_crossword_words` | CMS-authored crossword content |

Enums: `app_role`, `publish_status`, `layer_type`, `friendship_status`.

Row-level security is enabled on every table; content tables are readable by signed-in players, progress and XP rows are scoped to their owner, and friendship rows are visible to both sides of the pair.

**Auth**: email sign-in with a profile row created automatically by the `handle_new_user` trigger. Signed-out visitors see the sign-in screen with no nav chrome.

---

## 10. Known gaps / deferred

- **Friends' progress dots on topics** and a **per-world leaderboard** — `class_progress` RLS only exposes your own rows, so this needs a view + RPC or denormalised aggregates.
- **"Near me" leaderboard**, plus **location-based clubs** and **school clubs** — needs location/school data on profiles.
- **Pillar-themed illustrated world backgrounds** — needs four new scene images; worlds currently use gradients.
- **Daily mission tied to a pillar**, **parent/teacher notes per topic**, **reflection journal surfaced per topic** — all need new tables or columns.
- **Quiz full-snapshot late-join sync** — scores already catch up via per-tick rebroadcast; porting the crossword's question-index snapshot pattern is the remaining nicety.
