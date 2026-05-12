# Plan: Reliable co-op + CMS authoring + XP visibility

Four related improvements across missions, leaderboard, and Studio CMS.

## 1. Co-op reconnect & late-join sync (Quiz + Crossword)

Goal: A friend who refreshes (or joins late) lands on the current question/grid with the correct shared scoreboard.

Approach (Supabase Realtime broadcast — already used):
- On mount in co-op, send a `sync-request` with our peer id; existing peers reply with `sync-state` containing the **earliest authoritative snapshot** (host wins; otherwise the peer with the smallest joinedAt timestamp).
- Snapshot payload (Quiz): `{ pace, questionIndex, startedAt, perQuestionStartedAt, scores, answers, finished }`.
- Snapshot payload (Crossword): `{ difficulty, grid, activeClue, scores, completedWords }`.
- Add a presence channel (`channel.track({ peerId, joinedAt, name })`) so we know who is "host" deterministically (lowest joinedAt). Replaces ad-hoc handshake.
- On each state change, the host re-broadcasts an incremental `state-delta` with a monotonic `version` int. Peers ignore deltas with `version <= local.version` to fix ordering.
- On `visibilitychange` → visible, peers send a `sync-request` to re-pull current state (handles tab-switch + flaky network).
- Persist last snapshot in `sessionStorage` keyed by `code` so a true page refresh shows a "Reconnecting…" state instead of resetting.
- Add a Reconnect banner with manual "Resync" button that re-emits `sync-request`.

Files: `src/game/missions/EmotionsQuiz.tsx`, `src/game/missions/EmotionsCrossword.tsx`, plus a small shared helper `src/game/missions/coopChannel.ts` to centralize presence + versioning.

## 2. Leaderboard XP breakdown by mission & mode

Goal: Verify mission XP is being counted; split by source.

- Click a leaderboard row → opens a drawer/sheet with a breakdown for that user.
- Query `xp_events` grouped by `source`. We already use sources like:
  - `mission:emotions-crossword:solo` / `:coop`
  - `mission:emotions-quiz:solo` / `:coop`
  - `mission:emotions-quickfire:solo` / `:coop`
  - `class:<id>` for normal classes
- Render grouped table: Mission · Mode · Events · Total XP. Add a totals row.
- Add a `get_user_xp_breakdown(_user_id uuid)` SQL function (SECURITY DEFINER, returns aggregated rows) so the leaderboard can call it for any visible profile without exposing raw events.

Files: new migration for `get_user_xp_breakdown`, `src/game/Leaderboard.tsx` (or `GrowthPage.tsx`) to add the drawer.

## 3. CMS Crossword Builder

Goal: Author the Emotions Crossword grid, words, clues, and difficulty variants in Studio.

Data model (new tables):
- `mission_crosswords` — id, slug ("emotions"), title.
- `mission_crossword_variants` — id, crossword_id, difficulty (`easy|medium|hard`), grid_rows, grid_cols, xp_reward.
- `mission_crossword_words` — id, variant_id, answer (uppercased), clue, row, col, direction (`across|down`), number.
- RLS: public read; editors/admins manage (mirror existing `pillars` policies).

Studio screen: `src/studio/screens/CrosswordBuilder.tsx`
- Variant tabs (Easy/Medium/Hard) with per-variant XP.
- Grid size inputs + visual grid preview that highlights letters and clue numbers.
- Word table: answer, direction, start row/col, clue. Add/remove rows. Validates that the word fits the grid and crossings match.
- Save persists to DB.

Runtime: `emotionsCrosswordPuzzles.ts` is updated to fetch from DB (cached, with the current hardcoded set as fallback for offline/dev).

## 4. CMS Quiz Editor

Goal: Author quiz questions, answer choices, and correct answers per quiz variant.

Data model (new tables):
- `mission_quizzes` — id, slug (`emotions-quiz` | `emotions-quickfire`), pace (`self-paced|quick`), title, base_xp, time_limit_sec (nullable).
- `mission_quiz_questions` — id, quiz_id, position, prompt.
- `mission_quiz_choices` — id, question_id, label, is_correct, position.
- RLS: public read; editors manage.

Studio screen: `src/studio/screens/QuizEditor.tsx`
- Quiz selector (Self-paced / Quick-fire).
- Reorderable question list, per-question prompt + 4 choices (radio for correct).
- Validation: exactly one correct, min 2 choices, non-empty prompt.

Runtime: `emotionsQuiz.ts` is updated to fetch from DB and cache; the existing in-code arrays remain as the seed.

## Studio sidebar

Add two new entries under **Missions**:
- Crossword Builder → `view: "crossword-builder"`
- Quiz Editor → `view: "quiz-editor"`

Wire into `StudioContext`, `Layout` sidebar, and the `studio.tsx` router switch.

## Migrations & seeding

One migration creates all 5 new tables + RLS + a seed insert of the current hardcoded crossword/quiz content so the Studio shows existing data immediately. Plus the `get_user_xp_breakdown` function for #2.

## Out of scope (this pass)

- Authoring brand-new mission types (only Emotions Crossword + Quiz variants).
- Co-op reconnect for users who close the browser entirely for >5 minutes (we keep `sessionStorage` snapshot only).
- Editing crossword/quiz from inside the player UI.

## Order of execution

1. Migration (tables + RLS + seed + `get_user_xp_breakdown`).
2. Studio: Crossword Builder + Quiz Editor screens, sidebar wiring.
3. Runtime fetchers in `emotionsCrosswordPuzzles.ts` / `emotionsQuiz.ts` with hardcoded fallbacks.
4. Co-op reconnect: shared `coopChannel.ts`, refactor Quiz + Crossword to use presence/version/visibility resync.
5. Leaderboard XP breakdown drawer.
