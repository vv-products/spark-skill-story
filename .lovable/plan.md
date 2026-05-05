## Use uploaded image as hero background

Use the user's uploaded purple-background Leo image (already copied to `src/assets/leo-hero.jpg`) as the hero card background instead of the previous transparent PNG.

### Changes (single file: `src/game/GamePlayer.tsx`)

1. Update import:
   - `import leoHeroImg from "@/assets/leo-hero.png";` → `import leoHeroImg from "@/assets/leo-hero.jpg";`

2. Render the image as a full-bleed background of the hero card (covers the entire purple gradient area), with the text/CTA overlaid on the left:
   - Make the hero card position container hold the `<img>` as `absolute inset-0 h-full w-full object-cover object-right`.
   - Drop the separate gradient circle decorations (the image already provides background).
   - Text column stays at ~55% width, sitting on top with `relative z-10`.
   - Keep the lower min-height (~240px) so the card matches the reference proportions.

### Result

The character + purple background become a single image that perfectly matches the reference, with no transparency seams or pose mismatch.
