## Goal

After the player has placed all items into jars in the "Sort It Out" (T03) task, give them clear, gentle feedback about which placements are wrong — instead of just silently letting them press Continue with a low score. They should be nudged to fix mistakes, with an optional hint.

## UX

When `allDone` becomes true and `correct < items.length`:

1. **Wrong pills get marked** inside their (incorrect) jar:
   - Red ring around the pill (`ring-2 ring-red-400`)
   - Small ✗ icon prefix
   - A subtle one-time shake animation
   - Tooltip / aria-label: "Not quite — tap to move back"
   - (Tapping still sends it back to the tray, same as today.)

2. **Hint banner** appears above the buckets:
   > "Almost! 2 items are in the wrong jar. Tap a red pill to move it back, or use Hint."
   - Count updates live as the user fixes items.
   - Disappears once everything is correct.

3. **Hint button** (right side of the banner, ghost style):
   - On click, picks the first wrong item and:
     - Pulses its current (wrong) jar with a red glow
     - Pulses the correct jar with a green glow + shows its label briefly
     - Does NOT auto-move the item — the player still drags it.
   - Limit: 2 hints per attempt; after that the button is disabled with text "No more hints".

4. **Continue button (footer)**:
   - When `allDone && correct < total`: label changes from `"X/Y correct · +XP"` to `"Fix wrong items to continue"` and stays **disabled**.
   - When all are correct: enabled, label `"All correct · +XP XP"`.
   - This makes "complete" mean "completed correctly", consistent with the other tasks.

5. **All correct celebration**: when the last wrong item gets fixed, briefly flash a green ring around the whole bucket grid (reuse existing `flash` style) so the player knows they nailed it.

## Technical changes (single file: `src/game/LayerRenderer.tsx`, `T03Sort` only)

- Add state: `hintsUsed: number`, `hintTarget: { idx: number; wrongBucket: string; rightBucket: string } | null`.
- Derive: `wrongCount = items.filter((it,i) => placed[i] && placed[i] !== it.bucket).length`.
- New `useHint()` function: find first `i` where `placed[i] && placed[i] !== items[i].bucket`, set `hintTarget`, auto-clear after ~1.5s, increment `hintsUsed`.
- In the bucket render loop, when `hintTarget?.wrongBucket === b.label` add a red pulse class; when `hintTarget?.rightBucket === b.label` add a green pulse class with an overlay caption "← move it here".
- In the placed-pill render, when `placed[i] !== items[i].bucket` add red ring + ✗ + `animate-shake` (one-shot via key bump or CSS).
- Insert the hint banner between the tray and the bucket grid, only when `allDone && wrongCount > 0`.
- Update the footer `PrimaryBtn`:
  - `disabled={!allDone || wrongCount > 0}`
  - Label logic: `wrongCount > 0 ? "Fix wrong items to continue" : allDone ? \`All correct · +${xp} XP\` : "Drag all items into a jar"`.
- Keep `onComplete(xp)` unchanged (it now only fires on a fully-correct sort, which matches scoring elsewhere).
- Add a tiny keyframe (in the same file's existing inline style or via a Tailwind arbitrary class) for `animate-shake` if no equivalent exists; otherwise reuse `animate-pulse`.

## Out of scope

- No changes to the Studio editor for T03.
- No changes to data shape (`layer.config.items` / `buckets`).
- No changes to other task types or to scoring/XP rules elsewhere.
- No new dependencies.

## Files to edit

- `src/game/LayerRenderer.tsx` — `T03Sort` component only.
