## Goal

Today the player app is hard-locked to a 430px-wide phone column centered on a grey backdrop. Studio is desktop-only and partially breaks on tablet. This plan makes the whole product look intentional on phone, iPad, and desktop — same React code, three layout modes driven by Tailwind breakpoints.

Breakpoints used:
- `< md` (≤767px): phone — current mobile UX, unchanged in spirit
- `md` … `lg` (768–1023px): iPad — content fills width, multi-column grids, larger media, no sidebar yet
- `≥ lg` (1024px+): desktop — persistent left sidebar nav + wide content area, max content width ~1200px

---

## Part 1 — Player app shell (biggest change)

### New `PlayerShell` component

Replace the four near-identical wrappers in `src/routes/index.tsx`, `play.$slug.tsx`, `journey.tsx`, `profile.tsx` with one shared `<PlayerShell>` that picks the layout based on viewport:

- **Phone**: same as today — centered 430px column with shadow on grey background.
- **iPad**: full-bleed content, max-w ~840px, the existing sticky bottom nav stays.
- **Desktop**: persistent left sidebar (built with shadcn `Sidebar`), content area max-w ~1200px centered, hide bottom nav.

Sidebar items mirror the current `BottomNav` plus link targets that exist:
- Home → `/`
- My Journey → `/journey`
- Profile → `/profile`
- Leaderboard (rendered inside profile today; add a quick anchor)
- Sign out at the bottom (uses existing `usePlayerAuth`)

Active route uses `useRouterState` so the current page is highlighted. Sidebar collapses to icon-strip on tablet-desktop boundary so users can reclaim space.

### `Chrome.tsx` updates

- `BottomNav`: hide on `lg+` (`className="lg:hidden"`). On phone/tablet keep current behavior but make it actually navigate (currently the buttons do nothing) — wire them to `/`, `/journey`, `/profile`, plus a placeholder `/rewards` route.
- `TopBar`: keep, but on desktop it sits inside the content column not full-width.

### Per-screen responsive passes

For each screen, replace fixed pixel paddings with responsive ones (`px-5 md:px-8 lg:px-10`) and turn single-column lists into grids on wider viewports:

- **`HomeScreen.tsx`**: hero card grows to ~720px tall on desktop with text and image side-by-side; "Your Journey" / "Live events" card rails become 2-up on iPad, 3-up on desktop using `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- **`GamePlayer.tsx`** (`GameHome`): same grid treatment for class cards. Section headers get larger type on desktop.
- **`MyJourney.tsx`**: characters currently use `w-20`/`w-28`; bump to `lg:w-40` and increase portal sizes; badge & CTA grow proportionally. Composition stays a single row.
- **`AvatarPicker.tsx`** & **`AvatarProfilePage.tsx`**: avatar grid `grid-cols-3 md:grid-cols-5 lg:grid-cols-6`. Sticky bottom CTA on phone becomes inline on desktop.
- **`PlayerSignIn.tsx`**: card centered and capped at 480px (already mostly fine, just remove the 430px frame assumption).
- **Lesson screens** (`IntroScreen`, `VideoScreen`, `QuizScreen`, `ReflectionScreen`, `BranchingScreen`, `CompleteScreen`): cap reading column at ~720px on desktop (`max-w-[720px] mx-auto`), enlarge media and primary CTAs, keep generous bottom padding so content clears the (now-hidden on desktop) bottom nav.

---

## Part 2 — Studio CMS responsiveness

Studio's `Layout.tsx` already uses a 240px sidebar. Issues are the sidebar isn't collapsible and several screens overflow on iPad.

- **`src/studio/Layout.tsx`**: convert sidebar to collapsible. On `< md` it becomes an off-canvas drawer triggered by a hamburger in the header; on `md+` it stays pinned but can collapse to a 64px icon rail. Use the same shadcn `Sidebar` primitive as the player shell for consistency.
- **`Dashboard`, `Library`, `Module`, `ClassEditor`**: replace fixed grid widths with `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`. The 1100px editor column stays capped on desktop but becomes `max-w-full` on tablet. Long button rows in headers wrap with `flex-wrap gap-2`.
- **`TaskTypesRef`, `WelcomeCards`, `Avatars`**: card grids made responsive; modal widths already use `max-w-[90vw]` and are fine.
- Confirm/Prompt dialogs: already responsive — no change.

---

## Part 3 — Small global cleanups

- Remove `overflow-hidden` from page-level wrappers where it clipped sticky elements at narrow widths.
- Add a single `useIsDesktop()` hook in `src/hooks/` (matchMedia ≥1024px) for the few places that need to swap markup (e.g. show/hide BottomNav) rather than just toggling Tailwind classes.
- Keep all design tokens — no color or font changes.

---

## Out of scope

- No new routes (Rewards stays as a placeholder destination if added).
- No backend or data changes.
- No redesign of individual components beyond layout/spacing/grid changes — visual identity stays the same.

---

## Technical notes

- shadcn `Sidebar` is already in `src/components/ui/sidebar.tsx`. Use `collapsible="icon"` for desktop and `collapsible="offcanvas"` for the studio mobile drawer.
- Use `var(--sidebar-width)` syntax (Tailwind 4 quirk) when referencing sidebar width in custom classes.
- File-based routing means `/rewards` (if added) needs `src/routes/rewards.tsx`; flag for confirmation before creating.
- Keep `<PlayerAuthProvider>` and `<Toaster>` mounted once at the shell level instead of in every route file (small dedupe win that drops from this refactor).
