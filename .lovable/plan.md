# UI Replication Spec (docs/UI-DESIGN-SPEC.md)

Goal: a single document detailed enough that another project can rebuild this app's design and flows pixel-for-pixel, without guessing.

## What the document will contain

1. Design foundations
   - Every design token from `src/styles.css`: color variables (light + dark), radii, shadows, gradients, fonts, custom utilities and animations — exact values, copy-paste ready.
   - Typography scale, spacing rhythm, border-radius usage, elevation rules.
   - Per-pillar theme values from `pillarTheme.ts` (Maya / Leo / Dash / Pip): colors, gradients, mascot art, hero treatment.

2. Component inventory
   - The shadcn/ui components in use and which variants are actually used.
   - Custom game components (ProgressRing, ContinueCard, ClassPill, PillarDots, TopicPreviewSheet, WorldSkeleton, mission cards, flask XP badge, bottom nav, desktop sidebar) with anatomy, props, sizes, and states (default / hover / active / locked / completed / loading).

3. Screen-by-screen blueprints
   For each screen — Sign in, My World (home), My Journey, World page (topics / modules / classes levels), Class player layers, Growth + Leaderboard, Profile + edit, Shop, Sementa Club, all 8 missions, Studio CMS screens:
   - ASCII wireframe of the layout
   - Section order, hierarchy, copy strings, icon choices
   - Responsive behavior (mobile-first, desktop sidebar switch)
   - Empty, loading (skeleton), error, and locked states

4. Interaction and motion spec
   - Bottom nav auto-hide rules (scroll direction, 1.5s idle, route change reveal), safe-area padding (`pb-28`) rule.
   - Character nearest-body tap detection on My Journey.
   - Drill-down transitions, confetti/toast celebrations, mission timers and flier animation timing (1–2s traversal), music/accessibility toggles.

5. Flow diagrams
   - Navigation map (routes → screens), unlock progression flow, mission solo/co-op/competitive lobby flow, XP → level → shop currency flow.

6. Replication checklist
   - Ordered build order plus a verification checklist so the clone can be signed off screen by screen.

## Technical notes

- Sources read for accuracy: `src/styles.css`, `src/game/*`, `src/game/world/*`, `src/game/missions/*`, `src/game/shop/*`, `src/studio/*`, `src/routes/*`.
- Output written to `docs/UI-DESIGN-SPEC.md` and copied to `/mnt/documents/` for download, alongside the existing product overview and DB setup script.
- No app code changes; documentation only.
