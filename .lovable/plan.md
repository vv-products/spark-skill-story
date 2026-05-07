# Fix Welcome Back hero ratio & spacing

## Problem
The "Welcome back" hero in `src/game/GamePlayer.tsx` (lines 170–197) is **not** 16:9. The card uses `p-5` padding plus an inner `min-h-[240px]` flex row, which forces the card to ~280px tall on a 390px-wide mobile frame (true 16:9 would be ~219px). The headline sits at the top and the CTA is pushed to the bottom via `mt-auto`, producing the large blank gap between "Leo needs your help today…" and the **Start →** button.

Note: the marketing/demo `HomeScreen.tsx` hero (lines 79–105) already uses the correct 16:9 pattern. The live `GamePlayer.tsx` hero was never migrated.

## Change — `src/game/GamePlayer.tsx` lines 170–197

Rewrite the hero block to mirror the HomeScreen pattern:

- Outer card: add `aspect-video` (true 16:9), drop `p-5`, keep `rounded-[24px] overflow-hidden shadow-pop`, add the `[background:var(--gradient-hero)]` fallback.
- `<img>` stays absolutely positioned (`inset-0 h-full w-full object-cover object-right`).
- Add a left-to-right gradient overlay so the headline stays legible:
  `linear-gradient(90deg, rgba(123,47,190,0.92) 0%, rgba(123,47,190,0.7) 40%, rgba(123,47,190,0) 70%)`.
- Foreground stack: `relative flex h-full flex-col justify-between p-5`.
  - Top group: "Welcome back," / `{greetName} 👋` / headline (`max-w-[58%]`, smaller `text-[20px]` so it fits the shorter card without forcing height).
  - Bottom: the existing `<Link>` CTA, `self-start`, slightly smaller padding (`px-5 py-2.5 text-[14px]`) so it sits naturally inside a 16:9 frame.
- Remove the `min-h-[240px]` wrapper and the `mt-auto pt-5` spacer — `justify-between` on a fixed-aspect parent handles spacing without leaving a gap.

No other behavior changes: same image, same greeting, same `continueClass` link target, same Stat cards below.

## Files touched
- `src/game/GamePlayer.tsx` (hero block, ~lines 170–197)
