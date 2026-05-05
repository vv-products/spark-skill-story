## Compact stat cards with overflowing top icon

Update `StatCard` in `src/game/GamePlayer.tsx` (lines 277–322) to match the reference where the icon sits centered on top of the card and visibly overflows above it, while the card body itself is shorter.

### Changes

1. Make card content centered (not left-aligned): `items-center`, `text-center` on label/value.
2. Position the icon absolutely, half outside the card:
   - `absolute left-1/2 -translate-x-1/2`, `top: calc(var(--stat-card-icon-size) * -0.45)`.
   - Add `drop-shadow-md` for the floating look.
3. Reduce overall box height:
   - Use the small padding token for left/right/bottom.
   - Top padding becomes ~55% of the icon size (just enough to clear the overflowing icon).
   - Add `marginTop` ~45% of icon size on the card itself so the overflowing icon doesn't get clipped by the grid above.
4. Drop the in-flow icon container; label and value flow normally, vertically tighter.

No CSS token changes — only the component markup is updated.
