import { useState } from "react";
import { useGame } from "../GameContext";
import { TopBar } from "../Chrome";
import { XpPop } from "../Effects";
import dash from "@/assets/dash-avatar.png";
import leo from "@/assets/leo-avatar.png";

export function BranchingScreen() {
  const { setStep } = useGame();
  const [pick, setPick] = useState<"A" | "B" | null>(null);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <TopBar layer={3} totalLayers={4} />

      <main className="flex flex-1 flex-col px-4 pb-6">
        <div className="rounded-full bg-sky/15 px-3 py-1 text-xs font-extrabold text-sky ring-1 ring-sky/30 self-start">
          🎬 Simulation
        </div>

        {/* Cinematic scene */}
        <div className="relative mt-3 flex h-40 items-end overflow-hidden rounded-3xl bg-gradient-to-br from-gold/40 via-coral/30 to-sky/40 shadow-soft">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,_oklch(0.85_0.16_75/0.5),_transparent_60%)]" />
          <div className="relative z-10 flex w-full items-end justify-between px-4 pb-3">
            <span className="text-5xl">🏆</span>
            <img src={dash} alt="Dash at the classroom door" className="h-32 w-32 object-contain drop-shadow-lg" width={512} height={512} />
          </div>
          <div className="absolute left-3 top-3 rounded-lg bg-black/30 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
            🎨 Drawing Competition · 1st place!
          </div>
        </div>

        <p className="mt-4 text-balance text-center text-lg font-extrabold text-foreground">
          Dash is SO excited he might explode. What should he do?
        </p>

        {/* Choices */}
        <div className="mt-4 flex flex-col gap-3">
          <button
            onClick={() => setPick("A")}
            className={`group relative overflow-hidden rounded-3xl border-2 p-4 text-left shadow-soft transition-all active:scale-[0.98] ${
              pick === "A" ? "border-coral bg-coral/10 scale-[1.02] shadow-glow-coral" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-coral/40 to-gold/30 text-3xl animate-vibrate">
                💥
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Option A</p>
                <p className="text-sm font-extrabold leading-snug text-foreground">
                  Run in shouting and knock things over
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setPick("B")}
            className={`group relative overflow-hidden rounded-3xl border-2 p-4 text-left shadow-soft transition-all active:scale-[0.98] ${
              pick === "B" ? "border-sage bg-sage/10 scale-[1.02] shadow-[0_0_30px_oklch(0.7_0.1_155/0.5)]" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky/30 to-sage/30">
                <img src={leo} alt="" className="h-14 w-14 object-contain" width={512} height={512} loading="lazy" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Option B</p>
                <p className="text-sm font-extrabold leading-snug text-foreground">
                  Find Leo and jump up and down together
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-auto pt-5">
          <button
            disabled={!pick}
            onClick={() => setStep("branching-result")}
            className="w-full rounded-2xl bg-gradient-to-r from-sky to-indigo py-4 text-lg font-extrabold text-white shadow-pop transition-transform active:scale-[0.97] disabled:opacity-40"
          >
            Play it out ▶
          </button>
        </div>
      </main>
    </div>
  );
}

export function BranchingResultScreen() {
  const { setStep, addXp } = useGame();
  const [showXp, setShowXp] = useState(false);

  function handleContinue() {
    addXp("simulation", 20);
    setShowXp(true);
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <TopBar layer={3} totalLayers={4} />
      <main className="flex flex-1 flex-col px-4 pb-6">
        <div className="rounded-full bg-sage/15 px-3 py-1 text-xs font-extrabold text-sage ring-1 ring-sage/30 self-start">
          ✓ Perfect choice
        </div>

        {/* Warm celebration scene */}
        <div className="relative mt-3 flex aspect-[4/3] items-end justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-gold via-coral/60 to-sky/40 shadow-pop">
          <div className="pointer-events-none absolute inset-0">
            {["🎉", "✨", "💛", "⭐", "🎊"].map((s, i) => (
              <span key={i} className="animate-float-soft absolute text-3xl"
                style={{ left: `${10 + i * 18}%`, top: `${10 + (i % 3) * 20}%`, animationDelay: `${i * 0.2}s` }}>
                {s}
              </span>
            ))}
          </div>
          <div className="relative z-10 flex items-end gap-2 pb-4">
            <img src={leo} alt="Leo celebrating with Dash" className="h-36 w-36 object-contain drop-shadow-xl animate-bounce-in" width={512} height={512} />
            <img src={dash} alt="Dash celebrating" className="h-40 w-40 object-contain drop-shadow-xl animate-bounce-in" width={512} height={512} style={{ animationDelay: "0.15s" }} />
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-card p-5 shadow-soft">
          <p className="text-center text-base font-extrabold leading-snug text-foreground">
            "Happiness is best when you share it the right way!" 💛
          </p>
          <p className="mt-2 text-center text-sm font-semibold text-muted-foreground">
            Dash and Leo's joy spread across the whole table — that's the magic of shared happiness.
          </p>
        </div>

        <div className="mt-auto pt-5">
          <button
            onClick={handleContinue}
            className="w-full rounded-2xl bg-gradient-to-r from-sage to-sky py-4 text-lg font-extrabold text-white shadow-pop transition-transform active:scale-[0.97]"
          >
            Continue →
          </button>
        </div>
      </main>
      {showXp && <XpPop amount={20} message="Perfect choice!" onDone={() => setStep("reflection")} />}
    </div>
  );
}
