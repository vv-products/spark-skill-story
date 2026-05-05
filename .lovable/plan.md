## Fix "Meet the Characters" card layout

The new image is wired up but the `ActivityCard` uses an absolute-positioned image with a fade mask that crops out the dog. The reference shows the full dog at top with text/button cleanly below on the yellow background.

### Change

In `src/game/screens/HomeScreen.tsx`, update the `ActivityCard` component (around lines 276–294) so the image sits naturally at the top of the card instead of being absolutely positioned with a gradient mask.

- Remove `absolute inset-0`, `object-cover`, and the `[mask-image:...]` fade.
- Render the image as a normal flex child at the top, full-width, with `object-contain` (or `object-cover object-top`) so the whole character is visible.
- Stack title → description → button below the image inside the same card.
- Increase card height slightly (e.g. `h-[360px]`) to match the reference proportions.
- Keep the existing `bg` (card-gold yellow) so it blends with the new image background.

No changes needed for the `Live Events` card — same component, but the fairground image is meant to bleed, so I'll preserve that look by adding an optional `imageMode: "bleed" | "top"` prop and defaulting Live Events to `"bleed"` and Meet the Characters to `"top"`.
