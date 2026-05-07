The hero card looks 4:3-ish because only the **inner image slot** is 16:9, while the surrounding card adds padding + the text block below it, making the overall shape taller. Match the reference: make the **whole card 16:9**, with the image as the background and text overlaid on the left.

## Change — `src/game/screens/HomeScreen.tsx` (Hero block only)

Replace the current stacked layout (image banner on top, text below) with:

- Outer card: `aspect-video` (true 16:9), no padding, `overflow-hidden`, gradient as fallback background.
- `<img>` absolutely positioned, `inset-0 h-full w-full object-cover object-right` — anchors the character to the right side so faces aren't cropped.
- A left-to-right gradient overlay (`rgba(123,47,190,0.92) → transparent at 70%`) so the headline stays legible over the image.
- Foreground stack uses `flex h-full flex-col justify-between p-5`:
  - Top: "Welcome back," / "Alex 👋" / headline (constrained to `max-w-[55%]` so it doesn't overlap the character).
  - Bottom: "Start →" CTA button, self-aligned left.

No CMS / preview changes — they already use `aspect-video`. (Optionally I can mirror this same overlay style in the Studio preview so it matches; say the word.)

## Files touched
- `src/game/screens/HomeScreen.tsx` (lines ~79–108)
