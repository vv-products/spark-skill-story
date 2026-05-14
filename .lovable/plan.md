## World Page Upgrades

Big visual + functional pass on `/world/$slug`. All work is frontend on `WorldPage.tsx` plus a small helper file. No DB schema, no new artwork, no new routes.

A few items from the brainstorm need server work or new assets and are explicitly deferred — listed at the end.

---

### What ships

**1. Themed hero header**
- Pillar-tinted gradient background already exists; expand it to a proper hero band with the matching character image (`maya/leo/dash/pip-world.png`) on the right.
- Title (e.g. "Inner World") + tagline + a row of 4 small pillar dots that quick-jump to the other 3 worlds (active dot highlighted).
- Sticky compact header on scroll.

**2. World progress ring**
- Big circular ring inside the hero showing `% of all published classes in this world completed`.
- Below the ring: `X / Y classes`, `Z XP earned in this world`, and current streak badge.
- XP-in-this-world derived by summing `progress.perClass[classId].xp` for class IDs that belong to the pillar.

**3. "Continue where you left off" card**
- Hero-level card directly under the ring.
- Picks the most recently touched in-progress class in this world (uses `perClass.lastAt`); falls back to "Start Topic 1 → Module 1 → Class 1" if nothing started yet; hidden when 100% complete (replaced by a "World complete!" card).
- One-tap → `/play/$slug`.

**4. Next-unlock teaser**
- Small chip under the continue card, e.g. "Finish 1 more class to unlock Topic 3 ✨". Computed from `isTopicUnlocked` + `moduleProgress` on the first locked topic.

**5. Filter pills (Topic list view)**
- Row above the topic list: `All • In progress • Completed • Locked`.
- Filter is purely client-side, persists in `localStorage` per pillar.

**6. Topic preview sheet**
- Add an info icon on each `TopicPill`. Tapping it opens a small bottom sheet (shadcn `Sheet`) with: topic name, module count, estimated total time, list of module names with their lock state. Tapping a module from the sheet selects the topic and scrolls to that module.

**7. Third drill-down level: classes inside a module**
- Currently tapping a module jumps straight to the next playable class. Change to: tap a module → expand inline (or push a third state) showing the module's published classes as `ClassPill`s.
- Each `ClassPill` shows: number, title, status icon (✓ done / ▶ in-progress / 🔒 locked), XP earned, estimated minutes.
- Locked classes are disabled. Done classes show a "Replay" affordance. In-progress classes show "Continue".
- Tapping a playable class navigates to `/play/$slug`.

**8. Module estimated time**
- Sum of `class.estimated_minutes` for published classes in the module, surfaced on `ModulePill` and the new class-list header ("~12 min").
- Requires reading `estimated_minutes` from the catalog. If `HClass` doesn't currently include it, extend the catalog mapper to expose it (DB column exists on `classes`).

**9. Completion celebrations**
- When the user lands on the world page and a topic or module just hit 100% (compared against a `lastSeenCompletions` set in `localStorage`), trigger a one-shot confetti burst and a toast: "Module complete! +badge".
- Reuse the existing `Confetti` component from `src/game/Effects.tsx`.

**10. Polish**
- Replace plain `border bg-white` pills with subtle shadow + rounded-3xl, animated progress fill (existing `animate-in` utilities).
- Animate transitions between topic list ↔ module list ↔ class list with `fade-in` + `slide-in-from-bottom-2`.
- Empty / loading states refined (skeleton pills instead of plain text).
- Add `head()` metadata per pillar so each `/world/<slug>` has its own title + description for SEO.

---

### File changes

**Edit `src/game/WorldPage.tsx`** — the bulk of the work:
- Add hero with `<ProgressRing />`, mascot image, pillar quick-jump dots.
- Add `<ContinueCard />`, next-unlock teaser, filter pills.
- Extend the state machine: `view = "topics" | "modules" | "classes"` with `selectedTopicId` + `selectedModuleId`.
- Render `TopicPill`, `ModulePill`, new `ClassPill`.
- Hook up `Sheet` for topic preview.
- Wire localStorage for filter + last-seen completions; trigger `Confetti`.

**Edit `src/game/unlocks.ts`** — add helpers:
- `worldProgress(pillar, p)` → `{ completed, total, xpEarned, isComplete }`.
- `nextLockedTopic(pillar, p)` → `{ topic, classesNeeded } | null`.
- `mostRecentInProgressClass(pillar, p)` → `HClass | null`.
- `moduleEstimatedMinutes(module)` → number.

**Edit `src/studio/catalog.ts`** — surface `estimated_minutes` and `subtitle` on `HClass` (DB columns already selected? if not, add to the select + map).

**Edit `src/routes/world.$slug.tsx`** — add per-pillar `head()` metadata (title, description, og:title, og:description per the four pillars).

**New `src/game/world/` components** (split for readability):
- `ProgressRing.tsx` — SVG ring, accepts `pct`, `accent`, optional center label.
- `ContinueCard.tsx` — hero-style card with class title, progress, CTA.
- `PillarDots.tsx` — 4 dots, active highlighted, navigates between worlds.
- `ClassPill.tsx` — single class row with status icon + XP + minutes.
- `TopicPreviewSheet.tsx` — shadcn `Sheet` content.

---

### Tech notes

- Pillar slug → mascot image: small map identical to the one in `MyJourney.tsx`. Extract to `src/game/pillarTheme.ts` so both files share it (also moves `PILLAR_THEME` colors out of `WorldPage`).
- All progress reads stay local: `loadFullCatalog` + `loadUserProgress(user.id)` once per mount. No new server functions.
- Celebrations: store `mem-completions-${pillarSlug}` in localStorage as a JSON array of completed module/topic ids. Diff on mount; fire confetti for new entries; rewrite the storage.
- Filter + selected view persist in URL search params (`?view=modules&topic=<id>`) so back button works between drill levels.

---

### Deferred (need more setup; flagging now so we don't quietly drop them)

- **Friends' progress dots on topics** and **per-world leaderboard** — `class_progress` RLS only allows users to read their own rows, so we'd need either a Postgres view + RPC, or denormalised aggregate columns. Treat as a separate task.
- **Pillar-themed full-scene background** (each world its own illustrated environment) — needs 4 new generated images. Can be added later by swapping the gradient for a hero `<img>` once art is produced.
- **Daily mission tied to a pillar**, **parent/teacher notes**, **reflection journal** — all need new tables/columns. Out of scope here.

If you want any of those three pulled into this pass, say which and I'll fold them in.
