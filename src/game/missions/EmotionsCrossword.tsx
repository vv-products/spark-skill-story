// Emotions Crossword Mission
// - Solo or co-op (Supabase Realtime broadcast on a per-code channel).
// - Difficulty selector (easy / medium / hard) with different grids & XP rewards.
// - Accessibility: large text, colorblind palette, sound, vibration.
// - Scoreboard: tracks correct letters & words per player in co-op.
// - Robust late-join sync: newcomers receive the latest grid + scores from peers.
// - XP awarded into xp_events on completion + rewards screen.

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Users, Copy, Check, Settings as SettingsIcon, Trophy, RotateCcw, Volume2, VolumeX, Vibrate, Type, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerAuth } from "@/game/PlayerAuth";
import { Confetti } from "@/game/Effects";
import { PUZZLES, emptyGridFor, badgeForDifficulty, type Difficulty, type Puzzle, type WordRef } from "./emotionsCrosswordPuzzles";
import { useMissionSettings, playFeedback, type MissionSettings } from "./missionSettings";

const COMPLETION_KEY = "sementa.mission.emotions-crossword.completion";
type CompletionRecord = { difficulty: Difficulty; xp: number; coop: boolean; at: number };

function readCompletion(): CompletionRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COMPLETION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function writeCompletion(rec: CompletionRecord) {
  try { window.localStorage.setItem(COMPLETION_KEY, JSON.stringify(rec)); } catch { /* ignore */ }
}

function makeCode(len = 5): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

type Score = { name: string; correctLetters: number; correctWords: number };

export function EmotionsCrossword({ initialCode }: { initialCode?: string }) {
  const navigate = useNavigate();
  const { user } = usePlayerAuth();
  const { settings, update: updateSettings } = useMissionSettings();

  const [mode, setMode] = useState<"choose" | "solo" | "coop">(initialCode ? "coop" : "choose");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [code, setCode] = useState<string>(initialCode ?? "");
  const [showSettings, setShowSettings] = useState(false);

  const puzzle = PUZZLES[difficulty];
  const [grid, setGrid] = useState<string[][]>(() => emptyGridFor(puzzle));
  const [active, setActive] = useState<{ r: number; c: number; dir: "A" | "D" }>({ r: 0, c: 0, dir: "A" });
  const [peers, setPeers] = useState<{ name: string; cells: { r: number; c: number } }[]>([]);
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const correctCellsRef = useRef<Set<string>>(new Set());
  const completedWordsRef = useRef<Set<number>>(new Set());

  const myName = (user?.user_metadata as any)?.display_name || user?.email?.split("@")[0] || "Guest";
  const myKey = user?.id ?? `guest-${myName}`;

  // Reset board when difficulty changes (only if solo or before any input)
  useEffect(() => {
    setGrid(emptyGridFor(puzzle));
    setActive({ r: 0, c: 0, dir: "A" });
    setDone(false);
    setXpAwarded(null);
    correctCellsRef.current = new Set();
    completedWordsRef.current = new Set();
    setScores({});
    sessionStartRef.current = Date.now();
    // Broadcast difficulty change to peers in co-op
    if (mode === "coop" && channelRef.current) {
      channelRef.current.send({ type: "broadcast", event: "difficulty", payload: { difficulty } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  // ---------- Realtime channel ----------
  useEffect(() => {
    if (mode !== "coop" || !code) return;
    const channelName = `mission:emotions-crossword:${code}`;
    const ch = supabase.channel(channelName, {
      config: { broadcast: { self: false }, presence: { key: myKey } },
    });
    channelRef.current = ch;

    ch.on("broadcast", { event: "cell" }, (payload) => {
      const { r, c, ch: letter, by } = payload.payload as { r: number; c: number; ch: string; by: string };
      setGrid((g) => {
        const next = g.map((row) => row.slice());
        if (next[r]) next[r][c] = letter;
        return next;
      });
      // Score peer's correct entries (dedup per cell)
      const sol = puzzle.solution[r]?.[c];
      if (sol && letter && letter.toUpperCase() === sol.ch) {
        const key = `${r}-${c}`;
        if (!correctCellsRef.current.has(key)) {
          correctCellsRef.current.add(key);
          bumpScore(by, "letter");
        }
      }
    });

    ch.on("broadcast", { event: "cursor" }, (payload) => {
      const { name, r, c } = payload.payload as { name: string; r: number; c: number };
      setPeers((ps) => {
        const others = ps.filter((p) => p.name !== name);
        return [...others, { name, cells: { r, c } }];
      });
    });

    ch.on("broadcast", { event: "score" }, (payload) => {
      const incoming = payload.payload as { scores: Record<string, Score> };
      setScores((cur) => mergeScores(cur, incoming.scores));
    });

    ch.on("broadcast", { event: "difficulty" }, (payload) => {
      const d = (payload.payload as { difficulty: Difficulty }).difficulty;
      if (d !== difficulty) {
        setDifficulty(d);
        toast.info(`Difficulty changed to ${d}`);
      }
    });

    // Late-join sync: anyone joining asks for state. The peer with the
    // earliest sessionStart responds with the full snapshot.
    ch.on("broadcast", { event: "sync-request" }, (payload) => {
      const { from, ts } = payload.payload as { from: string; ts: number };
      // Only reply if we joined earlier than the requester
      if (sessionStartRef.current < ts) {
        ch.send({
          type: "broadcast",
          event: "sync-state",
          payload: {
            to: from,
            grid,
            scores,
            difficulty,
            active,
            sessionStart: sessionStartRef.current,
          },
        });
      }
    });

    ch.on("broadcast", { event: "sync-state" }, (payload) => {
      const incoming = payload.payload as {
        to: string; grid: string[][]; scores: Record<string, Score>;
        difficulty: Difficulty; active: { r: number; c: number; dir: "A" | "D" };
        sessionStart: number;
      };
      if (incoming.to !== myName) return;
      // Adopt earlier sessionStart so we behave consistently
      sessionStartRef.current = Math.min(sessionStartRef.current, incoming.sessionStart);
      if (incoming.difficulty !== difficulty) setDifficulty(incoming.difficulty);
      // Merge grid: prefer existing non-empty cells, fill gaps from incoming
      setGrid((g) => g.map((row, r) => row.map((cur, c) => cur || incoming.grid?.[r]?.[c] || "")));
      setScores((cur) => mergeScores(cur, incoming.scores));
      // Re-seed correctCellsRef from incoming grid
      const incomingGrid = incoming.grid;
      if (incomingGrid) {
        for (let r = 0; r < incomingGrid.length; r++) {
          for (let c = 0; c < (incomingGrid[r]?.length ?? 0); c++) {
            const sol = puzzle.solution[r]?.[c];
            const v = incomingGrid[r][c];
            if (sol && v && v.toUpperCase() === sol.ch) correctCellsRef.current.add(`${r}-${c}`);
          }
        }
      }
    });

    ch.on("presence", { event: "leave" }, ({ leftPresences }) => {
      const names = leftPresences.map((p: any) => p.name).filter(Boolean);
      if (names.length) setPeers((ps) => ps.filter((p) => !names.includes(p.name)));
    });

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({ name: myName, joinedAt: Date.now() });
        // Request state from any earlier peers
        ch.send({
          type: "broadcast",
          event: "sync-request",
          payload: { from: myName, ts: sessionStartRef.current },
        });
      }
    });

    // Re-sync on tab visibility regain
    function onVisible() {
      if (document.visibilityState === "visible" && channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "sync-request",
          payload: { from: myName, ts: sessionStartRef.current },
        });
      }
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      ch.unsubscribe();
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, code]);

  function bumpScore(name: string, kind: "letter" | "word") {
    setScores((cur) => {
      const cur1 = { ...cur };
      const s = cur1[name] ?? { name, correctLetters: 0, correctWords: 0 };
      cur1[name] = {
        ...s,
        correctLetters: s.correctLetters + (kind === "letter" ? 1 : 0),
        correctWords: s.correctWords + (kind === "word" ? 1 : 0),
      };
      // Broadcast updated scoreboard
      if (channelRef.current) {
        channelRef.current.send({ type: "broadcast", event: "score", payload: { scores: cur1 } });
      }
      return cur1;
    });
  }

  function mergeScores(a: Record<string, Score>, b: Record<string, Score>): Record<string, Score> {
    const keys = new Set([...Object.keys(a), ...Object.keys(b ?? {})]);
    const out: Record<string, Score> = {};
    for (const k of keys) {
      const x = a[k]; const y = b?.[k];
      if (!x) { out[k] = y!; continue; }
      if (!y) { out[k] = x; continue; }
      out[k] = {
        name: x.name,
        correctLetters: Math.max(x.correctLetters, y.correctLetters),
        correctWords: Math.max(x.correctWords, y.correctWords),
      };
    }
    return out;
  }

  // ---------- Win check + completed-word detection ----------
  useEffect(() => {
    // Detect newly completed words for scoreboard
    for (const w of puzzle.words) {
      if (completedWordsRef.current.has(wordKey(w))) continue;
      let allCorrect = true;
      for (let i = 0; i < w.len; i++) {
        const r = w.dir === "D" ? w.r + i : w.r;
        const c = w.dir === "A" ? w.c + i : w.c;
        const sol = puzzle.solution[r]?.[c];
        const v = grid[r]?.[c] ?? "";
        if (!sol || (v || "").toUpperCase() !== sol.ch) { allCorrect = false; break; }
      }
      if (allCorrect) {
        completedWordsRef.current.add(wordKey(w));
        bumpScore(myName, "word");
      }
    }

    // Win
    let win = true;
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        const sol = puzzle.solution[r]?.[c];
        if (!sol) continue;
        if ((grid[r]?.[c] || "").toUpperCase() !== sol.ch) { win = false; break; }
      }
      if (!win) break;
    }
    if (win && !done) {
      setDone(true);
      playFeedback("win", settings);
      void awardCompletion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid]);

  async function awardCompletion() {
    const baseXp = puzzle.xp;
    const coopBonus = mode === "coop" ? 20 : 0;
    const total = baseXp + coopBonus;
    setXpAwarded(total);
    writeCompletion({ difficulty, xp: total, coop: mode === "coop", at: Date.now() });
    if (user) {
      const { error } = await supabase.from("xp_events").insert({
        user_id: user.id,
        amount: total,
        source: `mission:emotions-crossword:${difficulty}${mode === "coop" ? ":coop" : ""}`,
      });
      if (error) console.error("[xp_events]", error);
    }
    toast.success(`Mission complete! +${total} XP`);
  }

  // ---------- input handling ----------
  function setCell(r: number, c: number, value: string) {
    const letter = value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    const sol = puzzle.solution[r]?.[c];
    setGrid((g) => {
      const next = g.map((row) => row.slice());
      if (next[r]) next[r][c] = letter;
      return next;
    });
    if (channelRef.current) {
      channelRef.current.send({ type: "broadcast", event: "cell", payload: { r, c, ch: letter, by: myName } });
    }
    if (sol && letter) {
      const isCorrect = letter.toUpperCase() === sol.ch;
      if (isCorrect) {
        const key = `${r}-${c}`;
        if (!correctCellsRef.current.has(key)) {
          correctCellsRef.current.add(key);
          bumpScore(myName, "letter");
        }
        playFeedback("correct", settings);
      } else {
        playFeedback("incorrect", settings);
      }
    }
    if (letter) advance(r, c, active.dir);
  }

  function advance(r: number, c: number, dir: "A" | "D") {
    const dr = dir === "D" ? 1 : 0;
    const dc = dir === "A" ? 1 : 0;
    let nr = r + dr, nc = c + dc;
    while (nr < puzzle.rows && nc < puzzle.cols && !puzzle.solution[nr]?.[nc]) { nr += dr; nc += dc; }
    if (nr < puzzle.rows && nc < puzzle.cols && puzzle.solution[nr]?.[nc]) setActive({ r: nr, c: nc, dir });
  }

  function handleCellClick(r: number, c: number) {
    if (!puzzle.solution[r]?.[c]) return;
    if (active.r === r && active.c === c) {
      setActive({ r, c, dir: active.dir === "A" ? "D" : "A" });
    } else {
      const hasAcross = puzzle.words.some((w) => w.dir === "A" && w.r === r && c >= w.c && c < w.c + w.len);
      const hasDown = puzzle.words.some((w) => w.dir === "D" && w.c === c && r >= w.r && r < w.r + w.len);
      const dir: "A" | "D" = hasAcross ? "A" : hasDown ? "D" : "A";
      setActive({ r, c, dir });
    }
    if (channelRef.current) {
      channelRef.current.send({ type: "broadcast", event: "cursor", payload: { name: myName, r, c } });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, r: number, c: number) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (grid[r]?.[c]) setCell(r, c, "");
      else {
        const dr = active.dir === "D" ? -1 : 0;
        const dc = active.dir === "A" ? -1 : 0;
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nc >= 0 && !puzzle.solution[nr]?.[nc]) { nr += dr; nc += dc; }
        if (nr >= 0 && nc >= 0 && puzzle.solution[nr]?.[nc]) {
          setActive({ r: nr, c: nc, dir: active.dir });
          setCell(nr, nc, "");
        }
      }
    } else if (e.key === "ArrowRight") { setActive({ r, c, dir: "A" }); advance(r, c, "A"); }
    else if (e.key === "ArrowLeft") {
      let nc = c - 1;
      while (nc >= 0 && !puzzle.solution[r]?.[nc]) nc--;
      if (nc >= 0) setActive({ r, c: nc, dir: "A" });
    } else if (e.key === "ArrowDown") { setActive({ r, c, dir: "D" }); advance(r, c, "D"); }
    else if (e.key === "ArrowUp") {
      let nr = r - 1;
      while (nr >= 0 && !puzzle.solution[nr]?.[c]) nr--;
      if (nr >= 0) setActive({ r: nr, c, dir: "D" });
    }
  }

  function resetBoard() {
    setGrid(emptyGridFor(puzzle));
    setDone(false);
    setXpAwarded(null);
    correctCellsRef.current = new Set();
    completedWordsRef.current = new Set();
    setScores({});
    setActive({ r: 0, c: 0, dir: "A" });
  }

  // ---------- mode chooser ----------
  if (mode === "choose") {
    const completion = readCompletion();
    return (
      <div className="mx-auto max-w-md px-5 py-6">
        <BackBar />
        <h1 className="mt-2 text-2xl font-black text-foreground">Emotions Crossword</h1>
        <p className="mt-1 text-sm text-text-secondary">A mini puzzle about how we feel. Play alone or invite a friend to play together in real-time.</p>

        {completion && (
          <div className="mt-4 rounded-2xl bg-green-50 border border-green-200 p-3 text-xs font-bold text-green-800">
            ✓ Last completed on <span className="capitalize">{completion.difficulty}</span> · +{completion.xp} XP
          </div>
        )}

        <DifficultyPicker value={difficulty} onChange={setDifficulty} />

        <div className="mt-5 space-y-3">
          <button
            onClick={() => setMode("solo")}
            className="w-full rounded-2xl bg-foreground p-4 text-left text-primary-foreground shadow-pop active:scale-[0.98] transition-transform"
          >
            <div className="text-sm font-extrabold">🧩 Play Solo</div>
            <div className="text-xs opacity-80 mt-0.5">Just you and the puzzle. Earn {puzzle.xp} XP.</div>
          </button>
          <button
            onClick={() => {
              const newCode = makeCode();
              setCode(newCode);
              setMode("coop");
              navigate({ to: "/mission/emotions-crossword", search: { code: newCode } as any });
            }}
            className="w-full rounded-2xl bg-primary p-4 text-left text-primary-foreground shadow-pop active:scale-[0.98] transition-transform"
          >
            <div className="text-sm font-extrabold flex items-center gap-2"><Users size={16} /> Co-op with a friend</div>
            <div className="text-xs opacity-90 mt-0.5">Solve it together live. Earn {puzzle.xp + 20} XP each.</div>
          </button>
        </div>

        <SettingsPanel open={showSettings} settings={settings} onToggle={() => setShowSettings(!showSettings)} onUpdate={updateSettings} />
      </div>
    );
  }

  // ---------- play view ----------
  const cellSize = settings.largeText ? 56 : 48;
  const inputFontClass = settings.largeText ? "text-2xl" : "text-lg";
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/mission/emotions-crossword?code=${code}` : "";
  const peerCount = peers.length;

  const activeWord = puzzle.words.find((w) => {
    if (w.dir !== active.dir) return false;
    if (w.dir === "A") return w.r === active.r && active.c >= w.c && active.c < w.c + w.len;
    return w.c === active.c && active.r >= w.r && active.r < w.r + w.len;
  });
  const activeClueText =
    activeWord
      ? (activeWord.dir === "A" ? puzzle.across : puzzle.down).find((cl) => cl.num === activeWord.num)?.text
      : "";

  // Ensure scoreboard always shows the current player even before they've scored
  const scoreList = Object.values({ ...scores, [myName]: scores[myName] ?? { name: myName, correctLetters: 0, correctWords: 0 } })
    .sort((a, b) => (b.correctWords - a.correctWords) || (b.correctLetters - a.correctLetters));

  // Won → show rewards screen
  if (done && xpAwarded != null) {
    return (
      <RewardsScreen
        difficulty={difficulty}
        xp={xpAwarded}
        coop={mode === "coop"}
        scores={mode === "coop" ? scoreList : null}
        meName={myName}
        onPlayAgain={resetBoard}
        onChangeDifficulty={() => { resetBoard(); setMode("choose"); }}
      />
    );
  }

  return (
    <div className={`mx-auto max-w-md px-5 py-4 ${settings.largeText ? "text-base" : ""}`}>
      <div className="flex items-center justify-between">
        <BackBar />
        <button
          onClick={() => setShowSettings((v) => !v)}
          aria-label="Mission settings"
          className="flex items-center gap-1 rounded-pill bg-card px-2.5 py-1 text-[11px] font-extrabold text-foreground shadow-card"
        >
          <SettingsIcon size={12} /> Options
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <h1 className={`font-black text-foreground ${settings.largeText ? "text-2xl" : "text-xl"}`}>Emotions Crossword</h1>
        <div className="flex items-center gap-2">
          <span className="rounded-pill bg-tag px-2 py-0.5 text-[10px] font-extrabold text-tag-foreground capitalize">{difficulty}</span>
          {mode === "coop" && (
            <div className="flex items-center gap-1 rounded-pill bg-card px-2 py-1 text-[11px] font-extrabold text-foreground shadow-card">
              <Users size={12} /> {peerCount + 1}
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="mt-3">
          <SettingsPanel open settings={settings} onToggle={() => setShowSettings(false)} onUpdate={updateSettings} />
        </div>
      )}

      {mode === "coop" && (
        <div className="mt-3 rounded-2xl bg-card p-3 shadow-card">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">Invite a friend</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 rounded-pill bg-muted px-3 py-2 text-center font-mono text-base font-extrabold tracking-[0.2em] text-foreground">{code}</div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                toast.success("Link copied!");
                setTimeout(() => setCopied(false), 1500);
              }}
              className="flex items-center gap-1 rounded-pill bg-primary px-3 py-2 text-xs font-extrabold text-primary-foreground"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Share"}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="mt-4 flex justify-center">
        <div
          className="grid gap-1 rounded-2xl bg-card p-3 shadow-card"
          style={{ gridTemplateColumns: `repeat(${puzzle.cols}, ${cellSize}px)` }}
        >
          {puzzle.solution.map((row, r) =>
            row.map((cell, c) => {
              if (!cell) return <div key={`${r}-${c}`} className="bg-transparent" style={{ width: cellSize, height: cellSize }} />;
              const isActive = active.r === r && active.c === c;
              const inActiveWord = activeWord && (
                activeWord.dir === "A"
                  ? activeWord.r === r && c >= activeWord.c && c < activeWord.c + activeWord.len
                  : activeWord.c === c && r >= activeWord.r && r < activeWord.r + activeWord.len
              );
              const peerHere = peers.find((p) => p.cells.r === r && p.cells.c === c);
              const value = grid[r]?.[c] || "";
              const isCorrect = !!value && value.toUpperCase() === cell.ch;
              const isFilledWrong = !!value && value.toUpperCase() !== cell.ch;

              // Color-blind friendly palette swaps red/green for blue/orange + icons
              const correctClass = settings.colorblind
                ? "border-blue-500 bg-blue-50 text-blue-900"
                : "border-green-300 bg-green-50 text-green-800";
              const wrongClass = settings.colorblind
                ? "border-orange-500 bg-orange-50 text-orange-900"
                : "border-red-300 bg-red-50 text-red-800";

              return (
                <div key={`${r}-${c}`} className="relative" style={{ width: cellSize, height: cellSize }}>
                  {cell.num && (
                    <span className="absolute left-0.5 top-0 z-10 text-[9px] font-extrabold text-text-secondary">{cell.num}</span>
                  )}
                  {peerHere && (
                    <span className="absolute -top-2 -right-1 z-10 rounded-pill bg-pink-500 px-1 text-[8px] font-extrabold text-white shadow">
                      {peerHere.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  {settings.colorblind && isCorrect && (
                    <span className="pointer-events-none absolute right-0.5 bottom-0 z-10 text-[10px] font-extrabold text-blue-600">✓</span>
                  )}
                  {settings.colorblind && isFilledWrong && (
                    <span className="pointer-events-none absolute right-0.5 bottom-0 z-10 text-[10px] font-extrabold text-orange-600">✗</span>
                  )}
                  <input
                    value={value}
                    onChange={(e) => setCell(r, c, e.target.value)}
                    onClick={() => handleCellClick(r, c)}
                    onFocus={() => handleCellClick(r, c)}
                    onKeyDown={(e) => handleKeyDown(e, r, c)}
                    inputMode="text"
                    autoCapitalize="characters"
                    maxLength={1}
                    aria-label={`Row ${r + 1} column ${c + 1}`}
                    className={`h-full w-full rounded-md border-2 text-center font-extrabold uppercase outline-none transition-colors ${inputFontClass} ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : inActiveWord
                          ? "border-primary/40 bg-primary/5 text-foreground"
                          : isCorrect
                            ? correctClass
                            : isFilledWrong
                              ? wrongClass
                              : "border-border bg-white text-foreground"
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Active clue */}
      {activeWord && (
        <div className="mt-3 rounded-2xl bg-primary/10 px-4 py-3">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
            {activeWord.num} {activeWord.dir === "A" ? "Across" : "Down"}
          </div>
          <div className={`mt-0.5 font-bold text-foreground ${settings.largeText ? "text-base" : "text-sm"}`}>{activeClueText}</div>
        </div>
      )}

      {/* Live scoreboard (co-op only) */}
      {mode === "coop" && (
        <div className="mt-3 rounded-2xl bg-card p-3 shadow-card">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary flex items-center gap-1"><Trophy size={11} /> Scoreboard</div>
          <ul className="mt-1.5 space-y-1">
            {scoreList.map((s, i) => (
              <li key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-extrabold text-foreground">
                  <span className="text-text-secondary">#{i + 1}</span>
                  {s.name === myName ? <span className="text-primary">{s.name} (you)</span> : <span>{s.name}</span>}
                </span>
                <span className="font-bold text-text-secondary">
                  {s.correctWords}<span className="opacity-50"> w</span> · {s.correctLetters}<span className="opacity-50"> l</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All clues */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <ClueList title="Across" clues={puzzle.across} largeText={settings.largeText} />
        <ClueList title="Down" clues={puzzle.down} largeText={settings.largeText} />
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={resetBoard}
          className="flex items-center gap-1 rounded-pill bg-card px-3 py-1.5 text-xs font-extrabold text-text-secondary shadow-card"
        >
          <RotateCcw size={12} /> Clear board
        </button>
      </div>
    </div>
  );
}

function wordKey(w: WordRef): number { return w.dir === "A" ? w.num * 2 : w.num * 2 + 1; }

// ---------- Difficulty picker ----------
function DifficultyPicker({ value, onChange }: { value: Difficulty; onChange: (d: Difficulty) => void }) {
  const opts: { id: Difficulty; label: string; sub: string }[] = [
    { id: "easy", label: "Easy", sub: "3 words · +25 XP" },
    { id: "medium", label: "Medium", sub: "4 words · +50 XP" },
    { id: "hard", label: "Hard", sub: "6 words · +100 XP" },
  ];
  return (
    <div className="mt-4">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">Difficulty</div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {opts.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className={`rounded-2xl border-2 p-2 text-center transition-all ${
                active ? "border-primary bg-primary/10" : "border-border bg-card"
              }`}
            >
              <div className={`text-xs font-extrabold ${active ? "text-primary" : "text-foreground"}`}>{o.label}</div>
              <div className="text-[10px] font-bold text-text-secondary mt-0.5">{o.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ClueList({ title, clues, largeText }: { title: string; clues: { num: number; text: string }[]; largeText: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">{title}</div>
      <ul className="mt-1.5 space-y-1.5">
        {clues.map((c) => (
          <li key={c.num} className={`text-foreground ${largeText ? "text-sm" : "text-xs"}`}>
            <span className="font-extrabold text-primary">{c.num}.</span> {c.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BackBar() {
  return (
    <Link to="/" className="inline-flex items-center gap-1 text-xs font-extrabold text-text-secondary">
      <ArrowLeft size={14} /> Back
    </Link>
  );
}

// ---------- Settings panel ----------
function SettingsPanel({
  open, settings, onToggle, onUpdate,
}: {
  open: boolean; settings: MissionSettings; onToggle: () => void; onUpdate: (p: Partial<MissionSettings>) => void;
}) {
  if (!open) return (
    <button
      onClick={onToggle}
      className="mt-4 flex items-center gap-1 text-xs font-extrabold text-text-secondary"
    >
      <SettingsIcon size={12} /> Accessibility options
    </button>
  );
  return (
    <div className="mt-4 rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Accessibility</div>
        <button onClick={onToggle} className="text-[11px] font-extrabold text-primary">Close</button>
      </div>
      <div className="mt-2 space-y-2">
        <Toggle icon={<Type size={14} />} label="Larger text"
          desc="Bigger letters in cells and clues."
          checked={settings.largeText} onChange={(v) => onUpdate({ largeText: v })} />
        <Toggle icon={<Eye size={14} />} label="Color-blind friendly"
          desc="Use blue/orange + ✓/✗ icons instead of red/green."
          checked={settings.colorblind} onChange={(v) => onUpdate({ colorblind: v })} />
        <Toggle icon={settings.sound ? <Volume2 size={14} /> : <VolumeX size={14} />} label="Sound feedback"
          desc="Beep on correct & incorrect letters."
          checked={settings.sound} onChange={(v) => onUpdate({ sound: v })} />
        <Toggle icon={<Vibrate size={14} />} label="Vibration"
          desc="Buzz on correct & incorrect letters (supported devices)."
          checked={settings.vibration} onChange={(v) => onUpdate({ vibration: v })} />
      </div>
    </div>
  );
}

function Toggle({ icon, label, desc, checked, onChange }: { icon: React.ReactNode; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-3 rounded-xl border border-border bg-white p-3 text-left"
      aria-pressed={checked}
    >
      <span className="flex-1">
        <span className="flex items-center gap-1.5 text-xs font-extrabold text-foreground">{icon} {label}</span>
        <span className="mt-0.5 block text-[10px] font-bold text-text-secondary">{desc}</span>
      </span>
      <span
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

// ---------- Rewards screen ----------
function RewardsScreen({
  difficulty, xp, coop, scores, meName, onPlayAgain, onChangeDifficulty,
}: {
  difficulty: Difficulty; xp: number; coop: boolean;
  scores: Score[] | null; meName: string;
  onPlayAgain: () => void; onChangeDifficulty: () => void;
}) {
  const badge = badgeForDifficulty(difficulty);
  return (
    <div className="mx-auto max-w-md px-5 py-6">
      <Confetti />
      <div className="rounded-3xl bg-gradient-to-br from-primary to-pink-400 p-6 text-center text-primary-foreground shadow-pop">
        <div className="text-5xl">{badge.emoji}</div>
        <div className="mt-2 text-xs font-extrabold uppercase tracking-wider opacity-90">Mission Complete</div>
        <h1 className="mt-1 text-2xl font-black">{badge.name}</h1>
        <p className="mt-1 text-xs font-bold opacity-90">Emotions Crossword · <span className="capitalize">{difficulty}</span>{coop ? " · Co-op" : ""}</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-pill bg-white/95 px-4 py-2 text-foreground shadow">
          <span className="text-base">⭐</span>
          <span className="text-sm font-black">+{xp} XP</span>
        </div>
      </div>

      {coop && scores && scores.length > 0 && (
        <div className="mt-5 rounded-2xl bg-card p-4 shadow-card">
          <div className="text-xs font-extrabold uppercase tracking-wider text-text-secondary flex items-center gap-1">
            <Trophy size={12} /> Final scoreboard
          </div>
          <ul className="mt-2 space-y-1.5">
            {scores.map((s, i) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-extrabold text-foreground">
                  <span className="w-5 text-center text-text-secondary">#{i + 1}</span>
                  {s.name === meName ? <span className="text-primary">{s.name} (you)</span> : s.name}
                  {i === 0 && <span className="text-base">👑</span>}
                </span>
                <span className="font-bold text-text-secondary">
                  {s.correctWords} words · {s.correctLetters} letters
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 space-y-2">
        <button
          onClick={onPlayAgain}
          className="w-full rounded-pill bg-primary py-3 text-sm font-extrabold text-primary-foreground shadow-pop"
        >
          Play again
        </button>
        <button
          onClick={onChangeDifficulty}
          className="w-full rounded-pill bg-card py-3 text-sm font-extrabold text-foreground shadow-card"
        >
          Change difficulty / mode
        </button>
        <Link
          to="/"
          className="block w-full rounded-pill bg-foreground py-3 text-center text-sm font-extrabold text-primary-foreground"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
