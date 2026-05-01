import { useGame } from "../GameContext";
import dash from "@/assets/dash-avatar.png";

export function IntroScreen() {
  const { setStep } = useGame();
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex items-center justify-between px-5 pt-5">
        <button onClick={() => setStep("home")} className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-card active:scale-95">
          ←
        </button>
        <h1 className="font-display text-2xl text-primary">Sementa</h1>
        <span className="w-10" />
      </div>

      <main className="flex flex-1 flex-col px-5 pb-6 pt-4">
        {/* Hero card */}
        <div className="relative overflow-hidden rounded-[20px] bg-[var(--gradient-hero)] p-6 text-primary-foreground shadow-pop">
          <div className="pointer-events-none absolute inset-0">
            {["⭐", "✨", "💫", "🌟", "✨"].map((s, i) => (
              <span
                key={i}
                className="animate-float-soft absolute text-2xl text-white/70"
                style={{
                  left: `${10 + i * 18}%`,
                  top: `${10 + (i % 2) * 25}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                {s}
              </span>
            ))}
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="animate-vibrate">
              <img
                src={dash}
                alt="Dash vibrating with excitement"
                className="h-44 w-44 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]"
                width={512}
                height={512}
              />
            </div>

            <span className="animate-bounce-in mt-2 rounded-pill bg-white px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-primary">
              Class 2
            </span>

            <h2 className="mt-3 text-3xl font-black leading-tight">The Happy Stall</h2>
            <p className="mt-3 max-w-xs text-balance text-sm font-semibold text-white/90">
              Today you'll discover what happiness really is — and why sharing it makes it bigger.
            </p>
          </div>
        </div>

        {/* XP preview card */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-card-gold p-4 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold text-2xl text-gold-foreground">
            ⚡
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Reward</p>
            <p className="text-base font-extrabold text-foreground">Earn up to 75 XP</p>
          </div>
        </div>

        {/* Layer preview */}
        <div className="mt-3 rounded-2xl bg-card p-4 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">What's inside</p>
          <ul className="mt-2 space-y-2">
            {[
              { e: "🎬", t: "Watch Dash's story" },
              { e: "⚡", t: "Rapid fire quiz" },
              { e: "🎭", t: "Choose what Dash does" },
              { e: "💭", t: "Share how YOU feel" },
            ].map((row) => (
              <li key={row.t} className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="text-base">{row.e}</span>{row.t}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-5">
          <button
            onClick={() => setStep("video")}
            className="w-full rounded-pill bg-primary py-4 text-lg font-extrabold text-primary-foreground shadow-pop transition-transform active:scale-[0.97] animate-pulse-glow"
          >
            Let's Go! 🚀
          </button>
        </div>
      </main>
    </div>
  );
}
