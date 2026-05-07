# Fix Welcome Card studio preview to match live hero

## Problem
The studio "Welcome Cards" preview (right column of `/studio` Welcome Cards screen) renders the image as a small inset rectangle with text stacked **below** it on a solid purple panel — the "Maya" mock. That doesn't match the live home hero, which is a single 16:9 card with the image as the **background** and text overlaid on the left ("Leo" mock).

The live hero (`src/game/GamePlayer.tsx`, recently fixed) is the source of truth.

## Change — `src/studio/screens/WelcomeCards.tsx`

Rewrite `WelcomeCardPreview` (lines 230–261) to mirror the live hero exactly:

- Outer: `relative aspect-video w-full overflow-hidden rounded-[20px] shadow-pop` with the existing purple gradient as fallback background.
- `<img>` absolutely positioned `inset-0 h-full w-full object-cover object-right` (only when `hero_image_url` exists).
- Left-to-right gradient overlay: `linear-gradient(90deg, rgba(123,47,190,0.92) 0%, rgba(123,47,190,0.7) 40%, rgba(123,47,190,0) 70%)`.
- Foreground: `relative flex h-full flex-col justify-between p-4`.
  - Top group (`max-w-[58%]`): "Welcome back," / `Alex 👋` (yellow) / headline (`text-[16px] font-black`) / optional subtitle.
  - Bottom: white pill CTA, `self-start`.
- Drop the decorative top-right white circle and the inner image-card pattern.

Sizes are slightly smaller than the live hero because the studio preview frame is narrower (~320px), but the proportions and layering match.

## Files touched
- `src/studio/screens/WelcomeCards.tsx` (lines 230–261)
