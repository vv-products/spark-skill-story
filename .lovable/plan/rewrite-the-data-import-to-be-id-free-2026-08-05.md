# Rewrite the data import to be id-free

You're right: the clone's tables generate their own ids, so hard-coded ids aren't needed. The catch is that child rows must still find their parent. The fix is to link rows by their human-readable keys (slugs, positions) and let the database create every id.

## What changes in `docs/DB-DATA.sql`

Regenerate the file so that:

- `id`, `created_at`, `updated_at` are never written — the table defaults fill them in.
- Every parent reference is resolved by lookup instead of a literal id, for example:
  - a topic points at its pillar by pillar slug
  - a module points at its topic by topic slug
  - a class points at its module by module slug
  - a layer points at its class by class slug
  - crossword variants point at the crossword slug; words point at their variant's crossword slug + difficulty
  - quiz questions point at the quiz slug; choices point at quiz slug + question position
- Verified in the live data: pillar, topic, module, class, crossword and quiz slugs are all unique, and layer/class/question/choice positions are unique within their parent — so every lookup resolves to exactly one row.

## Re-run safety

Each insert is guarded so re-running adds nothing twice:

- Slug-keyed tables (pillars, topics, modules, classes, crosswords, quizzes) skip rows whose slug already exists.
- Position-keyed children (layers, quiz questions, choices, crossword words, variants) skip rows that already exist under the same parent at the same position.

Order stays dependency-first: pillars, topics, modules, classes, layers, then crossword tables, then quiz tables, then avatars and welcome cards. All in one transaction.

## Notes kept in the file header

- No user data (no profiles, roles, XP, progress, friendships).
- Image URLs for avatars, welcome cards and class hero images still point at this project's public storage until those files are copied into the clone's buckets.

## Delivery

Updated `docs/DB-DATA.sql` plus a downloadable copy for the clone project.

## Technical notes

Child inserts use `INSERT ... SELECT` from the parent table filtered by slug (`insert into layers (class_id, ...) select c.id, ... from classes c where c.slug = '...'`) rather than a values list, and pair that with `where not exists (...)` for idempotency. Enum, `jsonb` and `text[]` columns keep explicit casts.
