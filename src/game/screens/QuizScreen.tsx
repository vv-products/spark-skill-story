import { useEffect, useState } from "react";
import { useGame } from "../GameContext";
import { TopBar } from "../Chrome";
import { FullscreenFlash, XpPop } from "../Effects";
import dash from "@/assets/dash-avatar.png";

type Q = { statement: string; answer: boolean };
const QUESTIONS: Q[] = [
  { statement: "Happiness always lasts forever.", answer: false },
  { statement: "Sharing happy moments makes them bigger.", answer: true },
  { statement: "It's okay to feel happy and sad on the same day.", answer: true },
];

export function QuizScreen() {
  const { setStep, addXp } = useGame();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(10);
  const [flash, setFlash] = useState<null | "green" | "red">(null);
  const [locked, setLocked] = useState(false);
  const [showXp, setShowXp] = useState<null | { amount: number; msg: string }>(null);
  const [done, setDone] = useState(false);

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
    setFlash(correct ? "green" : "red");
    if (correct) setScore((s) => s + 1);
  }

  function nextQuestion() {
    setFlash(null);
    if (idx + 1 < QUESTIONS.length) {
      setIdx(idx + 1);
      setTime(10);
      setLocked(false);
    } else {
      const base = 5;
      const bonus = score === QUESTIONS.length ? 15 : score >= 2 ? 10 : 0;
      addXp("quiz", base + bonus);
      setDone(true);
      setShowXp({ amount: base + bonus, msg: bonus >= 15 ? "All correct!" : "Nice work!" });
    }
  }

  const timePct = Math.max(0, (time / 10) * 100);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-background">
      <TopBar layer={2} totalLayers={4} />

      <main className="flex flex-1 flex-col px-5 pb-6">
        <div className="flex items-center justify-between">
          <div className="rounded-pill bg-card-warm px-3 py-1 text-xs font-extrabold text-foreground shadow-card">
            ⚡ Rapid Fire
          </div>
          <div className="rounded-pill bg-primary px-3 py-1 text-xs font-extrabold text-primary-foreground tabular-nums shadow-card">
            {score} / {QUESTIONS.length}
          </div>
        </div>

        {/* Countdown */}
        <div className="mt-3 h-2 overflow-hidden rounded-pill bg-muted">
          <div
            className="h-full rounded-pill bg-primary transition-[width] duration-100"
            style={{ width: `${timePct}%` }}
          />
        </div>

        {/* Statement */}
        <div className="mt-8 flex flex-1 items-center justify-center">
          <div className="animate-bounce-in rounded-2xl bg-card px-6 py-8 text-center shadow-card" key={idx}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">True or False?</p>
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
            className="group relative flex h-44 flex-col items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground shadow-pop transition-all active:scale-95 disabled:opacity-60"
          >
            <img src={dash} alt="" className="h-20 w-20 object-contain transition-transform group-active:-translate-x-3" width={512} height={512} loading="lazy" />
            <span className="text-3xl font-black">TRUE</span>
          </button>
          <button
            disabled={locked}
            onClick={() => handle(false)}
            className="group relative flex h-44 flex-col items-center justify-center gap-2 rounded-2xl bg-card text-primary shadow-card transition-all active:scale-95 disabled:opacity-60 ring-2 ring-primary"
          >
            <img src={dash} alt="" className="h-20 w-20 -scale-x-100 object-contain transition-transform group-active:translate-x-3" width={512} height={512} loading="lazy" />
            <span className="text-3xl font-black">FALSE</span>
          </button>
        </div>
      </main>

      {flash && <FullscreenFlash color={flash} onDone={nextQuestion} />}
      {showXp && <XpPop amount={showXp.amount} message={showXp.msg} onDone={() => setStep("branching")} />}
    </div>
  );
}
