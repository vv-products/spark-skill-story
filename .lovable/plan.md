## Goal

Add a "Read Aloud" button to in-game tasks so Explorer-age players (who can't fully read yet) can hear instructions and prompts spoken out loud. No API key, no backend cost — uses the browser's built-in Web Speech API (`window.speechSynthesis`).

## UX

- A small **🔊 button** appears in the top-right of every task `Frame` (next to the title).
- Tap once → speaks the relevant text for the current task. Tap again while speaking → stops.
- While speaking, the icon animates (pulse) so kids see it's "talking".
- Only shown for **Explorer** level players. Builders/Leaders don't see it (they can read).
- Voice picks the best available English child-friendly voice; speech rate is slowed slightly (rate 0.9) for clarity.
- A persistent **"Auto read"** toggle lives in the top bar of the player (off by default). When ON, every new task auto-speaks its prompt on mount. Saved to `localStorage`.

## What gets spoken per task

| Task | Spoken text |
|---|---|
| T01 Story Video | title + "Watch what happens" caption |
| T03 Sort | title + "Drag each item into the right jar." + every item label |
| T04 Rapid Fire | current question prompt |
| T05 Cards | current card prompt |
| T07 Branching | decision prompt + each option label |
| T11 Drawing, T14 Reflection, T15 Self-Rating | the prompt text |
| Other tasks | layer.title + subtitle |

Each task supplies its `speakText` to `Frame`; tasks without a custom one fall back to `title + subtitle`.

## Technical

- **New file `src/game/useReadAloud.ts`**: small hook wrapping `window.speechSynthesis`.
  - `speak(text: string)` — cancels any current utterance, picks a cached voice (prefers `en-*` female / "Samantha" / "Google US English"), sets `rate=0.9, pitch=1.05`, calls `synth.speak`.
  - `stop()` — `synth.cancel()`.
  - Exposes `speaking` boolean state via `onstart` / `onend` events.
  - Returns `{ supported, speaking, speak, stop }`. `supported = typeof window !== "undefined" && "speechSynthesis" in window`.

- **New component `ReadAloudButton`** (in same file or `src/game/ReadAloudButton.tsx`): round 36px button with 🔊 icon; shows pulse ring when `speaking`. Accepts `text: string`.

- **Edit `src/game/LayerRenderer.tsx`**:
  - Extend `Frame` props with optional `speakText?: string`. When present, render `<ReadAloudButton text={speakText} />` in the header next to the title.
  - Update each task component to pass an appropriate `speakText` (formula above). Tasks without bespoke prompts get `title + subtitle` automatically (default in `Frame`).
  - Gate visibility: `Frame` reads `useGame().level` and only renders the button when `level === "Explorer"` (or the auto-read toggle is on for any level).

- **Edit `src/game/GameContext.tsx`**:
  - Add `autoRead: boolean` and `setAutoRead(v: boolean)` to the context. Initial value pulled from `localStorage.getItem("sementa.autoRead")`. Persist on change.

- **Edit `src/game/Chrome.tsx`** (TopBar):
  - Add a tiny 🔊 toggle pill on the right showing "Read aloud: On/Off" wired to `autoRead`. Visible only for Explorer.

- **Auto-read trigger**: each task component, on mount, if `autoRead && supported`, calls `speak(speakText)`. Implemented inside `Frame` via a `useEffect` keyed on `speakText` so each task transition triggers it.

- **Cleanup**: `Frame` unmount calls `stop()` so leaving a screen cuts speech.

## Out of scope

- No ElevenLabs or paid TTS — Web Speech API is free, offline-capable, zero-config. (We can swap to ElevenLabs later for higher-quality character voices behind the same `useReadAloud` interface.)
- No translations / multi-language voice picker (English only for v1).
- No per-word highlighting / karaoke effect.
- No changes to the Studio editor or task data shape.

## Files to add / edit

- **add** `src/game/useReadAloud.ts` (hook + `ReadAloudButton`)
- **edit** `src/game/LayerRenderer.tsx` (`Frame` + each task to pass `speakText`)
- **edit** `src/game/GameContext.tsx` (`autoRead` state + persistence)
- **edit** `src/game/Chrome.tsx` (toggle in TopBar)
