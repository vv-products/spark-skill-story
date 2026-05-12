// "Catcher" mission — Night Zoo Keeper-style flying answers.
// Words/emojis fly from right to left across the screen. Tap the ones that
// match the current prompt; ignore (or avoid) the wrong ones.
// Solo, fast music, +40 base XP + per-catch bonus.

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Music, VolumeX, Heart, Sparkles, Clock, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerAuth } from "@/game/PlayerAuth";
import { Confetti } from "@/game/Effects";
import { useMissionSettings, playFeedback } from "./missionSettings";
import { startMusic, type MusicHandle } from "./missionMusic";
import { QUICK_FIRE_QUIZ } from "./emotionsQuiz";
import { awardOrbs, xpToOrbs } from "@/game/shop/flaskOrbs";
import { FlaskBadge } from "@/game/shop/Shop";

const COMPLETION_KEY = "sementa.mission.emotions-catcher";
const DIFFICULTY_KEY = "sementa.mission.emotions-catcher.difficulty";
const ROUND_SECONDS = 45;
const MAX_LIVES = 3;

type Difficulty = "easy" | "medium" | "hard";
type DiffConfig = {
  label: string;
  emoji: string;
  blurb: string;
  spawnMs: number;        // ms between fliers
  durMin: number;         // seconds across screen (slower = easier)
  durMax: number;
  correctChance: number;  // 0..1 — higher = easier
  xpMultiplier: number;
};
const DIFFICULTIES: Record<Difficulty, DiffConfig> = {
  easy:   { label: "Easy",   emoji: "🌱", blurb: "Slow fliers, mostly correct answers.",      spawnMs: 950, durMin: 2.0, durMax: 3.0, correctChance: 0.65, xpMultiplier: 0.8 },
  medium: { label: "Medium", emoji: "⚡", blurb: "Balanced speed, mix of distractors.",       spawnMs: 650, durMin: 1.4, durMax: 2.2, correctChance: 0.45, xpMultiplier: 1.0 },
  hard:   { label: "Hard",   emoji: "🔥", blurb: "Fast fliers, lots of tricky distractors.", spawnMs: 420, durMin: 0.9, durMax: 1.5, correctChance: 0.30, xpMultiplier: 1.4 },
};
function readDifficulty(): Difficulty {
  if (typeof window === "undefined") return "medium";
  const v = window.localStorage.getItem(DIFFICULTY_KEY);
  return v === "easy" || v === "medium" || v === "hard" ? v : "medium";
}
const TILE_COLORS = [
  "bg-[#E94B6F] text-white",
  "bg-[#3FB6E0] text-white",
  "bg-[#F5A623] text-white",
  "bg-[#5DBE63] text-white",
  "bg-[#7B2FBE] text-white",
];

type Flier = {
  id: number;
  label: string;
  isCorrect: boolean;
  topPct: number;     // vertical position 5–80%
  duration: number;   // seconds 1.0–2.0
  startedAt: number;  // ms epoch when spawned
  color: string;
  caught?: "right" | "wrong";
};

type CompletionRecord = { score: number; xp: number; at: number };
function readCompletion(): CompletionRecord | null {
  if (typeof window === "undefined") return null;
  try { const r = window.localStorage.getItem(COMPLETION_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function writeCompletion(rec: CompletionRecord) {
  try { window.localStorage.setItem(COMPLETION_KEY, JSON.stringify(rec)); } catch { /* ignore */ }
}

export function EmotionsCatcher() {
  const { user } = usePlayerAuth();
  const { settings } = useMissionSettings();
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const [promptIdx, setPromptIdx] = useState(0);
  const [fliers, setFliers] = useState<Flier[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(readDifficulty);
  const [orbsEarned, setOrbsEarned] = useState(0);
  const diffCfg = DIFFICULTIES[difficulty];
  const musicRef = useRef<MusicHandle | null>(null);
  const idRef = useRef(1);
  const [, force] = useState(0);

  function chooseDifficulty(d: Difficulty) {
    setDifficulty(d);
    try { window.localStorage.setItem(DIFFICULTY_KEY, d); } catch { /* ignore */ }
  }

  // Pool of prompts: pull from quick-fire quiz; "catch the answer to: …"
  const prompts = useMemo(() => QUICK_FIRE_QUIZ.map((q) => ({
    q: q.q,
    correct: q.options[q.answer],
    distractors: q.options.filter((_, i) => i !== q.answer),
  })), []);
  const allLabels = useMemo(() => Array.from(new Set(prompts.flatMap((p) => [p.correct, ...p.distractors]))), [prompts]);
  const current = prompts[promptIdx % prompts.length];

  // Music
  useEffect(() => {
    if (!started || done || !musicOn) return;
    musicRef.current = startMusic("fast", 0.07);
    return () => { musicRef.current?.stop(); musicRef.current = null; };
  }, [started, done, musicOn]);

  // Round timer
  useEffect(() => {
    if (!started || done) return;
    const startedAt = Date.now();
    const id = setInterval(() => {
      const left = Math.max(0, ROUND_SECONDS - (Date.now() - startedAt) / 1000);
      setTimeLeft(left);
      if (left <= 0) { clearInterval(id); void finish(); }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, done]);

  // Lives → end
  useEffect(() => {
    if (started && !done && lives <= 0) void finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lives, started, done]);

  // Spawn loop — speed, frequency, distractor mix come from difficulty
  useEffect(() => {
    if (!started || done) return;
    const spawn = () => {
      const isCorrect = Math.random() < diffCfg.correctChance;
      const label = isCorrect
        ? current.correct
        : (allLabels.filter((l) => l !== current.correct)[Math.floor(Math.random() * Math.max(1, allLabels.length - 1))] ?? "Calm");
      const f: Flier = {
        id: idRef.current++,
        label,
        isCorrect: label === current.correct,
        topPct: 8 + Math.random() * 70,
        duration: diffCfg.durMin + Math.random() * (diffCfg.durMax - diffCfg.durMin),
        startedAt: Date.now(),
        color: TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)],
      };
      setFliers((prev) => [...prev, f]);
    };
    spawn();
    const interval = setInterval(spawn, diffCfg.spawnMs);
    return () => clearInterval(interval);
  }, [started, done, current, allLabels, diffCfg]);

  // Cleanup expired fliers + count misses
  useEffect(() => {
    if (!started || done) return;
    const id = setInterval(() => {
      const now = Date.now();
      setFliers((prev) => {
        const remaining: Flier[] = [];
        let missedDelta = 0;
        for (const f of prev) {
          const expired = now - f.startedAt > f.duration * 1000 + 200;
          if (!expired) { remaining.push(f); continue; }
          if (!f.caught && f.isCorrect) missedDelta++;
        }
        if (missedDelta > 0) {
          setMissed((m) => m + missedDelta);
          setStreak(0);
          setLives((l) => Math.max(0, l - missedDelta));
          playFeedback("incorrect", settings);
        }
        return remaining;
      });
      force((n) => n + 1); // re-render to advance positions smoothly
    }, 120);
    return () => clearInterval(id);
  }, [started, done, settings]);

  // Cycle prompt every ~6s
  useEffect(() => {
    if (!started || done) return;
    const id = setInterval(() => setPromptIdx((i) => i + 1), 6000);
    return () => clearInterval(id);
  }, [started, done]);

  function tap(f: Flier) {
    if (f.caught || done) return;
    setFliers((prev) => prev.map((x) => (x.id === f.id ? { ...x, caught: f.isCorrect ? "right" : "wrong" } : x)));
    if (f.isCorrect) {
      setScore((s) => s + 10);
      setCaught((c) => c + 1);
      setStreak((s) => { const n = s + 1; setBestStreak((b) => Math.max(b, n)); return n; });
      playFeedback("correct", settings);
    } else {
      setStreak(0);
      setLives((l) => Math.max(0, l - 1));
      playFeedback("incorrect", settings);
    }
    // remove shortly after feedback
    setTimeout(() => setFliers((prev) => prev.filter((x) => x.id !== f.id)), 250);
  }

  async function finish() {
    if (done) return;
    setDone(true);
    musicRef.current?.stop();
    musicRef.current = null;
    playFeedback("win", settings);
    const streakBonus = bestStreak >= 5 ? 15 : bestStreak >= 3 ? 8 : 0;
    const rawXp = 40 + score + streakBonus;
    const finalXp = Math.round(rawXp * diffCfg.xpMultiplier);
    const orbs = xpToOrbs(finalXp);
    setXpAwarded(finalXp);
    setOrbsEarned(orbs);
    awardOrbs(orbs);
    writeCompletion({ score, xp: finalXp, at: Date.now() });
    if (user) {
      const { error } = await supabase.from("xp_events").insert({
        user_id: user.id, amount: finalXp, source: `mission:emotions-catcher:${difficulty}`,
      });
      if (error) console.error("[xp_events]", error);
    }
    toast.success(`Mission complete! +${finalXp} XP · +${orbs} 🧪`);
  }

  function restart() {
    setStarted(false); setDone(false); setScore(0); setStreak(0); setBestStreak(0);
    setCaught(0); setMissed(0); setLives(MAX_LIVES); setTimeLeft(ROUND_SECONDS);
    setXpAwarded(null); setPromptIdx(0); setFliers([]);
  }

  // ---------- intro ----------
  if (!started) {
    const last = readCompletion();
    return (
      <div className="mx-auto max-w-md px-5 py-6">
        <BackBar />
        <div className="mt-3 rounded-3xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 p-6 text-center text-white shadow-pop">
          <div className="text-5xl">🦋</div>
          <h1 className="mt-2 text-2xl font-black">Emotion Catcher</h1>
          <p className="mt-1 text-xs font-bold opacity-90">Tap the answers that match the prompt as they fly across the screen.</p>
          <div className="mt-3 inline-flex items-center gap-1 rounded-pill bg-white/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles size={11} /> Reflex mission
          </div>
        </div>

        {last && (
          <div className="mt-4 rounded-2xl bg-card p-3 text-xs font-bold text-text-secondary shadow-card">
            ✓ Last score: <span className="text-foreground">{last.score}</span> · earned <span className="text-foreground">+{last.xp} XP</span>
          </div>
        )}

        <div className="mt-5 space-y-2 rounded-2xl bg-card p-4 shadow-card">
          <Row label="Round" value={`${ROUND_SECONDS}s`} />
          <Row label="Lives" value={`${MAX_LIVES} ❤️`} />
          <Row label="Speed" value="1–2s per flier" />
          <Row label="Music" value="Fast & energetic" />
          <Row label="Base XP" value="+40 + 10 per catch" />
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-card p-3 shadow-card">
          <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
            {musicOn ? <Music size={14} /> : <VolumeX size={14} />} Background music
          </div>
          <button onClick={() => setMusicOn((v) => !v)} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${musicOn ? "bg-primary" : "bg-muted"}`}>
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${musicOn ? "left-[18px]" : "left-0.5"}`} />
          </button>
        </div>

        <button onClick={() => setStarted(true)} className="mt-5 w-full rounded-pill bg-gradient-to-r from-fuchsia-500 to-indigo-600 py-3 text-sm font-extrabold text-white shadow-pop">
          Start catching →
        </button>
      </div>
    );
  }

  // ---------- results ----------
  if (done && xpAwarded != null) {
    return (
      <div className="mx-auto max-w-md px-5 py-6">
        <Confetti />
        <div className="rounded-3xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 p-6 text-center text-white shadow-pop">
          <div className="text-5xl">🦋</div>
          <div className="mt-2 text-xs font-extrabold uppercase tracking-wider opacity-90">Mission Complete</div>
          <h1 className="mt-1 text-2xl font-black">Emotion Catcher</h1>
          <div className="mt-4 inline-flex items-center gap-2 rounded-pill bg-white/95 px-4 py-2 text-foreground shadow">
            <span className="text-base">⭐</span><span className="text-sm font-black">+{xpAwarded} XP</span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat label="Caught" value={caught} />
          <Stat label="Missed" value={missed} />
          <Stat label="Best streak" value={bestStreak} />
        </div>
        <div className="mt-6 space-y-2">
          <button onClick={restart} className="w-full rounded-pill bg-primary py-3 text-sm font-extrabold text-primary-foreground shadow-pop">Play again</button>
          <Link to="/" className="block w-full rounded-pill bg-foreground py-3 text-center text-sm font-extrabold text-primary-foreground">Back to home</Link>
        </div>
      </div>
    );
  }

  // ---------- play ----------
  const now = Date.now();
  return (
    <div className="mx-auto max-w-md px-5 py-3">
      <div className="flex items-center justify-between">
        <BackBar />
        <button onClick={() => setMusicOn((v) => !v)} className="flex items-center gap-1 rounded-pill bg-card px-2.5 py-1 text-[11px] font-extrabold text-foreground shadow-card">
          {musicOn ? <Music size={12} /> : <VolumeX size={12} />}
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Clock size={14} className={timeLeft < 8 ? "text-red-500" : "text-text-secondary"} />
        <div className="h-2 flex-1 rounded-pill bg-muted overflow-hidden">
          <div className={`h-full transition-all ${timeLeft < 8 ? "bg-red-500" : "bg-fuchsia-500"}`} style={{ width: `${(timeLeft / ROUND_SECONDS) * 100}%` }} />
        </div>
        <span className="w-10 text-right text-[11px] font-extrabold tabular-nums text-foreground">{timeLeft.toFixed(1)}s</span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <Heart key={i} size={16} className={i < lives ? "fill-red-500 text-red-500" : "text-muted"} />
          ))}
        </div>
        <span className="rounded-pill bg-card px-2 py-0.5 text-[11px] font-extrabold text-foreground shadow-card">{score} pts</span>
      </div>

      <div className="mt-3 rounded-2xl bg-card p-4 text-center shadow-card">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">Catch the answer to</div>
        <p className={`mt-1 font-black text-foreground ${settings.largeText ? "text-xl" : "text-base"}`}>{current.q}</p>
        <p className="mt-1 text-[11px] font-bold text-text-secondary">Tap the flying tile that means <span className="text-foreground">“{current.correct}”</span></p>
      </div>

      <div className="relative mt-3 h-[60vh] overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 to-fuchsia-50 shadow-card">
        {fliers.map((f) => {
          const elapsed = (now - f.startedAt) / 1000;
          const t = Math.min(1, elapsed / f.duration);
          const leftPct = 100 - t * 115; // start just off-right, exit off-left
          let extra = f.color;
          if (f.caught === "right") extra = "bg-green-500 text-white ring-4 ring-green-200";
          if (f.caught === "wrong") extra = "bg-red-500 text-white ring-4 ring-red-200";
          return (
            <button
              key={f.id}
              onClick={() => tap(f)}
              disabled={!!f.caught}
              style={{ top: `${f.topPct}%`, left: `${leftPct}%` }}
              className={`absolute -translate-y-1/2 rounded-2xl px-4 py-3 font-extrabold shadow-pop transition-all active:scale-95 ${extra} ${settings.largeText ? "text-base" : "text-sm"}`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {streak >= 2 && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-pill bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-700">
          🔥 {streak} streak!
        </div>
      )}
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
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="font-bold text-text-secondary">{label}</span>
      <span className="font-extrabold text-foreground">{value}</span>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-card p-3 text-center shadow-card">
      <div className="text-lg font-black text-foreground">{value}</div>
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">{label}</div>
    </div>
  );
}
