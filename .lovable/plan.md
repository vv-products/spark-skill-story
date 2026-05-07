## Goal
Replace the current "Your Journey" rail (5 class cards from a single ordering) with **exactly 4 cards — one per pillar**. Each card represents the most relevant module in that pillar for the user, with module-level progress and a clear Start/Continue CTA.

## Card content (each of the 4 cards)

```text
┌──────────────────────────┐
│  [hero image]      ◐ 45% │  ← circular progress + % overlay
│                          │
├──────────────────────────┤
│ Class: <next class name> │  line 1
│ Module: <module name>    │  line 2
│ Topic: <topic name>      │  line 3
│                          │
│   [ Start ] / [Continue] │  full-width pill button
│                          │
│   • <Pillar name> pill   │  pill tag below button
└──────────────────────────┘
```

- **Module shown per pillar**:
  1. If any module in the pillar is *in progress* (≥1 class started but not all classes completed) → show that one (most recently touched).
  2. Else → show the next *not-started* module (lowest position whose classes are all unstarted).
  3. Else (everything in the pillar is completed) → show the last completed module with 100%.
- **Class shown on card**: within that module, the next class to play (first not-completed; if all completed, the last one).
- **Hero image**: that class's `heroImageUrl` if set, else fallback (existing `FALLBACK_IMAGES` rotation).
- **Progress %**: completed classes ÷ total classes in module × 100 (module-level, not class-level).
- **Button label**: `Continue` if any class in the module has progress; otherwise `Start`. (If module 100% done → `Replay`.)
- **Pillar pill**: pillar emoji + name, styled like existing tag pills.
- Card click navigates to `/play/$slug` for the chosen class (same as today).

## Implementation

**File: `src/game/GamePlayer.tsx`** (only file touched)

1. **Load the full catalog** alongside the existing class list:
   - Add `loadFullCatalog` (already exported from `src/studio/catalog.ts`) to the initial `Promise.all` in `GameHome`.
   - Store as `pillars: HPillar[] | null` in state.
2. **Filter to published classes only** when computing per-pillar selections (use the existing `loadPublishedClasses` result as a `Set<classId>` of valid IDs; ignore drafts inside modules).
3. **Replace `journeyClasses` memo** with a new `journeyEntries` memo returning up to 4 items of shape:
   ```ts
   { pillar: HPillar; topic: HTopic; module: HModule; nextClass: HClass;
     completedCount: number; totalCount: number; pct: number;
     state: "new" | "in_progress" | "done" }
   ```
   One entry per pillar, in pillar `position` order. Skip a pillar if it has zero published classes.
4. **Render the rail** using the new entries. Replace the current `JourneyCard` usage with an updated `JourneyCard` that accepts `className`, `moduleName`, `topicName`, `pillarName`, `pillarEmoji`, `pct`, `state`, `image`, `slug`.
5. **Update `JourneyCard`**:
   - Show three text lines (class / module / topic) with truncation (`line-clamp-1`).
   - Replace the small bottom-right `45% ◐` badge with a proper circular progress ring (SVG, ~44px) overlaid top-right of the image, showing the % in the center.
   - Keep the full-width pill button (`Start` / `Continue` / `Replay`).
   - Add a single pill below the button: `<emoji> <Pillar name>`.
   - Drop the old `tags` and `current` props (and the `current` border logic — already removed previously).

## Edge cases

- **Pillar has no published classes** → omit (fewer than 4 cards is acceptable).
- **Guest / signed-out user** → `state` is always `new`, pct is `0`, button shows `Start`. Behaviour matches today's empty-progress path.
- **Module has zero classes** → skip module, fall through to next candidate in same pillar.
- **Loading** → keep existing "Loading…" placeholder until both `classes` and `pillars` resolve.

## Out of scope

- No DB schema changes.
- "Your Missions", "Fun Activities", and Leaderboard sections are untouched.
- Hero banner ("Leo needs your help today…") and its `continueClass` logic stay as-is.