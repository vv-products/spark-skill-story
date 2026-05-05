## Problem

The live home screen is rendered by `src/game/GamePlayer.tsx` (not `HomeScreen.tsx`), and its "Meet the Characters" `ActivityCard` still imports `activity-characters.jpg`. Also, the `ActivityCard` here doesn't support the new top-stacked image layout.

## Changes

**`src/game/GamePlayer.tsx`**
1. Replace import `activity-characters.jpg` → `meet-characters.jpg`:
   ```ts
   import meetCharactersImg from "@/assets/meet-characters.jpg";
   ```
2. Pass `imageMode="top"` to the "Meet the Characters" `ActivityCard` and use `meetCharactersImg`.
3. Update `ActivityCard` (line 390) to accept `imageMode?: "bleed" | "top"`, mirroring the `HomeScreen.tsx` implementation: in `top` mode render a 340px-tall card with the image stacked at the top (`object-contain object-bottom`) and text/CTA below; otherwise keep current bleed layout.

No other files need changes.