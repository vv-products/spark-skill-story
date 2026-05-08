## My Journey — interactive character + world portal scene

### New files

**`src/game/MyJourney.tsx`** — the component.

Layout (Tailwind):
- Full-bleed container `relative w-full h-[100dvh] overflow-hidden bg-gradient-to-b from-sky-200 via-indigo-100 to-amber-50`
- Background portal layer: 4 absolutely-positioned circular gradients (one per character), only the active one expands to fill via `scale-[12]` + opacity transition. Inactive portals stay as small circles behind their character.
- Foreground row: flex row, 4 character cards evenly spaced, anchored to bottom.

Characters config (in-file array):
```
maya  → Inner World  → treehouse  → emerald/teal gradient + 🌳
leo   → Social World → village    → rose/orange gradient + 🏘️
dash  → Action World → lab        → violet/fuchsia gradient + 🧪
pip   → Real World   → marketplace→ amber/yellow gradient + 🛒
```
Character "art" = large emoji (🦊 Maya, 🐻 Leo, 🐰 Dash, 🦉 Pip) inside a soft-shadowed circle — keeps it dependency-free; can be swapped for real art later.

State: `const [active, setActive] = useState<string | null>(null)`.

Per-character `<button>`:
- Wrapper: `transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]` (elastic/back-out)
- Idle animation: `animate-[bob_3s_ease-in-out_infinite]` with a per-character `animationDelay` so they bob out of sync
- Active: `scale-125 -translate-y-6 z-20`
- Inactive while another active: `scale-75 grayscale opacity-60`
- Neutral: `scale-100`
- Portal circle behind each character: small (`w-32 h-32 rounded-full blur-sm`) when neutral; when active grows to cover screen (`w-[200vmax] h-[200vmax] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 fixed`) with `transition-[transform,opacity] duration-700`.

Badge + CTA (rendered when `active`):
- Top-center pill `animate-fade-in`: shows character name + "· {WorldName}"
- Bottom CTA button (rounded-full, large, bg matches world color): "Enter the {World}" → `<Link to="/">` placeholder
- Backdrop catch: an absolutely-positioned `<div className="absolute inset-0 z-10" onClick={() => setActive(null)} />` that sits below the active character but above other characters, so tapping elsewhere resets.

Keyframes: define `bob` inline via a `<style>` tag in the component (translateY 0 → -8px → 0) to avoid touching the global stylesheet. Tailwind's existing `animate-fade-in` is already configured.

Accessibility: each character is a `<button>` with `aria-label="Choose {name}, guide of the {world}"`; active state sets `aria-pressed`.

Responsive: at <640px, characters use `w-20`, badge text `text-base`; at ≥640px, `w-28` and `text-xl`. Composition stays as a single row (4 across) per the brief.

### New route

**`src/routes/journey.tsx`** — TanStack Start route at `/journey`, mirrors `profile.tsx` shell (centered max-w-[430px] mobile frame, Toaster), renders `<MyJourney />`. Sets meta title "My Journey — Sementa".

### Not changed
- No DB, no auth, no nav additions (user can navigate to `/journey` directly; ask if you want it linked from the home screen).
