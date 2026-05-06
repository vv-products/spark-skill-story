import { useGame } from "./GameContext";

export function TopBar({ layer, totalLayers }: { layer?: number; totalLayers?: number }) {
  const { xp, totalXp, level, streak, autoRead, setAutoRead } = useGame();
  const pct = Math.min(100, (xp / totalXp) * 100);
  const showReadToggle = level === "Explorer";

  return (
    <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <div className="flex items-center gap-1.5 rounded-pill bg-card px-3 py-1.5 shadow-card">
          <span className="text-base">⭐</span>
          <span className="text-xs font-extrabold text-foreground">{level}</span>
        </div>

        <div className="flex flex-1 items-center gap-2">
          <div className="relative h-2.5 flex-1 overflow-hidden rounded-pill bg-muted">
            <div
              className="h-full rounded-pill bg-primary transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] font-bold tabular-nums text-text-secondary">
            {xp}/{totalXp}
          </span>
        </div>

        {showReadToggle && (
          <button
            type="button"
            onClick={() => setAutoRead(!autoRead)}
            aria-pressed={autoRead}
            title={autoRead ? "Auto read aloud: On" : "Auto read aloud: Off"}
            className={`flex items-center gap-1 rounded-pill px-2.5 py-1.5 shadow-card transition-colors ${
              autoRead ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
            }`}
          >
            <span className="text-base">{autoRead ? "🔊" : "🔈"}</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider">
              {autoRead ? "On" : "Off"}
            </span>
          </button>
        )}

        <div className="flex items-center gap-1 rounded-pill bg-card px-3 py-1.5 shadow-card">
          <span className="text-base">🔥</span>
          <span className="text-xs font-extrabold text-streak">Day {streak}</span>
        </div>
      </div>

      {layer && totalLayers && (
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Layer {layer} of {totalLayers}
            </span>
            <span className="text-[11px] font-bold text-text-secondary">
              The Happy Stall
            </span>
          </div>
          <div className="mt-1.5 flex gap-1.5">
            {Array.from({ length: totalLayers }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-pill transition-all ${
                  i < layer ? "bg-primary" : "bg-muted"
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
    <div
      className="sticky bottom-0 z-20 mt-auto border-t border-border bg-card"
      style={{ height: "calc(72px + env(safe-area-inset-bottom))" }}
    >
      <div className="grid h-[72px] grid-cols-4 px-2">
        {items.map((it) => (
          <button
            key={it.label}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl py-1 transition-all active:scale-95"
          >
            {it.active ? (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xl text-primary-foreground shadow-pop">
                {it.icon}
              </span>
            ) : (
              <span className="text-2xl opacity-60 grayscale">{it.icon}</span>
            )}
            <span className={`text-[10px] font-extrabold ${it.active ? "text-primary" : "text-[#999999]"}`}>
              {it.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
