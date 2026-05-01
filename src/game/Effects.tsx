import { useEffect, useState } from "react";

export function XpPop({ amount, message, onDone }: { amount: number; message?: string; onDone?: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 1100);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div className="animate-float-up flex flex-col items-center gap-2">
        <div className="rounded-pill bg-gold px-6 py-3 text-2xl font-extrabold text-gold-foreground shadow-glow-gold">
          +{amount} XP
        </div>
        {message && (
          <div className="rounded-pill bg-card px-4 py-1.5 text-sm font-bold text-foreground shadow-card">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export function FullscreenFlash({ color, onDone }: { color: "green" | "red"; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 550);
    return () => clearTimeout(t);
  }, [onDone]);
  const bg = color === "green" ? "bg-primary" : "bg-destructive";
  const anim = color === "green" ? "animate-bounce-in" : "animate-shake";
  return (
    <div className={`pointer-events-none fixed inset-0 z-40 ${bg} ${anim} opacity-85`}>
      <div className="flex h-full w-full items-center justify-center">
        <span className="text-8xl">{color === "green" ? "✨" : "💫"}</span>
      </div>
    </div>
  );
}

export function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 2 + Math.random() * 2,
      color: ["bg-primary", "bg-gold", "bg-streak", "bg-primary-light", "bg-card-warm"][i % 5],
      size: 8 + Math.random() * 10,
    }))
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`absolute top-0 ${p.color} rounded-sm`}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-out forwards`,
          }}
        />
      ))}
    </div>
  );
}
