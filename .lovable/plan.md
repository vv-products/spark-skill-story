## Goal

Turn each character's "Explore world" CTA into a real navigable world page that shows topics → modules as interactive progress pills, with the multi-level locking rules you described.

## Routing

- New route file: `src/routes/world.$slug.tsx` — slug is the pillar slug (`inner`, `social`, `action`, `real`).
- Map character → pillar:
  - maya → inner, leo → social, dash → action, pip → real.
- `MyJourney` CTA becomes a `<Link to="/world/$slug" params={{ slug }}>` instead of a plain button.
- Page rendered inside the existing `PlayerShell` (keeps bottom nav + auto-hide behavior).
- Back button in the top-left of the world page → navigates to `/journey`.

## Data

Reuse existing helpers — no schema changes:
- `loadFullCatalog()` from `src/studio/catalog.ts` for the pillar/topic/module/class hierarchy.
- `loadPublishedClasses()` to know which classes are actually playable (filter out drafts).
- `loadUserProgress(userId)` from `src/game/progress.ts` for `completedClassIds`.

Derived helpers (added in a small new file `src/game/unlocks.ts`):
- `isClassComplete(classId)` — `progress.completedClassIds.has(classId)`.
- `moduleProgress(module)` → `{ completed, total, isComplete }` over its **published** classes.
- `topicProgress(topic)` → sum across modules.
- `isModuleUnlocked(topic, moduleIndex)` — true if `moduleIndex === 0` or previous module `isComplete`.
- `isTopicUnlocked(pillar, topicIndex)` — true if `topicIndex === 0` or **first module of previous topic** is complete (your nuance).
- `isClassUnlocked(module, classIndex)` — true if `classIndex === 0` or previous class complete.

Pillars are always unlocked (no gating between worlds).

## World page UX

Two states inside one page, animated:

**State A — Topic list (default)**
- Header: world name + character tagline + back button.
- Vertical stack of topic pills. Each pill is full-width, rounded, shows:
  - Topic title
  - Progress bar fill = `topicProgress.completed / total`
  - Lock icon + dimmed style if `!isTopicUnlocked`
- Tap an unlocked pill → transitions to State B (other topics fade/slide out, selected pill animates to top).

**State B — Modules of selected topic**
- Selected topic stays pinned at top as a header pill (tap or back chevron returns to State A).
- Below it: 5 module pills, same progress-bar treatment.
- Locked modules show lock icon + are non-interactive.
- Tap an unlocked module → navigates into the first incomplete (or first) class of that module using the existing class entry (reuse the navigation `GamePlayer` already does — `play/$slug` route with the class slug). If the module has zero published classes, show a small "Coming soon" hint instead.

Animations: simple Tailwind transitions (`transition-all`, opacity + translate-y), no new libs. Match the playful style already in `MyJourney` (Nunito, soft shadows, accent color from the active character).

## Files to add / change

- **Add** `src/routes/world.$slug.tsx` — route, loads catalog + progress, renders `<WorldPage>`.
- **Add** `src/game/WorldPage.tsx` — the two-state UI described above.
- **Add** `src/game/unlocks.ts` — pure helpers listed above (also exported for future reuse on the Home/Journey screens).
- **Edit** `src/game/MyJourney.tsx` — replace the CTA `<button>` with a `<Link>` to the new route, keyed by character→pillar slug map.

## Out of scope (call out, don't do)

- No DB / RLS changes.
- No changes to class playback itself — we just route into the existing class flow.
- Home screen "Your Level" card and other surfaces stay as-is. We can wire `unlocks.ts` into them in a follow-up if you want consistent lock indicators everywhere.
