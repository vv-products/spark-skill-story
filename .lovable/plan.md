## Problem

The Content Library shows 11 pillars but should only show 4. The `pillars` table has duplicates (e.g. two "The Inner World", two "The Social World", two "The Action World", two "The Real World") plus three extras with no content ("With Others", "The World", "My Future").

Current rows:

```text
inner-world       The Inner World    5 topics   ← duplicate
inner             The Inner World    5 topics   ← KEEP (canonical)
social-world      The Social World   3 topics   ← duplicate
social            The Social World   5 topics   ← KEEP
with-others       With Others        0 topics   ← DELETE
action-world      The Action World   3 topics   ← duplicate
the-world         The World          0 topics   ← DELETE
action            The Action World   5 topics   ← KEEP
real              The Real World     5 topics   ← KEEP
real-world        The Real World     3 topics   ← duplicate
my-future         My Future          0 topics   ← DELETE
```

## Changes

Single SQL migration:

1. Re-parent topics from each duplicate pillar to its canonical counterpart (`inner-world` → `inner`, `social-world` → `social`, `action-world` → `action`, `real-world` → `real`).
2. Delete the 4 duplicate pillars and the 3 empty extras (`with-others`, `the-world`, `my-future`).
3. Re-number `position` so the remaining 4 are 1–4: Inner (1), Social (2), Action (3), Real (4).

No code changes needed — `loadFullCatalog()` reads pillars by `position`, so the Library will automatically show 4.

## Notes

Topics keep their existing slugs/positions; if any slug collisions appear when re-parenting, I'll resolve them (rename the duplicate's topic slug with a suffix) before deletion. No class/layer data is lost.