## Goal
On the home page, the "Your Journey" rail currently shows the first 5 published classes regardless of what the user is actually playing. Update it so it surfaces the user's actual journey — the class they're currently in the middle of, plus other in-progress and recently-touched classes — instead of a generic catalog slice.

## Changes (all in `src/game/GamePlayer.tsx`)

1. **Replace `journeyClasses` derivation** (currently `(classes ?? []).slice(0, 5)`) with a prioritized list built from `progress`:
   - **Current class** first: the existing `continueClass` (most recently touched, not completed).
   - **Other in-progress classes** next: every class in `progress.perClass` with `xp > 0` and not in `completedClassIds`, sorted by `lastAt` desc, excluding the current one.
   - **Recently completed** after that: classes in `completedClassIds`, sorted by `lastAt` desc from `perClass`.
   - **Fill with "up next"** suggestions: the next published classes in catalog order that the user hasn't touched, until the rail has up to 5 cards.
   - For signed-out / guest users (no progress), keep current behavior (first 5 published classes) so the rail isn't empty.

2. **Empty state**: if user is signed in but has zero progress and there are no published classes, keep the existing "No classes yet." message. If signed in with no progress but classes exist, show the "up next" suggestions (so new users still see something to start).

3. **Card labelling**: tags/CTA already adapt via `done` / `inProgress` checks, so no change needed there — the prioritized ordering automatically makes the current class appear first with its `Continue →` CTA and the `ring-2 ring-primary` highlight (via existing `current={continueClass?.id === c.id}`).

4. **Section header**: optionally update the "Your Journey" `SectionHeader` `viewAllSlug` to point at `continueClass?.slug ?? classes?.[0]?.slug` so "View All" jumps into the current journey.

No other files need changes. No DB / schema / RLS work — `loadUserProgress` already returns everything needed.