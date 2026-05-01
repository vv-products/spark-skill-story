import { useGame } from "./GameContext";
import { TopBar, BottomNav } from "./Chrome";
import fairground from "@/assets/fairground.jpg";
import maya from "@/assets/maya-avatar.png";

export function HomeScreen() {
  const { setStep } = useGame();
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <TopBar />
      <main className="relative flex-1 overflow-hidden">
        {/* Background fairground */}
        <div className="absolute inset-0">
          <img
            src={fairground}
            alt="The Emotion Fair at twilight, dark stalls awaiting light"
            className="h-full w-full object-cover"
            width={1024}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo/30 via-transparent to-background" />
          {/* Glowing stall spotlight */}
          <div
            className="absolute left-1/2 top-[42%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "var(--gradient-stall)", filter: "blur(8px)" }}
          />
        </div>

        {/* Story arc badge */}
        <div className="relative z-10 mx-4 mt-3 flex justify-center">
          <div className="rounded-full bg-card/85 px-4 py-1.5 text-xs font-bold text-foreground shadow-soft backdrop-blur-md">
            🎪 Story Arc · The Emotion Fair
          </div>
        </div>

        {/* Maya at the stall */}
        <div className="relative z-10 mt-44 flex flex-col items-center px-6">
          <div className="animate-float-soft">
            <img
              src={maya}
              alt="Maya waving from the entrance of the glowing Happy Stall"
              className="h-44 w-44 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]"
              width={512}
              height={512}
            />
          </div>
          <div className="mt-2 rounded-2xl bg-card/95 px-4 py-2 text-sm font-bold text-foreground shadow-soft backdrop-blur-md">
            "Come on! The Happy Stall needs you ✨"
          </div>
        </div>

        {/* Continue card */}
        <div className="relative z-10 mx-4 mt-6 rounded-3xl bg-card p-5 shadow-pop">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Continue Class 2
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-foreground">The Happy Stall</h2>
              <p className="text-xs font-semibold text-muted-foreground">4 layers · ~5 min</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-3xl">
              🌟
            </div>
          </div>
          <button
            onClick={() => setStep("intro")}
            className="animate-pulse-glow mt-4 w-full rounded-2xl bg-gradient-to-r from-gold to-coral py-4 text-lg font-extrabold text-gold-foreground shadow-pop transition-transform active:scale-[0.97]"
          >
            Continue →
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
