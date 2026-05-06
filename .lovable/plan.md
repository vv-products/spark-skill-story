## Goal

Replace the current "tap a colored button under each item" UX in `T03Sort` (`src/game/LayerRenderer.tsx`, lines ~142–194) with a real drag-and-drop interaction, matching the screenshot: items live in a tray, the user drags each pill into one of the 4 jar/bucket cards.

## Approach

Use the native HTML5 Drag & Drop API plus pointer events for touch — no new dependency required. (We avoid `react-dnd` / `dnd-kit` to keep the bundle lean; the task is small.)

### UI changes inside `T03Sort`

1. **Remove** the bottom "select" grid (lines 178–191) — the per-item rows of bucket buttons.
2. **Item tray** (top): render each unplaced item as a draggable pill (`draggable`, `onDragStart` sets `dataTransfer` payload = item index; also pointer-event handlers for touch).
3. **Bucket cards**: each becomes a drop target (`onDragOver` preventDefault, `onDrop` reads index → `setPlaced`). On drop:
   - place the item into the bucket (visual pill inside the card as today)
   - briefly flash the card border green/red based on `placed === item.bucket`
4. **Touch fallback**: HTML5 DnD is desktop-only on mobile. Add a small `usePointerDrag` helper:
   - `onPointerDown` on a pill captures the item, renders a floating clone following the pointer (`position: fixed`)
   - on `pointerup`, `document.elementFromPoint` finds the bucket under the finger (buckets get `data-bucket="Happy"` etc.) and we call the same place handler.
5. **Undo**: tapping a placed pill inside a bucket sends it back to the tray (so users can correct mistakes before pressing Continue).
6. Keep the existing footer/progress logic (`allDone`, `correct`, `onComplete(xp)`) unchanged.

### Visual polish (match screenshot)

- Tray pills: white rounded-full, subtle shadow, `cursor-grab` / `active:cursor-grabbing`.
- Bucket card while a drag is over it: thicker ring (`ring-4 ring-white/60`) and slight scale.
- Placed pills: translucent white chip inside the colored card (already done).
- Layout: 2-column grid of buckets (Happy / Sad / Scared / Angry), tray above.

## Files to edit

- `src/game/LayerRenderer.tsx` — rewrite the `T03Sort` component only. No other components, no DB, no Studio changes. Existing `layer.config.items` / `layer.config.buckets` shape is preserved.

## Out of scope

- No drag-reorder within a bucket.
- No animation library; just CSS transitions.
- Studio editor for the sort task is unchanged.
