## Problem

The home page at `/` renders `GameHome` from `src/game/GamePlayer.tsx`, whose hero card is **hardcoded** to Leo's image and "Leo needs your help today…" headline. It never queries `welcome_cards`, so newly-created/edited cards in Studio never appear.

(There's a second `HomeScreen.tsx` that *does* read CMS welcome cards via `listActiveWelcomeCards()` — but that component is not mounted on `/`. It's dead/legacy.)

## Fix — wire `GameHome` hero to CMS welcome cards

In `src/game/GamePlayer.tsx`:

1. Import `listActiveWelcomeCards` and `WelcomeCard` from `@/studio/welcomeCards`, plus `useEffect`/`useState` (already in scope).
2. Inside `GameHome`, fetch active cards once on mount into `cmsCards` state.
3. Build a `slides` array from CMS cards; if none load, fall back to the current hardcoded Leo slide (`leoHeroImg` + "Leo needs your help today..." + Start → linking to `continueClass`).
4. Add a 4-second rotation `setInterval` (skip when ≤1 slide), tracking `idx` in state.
5. Render the active slide's `hero_image_url`, `headline` (with `whitespace-pre-line` so `\n` works), `cta_label`, and route the CTA:
   - if `cta_destination` starts with `/play/` → use TanStack `<Link to="/play/$slug" params={{ slug }}>`,
   - else if it's a non-`/` path → `window.location.href = destination`,
   - else (default `/`) → keep current behavior (link to `continueClass`).
6. Keep all existing layout/styling (16:9, gradient overlay, max-w-[58%], self-start CTA) — only the data source and CTA wiring change.

## Optional cleanup
- Delete unused `src/game/screens/HomeScreen.tsx` (and its sibling fallback imports if no other consumer) since `/` uses `GameHome` exclusively. Confirm with `rg "HomeScreen"` first; if anything still imports it, leave it alone.

## Files touched
- `src/game/GamePlayer.tsx` (hero block, lines ~168–196, plus a small fetch effect above the JSX)
