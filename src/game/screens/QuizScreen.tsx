import { useEffect, useRef, useState } from "react";
import { useGame } from "../GameContext";
import { TopBar } from "../Chrome";
import { FullscreenFlash, XpPop, Confetti } from "../Effects";
import dash from "@/assets/dash-avatar.png";

type Q = { statement: string; answer: boolean };
const QUESTIONS: Q[] = [
  { statement: "Happiness always lasts forever.", answer: false },
  { statement: "Sharing happy moments makes them bigger.", answer: true },
  { statement: "It's okay to feel happy and sad on the same day.", answer: true },
  { statement: "You can only feel happy if you get a present.", answer: false },
  { statement: "Laughing is one of happiness's favourite disguises.", answer: true },
];
const TOTAL = QUESTIONS.length;
const TIME_PER_Q = 10;

export function QuizScreen() {
  const { setStep, addXp } = useGame();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [scorePulse, setScorePulse] = useState(0);
  const [time, setTime] = useState(TIME_PER_Q);
  const [flash, setFlash] = useState<null | "green" | "red">(null);
  const [locked, setLocked] = useState(false);
  const [pickedSide, setPickedSide] = useState<null | "left" | "right">(null);
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showPerfect, setShowPerfect] = useState(false);
  const [showXp, setShowXp] = useState<null | { amount: number; msg: string }>(null);
  const [done, setDone] = useState(false);
  const cardKey = useRef(0);

  const q = QUESTIONS[idx];

  useEffect(() => {
    if (locked || done) return;
    if (time <= 0) { handle(undefined as unknown as boolean); return; }
    const t = setTimeout(() => setTime((v) => v - 0.1), 100);
    return () => clearTimeout(t);
  }, [time, locked, done]);

  function handle(picked: boolean) {
    if (locked) return;
    setLocked(true);
    const correct = picked === q.answer;
    // Dash runs in the direction tapped (TRUE=left, FALSE=right). Timeout = wrong → no run.
    if (picked === true) setPickedSide("left");
    else if (picked === false) setPickedSide("right");
    setFlash(correct ? "green" : "red");
    if (correct) {
      setScore((s) => s + 1);
      setScorePulse((p) => p + 1);
    }
  }

  function afterFlash() {
    setFlash(null);
    const wasCorrect = pickedSide !== null && (pickedSide === "left") === q.answer;
    if (!wasCorrect) {
      // Show "That's the one!" hint for 1s before advancing
      setRevealCorrect(true);
      setTimeout(() => {
        setRevealCorrect(false);
        advance();
      }, 1000);
    } else {
      // Brief delay so the new question bounces in cleanly
      setTimeout(advance, 200);
    }
  }

  function advance() {
    if (idx + 1 < TOTAL) {
      cardKey.current += 1;
      setIdx((i) => i + 1);
      setTime(TIME_PER_Q);
      setLocked(false);
      setPickedSide(null);
    } else {
      finish();
    }
  }

  function finish() {
    setDone(true);
    // Show summary card for 2s
    setShowSummary(true);
    setTimeout(() => {
      setShowSummary(false);
      const base = 5;
      const allCorrect = score === TOTAL; // score state is current at this point
      const bonus = allCorrect ? 15 : score >= 3 ? 8 : 0;
      const total = base + bonus;
      addXp("quiz", total);
      if (allCorrect) {
        setShowPerfect(true);
        setTimeout(() => {
          setShowPerfect(false);
          setShowXp({ amount: total, msg: "All correct! 🏆" });
        }, 1500);
      } else {
        setShowXp({ amount: total, msg: score >= 3 ? "Nice work!" : "Keep going!" });
      }
    }, 2000);
  }

  const timePct = Math.max(0, (time / TIME_PER_Q) * 100);
  const timerColor =
    timePct > 60 ? "#22C55E" : timePct > 30 ? "#F5A623" : "#E5484D";
  const timerPulse = timePct < 15 ? "animate-pulse" : "";

  const stars = score === TOTAL ? 3 : score >= 3 ? 2 : score >= 1 ? 1 : 0;

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-background">
      <TopBar layer={2} totalLayers={4} />

      <main className="flex flex-1 flex-col px-5 pb-6">
        <div className="flex items-center justify-between">
          <div className="rounded-pill bg-card-warm px-3 py-1 text-xs font-extrabold text-foreground shadow-card">
            ⚡ Rapid Fire
          </div>
          <div
            key={`score-${scorePulse}`}
            className="animate-score-pop rounded-pill bg-primary px-3 py-1 text-xs font-extrabold text-primary-foreground tabular-nums shadow-card"
          >
            {score} / {TOTAL}
          </div>
        </div>

        {/* Countdown */}
        <div className={`mt-3 h-2 overflow-hidden rounded-pill bg-muted ${timerPulse}`}>
          <div
            className="h-full rounded-pill transition-[width,background-color] duration-200"
            style={{ width: `${timePct}%`, backgroundColor: timerColor }}
          />
        </div>

        {/* Statement */}
        <div className="mt-8 flex flex-1 items-center justify-center">
          <div
            key={cardKey.current}
            className="animate-bounce-in rounded-2xl bg-card px-6 py-8 text-center shadow-card"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">
              True or False?
            </p>
            <p className="mt-3 text-2xl font-black leading-tight text-foreground">
              "{q.statement}"
            </p>
          </div>
        </div>

        {/* Tap zones */}
        <div className="grid grid-cols-2 gap-3 pt-6">
          <button
            disabled={locked}
            onClick={() => handle(true)}
            className={`group relative flex h-44 flex-col items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground shadow-pop transition-all active:scale-95 disabled:opacity-90 ${
              revealCorrect && q.answer === true ? "ring-4 ring-green-400" : ""
            }`}
          >
            <img
              src={dash}
              alt=""
              className={`h-20 w-20 object-contain ${
                pickedSide === "left" ? "animate-dash-run-left" : ""
              }`}
              width={512}
              height={512}
              loading="lazy"
            />
            <span className="text-3xl font-black">TRUE</span>
            {revealCorrect && q.answer === true && (
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill bg-green-500 px-3 py-1 text-[11px] font-extrabold text-white shadow-card">
                ✓ That's the one!
              </span>
            )}
          </button>
          <button
            disabled={locked}
            onClick={() => handle(false)}
            className={`group relative flex h-44 flex-col items-center justify-center gap-2 rounded-2xl bg-card text-primary shadow-card ring-2 ring-primary transition-all active:scale-95 disabled:opacity-90 ${
              revealCorrect && q.answer === false ? "ring-4 ring-green-400" : ""
            }`}
          >
            <img
              src={dash}
              alt=""
              className={`h-20 w-20 -scale-x-100 object-contain ${
                pickedSide === "right" ? "animate-dash-run-right" : ""
              }`}
              width={512}
              height={512}
              loading="lazy"
            />
            <span className="text-3xl font-black">FALSE</span>
            {revealCorrect && q.answer === false && (
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill bg-green-500 px-3 py-1 text-[11px] font-extrabold text-white shadow-card">
                ✓ That's the one!
              </span>
            )}
          </button>
        </div>
      </main>

      {flash && <FullscreenFlash color={flash} onDone={afterFlash} />}

      {/* End-of-quiz summary card */}
      {showSummary && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-end justify-center bg-black/30 backdrop-blur-sm">
          <div className="animate-slide-up-in mx-5 mb-10 w-full max-w-[400px] rounded-3xl bg-card p-6 text-center shadow-pop">
            <p className="text-xs font-extrabold uppercase tracking-widest text-text-secondary">
              Round Complete
            </p>
            <p className="mt-2 text-6xl font-black text-foreground tabular-nums">
              {score} <span className="text-text-secondary">/ {TOTAL}</span>
            </p>
            <div className="mt-3 flex justify-center gap-1 text-3xl">
              {[1, 2, 3].map((n) => (
                <span key={n} className={n <= stars ? "" : "opacity-25 grayscale"}>
                  ⭐
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center">
              <img
                src={dash}
                alt=""
                className={`h-24 w-24 object-contain ${
                  score >= 3 ? "animate-bounce-in" : "opacity-80"
                }`}
              />
            </div>
            <p className="mt-2 text-lg font-extrabold text-foreground">
              {score === TOTAL ? "Flawless!" : score >= 3 ? "Great round!" : "Tricky one 🤷"}
            </p>
          </div>
        </div>
      )}

      {/* Perfect-round celebration */}
      {showPerfect && (
        <div className="pointer-events-none fixed inset-0 z-40 flex flex-col items-center justify-center bg-primary-dark">
          <Confetti />
          <img
            src={dash}
            alt=""
            className="h-40 w-40 animate-bounce-in object-contain drop-shadow-2xl"
          />
          <p className="mt-4 animate-bounce-in text-5xl font-black text-white drop-shadow-lg">
            PERFECT! 🌟
          </p>
        </div>
      )}

      {showXp && (
        <XpPop
          amount={showXp.amount}
          message={showXp.msg}
          onDone={() => setStep("branching")}
        />
      )}
    </div>
  );
}
