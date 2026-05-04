import { useState } from "react";
import { useGame } from "../GameContext";
import { TopBar } from "../Chrome";
import { XpPop } from "../Effects";
import dash from "@/assets/dash-avatar.png";
import leo from "@/assets/leo-avatar.png";

type Pick = "A" | "B";

export function BranchingScreen() {
  const { setStep, setBranchingPick } = useGame();
  const [pick, setPick] = useState<Pick | null>(null);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <TopBar layer={3} totalLayers={4} />

      <main className="flex flex-1 flex-col px-5 pb-6">
        <div className="self-start rounded-pill bg-card-warm px-3 py-1 text-xs font-extrabold text-foreground shadow-card">
          🎬 Simulation
        </div>

        {/* Cinematic scene */}
        <div className="relative mt-3 flex h-40 items-end overflow-hidden rounded-2xl bg-[var(--gradient-hero)] shadow-card">
          <div className="pointer-events-none absolute inset-0">
            {["⭐", "✨", "🏆"].map((s, i) => (
              <span key={i} className="animate-float-soft absolute text-2xl text-white/70"
                style={{ left: `${15 + i * 25}%`, top: `${15 + (i % 2) * 25}%`, animationDelay: `${i * 0.4}s` }}>
                {s}
              </span>
            ))}
          </div>
          <div className="relative z-10 flex w-full items-end justify-between px-4 pb-3">
            <span className="text-5xl">🏆</span>
            <img src={dash} alt="Dash at the classroom door" className="h-32 w-32 object-contain drop-shadow-lg" width={512} height={512} />
          </div>
          <div className="absolute left-3 top-3 rounded-pill bg-white/95 px-3 py-1 text-[11px] font-extrabold text-foreground shadow-card">
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
            className={`group relative overflow-hidden rounded-2xl border-2 bg-card p-4 text-left shadow-card transition-all active:scale-[0.98] ${
              pick === "A" ? "border-primary scale-[1.02] shadow-pop" : "border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card-warm text-3xl animate-vibrate">
                💥
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Option A</p>
                <p className="text-sm font-extrabold leading-snug text-foreground">
                  Run in shouting and knock things over
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setPick("B")}
            className={`group relative overflow-hidden rounded-2xl border-2 bg-card p-4 text-left shadow-card transition-all active:scale-[0.98] ${
              pick === "B" ? "border-primary scale-[1.02] shadow-pop" : "border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card-gold">
                <img src={leo} alt="" className="h-14 w-14 object-contain" width={512} height={512} loading="lazy" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Option B</p>
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
            onClick={() => {
              if (!pick) return;
              setBranchingPick(pick);
              setStep("branching-result");
            }}
            className="w-full rounded-pill bg-primary py-4 text-lg font-extrabold text-primary-foreground shadow-pop transition-transform active:scale-[0.97] disabled:opacity-40"
          >
            Play it out ▶
          </button>
        </div>
      </main>
    </div>
  );
}

export function BranchingResultScreen() {
  const { setStep, addXp, branchingPick, setBranchingPick } = useGame();
  const [showXp, setShowXp] = useState(false);
  const isOptimal = branchingPick === "B";

  function handleContinue() {
    addXp("simulation", isOptimal ? 20 : 10);
    setShowXp(true);
  }

  function handleTryAgain() {
    setBranchingPick(null);
    setStep("branching");
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <TopBar layer={3} totalLayers={4} />
      <main className="flex flex-1 flex-col px-5 pb-6">
        <div className={`self-start rounded-pill px-3 py-1 text-xs font-extrabold shadow-card ${
          isOptimal ? "bg-card-gold text-gold-dark" : "bg-card-warm text-foreground"
        }`}>
          {isOptimal ? "✓ Perfect choice" : "💭 Oops — let's see what happened"}
        </div>

        {/* Scene */}
        <div className="relative mt-3 flex aspect-[4/3] items-end justify-center overflow-hidden rounded-2xl bg-[var(--gradient-hero)] shadow-pop">
          <div className="pointer-events-none absolute inset-0">
            {(isOptimal ? ["🎉", "✨", "💛", "⭐", "🎊"] : ["💥", "😮", "🫣", "📚", "💢"]).map((s, i) => (
              <span key={i} className="animate-float-soft absolute text-3xl"
                style={{ left: `${10 + i * 18}%`, top: `${10 + (i % 3) * 20}%`, animationDelay: `${i * 0.2}s` }}>
                {s}
              </span>
            ))}
          </div>
          <div className="relative z-10 flex items-end gap-2 pb-4">
            {isOptimal ? (
              <>
                <img src={leo} alt="Leo celebrating with Dash" className="h-36 w-36 object-contain drop-shadow-xl animate-bounce-in" width={512} height={512} />
                <img src={dash} alt="Dash celebrating" className="h-40 w-40 object-contain drop-shadow-xl animate-bounce-in" width={512} height={512} style={{ animationDelay: "0.15s" }} />
              </>
            ) : (
              <img src={dash} alt="Dash looking sheepish after knocking things over" className="h-40 w-40 object-contain drop-shadow-xl animate-vibrate" width={512} height={512} />
            )}
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-card p-5 shadow-card">
          {isOptimal ? (
            <>
              <p className="text-center text-base font-extrabold leading-snug text-foreground">
                "Happiness is best when you share it the right way!" 💛
              </p>
              <p className="mt-2 text-center text-sm font-semibold text-text-secondary">
                Dash and Leo's joy spread across the whole table — that's the magic of shared happiness.
              </p>
            </>
          ) : (
            <>
              <p className="text-center text-base font-extrabold leading-snug text-foreground">
                Uh oh — Dash's big feelings knocked the paint pots flying! 🎨💦
              </p>
              <p className="mt-2 text-center text-sm font-semibold text-text-secondary">
                Big joy is wonderful, but it needs somewhere to <span className="font-extrabold text-foreground">go</span>. Sharing it with a friend turns the volume down — and the magic up.
              </p>
            </>
          )}
        </div>

        <div className="mt-auto pt-5 flex flex-col gap-2">
          {!isOptimal && (
            <button
              onClick={handleTryAgain}
              className="w-full rounded-pill border-2 border-primary bg-card py-3 text-base font-extrabold text-primary transition-transform active:scale-[0.97]"
            >
              ↺ Try the other path
            </button>
          )}
          <button
            onClick={handleContinue}
            className="w-full rounded-pill bg-primary py-4 text-lg font-extrabold text-primary-foreground shadow-pop transition-transform active:scale-[0.97]"
          >
            Continue →
          </button>
        </div>
      </main>
      {showXp && <XpPop amount={isOptimal ? 20 : 10} message={isOptimal ? "Perfect choice!" : "Good try — you learned something!"} onDone={() => setStep("reflection")} />}
    </div>
  );
}
