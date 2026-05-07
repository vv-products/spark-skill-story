## Issue

The seed import created NEW duplicate modules ("Using My Words", "A or B?", "Being a Good Example") at position 6 in each topic and attached the 10 classes to those, instead of populating the existing position-1 modules already in the catalog.

Duplicates (position 6, with 10 classes):
- Communication Skills → `9a53986c…` "Using My Words"
- Decision Making → `e31be56c…` "A or B?"
- Leadership → `0cf3d01e…` "Being a Good Example"

Existing target modules (position 1, currently empty):
- Communication Skills → `9b160bad…` "Using My Words"
- Decision Making → `80b8e4b1…` "A or B?"
- Leadership → `2a15e3c5…` "Being a Good Example"

## Fix

Run a data migration (insert tool) that for each of the 3 pairs:

1. `UPDATE classes SET module_id = <target_id> WHERE module_id = <duplicate_id>` — moves all 10 classes (and their layers cascade via class_id) onto the existing module.
2. `DELETE FROM modules WHERE id = <duplicate_id>` — removes the duplicate position-6 module.

No code or schema changes needed — `loadFullCatalog` already reads classes by `module_id`, so the UI will reflect the move immediately.

## Verification

After the migration, re-run the inventory query and confirm:
- Each of the 3 target modules at position 1 shows `class_count = 10`.
- The 3 duplicate modules at position 6 are gone.
- Library screen shows "10/10 classes built" on the correct first module and no extra module at the bottom.
