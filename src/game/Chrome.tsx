import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Map, BarChart3, Users, Settings } from "lucide-react";
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
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{autoRead ? "On" : "Off"}</span>
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
            <span className="text-[11px] font-bold text-text-secondary">The Happy Stall</span>
          </div>
          <div className="mt-1.5 flex gap-1.5">
            {Array.from({ length: totalLayers }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-pill transition-all ${i < layer ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type NavTo = "/" | "/journey" | "/profile" | "/studio" | "/club";
const NAV_ITEMS: Array<{
  icon: typeof Home;
  label: string;
  to: NavTo;
}> = [
  { icon: Home, label: "My World", to: "/" },
  { icon: Map, label: "My Journey", to: "/journey" },
  { icon: BarChart3, label: "My Growth", to: "/profile" },
  { icon: Users, label: "Sementa Club", to: "/club" },
  { icon: Settings, label: "Settings", to: "/studio" },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/30 bg-gradient-to-r from-[#EFEAFB]/70 via-white/60 to-[#FCE9F0]/70 backdrop-blur-xl backdrop-saturate-150 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 px-2 pt-2 pb-2">
        {NAV_ITEMS.map((it, idx) => {
          // Active when pathname matches; for duplicate targets (My Growth + Sementa
          // Club both → /profile) only the first one lights up.
          const matches = it.to === "/" ? pathname === "/" : pathname === it.to || pathname.startsWith(it.to + "/");
          const firstMatchIdx = NAV_ITEMS.findIndex((n) =>
            n.to === "/" ? pathname === "/" : pathname === n.to || pathname.startsWith(n.to + "/"),
          );
          const active = matches && idx === firstMatchIdx;
          const Icon = it.icon;
          return (
            <Link
              key={it.label}
              to={it.to}
              className="flex flex-col items-center justify-center gap-1.5 py-1 transition-transform active:scale-95"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                  active ? "bg-primary text-primary-foreground shadow-pop" : "bg-white text-foreground/70 shadow-sm"
                }`}
              >
                <Icon size={20} strokeWidth={2.25} />
              </span>
              <span
                className={`text-[10.5px] font-extrabold leading-none ${
                  active ? "text-primary" : "text-text-secondary"
                }`}
              >
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
