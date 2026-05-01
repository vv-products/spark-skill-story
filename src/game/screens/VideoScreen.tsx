import { useEffect, useState } from "react";
import { useGame } from "../GameContext";
import { TopBar } from "../Chrome";
import { XpPop } from "../Effects";
import dash from "@/assets/dash-avatar.png";
import maya from "@/assets/maya-avatar.png";

export function VideoScreen() {
  const { setStep, addXp } = useGame();
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showXp, setShowXp] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 100 / 30; // 3 seconds
      });
    }, 100);
    const t = setTimeout(() => setReady(true), 3000);
    return () => { clearInterval(interval); clearTimeout(t); };
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <TopBar layer={1} totalLayers={4} />

      <main className="flex flex-1 flex-col px-4 pb-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">Watch what happens to Dash!</p>
          <div className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-extrabold text-gold ring-1 ring-gold/30">
            +10 XP
          </div>
        </div>

        {/* Video placeholder */}
        <div className="relative aspect-[9/12] overflow-hidden rounded-3xl bg-gradient-to-br from-indigo via-coral to-gold shadow-pop">
          {/* Stars */}
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="animate-float-soft absolute text-2xl"
                style={{
                  left: `${(i * 13) % 100}%`,
                  top: `${(i * 17) % 90}%`,
                  animationDelay: `${(i % 5) * 0.3}s`,
                  filter: "drop-shadow(0 0 8px rgba(255,220,120,0.8))",
                }}
              >
                ✨
              </span>
            ))}
          </div>

          {/* Maya watching */}
          <div className="absolute bottom-6 left-4">
            <img
              src={maya}
              alt="Maya watches and starts to smile"
              className="h-28 w-28 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)]"
              width={512}
              height={512}
              loading="lazy"
            />
          </div>

          {/* Dash running */}
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              left: `${10 + progress * 0.7}%`,
              transition: "left 0.1s linear",
            }}
          >
            <img
              src={dash}
              alt="Dash chasing glowing stars"
              className="h-32 w-32 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
              width={512}
              height={512}
            />
          </div>

          {/* Caption */}
          <div className="absolute left-3 right-3 top-3 rounded-xl bg-black/35 px-3 py-2 text-center text-xs font-bold text-white backdrop-blur-sm">
            Dash chases happiness through the golden stall…
          </div>

          {/* Video progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
            <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-auto pt-5">
          <button
            disabled={!ready}
            onClick={() => { addXp("foundation", 10); setShowXp(true); }}
            className="w-full rounded-2xl bg-gold py-4 text-lg font-extrabold text-gold-foreground shadow-pop transition-all active:scale-[0.97] disabled:opacity-40"
          >
            {ready ? "Continue →" : "Watching…"}
          </button>
        </div>
      </main>

      {showXp && (
        <XpPop amount={10} message="Story watched!" onDone={() => setStep("quiz")} />
      )}
    </div>
  );
}
