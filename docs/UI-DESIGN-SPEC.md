# Sementa — UI Design & Flow Replication Spec

Purpose: rebuild the Sementa player app and Studio CMS **pixel-for-pixel** in another
project. Everything here is extracted from the live codebase — token values, class
names, copy strings, and numbers are literal, not approximations.

Companion documents:
- `docs/PRODUCT-OVERVIEW.md` — features and flows in prose.
- `docs/DB-SETUP.sql` — full backend schema, RLS, functions, triggers, storage.

---

## 1. Design foundations

### 1.1 Stack assumptions

- React 19 + TanStack Start (file routes in `src/routes`).
- Tailwind CSS v4 configured entirely through `src/styles.css` (no `tailwind.config.js`).
- shadcn/ui components in `src/components/ui`.
- Icons: `lucide-react`. Emoji are used deliberately as playful iconography.
- Toasts: `sonner`.

### 1.2 Fonts

```
--font-sans:    "Nunito", "Poppins", system-ui, sans-serif    /* everything in the player app */
--font-display: "Pacifico", "Caveat", cursive                 /* .font-display — brand wordmark only */
--font-studio:  "Inter", system-ui, sans-serif                /* .font-studio / .studio-root — CMS only */
```

Load Nunito, Poppins, Pacifico, Caveat and Inter via a `<link>` in the root route head.
Never `@import` a remote URL inside `styles.css`.

### 1.3 Colour tokens (light)

```
--background        #F0F0FA      --card              #FFFFFF
--foreground        #1A1A2E      --card-foreground   #1A1A2E
--card-warm         #FFF0EE      --card-gold         #FFF8E8
--card-amber        #FAC548      --popover           #FFFFFF
--primary           #7B2FBE      --primary-foreground #FFFFFF
--primary-light     #9B4FD4      --primary-dark      #5A1F9A
--secondary         #FFFFFF      --secondary-foreground #7B2FBE
--muted             #F0F0F0      --muted-foreground  #666680
--accent            #FFF0EE      --accent-foreground #1A1A2E
--destructive       #E5484D      --destructive-foreground #FFFFFF
--border            #E8E8F0      --input             #E8E8F0
--ring              #7B2FBE
```

Sementa semantic extras:

```
--gold #F5A623   --gold-dark #D4890A   --gold-foreground #1A1A2E
--streak #FF6B35 --streak-foreground #FFFFFF
--text-secondary #666680   --text-accent #F5A623
--tag #F0F0F0    --tag-foreground #333333
```

### 1.4 Colour tokens (dark, `.dark` class)

```
--background #1A1A2E   --foreground #F0F0FA
--card #252540         --card-foreground #F0F0FA
--primary #9B4FD4      --primary-foreground #FFFFFF
--muted #2E2E48        --muted-foreground #B0B0C8
--border rgba(255,255,255,0.1)   --ring #9B4FD4
```

### 1.5 Studio (CMS) tokens

```
--color-studio-bg          #F8F8FC
--color-studio-sidebar     #1A1A2E
--color-studio-sidebar-text #AAAACC
--color-studio-card-border #EBEBF5
--color-studio-tag         #F0F0FA
--color-success            #2E7D32
--color-warning            #F5A623
--shadow-studio            0 2px 8px rgba(0,0,0,0.06)
```

`.studio-root` scopes CMS typography/background and restyles scrollbars
(10px, thumb `#D8D8E8`, radius 8px, transparent track).

### 1.6 Radii

```
--radius: 1rem                     (base)
--radius-sm  = radius - 4px        --radius-md = radius - 2px
--radius-lg  = radius              --radius-xl = radius + 4px
--radius-2xl = radius + 8px        --radius-3xl = radius + 12px
--radius-pill = 50px               /* class: rounded-pill — used for every chip/tag/bar */
```

Hero cards and large media use a literal `rounded-[24px]`. Small chips use `rounded-full`.

### 1.7 Shadows and gradients

```
--shadow-card        0 4px 12px rgba(0,0,0,0.08)
--shadow-pop         0 8px 24px rgba(123,47,190,0.25)
--shadow-glow-purple 0 0 30px rgba(123,47,190,0.4)
--shadow-glow-gold   0 0 24px rgba(245,166,35,0.45)

--gradient-hero linear-gradient(135deg, #7B2FBE 0%, #9B4FD4 100%)
--gradient-gold linear-gradient(135deg, #F5A623 0%, #FFB84D 100%)
```

Use `shadow-card` for resting surfaces, `shadow-pop` for the active nav pill and hero
cards, glows for celebration states only.

### 1.8 Stat-card tokens (home tiles)

```
--stat-card-radius 20px   --stat-card-padding 14px
--stat-card-icon-size 40px --stat-card-icon-gap 12px
--stat-card-label-size 11px --stat-card-label-gap 6px
--stat-card-value-size 19px
```

### 1.9 Type scale in practice

The app deliberately uses small, heavy type. Observed usage:

| Role | Classes |
|---|---|
| Brand wordmark | `font-display text-3xl text-primary` |
| Hero headline | `text-[20px] font-black leading-[1.15] drop-shadow-md` |
| Hero eyebrow | `text-[13px] font-semibold text-white/90` |
| Section header | `text-base font-extrabold` |
| Card title | `text-sm font-extrabold` |
| Card subtitle / meta | `text-[11px] font-bold text-text-secondary` |
| Chips / tags | `text-[10px] font-extrabold` on `bg-tag text-tag-foreground rounded-pill px-2 py-0.5` |
| Overline / eyebrow | `text-[10px] font-extrabold uppercase tracking-wider` |
| Numeric values | add `tabular-nums` |

Weights used: `font-semibold`, `font-bold`, `font-extrabold`, `font-black`. Regular
weight is essentially never used for UI chrome.

### 1.10 Animation library

Keyframes defined in `styles.css`: `bounce-in`, `pop`, `float-up`, `pulse-glow`,
`wiggle`, `shake`, `confetti-fall`, `float-soft`, `vibrate`, `slide-up-in`,
`score-pop`, `dash-run-left`, `dash-run-right`.

Utility classes and durations:

```
.animate-bounce-in     0.5s cubic-bezier(.34,1.56,.64,1)
.animate-pop           0.4s cubic-bezier(.34,1.56,.64,1)
.animate-float-soft    3s ease-in-out infinite      /* idle mascots */
.animate-pulse-glow    2s ease-in-out infinite      /* "next up" affordance */
.animate-wiggle        0.5s ease-in-out             /* correct answer */
.animate-shake         0.4s ease-in-out             /* wrong answer */
.animate-vibrate       0.4s linear infinite         /* urgency / low timer */
.animate-float-up      1.2s ease-out forwards       /* +XP floaters */
.animate-slide-up-in   0.45s cubic-bezier(.34,1.56,.64,1) forwards  /* sheets */
.animate-score-pop     0.4s ease-out                /* score increments */
.animate-dash-run-left / -right  0.5s cubic-bezier(.4,0,.2,1) forwards
```

Motion rule: entrances overshoot (spring curve `cubic-bezier(0.34,1.56,0.64,1)`);
exits and transforms are ease-out. Transitions on interactive elements are
`transition-transform active:scale-95` for tap feedback.

### 1.11 Pillar themes (`src/game/pillarTheme.ts`)

| Slug | Character | World | Tagline | Accent | Glow |
|---|---|---|---|---|---|
| `inner` | Maya | Inner World | Brave enough to try, strong enough to fail | `#7c3aed` | `rgba(167,139,250,0.25)` |
| `social` | Leo | Social World | Kind heart, learning to speak up | `#e11d48` | `rgba(251,113,133,0.25)` |
| `action` | Dash | Action World | Full speed ahead, learning to pause | `#6366f1` | `rgba(129,140,248,0.25)` |
| `real` | Pip | Real World | Small steps, giant leaps | `#f97316` | `rgba(251,191,36,0.25)` |

Order is always `inner → social → action → real`. Each has a mascot image
(`src/assets/images/{maya,leo,dash,pip}-world.png`). Accent drives the hero
gradient, progress ring stroke, active pill fill, and CTA background on that world.

---

## 2. Layout shell

### 2.1 `PlayerShell` responsive rules

- Phone (`< md`): centred column, max **430px**, card shadow over grey backdrop.
- Tablet (`md`): column widens to ~**720px**, same vertical stack.
- Desktop (`lg+`): persistent left sidebar nav + content column up to ~**960px**,
  decorative gradient backdrop; bottom nav hidden via `lg:hidden`.
- `bleed` prop removes inner padding for full-bleed scenes (My Journey, world hero).
- When signed in, the content area gets **`pb-28`** so the fixed bottom nav never
  covers the last element. Full-bleed pages that opt out must lift their own CTA
  (Journey CTA sits at `bottom-28` on mobile).

### 2.2 Bottom nav (`BottomNav` in `Chrome.tsx`)

5 items, `grid grid-cols-5`:

| Icon (lucide) | Label | Route |
|---|---|---|
| `Home` | My World | `/` |
| `Map` | My Journey | `/journey` |
| `BarChart3` | My Growth | `/profile` |
| `Users` | Sementa Club | `/club` |
| `Settings` | Settings | `/studio` |

Container:
`fixed inset-x-0 bottom-0 z-40 border-t border-white/30 bg-gradient-to-r from-[#EFEAFB]/70 via-white/60 to-[#FCE9F0]/70 backdrop-blur-xl backdrop-saturate-150 transition-transform duration-300 ease-out lg:hidden`
plus `paddingBottom: env(safe-area-inset-bottom)`.

Item: 44px circle (`h-11 w-11 rounded-full`). Active = `bg-primary text-primary-foreground shadow-pop`
with label `text-primary`; inactive = `bg-white text-foreground/70 shadow-sm` with
label `text-text-secondary`. Label is `text-[10.5px] font-extrabold`.

Auto-hide behaviour (exact):
- Scroll delta > 4px: scrolling **down** past `scrollY > 80` → hide; scrolling **up** → show.
- Any scroll schedules a **1500ms** idle timer that re-shows the nav.
- `touchstart` / `mousemove` show the nav and schedule a **2200ms** hide.
- Route change always reveals it.
- Hidden state = `translate-y-full`; visible = `translate-y-0`.

### 2.3 `TopBar` (class player chrome)

`sticky top-0 z-20 bg-background/90 backdrop-blur-md`, containing:
- Level pill: `⭐` + level name, `rounded-pill bg-card px-3 py-1.5 shadow-card`.
- XP bar: `h-2.5 rounded-pill bg-muted` track, `bg-primary` fill,
  `transition-all duration-700 ease-out`; right label `{xp}/{totalXp}` at `text-[11px] tabular-nums`.
- Read-aloud toggle (only when level is `Explorer`): 🔊 / 🔈, active = `bg-primary text-primary-foreground`.
- Streak pill: `🔥 Day {n}` in `text-streak`.
- Optional layer strip: `Layer {n} of {total}` overline + segmented bars
  (`h-1.5 flex-1 rounded-pill`, done = `bg-primary`, pending = `bg-muted`).

---

## 3. Route map

```text
/                         My World (home)  — sign-in gate, avatar-picker gate
/journey                  My Journey (character scene)
/world/$slug              World page (inner | social | action | real)
/play/$slug               Class player (layer runner)
/profile                  My Growth (stats + leaderboard)
/profile/edit             Profile editor
/club                     Sementa Club (friends)
/club/join/$code          Friend-code join deep link
/shop                     Shop (Flask XP)
/studio                   Studio CMS (role gated)

/mission/emotions-crossword     Solo/co-op crossword
/mission/emotions-quiz          Self-paced 10-MCQ quiz
/mission/emotions-quickfire     Quick-fire timed quiz
/mission/emotions-catcher       Flying-tile catcher
/mission/emotion-duel           Competitive 1v1 (friends only)
/mission/reaction-race          Competitive best-of-7 (friends only)
/mission/empathy-relay          Co-op alternating turns (friends only)
/mission/mood-match             Co-op emotion sync (friends only)
```

---

## 4. Screen blueprints

### 4.1 Sign-in (`PlayerSignIn`)

Shown when `!user && !isGuest`. **Bottom nav is hidden here.**
Email/password + Google, plus a "Continue as guest" action that sets guest mode.
Guest state shows an unlock prompt in the home footer.

### 4.2 Avatar picker gate

If the signed-in profile has no `avatar_id`, `AvatarPicker` renders `fullscreen`
before the home screen. Picking writes `avatar_image_url` and dismisses the gate.

### 4.3 My World — home (`GamePlayer.tsx`)

```text
┌──────────────────────────────────────────┐
│ Sementa (font-display)   [🔍] [🔔] [ava] │  sticky top bar
├──────────────────────────────────────────┤
│  HERO CARD  aspect-video rounded-[24px]  │  gradient-hero, shadow-pop
│  "Welcome back,"   <name in gold>        │  auto-rotates every 4000ms
│  Headline (max-w-[58%], text-[20px])     │  fallback: "Leo needs your help today..."
│  Subline (text-[12px] text-white/85)     │
├──────────────────────────────────────────┤
│ [Your Stars] [Your Level] [Learning      │  3 stat cards
│  bg-card-warm  bg-card-gold   Streak]    │  icons: star / trophy / fire PNGs
│  + gold note strip (bg-card-gold,        │
│    text-[12px] text-[#A66D00])           │
├──────────────────────────────────────────┤
│ Your Journey                    View all │  section header
│  ▸ horizontal cards, one per pillar      │  CTA: Start / Continue / Replay
├──────────────────────────────────────────┤
│ Your Missions                   View all │
│  ▸ Crossword · Quiz · Quick-fire ·       │
│    Emotion Catcher                       │
│  ▸ Friends-only row: Emotion Duel ⚔️,    │
│    Reaction Race ⚡, Empathy Relay 🤝,    │
│    Mood Match 💞                          │
├──────────────────────────────────────────┤
│ Fun Activities                            │
│  ▸ Meet the Characters · Live Events     │
├──────────────────────────────────────────┤
│ SHOP banner (gradient, "Open →")         │
│  "Spend your XP on frames, titles &      │
│   boosts."                                │
├──────────────────────────────────────────┤
│ Leaderboard (top entries, tap → preview) │
├──────────────────────────────────────────┤
│ footer: sign out / unlock guest link     │
└──────────────────────────────────────────┘
```

Details:
- Greeting name resolution order: `profiles.display_name` → `user_metadata.display_name`
  → email local-part → `"Explorer"`.
- Stat cards show `—` when not signed in.
- Level = `levelFromXp(totalXp)` = `floor(xp / 100) + 1`. Use this everywhere; never
  a second divisor.
- Journey card shows a circular % badge (`text-[10px] font-extrabold text-white`),
  module name, and tag chips.
- Mission cards carry a completion ribbon when a local completion record exists
  (`✓ Last: {difficulty} · +{xp} XP`), else the default subtitle
  (e.g. `"Solo or with a friend"`, `"Catch the right emotions!"`).
- Friends-only cards use a top-left uppercase badge (`Vs friend` / `Co-op`) and
  chips `Friends only`, `Live`. Gradients per card:
  duel `from-rose-500 via-fuchsia-500 to-violet-600`,
  race `from-amber-500 via-orange-500 to-red-500`,
  relay `from-emerald-400 via-teal-500 to-cyan-500`,
  mood `from-pink-500 via-fuchsia-500 to-purple-600`.
- Loading state: full-height centred `Loading…` on `#F8F8FC` with `#666` text.

### 4.4 My Journey (`MyJourney.tsx`)

Full-bleed illustrated scene with Maya, Leo, Dash, Pip. Selection uses **nearest-body
detection on the scene container** (not per-image click targets): compute pointer
distance to each character's body anchor and select the closest. Name pills render at
`z-50`. Characters are nudged left so all four stay inside the background frame
(Pip at ~5% left offset). CTA "Explore {name}'s world" sits at `bottom-28` on mobile
to clear the bottom nav, with a hint line beneath.

### 4.5 World page (`/world/$slug`)

Three drill-down levels in one route: **Topics → Modules → Classes**.

```text
┌──────────────────────────────────────────┐
│ ← back      sticky header (accent tint)  │
│  HERO: mascot + world name + tagline     │
│  ProgressRing (SVG) · XP · streak ·      │
│  "Mastered" indicator when complete      │
├──────────────────────────────────────────┤
│ Continue where you left off  (card)      │
├──────────────────────────────────────────┤
│ PillarDots — 4-dot quick jump            │
├──────────────────────────────────────────┤
│ Filters: All · In Progress · Completed · │
│          Locked   (rounded-full pills)   │
├──────────────────────────────────────────┤
│ Topic pills (progress bar inside pill)   │
│   → tap opens TopicPreviewSheet          │
│   → expands module list                  │
│      → module expands ClassPill list     │
│         (status · XP · duration)          │
├──────────────────────────────────────────┤
│ Next-unlock teaser card                  │
└──────────────────────────────────────────┘
```

Components: `ProgressRing`, `ContinueCard`, `PillarDots`, `ClassPill`,
`TopicPreviewSheet`, `WorldSkeleton`.

States:
- **Loading** — `WorldSkeleton`, themed with the pillar accent.
- **Timeout** — after **8s** the page bails out of loading.
- **Error** — "World not found" with a "Try again" action.
- **Locked** — greyed row, lock glyph, tap shows the unlock requirement, never navigates.
- **Complete** — accent-filled pill + confetti/toast on first completion.

### 4.6 Unlock rules (`src/game/unlocks.ts`)

- Pillars: always unlocked.
- Topic *N* unlocks when the **first module** of topic *N-1* is complete.
- Module *N* unlocks when module *N-1* is complete.
- Class *N* unlocks when class *N-1* is complete (published classes only).
- A module is complete when all **published** classes in it are complete.

### 4.7 Class player (`/play/$slug`)

`TopBar` with layer strip, then one layer at a time via `LayerRenderer`.
15 task types (code → component → base XP):

| Code | Name | Emoji | Family | XP |
|---|---|---|---|---|
| T01 | Story Video | 📹 | Foundation | 5 |
| T02 | Micro Clip | ⚡ | Foundation | 3 |
| T03 | Drag & Drop Sort | 🗂️ | Knowledge Check | 10 |
| T04 | Rapid Fire Tap | ⚡ | Knowledge Check | 10 |
| T05 | Scenario Card Flip | 🃏 | Knowledge Check | 10 |
| T06 | Body Map Tap | 🫀 | Knowledge Check | 8 |
| T07 | Branching Story | 🌿 | Simulation | 15 |
| T08 | Role-Play AI Chat | 🤖 | Simulation | 20 |
| T09 | Guided Experience | 🧘 | Simulation | 12 |
| T10 | Voice Recording | 🎙️ | Performance | 15 |
| T11 | Drawing / Collage | 🎨 | Performance | 12 |
| T12 | Build & Arrange | 🔧 | Performance | 15 |
| T13 | Real-Life Mission | 🌍 | Real-Life | 25 |
| T14 | Open Reflection | ✍️ | Reflection | 10 |
| T15 | Self-Rating Scale | 📊 | Reflection | 8 |

Unknown codes fall back to a generic card: *"This layer type doesn't have a custom view
yet. Tap continue to claim XP."* Each layer header uses
`text-[11px] font-bold uppercase tracking-wider text-[#7B2FBE]`.

Screen components: `IntroScreen`, `VideoScreen`, `QuizScreen`, `BranchingScreen`,
`ReflectionScreen`, `CompleteScreen`.

### 4.8 My Growth (`/profile`) and Leaderboard

Stats header (XP, level, stars, streak) then the leaderboard with filters:
**All · Friends · Near me**. Tapping a row opens `ProfilePreviewCard`; a drawer shows
the **XP breakdown by source and mode (solo vs co-op)** from `get_user_xp_breakdown`.

Ranking order: **Level DESC → Stars DESC → total XP DESC**.
Level = `floor(xp/100)+1`. Stars = count of XP-earning events.

`/profile/edit` edits display name and avatar.

### 4.9 Shop (`/shop`)

Currency: **Flask XP** (`FlaskConical` lucide icon, 🧪 in copy). Earned at
**1 shop XP per 5 mission XP** (`xpToOrbs`). Balance persisted in `localStorage`
and broadcast via a custom event so the home badge updates live.

Grouped by category, in order Avatar Frame → Title → Boost → Theme:

| Item | Emoji | Cost | Category |
|---|---|---|---|
| Galaxy Frame | 🌌 | 40 | Avatar Frame |
| Flame Frame | 🔥 | 60 | Avatar Frame |
| Rainbow Frame | 🌈 | 90 | Avatar Frame |
| Title: Explorer | 🧭 | 30 | Title |
| Title: Empath | 💞 | 50 | Title |
| Title: Sage | 🦉 | 120 | Title |
| 2× XP Booster | ⚡ | 80 | Boost |
| Sunset Theme | 🌇 | 70 | Theme |
| Ocean Theme | 🌊 | 70 | Theme |

Affordable item shows `FlaskConical` + cost; unaffordable shows `Lock` + cost and is
dimmed. Failed purchase toast: `Need {n} more XP!`. Owned items show an owned badge.

### 4.10 Sementa Club (`/club`)

`ClubPage` composes `JoinCard` (enter a friend code), `AddFriend`, `RequestsInbox`,
`FriendsList`. `/club/join/$code` is the shareable deep link. Friend codes resolve via
`lookup_friend_code`.

### 4.11 Missions

Shared conventions: intro screen (title, blurb, difficulty selector, last-score strip,
Start CTA with `pb-32` clearance) → play screen → rewards screen (XP, badges, flask
orbs, replay + shop CTAs). XP writes to `xp_events`; local completion records power the
home-card ribbons.

**Accessibility settings** (`missionSettings.ts`, localStorage key
`sementa.mission.settings`): `largeText`, `colorblind`, `sound` (default on),
`vibration` (default on). Colour-blind mode adds icons and safer hues instead of
red/green alone.

**Music** (`missionMusic.ts`, procedural Web Audio): soothing bed for self-paced
missions, fast bed for quick-fire/timed missions.

**Emotion Catcher difficulty table** (literal config):

| Difficulty | Emoji | Blurb | Spawn | Flight duration | Correct chance | XP × |
|---|---|---|---|---|---|---|
| Easy | 🌱 | Slow fliers, mostly correct answers. | 950ms | 2.0–3.0s | 0.65 | 0.8 |
| Medium | ⚡ | Balanced speed, mix of distractors. | 650ms | 1.4–2.2s | 0.45 | 1.0 |
| Hard | 🔥 | Fast fliers, lots of tricky distractors. | 420ms | 0.9–1.5s | 0.30 | 1.4 |

Round: 45s, 3 lives. Fliers travel right→left; a flier is a miss 200ms after its
duration elapses. Final XP = `round(rawXp × multiplier)`. Difficulty persists at
`sementa.mission.emotions-catcher.difficulty`.

**Crossword**: Easy / Medium / Hard grids, 25 / 50 / 100 XP. Badges: Sprout Solver,
Puzzle Pal, Emotion Master. Co-op syncs cells and cursors over Supabase Realtime
broadcast with a `sync-request` / `sync-state` handshake for late joiners.

**Quiz**: 10 MCQs. Self-paced +25 XP base (soothing music); Quick-fire +50 XP base,
8s per question, fast music, rarer badge. Solo/Co-op selector; co-op broadcasts scores
and ends on a shared scoreboard, and re-broadcasts state so a refreshing friend
resumes on the current question.

**Friends-only multiplayer** uses `FriendGate` + `MultiplayerLobby` (code + presence +
`?code=` invite links). Competitive: Emotion Duel, Reaction Race. Co-op: Empathy Relay,
Mood Match.

### 4.12 Studio CMS (`/studio`)

`.studio-root` theme: Inter, `#F8F8FC` background, `#1A1A2E` sidebar with `#AAAACC`
text, `#EBEBF5` card borders, `shadow-studio`. Screens: Dashboard, Library, Module,
ClassEditor, QuizEditor, CrosswordBuilder, Missions, Avatars, WelcomeCards,
TaskTypesRef. Role-gated via `has_role`. Status chips use `--color-success` (published)
and `--color-warning` (draft/review).

---

## 5. Flows

### 5.1 Entry

```text
open app
  └─ loading  →  no session & not guest → Sign-in
                    └─ signed in → profile has avatar_id?
                          ├─ no  → Avatar picker (fullscreen)
                          └─ yes → My World
```

### 5.2 Learning

```text
My World ──▶ Your Journey card ──▶ /world/{slug}
My Journey ─▶ character tap ─────▶ /world/{slug}
/world/{slug} ─▶ topic ─▶ module ─▶ class pill ─▶ /play/{slug}
/play/{slug}  ─▶ layers 1..n ─▶ Complete ─▶ XP written ─▶ next class unlocks
```

### 5.3 XP economy

```text
class layer / mission completion
      └─ xp_events row
            ├─ profile total XP ─▶ level = floor(xp/100)+1 ─▶ leaderboard rank
            ├─ stars = count of xp_events ─▶ tiebreaker
            └─ shop XP = floor(mission XP / 5) ─▶ /shop purchases
```

### 5.4 Multiplayer

```text
Mission card (friends only)
  └─ FriendGate: has ≥1 friend?
        ├─ no  → prompt to add a friend (link to /club)
        └─ yes → MultiplayerLobby
                   ├─ host: generate code, share ?code= link
                   └─ guest: enter code / open link
                        └─ presence ready → round starts
                             └─ realtime broadcast state
                                  └─ refresh → sync-request → sync-state → resume
                                       └─ results + XP
```

---

## 6. Replication checklist

Build in this order; verify each row before moving on.

1. Fonts linked in root head; `styles.css` tokens copied verbatim (sections 1.2–1.10).
2. `PlayerShell` breakpoints (430 / 720 / 960) and the `pb-28` rule.
3. `BottomNav` with exact hide/show timings (80px, 1500ms, 2200ms, 4px delta).
4. Sign-in gate hides the bottom nav; avatar gate renders before home.
5. Home screen section order and copy match section 4.3 exactly.
6. `levelFromXp` used for every level display — no second formula anywhere.
7. My Journey nearest-body tap selection; CTA at `bottom-28`.
8. World page three-level drill-down, filters, skeleton, 8s timeout, error fallback.
9. Unlock rules match section 4.6.
10. All 15 task types render, with the fallback card for unknown codes.
11. Leaderboard ranking Level → Stars → XP, with the XP-breakdown drawer.
12. Shop items, costs, categories, and the 5:1 conversion.
13. Each mission's intro / play / rewards trio, difficulty tables, music, and a11y toggles.
14. Studio scoped theme and all ten CMS screens behind role gating.
15. Dark mode verified: no hardcoded `text-white` / `bg-black` outside gradient overlays.
