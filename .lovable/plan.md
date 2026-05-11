## Problem

The journey scene currently scales the background and the characters as two separate systems:

- Background: CSS `background-image` with `backgroundSize: auto 100%`, centered. On tablet/desktop this leaves big empty bands on either side.
- Characters: absolutely positioned in `%` of a container that grows from `440px → 680px → 880px`. As the container widens, character `%` anchors slide off the bench/path drawn in the BG.

Result: only mobile is close to the reference. On tablet the scene doesn't fill, on desktop the kids become huge and Pip floats off the bench.

## Fix: one scene, one coordinate system

Treat the background as the canvas and put characters on top of it as overlays inside the **same** box. The whole scene scales as a unit, so character positions calibrated once match at every viewport.

### Changes to `src/game/MyJourney.tsx`

1. **Replace the CSS-background div with an `<img>`-based scene box.**
   - A relative wrapper with `aspect-ratio` matching `scene-bg.png` (likely ~3:4 portrait — confirm from the asset).
   - Inside it: `<img src={BG_IMG} className="absolute inset-0 h-full w-full object-cover" />`.
   - All character `<img>`s become absolute children of this same wrapper, positioned in `%` of the wrapper (which now equals `%` of the BG image).

2. **Size the scene wrapper responsively, preserving aspect-ratio.**
   - Phone: `w-full max-h-[68dvh]`.
   - Tablet (`md`): `max-w-[560px] max-h-[72dvh]`.
   - Desktop (`lg`): `max-w-[640px] max-h-[78dvh]`.
   - Centered. The aspect-ratio rule keeps width and height in lockstep so the BG never letterboxes and characters never drift.

3. **Re-anchor characters to BG landmarks (one calibration, applies everywhere).**
   Tuned against the reference image:
   - **Pip**: sitting on the left bench arm — `left ~14%`, `bottom ~46%`, `width ~12%`.
   - **Leo**: standing in front of the bench, center-left — `left ~30%`, `bottom ~6%`, `width ~26%`.
   - **Maya**: standing right of Leo — `left ~52%`, `bottom ~6%`, `width ~26%`.
   - **Dash**: small dog front-center, slightly right of Leo — `left ~42%`, `bottom ~2%`, `width ~16%`.
   Exact numbers will be nudged after a screenshot pass on all three viewports.

4. **Drop `mix-blend-mode: multiply` on character imgs** (it was hiding the cutout edges against the green band; with the new layout we don't need it and it dulls the kids on desktop).

5. **Header & CTA stay as overlays** on top of the scene wrapper, unchanged.

6. **Sidebar dim/blur logic** stays as-is, just applied to the new scene wrapper instead of the CSS-bg div.

### What stays the same

- Tap / bounce / float animations.
- Name pills, footOffset values.
- Character data, colors, world taglines.
- `PlayerShell` bleed mode — no shell changes needed.

### Out of scope

- No changes to other player screens.
- No new assets.
- No copy or color changes.

## Verification

After implementing, screenshot `/journey` at 390×844, 820×1180, and 1536×864 and compare each to the reference. Iterate the 4 character `%` values only (no structural changes) until all three match.
