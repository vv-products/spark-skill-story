import { useState, useEffect } from "react";

type CharId = "maya" | "leo" | "dash" | "pip";

import mayaImg from "@/assets/images/maya-world.png";
import leoImg  from "@/assets/images/leo-world.png";
import dashImg from "@/assets/images/dash-world.png";
import pipImg  from "@/assets/images/pip-world.png";

const IMGS = { maya: mayaImg, leo: leoImg, dash: dashImg, pip: pipImg };

type Character = {
  id: CharId;
  name: string;
  world: string;
  tagline: string;
  bgGradient: string;   // world background when active
  accentColor: string;  // pill / button color
  bobDelay: string;
};

const CHARACTERS: Character[] = [
  {
    id: "maya",
    name: "Maya",
    world: "Inner World",
    tagline: "Brave enough to try, strong enough to fail",
    bgGradient: "linear-gradient(160deg, #a855f7 0%, #7c3aed 100%)",
    accentColor: "#7c3aed",
    bobDelay: "0s",
  },
  {
    id: "leo",
    name: "Leo",
    world: "Social World",
    tagline: "Kind heart, learning to speak up",
    bgGradient: "linear-gradient(160deg, #f97316 0%, #e11d48 100%)",
    accentColor: "#e11d48",
    bobDelay: "0.45s",
  },
  {
    id: "dash",
    name: "Dash",
    world: "Action World",
    tagline: "Full speed ahead, learning to pause",
    bgGradient: "linear-gradient(160deg, #06b6d4 0%, #6366f1 100%)",
    accentColor: "#6366f1",
    bobDelay: "0.2s",
  },
  {
    id: "pip",
    name: "Pip",
    world: "Real World",
    tagline: "Small steps, giant leaps",
    bgGradient: "linear-gradient(160deg, #fbbf24 0%, #f97316 100%)",
    accentColor: "#f97316",
    bobDelay: "0.65s",
  },
];

// Group photo composition — all four together, overlapping naturally
// Maya (back-left), Leo (back-right), Dash (front-left), Pip (front-right)
// Positions are % of the scene container
const SCENE: Array<{
  id: CharId;
  left: string;
  width: string;
  bottom: string;
  zIndex: number;
}> = [
  { id: "maya", left: "2%",  width: "45%", bottom: "22%", zIndex: 11 },
  { id: "leo",  left: "50%", width: "48%", bottom: "22%", zIndex: 11 },
  { id: "dash", left: "0%",  width: "42%", bottom: "0%",  zIndex: 13 },
  { id: "pip",  left: "55%", width: "38%", bottom: "0%",  zIndex: 13 },
];

// Neutral sky — matches the soft top of the home screen hero
const NEUTRAL_BG = "linear-gradient(180deg, #ede9fe 0%, #f5f3ff 40%, #fef9c3 100%)";

export function MyJourney() {
  const [active, setActive] = useState<CharId | null>(null);
  // "waving" tracks which character is mid-wave animation
  const [waving, setWaving] = useState<CharId | null>(null);
  const [visible, setVisible] = useState(false);

  const activeChar = CHARACTERS.find((c) => c.id === active) ?? null;

  useEffect(() => {
    setVisible(false);
    if (active) {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [active]);

  const handleTap = (id: CharId, e: React.MouseEvent) => {
    e.stopPropagation();
    // Trigger wave on the tapped character
    setWaving(id);
    setTimeout(() => setWaving(null), 700);
    setActive((prev) => (prev === id ? null : id));
  };

  const bg = activeChar ? activeChar.bgGradient : NEUTRAL_BG;

  return (
    <div
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden select-none"
      style={{ background: bg, transition: "background 0.7s cubic-bezier(0.4,0,0.2,1)" }}
      onClick={() => setActive(null)}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; box-sizing: border-box; }

        /* Idle float */
        @keyframes bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-9px); }
        }

        /* Wave: arm-raise feeling — quick bounce + slight rotate */
        @keyframes wave {
          0%   { transform: translateY(0px)   rotate(0deg)   scale(1); }
          20%  { transform: translateY(-18px) rotate(-6deg)  scale(1.12); }
          45%  { transform: translateY(-12px) rotate(5deg)   scale(1.1); }
          65%  { transform: translateY(-20px) rotate(-4deg)  scale(1.13); }
          85%  { transform: translateY(-8px)  rotate(3deg)   scale(1.06); }
          100% { transform: translateY(0px)   rotate(0deg)   scale(1); }
        }

        /* Active idle — keeps elevated */
        @keyframes bobActive {
          0%, 100% { transform: translateY(-6px) scale(1.08); }
          50%       { transform: translateY(-14px) scale(1.08); }
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }

        .fade-down { animation: fadeDown 0.38s ease-out forwards; }
        .fade-up   { animation: fadeUp   0.42s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .scale-in  { animation: scaleIn  0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        .char-img {
          width: 100%;
          display: block;
          background: transparent;
          mix-blend-mode: multiply;
          transform-origin: bottom center;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: filter 0.45s ease, opacity 0.4s ease;
        }
        .char-img:active { opacity: 0.85; }

        /* Name pill at bottom */
        .name-pill {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          border-radius: 999px;
          padding: 3px 12px;
          font-size: 11px;
          font-weight: 800;
          color: white;
          pointer-events: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }

        .cta-btn {
          border: 2px solid rgba(255,255,255,0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .cta-btn:active {
          transform: scale(0.96) !important;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="relative z-30 px-6 pt-10 text-center">
        {activeChar ? (
          <div key={activeChar.id + "-active"} className="fade-down">
            <h1 className="text-[1.9rem] font-black leading-tight text-white drop-shadow-md">
              {activeChar.world}
            </h1>
            <p className="mt-1 text-sm font-semibold text-white/80">
              {activeChar.tagline}
            </p>
          </div>
        ) : (
          <div key="neutral" className="fade-down">
            <h1 className="text-[1.9rem] font-black text-violet-900">
              My Journey
            </h1>
            <p className="mt-1 text-sm font-semibold text-violet-400">
              Tap a character to explore their world
            </p>
          </div>
        )}
      </div>

      {/* ── Group photo scene ── */}
      <div className="relative z-10 flex flex-1 items-end justify-center pb-28">
        <div
          className="relative w-full"
          style={{ maxWidth: 440, height: "62vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {SCENE.map((s) => {
            const char = CHARACTERS.find((c) => c.id === s.id)!;
            const isActive = active === s.id;
            const isDimmed = active !== null && !isActive;
            const isWaving = waving === s.id;

            // Animation priority: wave > active bob > idle bob > none (dimmed)
            let animStyle = "";
            if (isWaving) {
              animStyle = `wave 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards`;
            } else if (isActive) {
              animStyle = `bobActive 2.4s ease-in-out ${char.bobDelay} infinite`;
            } else if (!isDimmed) {
              animStyle = `bob 2.8s ease-in-out ${char.bobDelay} infinite`;
            }

            return (
              <div
                key={s.id}
                style={{
                  position: "absolute",
                  left: s.left,
                  bottom: s.bottom,
                  width: s.width,
                  zIndex: isActive ? 20 : s.zIndex,
                }}
              >
                <img
                  src={IMGS[s.id]}
                  alt={char.name}
                  className="char-img"
                  draggable={false}
                  style={{
                    filter: isDimmed
                      ? "grayscale(1) brightness(0.52)"
                      : isActive
                        ? `drop-shadow(0 4px 24px rgba(255,255,255,0.5)) brightness(1.05)`
                        : "none",
                    opacity: isDimmed ? 0.55 : 1,
                    animation: animStyle,
                  }}
                  onClick={(e) => handleTap(s.id, e)}
                />

                {/* Name pill — always visible */}
                <div
                  className="name-pill"
                  style={{
                    background: isDimmed
                      ? "rgba(120,120,120,0.6)"
                      : char.accentColor,
                    opacity: isDimmed ? 0.5 : 1,
                    transition: "background 0.4s ease, opacity 0.4s ease",
                  }}
                >
                  {char.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CTA button (active state only) ── */}
      {activeChar && visible && (
        <div
          className="absolute inset-x-0 bottom-8 z-30 flex justify-center fade-up"
        >
          <button
            type="button"
            className="cta-btn rounded-full px-8 py-4 text-base font-black text-white shadow-2xl"
            style={{ background: "rgba(255,255,255,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            Explore {activeChar.name}'s {activeChar.world} →
          </button>
        </div>
      )}

      {/* ── Bottom hint (neutral state) ── */}
      {!active && (
        <div
          className="absolute bottom-8 left-0 right-0 z-20 flex justify-center scale-in"
        >
          <div
            className="rounded-full px-5 py-2 text-xs font-bold text-violet-500 shadow-sm"
            style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}
          >
            👆 Tap any character
          </div>
        </div>
      )}
    </div>
  );
}

export default MyJourney;