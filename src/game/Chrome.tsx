import { useGame } from "./GameContext";

export function TopBar({ layer, totalLayers }: { layer?: number; totalLayers?: number }) {
  const { xp, totalXp, level, streak } = useGame();
  const pct = Math.min(100, (xp / totalXp) * 100);

  return (
    <div className="sticky top-0 z-20 bg-background/85 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1.5 ring-1 ring-gold/30">
          <span className="text-base">⭐</span>
          <span className="text-xs font-extrabold text-foreground">{level}</span>
        </div>

        <div className="flex flex-1 items-center gap-2">
          <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-coral transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-bold tabular-nums text-muted-foreground">
            {xp}/{totalXp}
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-coral/15 px-2.5 py-1.5 ring-1 ring-coral/30">
          <span className="text-base">🔥</span>
          <span className="text-xs font-extrabold text-foreground">Day {streak}</span>
        </div>
      </div>

      {layer && totalLayers && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Layer {layer} of {totalLayers}
            </span>
            <span className="text-[11px] font-bold text-muted-foreground">
              The Happy Stall
            </span>
          </div>
          <div className="mt-1.5 flex gap-1.5">
            {Array.from({ length: totalLayers }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < layer ? "bg-gold" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BottomNav() {
  const items = [
    { icon: "🏠", label: "Home", active: true },
    { icon: "🌱", label: "My Growth" },
    { icon: "🎯", label: "Challenges" },
    { icon: "🎁", label: "Rewards" },
  ];
  return (
    <div className="sticky bottom-0 z-20 mt-auto border-t border-border bg-card/95 backdrop-blur-md">
      <div className="grid grid-cols-4 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {items.map((it) => (
          <button
            key={it.label}
            className={`flex flex-col items-center gap-0.5 rounded-2xl py-2 transition-all active:scale-95 ${
              it.active ? "text-gold" : "text-muted-foreground"
            }`}
          >
            <span className="text-2xl">{it.icon}</span>
            <span className="text-[10px] font-bold">{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
