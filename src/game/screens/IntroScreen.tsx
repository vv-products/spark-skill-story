import { useGame } from "../GameContext";
import happyStall from "@/assets/happy-stall.jpg";
import dash from "@/assets/dash-avatar.png";

export function IntroScreen() {
  const { setStep } = useGame();
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-background">
      <img
        src={happyStall}
        alt="Warm interior of The Happy Stall — golden light, stars, confetti"
        className="absolute inset-0 h-full w-full object-cover"
        width={1024}
        height={1280}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/95" />

      {/* Floating stars */}
      <div className="pointer-events-none absolute inset-0">
        {["⭐", "✨", "💫", "🌟"].map((s, i) => (
          <span
            key={i}
            className="animate-float-soft absolute text-2xl"
            style={{
              left: `${10 + i * 22}%`,
              top: `${15 + (i % 2) * 20}%`,
              animationDelay: `${i * 0.4}s`,
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-end px-6 pb-8 pt-16">
        <div className="animate-vibrate">
          <img
            src={dash}
            alt="Dash the dog vibrating with excitement"
            className="h-56 w-56 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
            width={512}
            height={512}
          />
        </div>

        <div className="animate-bounce-in mt-2 rounded-full bg-coral px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-coral-foreground shadow-soft">
          Class 2
        </div>

        <h1 className="mt-3 text-center text-4xl font-black text-foreground drop-shadow-sm">
          The Happy Stall
        </h1>
        <p className="mt-3 max-w-xs text-balance text-center text-base font-semibold text-foreground/85">
          Today you'll discover what happiness really is — and why sharing it makes it bigger.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-full bg-gold/95 px-5 py-2.5 shadow-glow-gold">
          <span className="text-xl">⚡</span>
          <span className="text-base font-extrabold text-gold-foreground">Earn up to 75 XP</span>
        </div>

        <button
          onClick={() => setStep("video")}
          className="mt-6 w-full max-w-sm rounded-2xl bg-gradient-to-r from-coral to-gold py-5 text-xl font-black text-white shadow-pop transition-transform active:scale-[0.97]"
        >
          Let's Go! 🚀
        </button>
      </div>
    </div>
  );
}
