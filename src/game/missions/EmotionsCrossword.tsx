// Emotions Crossword Mission
// Solo or co-op (invite a friend). Co-op uses Supabase Realtime broadcast
// on a channel keyed by a short share code — no DB writes per cell.

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Users, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerAuth } from "@/game/PlayerAuth";
import { Confetti } from "@/game/Effects";

// ---------- Puzzle definition ----------
// 5 cols x 5 rows. "." = blocked.
//  H A P P Y
//  B O R E D
//  . . O . .
//  . . U . .
//  . . D U L L  (extends to 6 cols)
const ROWS = 5;
const COLS = 6;
type Cell = { ch: string; num?: number } | null;

const SOLUTION: Cell[][] = [
  [{ ch: "H", num: 1 }, { ch: "A" }, { ch: "P", num: 2 }, { ch: "P" }, { ch: "Y" }, null],
  [{ ch: "B", num: 3 }, { ch: "O" }, { ch: "R" }, { ch: "E" }, { ch: "D" }, null],
  [null, null, { ch: "O" }, null, null, null],
  [null, null, { ch: "U" }, null, null, null],
  [null, null, { ch: "D", num: 4 }, { ch: "U" }, { ch: "L" }, { ch: "L" }],
];

const CLUES_ACROSS = [
  { num: 1, text: "Feeling great with a big smile (5)" },
  { num: 3, text: "Feeling uninterested or tired of something (5)" },
  { num: 4, text: "Boring; not exciting (4)" },
];
const CLUES_DOWN = [
  { num: 2, text: "Feeling pleased with what you did (5)" },
];

// Words list for hit-testing the active clue
type WordRef = { num: number; dir: "A" | "D"; r: number; c: number; len: number };
const WORDS: WordRef[] = [
  { num: 1, dir: "A", r: 0, c: 0, len: 5 },
  { num: 3, dir: "A", r: 1, c: 0, len: 5 },
  { num: 4, dir: "A", r: 4, c: 2, len: 4 },
  { num: 2, dir: "D", r: 0, c: 2, len: 5 },
];

// ---------- helpers ----------
function makeCode(len = 5): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function emptyGrid(): string[][] {
  return SOLUTION.map((row) => row.map((c) => (c ? "" : "")));
}

// ---------- component ----------
export function EmotionsCrossword({ initialCode }: { initialCode?: string }) {
  const navigate = useNavigate();
  const { user } = usePlayerAuth();
  const [mode, setMode] = useState<"choose" | "solo" | "coop">(initialCode ? "coop" : "choose");
  const [code, setCode] = useState<string>(initialCode ?? "");
  const [grid, setGrid] = useState<string[][]>(emptyGrid);
  const [active, setActive] = useState<{ r: number; c: number; dir: "A" | "D" }>({ r: 0, c: 0, dir: "A" });
  const [peers, setPeers] = useState<{ name: string; cells: { r: number; c: number } }[]>([]);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const myName = (user?.user_metadata as any)?.display_name || user?.email?.split("@")[0] || "Guest";

  // ---------- Realtime channel ----------
  useEffect(() => {
    if (mode !== "coop" || !code) return;
    const ch = supabase.channel(`mission:emotions-crossword:${code}`, {
      config: { broadcast: { self: false }, presence: { key: user?.id ?? `guest-${Math.random().toString(36).slice(2, 8)}` } },
    });
    channelRef.current = ch;

    ch.on("broadcast", { event: "cell" }, (payload) => {
      const { r, c, ch: letter } = payload.payload as { r: number; c: number; ch: string };
      setGrid((g) => {
        const next = g.map((row) => row.slice());
        next[r][c] = letter;
        return next;
      });
    });
    ch.on("broadcast", { event: "cursor" }, (payload) => {
      const { name, r, c } = payload.payload as { name: string; r: number; c: number };
      setPeers((ps) => {
        const others = ps.filter((p) => p.name !== name);
        return [...others, { name, cells: { r, c } }];
      });
    });
    ch.on("broadcast", { event: "sync-request" }, () => {
      // Reply with current grid for newcomers
      ch.send({ type: "broadcast", event: "sync-state", payload: { grid } });
    });
    ch.on("broadcast", { event: "sync-state" }, (payload) => {
      const incoming = (payload.payload as { grid: string[][] }).grid;
      // Merge: keep any cell we already have
      setGrid((g) => g.map((row, r) => row.map((cur, c) => cur || incoming?.[r]?.[c] || "")));
    });

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({ name: myName, joinedAt: Date.now() });
        // Ask any existing player for current state
        ch.send({ type: "broadcast", event: "sync-request", payload: { from: myName } });
      }
    });

    return () => {
      ch.unsubscribe();
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, code]);

  // ---------- Win check ----------
  useEffect(() => {
    let win = true;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const sol = SOLUTION[r][c];
        if (!sol) continue;
        if ((grid[r][c] || "").toUpperCase() !== sol.ch) { win = false; break; }
      }
      if (!win) break;
    }
    if (win && !done) {
      setDone(true);
      toast.success("🎉 Crossword complete!");
    }
  }, [grid, done]);

  // ---------- input handling ----------
  function setCell(r: number, c: number, value: string) {
    const letter = value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    setGrid((g) => {
      const next = g.map((row) => row.slice());
      next[r][c] = letter;
      return next;
    });
    if (channelRef.current) {
      channelRef.current.send({ type: "broadcast", event: "cell", payload: { r, c, ch: letter, by: myName } });
    }
    if (letter) advance(r, c, active.dir);
  }

  function advance(r: number, c: number, dir: "A" | "D") {
    const dr = dir === "D" ? 1 : 0;
    const dc = dir === "A" ? 1 : 0;
    let nr = r + dr, nc = c + dc;
    while (nr < ROWS && nc < COLS && !SOLUTION[nr][nc]) { nr += dr; nc += dc; }
    if (nr < ROWS && nc < COLS && SOLUTION[nr][nc]) setActive({ r: nr, c: nc, dir });
  }

  function handleCellClick(r: number, c: number) {
    if (!SOLUTION[r][c]) return;
    if (active.r === r && active.c === c) {
      setActive({ r, c, dir: active.dir === "A" ? "D" : "A" });
    } else {
      // Pick a direction that has a word at this cell
      const hasAcross = WORDS.some((w) => w.dir === "A" && w.r === r && c >= w.c && c < w.c + w.len);
      const hasDown = WORDS.some((w) => w.dir === "D" && w.c === c && r >= w.r && r < w.r + w.len);
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
      if (grid[r][c]) setCell(r, c, "");
      else {
        const dr = active.dir === "D" ? -1 : 0;
        const dc = active.dir === "A" ? -1 : 0;
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nc >= 0 && !SOLUTION[nr]?.[nc]) { nr += dr; nc += dc; }
        if (nr >= 0 && nc >= 0 && SOLUTION[nr][nc]) {
          setActive({ r: nr, c: nc, dir: active.dir });
          setCell(nr, nc, "");
        }
      }
    } else if (e.key === "ArrowRight") { setActive({ r, c, dir: "A" }); advance(r, c, "A"); }
    else if (e.key === "ArrowLeft") {
      let nr = r, nc = c - 1;
      while (nc >= 0 && !SOLUTION[nr][nc]) nc--;
      if (nc >= 0) setActive({ r: nr, c: nc, dir: "A" });
    } else if (e.key === "ArrowDown") { setActive({ r, c, dir: "D" }); advance(r, c, "D"); }
    else if (e.key === "ArrowUp") {
      let nr = r - 1, nc = c;
      while (nr >= 0 && !SOLUTION[nr][nc]) nr--;
      if (nr >= 0) setActive({ r: nr, c: nc, dir: "D" });
    }
  }

  // ---------- mode chooser ----------
  if (mode === "choose") {
    return (
      <div className="mx-auto max-w-md px-5 py-6">
        <BackBar />
        <h1 className="mt-2 text-2xl font-black text-foreground">Emotions Crossword</h1>
        <p className="mt-1 text-sm text-text-secondary">A mini puzzle about how we feel. Play alone or invite a friend to play together in real-time.</p>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => setMode("solo")}
            className="w-full rounded-2xl bg-foreground p-4 text-left text-primary-foreground shadow-pop active:scale-[0.98] transition-transform"
          >
            <div className="text-sm font-extrabold">🧩 Play Solo</div>
            <div className="text-xs opacity-80 mt-0.5">Just you and the puzzle.</div>
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
            <div className="text-xs opacity-90 mt-0.5">Share a code or link — solve it together live.</div>
          </button>
        </div>
      </div>
    );
  }

  // ---------- play view ----------
  const cellSize = 48;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/mission/emotions-crossword?code=${code}` : "";
  const peerCount = peers.length;

  // Active clue text
  const activeWord = WORDS.find((w) => {
    if (w.dir !== active.dir) return false;
    if (w.dir === "A") return w.r === active.r && active.c >= w.c && active.c < w.c + w.len;
    return w.c === active.c && active.r >= w.r && active.r < w.r + w.len;
  });
  const activeClueText =
    activeWord
      ? (activeWord.dir === "A" ? CLUES_ACROSS : CLUES_DOWN).find((cl) => cl.num === activeWord.num)?.text
      : "";

  return (
    <div className="mx-auto max-w-md px-5 py-4">
      <BackBar />

      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-xl font-black text-foreground">Emotions Crossword</h1>
        {mode === "coop" && (
          <div className="flex items-center gap-1 rounded-pill bg-card px-2.5 py-1 text-[11px] font-extrabold text-foreground shadow-card">
            <Users size={12} /> {peerCount + 1} online
          </div>
        )}
      </div>

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
              {copied ? "Copied" : "Share link"}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="mt-4 flex justify-center">
        <div
          className="grid gap-1 rounded-2xl bg-card p-3 shadow-card"
          style={{ gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)` }}
        >
          {SOLUTION.map((row, r) =>
            row.map((cell, c) => {
              if (!cell) return <div key={`${r}-${c}`} className="bg-transparent" style={{ width: cellSize, height: cellSize }} />;
              const isActive = active.r === r && active.c === c;
              const inActiveWord = activeWord && (
                activeWord.dir === "A"
                  ? activeWord.r === r && c >= activeWord.c && c < activeWord.c + activeWord.len
                  : activeWord.c === c && r >= activeWord.r && r < activeWord.r + activeWord.len
              );
              const peerHere = peers.find((p) => p.cells.r === r && p.cells.c === c);
              const value = grid[r][c] || "";
              const isCorrect = value && value.toUpperCase() === cell.ch;
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
                  <input
                    value={value}
                    onChange={(e) => setCell(r, c, e.target.value)}
                    onClick={() => handleCellClick(r, c)}
                    onFocus={() => handleCellClick(r, c)}
                    onKeyDown={(e) => handleKeyDown(e, r, c)}
                    inputMode="text"
                    autoCapitalize="characters"
                    maxLength={1}
                    className={`h-full w-full rounded-md border-2 text-center text-lg font-extrabold uppercase outline-none transition-colors ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : inActiveWord
                          ? "border-primary/40 bg-primary/5 text-foreground"
                          : isCorrect
                            ? "border-green-300 bg-green-50 text-green-800"
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
          <div className="mt-0.5 text-sm font-bold text-foreground">{activeClueText}</div>
        </div>
      )}

      {/* All clues */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <ClueList title="Across" clues={CLUES_ACROSS} />
        <ClueList title="Down" clues={CLUES_DOWN} />
      </div>

      {done && (
        <>
          <Confetti />
          <div className="mt-4 rounded-2xl bg-green-50 border border-green-200 p-4 text-center">
            <div className="text-2xl">🎉</div>
            <div className="mt-1 text-sm font-extrabold text-green-800">Mission complete!</div>
            <div className="text-xs text-green-700">You named the emotions.</div>
          </div>
        </>
      )}
    </div>
  );
}

function ClueList({ title, clues }: { title: string; clues: { num: number; text: string }[] }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">{title}</div>
      <ul className="mt-1.5 space-y-1.5">
        {clues.map((c) => (
          <li key={c.num} className="text-xs text-foreground">
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
