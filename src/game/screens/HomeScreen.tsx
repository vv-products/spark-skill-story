import { useGame } from "../GameContext";
import { TopBar, BottomNav } from "../Chrome";
import maya from "@/assets/maya-avatar.png";

export function HomeScreen() {
  const { setStep, xp, totalXp, streak } = useGame();
  const ringPct = Math.min(100, (xp / totalXp) * 100);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="sticky top-0 z-20 flex items-center justify-between bg-background px-5 pt-5 pb-3">
        <div>
          <p className="text-sm font-bold text-text-secondary">Welcome back,</p>
          <p className="text-2xl font-black text-foreground">
            Alex <span className="text-text-accent">👋</span>
          </p>
        </div>
        <h1 className="font-display text-3xl text-primary">Sementa</h1>
      </div>

      <main className="flex-1 px-5 pb-6">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-[20px] [background:var(--gradient-hero)] p-5 text-primary-foreground shadow-pop">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex-1">
              <span className="inline-block rounded-pill bg-white/25 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider drop-shadow-sm">
                🎪 The Emotion Fair
              </span>
              <h2 className="mt-3 text-2xl font-black leading-tight drop-shadow-md">
                Continue Class 2:<br />The Happy Stall
              </h2>
              <p className="mt-1 text-xs font-extrabold text-white drop-shadow-md">4 layers · ~5 min</p>
            </div>
            <img
              src={maya}
              alt="Maya waving from The Happy Stall"
              className="h-28 w-28 -mr-2 -mt-2 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] animate-float-soft"
              width={512}
              height={512}
            />
          </div>

          <button
            onClick={() => setStep("intro")}
            className="mt-4 w-full rounded-pill bg-white py-3.5 text-base font-extrabold text-primary shadow-card transition-transform active:scale-[0.97]"
          >
            Continue →
          </button>
        </div>

        {/* Stat cards */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-card-warm p-3 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Streak</p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl">🔥</span>
              <span className="text-xl font-black text-foreground">{streak}</span>
            </p>
            <p className="text-[10px] font-bold text-text-secondary">days</p>
          </div>
          <div className="rounded-2xl bg-card-gold p-3 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Level</p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl">🏆</span>
              <span className="text-xl font-black text-foreground">3</span>
            </p>
            <p className="text-[10px] font-bold text-text-secondary">Explorer</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-card p-3 shadow-card">
            <div className="relative h-12 w-12">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#F0F0F0" strokeWidth="4" />
                <circle
                  cx="18" cy="18" r="15" fill="none" stroke="#7B2FBE" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(ringPct / 100) * 94.2} 94.2`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-foreground">
                {Math.round(ringPct)}%
              </span>
            </div>
            <p className="mt-1 text-[10px] font-bold text-text-secondary">to Level 4</p>
          </div>
        </div>

        {/* Journey list */}
        <div className="mt-5 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-foreground">Your Journey</h3>
          <button className="text-xs font-bold text-primary">See all</button>
        </div>

        <div className="mt-2 flex flex-col gap-3">
          {[
            { tag: "Class 1", title: "The Mystery Gates", state: "done", emoji: "✅" },
            { tag: "Class 2", title: "The Happy Stall", state: "current", emoji: "🌟" },
            { tag: "Class 3", title: "The Sad Corner", state: "locked", emoji: "🔒" },
          ].map((c) => (
            <button
              key={c.title}
              type="button"
              disabled={c.state === "locked"}
              onClick={() => {
                if (c.state === "current") setStep("intro");
              }}
              className={`flex w-full items-center gap-3 rounded-2xl bg-card p-3.5 text-left shadow-card transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${
                c.state === "current" ? "ring-2 ring-primary" : ""
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                  c.state === "current"
                    ? "bg-primary text-primary-foreground"
                    : c.state === "done"
                    ? "bg-card-warm"
                    : "bg-muted opacity-60"
                }`}
              >
                {c.emoji}
              </div>
              <div className="flex-1">
                <span className="inline-block rounded-pill bg-tag px-2 py-0.5 text-[10px] font-extrabold text-tag-foreground">
                  {c.tag}
                </span>
                <p className={`mt-0.5 text-sm font-extrabold ${c.state === "locked" ? "text-text-secondary" : "text-foreground"}`}>
                  {c.title}
                </p>
              </div>
              <span className="text-base text-tag-foreground">🔖</span>
            </button>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
