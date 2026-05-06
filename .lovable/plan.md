## Goal

When the player gets every item in the right jar in the "Sort It Out" (T03) task, give them a satisfying celebration moment before they tap Continue.

## UX

The moment `allCorrect` becomes true (last wrong item gets fixed, or final placement is correct on first try):

1. **Confetti burst** falls across the screen for ~2.5s using the existing `Confetti` component.
2. **Celebration banner** slides in above the buckets (replacing the red hint banner): green pill with "🎉 Perfect sort! +{xp} XP" using `animate-scale-in`.
3. **Bucket grid pulses green** once (reuse existing `flash` ring style applied to all buckets briefly).
4. **All correct pills do a quick bounce** — staggered `animate-scale-in` so they pop one after another.
5. **Continue button** gets a subtle pulse to draw the eye, label already reads `All correct · +X XP`.

Celebration only fires once per attempt (tracked via a `celebrated` ref) so toggling items after won't re-trigger it.

## Technical changes (single file: `src/game/LayerRenderer.tsx`, `T03Sort` only)

- Import `Confetti` from `./Effects`.
- Add state `celebrating: boolean` and ref `celebratedRef` to fire only once per session.
- `useEffect` watching `allCorrect`: when it flips true and `!celebratedRef.current`, set `celebrating=true`, mark ref, and `setTimeout` to clear after 2500ms (confetti can stay mounted that long).
- Conditionally render `<Confetti />` while `celebrating`.
- When `allCorrect`, render a green celebration banner in place of the red hint banner with `animate-scale-in`.
- Add `animate-scale-in` (with staggered `animationDelay` based on item index) to correctly placed pills when `allCorrect` is true.
- Add `animate-pulse` to the footer `PrimaryBtn` when `allCorrect`.

## Out of scope

- No new sound effects.
- No changes to scoring, XP, or other task types.
- No new dependencies — reuses existing `Confetti` component and Tailwind animations.

## Files to edit

- `src/game/LayerRenderer.tsx` — `T03Sort` component only.
