## Sidebar changes (`src/studio/Layout.tsx`)

Update the `NAV` array and click handler:

- **Remove** "Pillars" entirely (it currently just opened the Library, duplicating that item).
- **Remove** "Media" and "Settings". They are nav stubs with no handler — there is no screen, no state, and nothing in the codebase referencing them. They were placeholder items left over from the original mock and were never wired to anything. Rather than leave dead buttons, I'll remove them. If you later want either:
  - **Media** would typically be an asset library (uploaded images/audio/video used in layer fields like Story Video, Drawing, Voice Recording).
  - **Settings** would typically be Studio preferences (default age group, publish defaults, role/team management).
  
  If you want me to scaffold one or both instead of removing, tell me and I'll add it to the plan.

Final sidebar: Dashboard · Content Library · Task Types.

## Task Types screen (`src/studio/screens/TaskTypesRef.tsx`)

Two additions:

### 1. "Active classes" count per task type
- Pull `pillars` from `useStudio()`.
- Compute, for each task `code`, the number of layers across all classes whose `taskCode === code` (walk `pillars → topics → modules → classes → layers`).
- Render a badge on each task card: `Used in N layers · M classes`.

### 2. "Add Task Type" button (top right of screen)
- Opens a small dialog: name, code (auto-suggested e.g. `T16`, `T17`…), emoji, family (select from existing 6 families), description, XP, age groups.
- Custom types are persisted to `localStorage` under `studio.customTaskTypes` and merged into `TASK_TYPES` / `TASK_BY_CODE` at runtime via a new `useTaskTypes()` hook.
- Why localStorage and not the database: task codes are referenced as strings throughout layer config and the existing built-in list is hardcoded in `src/studio/data.ts`. A DB-backed task-type table would require a schema migration and a wider refactor of `catalog.ts` (`layerTypeForTask`, `guessTaskCodeFromType`). Local persistence keeps this change scoped; we can promote it to the DB later if you want custom types to be shared across users.
- Custom types become immediately available in the Class Editor's task picker (it already iterates `TASK_TYPES`).

### 3. Minor
- Update screen subtitle from "All 15 task types" to "All N task types" (computed).
- Each card shows whether it's built-in or custom (small chip).

## Files touched
- `src/studio/Layout.tsx` — trim NAV.
- `src/studio/data.ts` — export a small `useTaskTypes()` hook + `addCustomTaskType()` helper backed by localStorage; keep `TASK_TYPES` as the built-in seed.
- `src/studio/screens/TaskTypesRef.tsx` — counts, Add dialog, use the hook.
- `src/studio/screens/ClassEditor.tsx` (light touch) — read task list from `useTaskTypes()` so custom types appear in the picker.

No DB migration. No changes to Dashboard or Library.