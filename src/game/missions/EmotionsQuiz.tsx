// Blooket-style multiple-choice mission for Emotions.
// - "self-paced": no timer, soothing background music, +50 XP base
// - "quick": 8s timer per question, fast music, streaks, +100 XP base + speed bonus
// Background music starts on first user interaction (autoplay-safe).

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, Flame, Sparkles, Music, MusicOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerAuth } from "@/game/PlayerAuth";
import { Confetti } from "@/game/Effects";
import { useMissionSettings, playFeedback } from "./missionSettings";
import { startMusic, type MusicHandle, type MusicKind } from "./missionMusic";
import { SELF_PACED_QUIZ, QUICK_FIRE_QUIZ, type MCQ } from "./emotionsQuiz";

type Pace = "self-paced" | "quick";
const QUICK_TIME = 8; // seconds per question
const COMPLETION_KEY_BASE = "sementa.mission.emotions-quiz";

type CompletionRecord = { pace: Pace; score: number; xp: number; at: number };
function readCompletion(pace: Pace): CompletionRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${COMPLETION_KEY_BASE}.${pace}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function writeCompletion(rec: CompletionRecord) {
  try { window.localStorage.setItem(`${COMPLETION_KEY_BASE}.${rec.pace}`, JSON.stringify(rec)); } catch { /* ignore */ }
}

const PACE_CONFIG: Record<Pace, { music: MusicKind; baseXp: number; perRightXp: number; title: string; tagline: string; emoji: string }> = {
  "self-paced": { music: "soothing", baseXp: 25, perRightXp: 5, title: "Emotions Quiz", tagline: "Take your time. Soothing vibes.", emoji: "🌿" },
  "quick":      { music: "fast",     baseXp: 50, perRightXp: 8, title: "Emotions Quick-Fire", tagline: "8 seconds per question. Don't blink.", emoji: "⚡" },
};

export function EmotionsQuiz({ pace }: { pace: Pace }) {
  const navigate = useNavigate();
  const { user } = usePlayerAuth();
  const { settings } = useMissionSettings();
  const cfg = PACE_CONFIG[pace];
  const questions = useMemo<MCQ[]>(() => (pace === "quick" ? QUICK_FIRE_QUIZ : SELF_PACED_QUIZ), [pace]);

  const [started, setStarted] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUICK_TIME);
  const [done, setDone] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const musicRef = useRef<MusicHandle | null>(null);
  const startedAtRef = useRef<number>(0);

  // Music lifecycle
  useEffect(() => {
    if (!started || !musicOn) return;
    musicRef.current = startMusic(cfg.music, pace === "quick" ? 0.07 : 0.06);
    return () => { musicRef.current?.stop(); musicRef.current = null; };
  }, [started, musicOn, cfg.music, pace]);

  // Timer for quick mode
  useEffect(() => {
    if (!started || pace !== "quick" || done || picked != null) return;
    setTimeLeft(QUICK_TIME);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const left = Math.max(0, QUICK_TIME - elapsed);
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(interval);
        // Time up = wrong
        setPicked(-1);
        setStreak(0);
        playFeedback("incorrect", settings);
        setTimeout(nextQuestion, 900);
      }
    }, 100);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, idx, pace, done, picked]);

  function start() {
    setStarted(true);
    startedAtRef.current = Date.now();
  }

  function pick(i: number) {
    if (picked != null || done) return;
    const correct = i === questions[idx].answer;
    setPicked(i);
    if (correct) {
      // Speed bonus for quick mode
      const speedBonus = pace === "quick" ? Math.round(timeLeft * 2) : 0;
      const streakBonus = (streak + 1) >= 3 ? 5 : 0;
      const gain = cfg.perRightXp + speedBonus + streakBonus;
      setScore((s) => s + gain);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      playFeedback("correct", settings);
    } else {
      setStreak(0);
      playFeedback("incorrect", settings);
    }
    setTimeout(nextQuestion, pace === "quick" ? 900 : 1400);
  }

  function nextQuestion() {
    setPicked(null);
    if (idx + 1 >= questions.length) {
      void finish();
    } else {
      setIdx((n) => n + 1);
    }
  }

  async function finish() {
    setDone(true);
    musicRef.current?.stop();
    musicRef.current = null;
    playFeedback("win", settings);
    const finalXp = cfg.baseXp + score;
    setXpAwarded(finalXp);
    writeCompletion({ pace, score, xp: finalXp, at: Date.now() });
    if (user) {
      const { error } = await supabase.from("xp_events").insert({
        user_id: user.id,
        amount: finalXp,
        source: `mission:emotions-${pace}`,
      });
      if (error) console.error("[xp_events]", error);
    }
    toast.success(`Mission complete! +${finalXp} XP`);
  }

  function restart() {
    setIdx(0); setPicked(null); setScore(0); setStreak(0); setBestStreak(0);
    setDone(false); setXpAwarded(null); setTimeLeft(QUICK_TIME);
    setStarted(false);
  }

  // ---------- intro screen ----------
  if (!started) {
    const completion = readCompletion(pace);
    return (
      <div className="mx-auto max-w-md px-5 py-6">
        <BackBar />
        <div className={`mt-3 rounded-3xl p-6 shadow-pop text-center ${
          pace === "quick"
            ? "bg-gradient-to-br from-orange-500 to-pink-500 text-white"
            : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
        }`}>
          <div className="text-5xl">{cfg.emoji}</div>
          <h1 className="mt-2 text-2xl font-black">{cfg.title}</h1>
          <p className="mt-1 text-xs font-bold opacity-90">{cfg.tagline}</p>
          {pace === "quick" && (
            <div className="mt-3 inline-flex items-center gap-1 rounded-pill bg-white/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles size={11} /> Rare mission
            </div>
          )}
        </div>

        {completion && (
          <div className="mt-4 rounded-2xl bg-card p-3 text-xs font-bold text-text-secondary shadow-card">
            ✓ Last score: <span className="text-foreground">{completion.score}</span> · earned <span className="text-foreground">+{completion.xp} XP</span>
          </div>
        )}

        <div className="mt-5 space-y-2 rounded-2xl bg-card p-4 shadow-card">
          <Row label="Questions" value={`${questions.length}`} />
          <Row label="Pace" value={pace === "quick" ? "8s per question" : "Self-paced"} />
          <Row label="Music" value={pace === "quick" ? "Fast & energetic" : "Soothing ambient"} />
          <Row label="Base XP" value={`+${cfg.baseXp}`} />
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-card p-3 shadow-card">
          <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
            {musicOn ? <Music size={14} /> : <MusicOff size={14} />} Background music
          </div>
          <button
            onClick={() => setMusicOn((v) => !v)}
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${musicOn ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${musicOn ? "left-[18px]" : "left-0.5"}`} />
          </button>
        </div>

        <button
          onClick={start}
          className={`mt-5 w-full rounded-pill py-3 text-sm font-extrabold shadow-pop ${
            pace === "quick" ? "bg-orange-500 text-white" : "bg-primary text-primary-foreground"
          }`}
        >
          Start mission →
        </button>
      </div>
    );
  }

  // ---------- results screen ----------
  if (done && xpAwarded != null) {
    const correct = questions.filter((_, i) => true).length; // placeholder, recompute below
    // Recompute correct count from score? Easier: track during play; for now derive from XP gained per right
    return (
      <div className="mx-auto max-w-md px-5 py-6">
        <Confetti />
        <div className={`rounded-3xl p-6 text-center text-white shadow-pop ${
          pace === "quick" ? "bg-gradient-to-br from-orange-500 to-pink-500" : "bg-gradient-to-br from-emerald-400 to-teal-500"
        }`}>
          <div className="text-5xl">{cfg.emoji}</div>
          <div className="mt-2 text-xs font-extrabold uppercase tracking-wider opacity-90">Mission Complete</div>
          <h1 className="mt-1 text-2xl font-black">{cfg.title}</h1>
          <div className="mt-4 inline-flex items-center gap-2 rounded-pill bg-white/95 px-4 py-2 text-foreground shadow">
            <span className="text-base">⭐</span>
            <span className="text-sm font-black">+{xpAwarded} XP</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat label="Score" value={score} />
          <Stat label="Best streak" value={bestStreak} icon={<Flame size={12} />} />
          <Stat label="Questions" value={questions.length} />
        </div>

        <div className="mt-6 space-y-2">
          <button onClick={restart} className="w-full rounded-pill bg-primary py-3 text-sm font-extrabold text-primary-foreground shadow-pop">
            Play again
          </button>
          <Link to="/" className="block w-full rounded-pill bg-foreground py-3 text-center text-sm font-extrabold text-primary-foreground">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // ---------- quiz screen ----------
  const q = questions[idx];
  const correctIdx = q.answer;
  const showFeedback = picked != null;
  const isQuick = pace === "quick";
  const timePct = Math.max(0, Math.min(100, (timeLeft / QUICK_TIME) * 100));

  // Blooket-style 4 colored option tiles
  const tileColors = [
    "bg-[#E94B6F] text-white", // red/pink
    "bg-[#3FB6E0] text-white", // blue
    "bg-[#F5A623] text-white", // orange
    "bg-[#5DBE63] text-white", // green
  ];

  return (
    <div className="mx-auto max-w-md px-5 py-4">
      <div className="flex items-center justify-between">
        <BackBar />
        <button
          onClick={() => setMusicOn((v) => !v)}
          aria-label={musicOn ? "Mute music" : "Play music"}
          className="flex items-center gap-1 rounded-pill bg-card px-2.5 py-1 text-[11px] font-extrabold text-foreground shadow-card"
        >
          {musicOn ? <Music size={12} /> : <MusicOff size={12} />}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[10px] font-extrabold text-text-secondary">{idx + 1} / {questions.length}</span>
        <div className="h-2 flex-1 rounded-pill bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${((idx) / questions.length) * 100}%` }} />
        </div>
        <span className="rounded-pill bg-card px-2 py-0.5 text-[10px] font-extrabold text-foreground shadow-card">{score} pts</span>
      </div>

      {/* Quick-mode timer */}
      {isQuick && (
        <div className="mt-3 flex items-center gap-2">
          <Clock size={14} className={timeLeft < 3 ? "text-red-500" : "text-text-secondary"} />
          <div className="h-2 flex-1 rounded-pill bg-muted overflow-hidden">
            <div
              className={`h-full transition-all ${timeLeft < 3 ? "bg-red-500" : "bg-orange-500"}`}
              style={{ width: `${timePct}%` }}
            />
          </div>
          <span className="w-8 text-right text-[11px] font-extrabold text-foreground tabular-nums">{timeLeft.toFixed(1)}s</span>
        </div>
      )}

      {/* Streak indicator */}
      {streak >= 2 && (
        <div className="mt-3 inline-flex items-center gap-1 rounded-pill bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-700">
          <Flame size={12} /> {streak} streak!
        </div>
      )}

      {/* Question */}
      <div className="mt-4 rounded-3xl bg-card p-5 text-center shadow-card">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">Question {idx + 1}</div>
        <p className={`mt-2 font-black text-foreground ${settings.largeText ? "text-2xl" : "text-xl"}`}>{q.q}</p>
      </div>

      {/* Options grid */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = correctIdx === i;
          let extra = tileColors[i];
          if (showFeedback) {
            if (isCorrect) extra = "bg-green-500 text-white ring-4 ring-green-200";
            else if (isPicked) extra = "bg-red-500 text-white ring-4 ring-red-200";
            else extra += " opacity-50";
          }
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={showFeedback}
              className={`min-h-[88px] rounded-2xl px-3 py-4 text-center font-extrabold shadow-pop transition-all active:scale-[0.97] ${extra} ${settings.largeText ? "text-base" : "text-sm"}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {showFeedback && q.explain && picked === correctIdx && (
        <div className="mt-3 rounded-2xl bg-green-50 border border-green-200 px-4 py-3 text-xs font-bold text-green-800">
          {q.explain}
        </div>
      )}
      {showFeedback && picked !== correctIdx && (
        <div className="mt-3 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-bold text-red-800">
          The answer was <span className="font-extrabold">{q.options[correctIdx]}</span>{q.explain ? `. ${q.explain}` : "."}
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

function Stat({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-3 text-center shadow-card">
      <div className="text-lg font-black text-foreground flex items-center justify-center gap-1">{icon}{value}</div>
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">{label}</div>
    </div>
  );
}
