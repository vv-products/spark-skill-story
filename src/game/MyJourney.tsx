import { useState } from "react";

type CharId = "maya" | "leo" | "dash" | "pip";

type Character = {
  id: CharId;
  name: string;
  emoji: string;
  world: string;
  place: string;
  placeEmoji: string;
  portal: string; // tailwind gradient classes
  cta: string;
};

const CHARACTERS: Character[] = [
  {
    id: "maya",
    name: "Maya",
    emoji: "🦊",
    world: "Inner World",
    place: "Treehouse",
    placeEmoji: "🌳",
    portal: "from-emerald-300 via-teal-400 to-emerald-600",
    cta: "bg-emerald-500 hover:bg-emerald-600",
  },
  {
    id: "leo",
    name: "Leo",
    emoji: "🐻",
    world: "Social World",
    place: "Village",
    placeEmoji: "🏘️",
    portal: "from-rose-300 via-orange-400 to-rose-600",
    cta: "bg-rose-500 hover:bg-rose-600",
  },
  {
    id: "dash",
    name: "Dash",
    emoji: "🐰",
    world: "Action World",
    place: "Lab",
    placeEmoji: "🧪",
    portal: "from-violet-300 via-fuchsia-400 to-violet-600",
    cta: "bg-violet-500 hover:bg-violet-600",
  },
  {
    id: "pip",
    name: "Pip",
    emoji: "🦉",
    world: "Real World",
    place: "Marketplace",
    placeEmoji: "🛒",
    portal: "from-amber-300 via-yellow-400 to-amber-600",
    cta: "bg-amber-500 hover:bg-amber-600",
  },
];

const ELASTIC = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export function MyJourney() {
  const [active, setActive] = useState<CharId | null>(null);
  const activeChar = CHARACTERS.find((c) => c.id === active) ?? null;

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-sky-200 via-indigo-100 to-amber-50"
      onClick={() => setActive(null)}
    >
      <style>{`
        @keyframes journey-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes journey-portal-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>

      {/* Expanding active portal — full-screen background */}
      {activeChar && (
        <div
          className={`pointer-events-none fixed left-1/2 top-1/2 z-0 aspect-square w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br opacity-95 ${activeChar.portal}`}
          style={{
            transform: "translate(-50%, -50%) scale(400)",
            transition: `transform 900ms ${ELASTIC}, opacity 600ms ease-out`,
          }}
        />
      )}

      {/* Header */}
      <header className="relative z-30 px-6 pt-8 text-center">
        <h1
          className="text-3xl font-extrabold tracking-tight text-slate-800 transition-colors duration-500"
          style={{ color: activeChar ? "white" : undefined }}
        >
          My Journey
        </h1>
        <p
          className="mt-1 text-sm font-medium text-slate-600 transition-colors duration-500"
          style={{ color: activeChar ? "rgba(255,255,255,0.85)" : undefined }}
        >
          Pick a guide to explore their world
        </p>
      </header>

      {/* Character row */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-around px-2 pb-24 sm:pb-32">
        {CHARACTERS.map((c, i) => {
          const isActive = active === c.id;
          const isDimmed = active !== null && !isActive;

          return (
            <button
              key={c.id}
              type="button"
              aria-label={`Choose ${c.name}, guide of the ${c.world}`}
              aria-pressed={isActive}
              onClick={(e) => {
                e.stopPropagation();
                setActive(isActive ? null : c.id);
              }}
              className="group relative flex flex-col items-center focus:outline-none"
              style={{
                transition: `transform 600ms ${ELASTIC}, filter 400ms ease, opacity 400ms ease`,
                transform: isActive
                  ? "scale(1.35) translateY(-24px)"
                  : isDimmed
                    ? "scale(0.78)"
                    : "scale(1)",
                filter: isDimmed ? "grayscale(1)" : "none",
                opacity: isDimmed ? 0.55 : 1,
                zIndex: isActive ? 30 : 10,
              }}
            >
              {/* Per-character portal disc */}
              <div
                className={`absolute -z-10 rounded-full bg-gradient-to-br ${c.portal} shadow-[0_8px_30px_rgba(0,0,0,0.25)]`}
                style={{
                  width: 130,
                  height: 130,
                  top: -18,
                  filter: "blur(1px)",
                  opacity: active && !isActive ? 0.4 : 0.95,
                  transition: "opacity 400ms ease",
                }}
              >
                <div className="flex h-full w-full items-center justify-center text-4xl opacity-80">
                  {c.placeEmoji}
                </div>
              </div>

              {/* Character */}
              <div
                className="text-6xl drop-shadow-[0_6px_8px_rgba(0,0,0,0.25)] sm:text-7xl"
                style={{
                  animation: `journey-bob 2.8s ease-in-out ${i * 0.35}s infinite`,
                }}
              >
                {c.emoji}
              </div>

              {/* Name plate (neutral) */}
              {!active && (
                <span className="mt-2 rounded-full bg-white/80 px-3 py-0.5 text-xs font-bold text-slate-700 shadow-sm">
                  {c.name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active badge */}
      {activeChar && (
        <div
          className="pointer-events-none absolute left-1/2 top-24 z-40 -translate-x-1/2 animate-fade-in"
          key={activeChar.id + "-badge"}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="rounded-full bg-white/95 px-5 py-2 text-lg font-extrabold text-slate-800 shadow-lg">
              {activeChar.name}
            </span>
            <span className="rounded-full bg-black/30 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
              {activeChar.placeEmoji} {activeChar.world} · {activeChar.place}
            </span>
          </div>
        </div>
      )}

      {/* CTA */}
      {activeChar && (
        <div className="absolute inset-x-0 bottom-6 z-40 flex justify-center animate-fade-in">
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className={`rounded-full px-8 py-4 text-base font-extrabold text-white shadow-xl transition-transform hover:scale-105 active:scale-95 ${activeChar.cta}`}
          >
            Enter the {activeChar.place} →
          </button>
        </div>
      )}
    </div>
  );
}

export default MyJourney;
