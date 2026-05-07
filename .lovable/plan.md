Switch the Welcome Card hero image from a 4:5 portrait sidekick to a **4:3 landscape banner** across the home screen, the Studio uploader, and the live preview — so what editors upload matches what learners see.

## Changes

### 1. `src/game/screens/HomeScreen.tsx` — Hero layout
Restructure the Welcome card from a side-by-side (text + portrait image) to a **stacked** layout:
- Top: 4:3 landscape image banner (full card width), `object-cover`, rounded corners
- Below: "Welcome back, Alex 👋", headline, CTA button

This makes the 4:3 image the visual anchor and removes the cramped portrait crop.

### 2. `src/studio/screens/WelcomeCards.tsx`
- **Uploader thumbnail**: change `aspect-[4/5]` → `aspect-[4/3]`, widen the editor image column from 160px to ~240px.
- **Hint text** under the upload button: *"Recommended: 4:3 landscape, ~1200×900px. JPG or PNG, max 5MB."*
- **Preview rotator (`WelcomeCardPreview`)**: rebuild to mirror the new home-screen stacked layout (4:3 banner on top, text + CTA below) so preview === reality.

### 3. No DB migration needed
The image URL column is unchanged; only the rendered aspect ratio changes.

## Out of scope (deferred)
- Per-card image-fit toggle (cover vs contain)
- Multi-line headline textarea (can address separately if still needed after the layout change)
- Seeding a 2nd starter card to demo rotation — you can add one in the CMS once the ratio fix lands.

## Files touched
- `src/game/screens/HomeScreen.tsx`
- `src/studio/screens/WelcomeCards.tsx`
