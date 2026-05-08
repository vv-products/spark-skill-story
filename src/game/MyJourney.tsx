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
  pillar: string;
  tagline: string;
  bgStart: string;
  bgEnd: string;
  placeholder: string;
  bobDelay: string;
};

const CHARACTERS: Character[] = [
  {
    id: "maya",
    name: "Maya",
    world: "Inner World",
    pillar: "Pillar 1 · Self-Mastery & Resilience",
    tagline: "Brave enough to try, strong enough to fail",
    bgStart: "#6ee7b7",
    bgEnd: "#059669",
    placeholder: "👧",
    bobDelay: "0s",
  },
  {
    id: "leo",
    name: "Leo",
    world: "Social World",
    pillar: "Pillar 2 · Relationships & Communication",
    tagline: "Kind heart, finding his voice",
    bgStart: "#fda4af",
    bgEnd: "#e11d48",
    placeholder: "👦",
    bobDelay: "0.5s",
  },
  {
    id: "dash",
    name: "Dash",
    world: "Action World",
    pillar: "Pillar 3 · Decisions & Problem Solving",
    tagline: "Full speed ahead, learning to pause",
    bgStart: "#c4b5fd",
    bgEnd: "#7c3aed",
    placeholder: "🐕",
    bobDelay: "0.25s",
  },
  {
    id: "pip",
    name: "Pip",
    world: "Real World",
    pillar: "Pillar 4 · Leadership & Future Readiness",
    tagline: "Small steps, giant leaps",
    bgStart: "#fde68a",
    bgEnd: "#d97706",
    placeholder: "🐱",
    bobDelay: "0.75s",
  },
];

// Back row: Maya (left) + Leo (right) — taller, pushed up
// Front row: Dash (front-left) + Pip (front-right) — smaller, sit lower
// All positions relative to a fixed-height scene container
const SCENE: Array<{ id: CharId; left: string; width: string; bottom: string; zIndex: number }> = [
  { id: "maya", left: "0%",   width: "50%", bottom: "18%", zIndex: 11 },
  { id: "leo",  left: "48%",  width: "52%", bottom: "18%", zIndex: 11 },
  { id: "dash", left: "0%",   width: "44%", bottom: "0%",  zIndex: 13 },
  { id: "pip",  left: "54%",  width: "40%", bottom: "0%",  zIndex: 13 },
];

const NEUTRAL_BG = "linear-gradient(160deg, #bae6fd 0%, #dbeafe 50%, #fef9c3 100%)";

export function MyJourney() {
  const [active, setActive] = useState<CharId | null>(null);
  const [visible, setVisible] = useState(false);
  const activeChar = CHARACTERS.find((c) => c.id === active) ?? null;

  useEffect(() => {
    setVisible(false);
    if (active) {
      const t = setTimeout(() => setVisible(true), 60);
      return () => clearTimeout(t);
    }
  }, [active]);

  const bg = activeChar
    ? `linear-gradient(160deg, ${activeChar.bgStart} 0%, ${activeChar.bgEnd} 100%)`
    : NEUTRAL_BG;

  return (
    <div
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden select-none"
      style={{ background: bg, transition: "background 0.65s ease" }}
      onClick={() => setActive(null)}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; box-sizing: border-box; }

        @keyframes bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes bobActive {
          0%, 100% { transform: translateY(-8px) scale(1.1); }
          50%       { transform: translateY(-18px) scale(1.1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUpCenter {
          from { opacity: 0; transform: translateY(22px) translateX(-50%); }
          to   { opacity: 1; transform: translateY(0)    translateX(-50%); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0px rgba(255,255,255,0.6); }
          50%       { box-shadow: 0 0 0 10px rgba(255,255,255,0); }
        }

        .fade-up     { animation: fadeUp     0.45s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .fade-down   { animation: fadeDown   0.38s ease-out forwards; }
        .name-badge  { animation: fadeUpCenter 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards,
                                  glowPulse 2.4s ease-in-out 0.45s infinite; }

        .char-wrap {
          width: 100%;
          cursor: pointer;
          transform-origin: bottom center;
          -webkit-tap-highlight-color: transparent;
          transition: filter 0.5s ease, opacity 0.4s ease;
        }
        .char-wrap:active { filter: brightness(1.15) !important; }

        .char-img {
          width: 100%;
          display: block;
          background: transparent;
          mix-blend-mode: multiply;
        }

        .char-placeholder {
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(2.5rem, 10vw, 5rem);
        }
      `}</style>

      {/* ── Header ── */}
      <div className="relative z-30 px-6 pt-10 text-center">
        {activeChar ? (
          <div key={activeChar.id + "-h"} className="fade-down">
            <span
              className="mb-1 inline-block rounded-full px-4 py-0.5 text-[11px] font-extrabold uppercase tracking-widest"
              style={{ background: "rgba(255,255,255,0.25)", color: "white" }}
            >
              {activeChar.pillar}
            </span>
            <h1 className="text-[2rem] font-black leading-tight text-white drop-shadow-md">
              {activeChar.world}
            </h1>
            <p className="mt-1 text-sm font-bold text-white/80">{activeChar.tagline}</p>
          </div>
        ) : (
          <div key="neutral-h" className="fade-down">
            <h1 className="text-[2rem] font-black text-slate-800">My Journey</h1>
            <p className="mt-1 text-sm font-bold text-slate-500">
              Tap a character to explore their world
            </p>
          </div>
        )}
      </div>

      {/* ── Scene ── */}
      <div className="relative z-10 flex flex-1 items-end justify-center pb-24">
        <div
          className="relative w-full"
          style={{ maxWidth: 420, height: "60vh", position: "relative" }}
          onClick={(e) => e.stopPropagation()}
        >
          {SCENE.map((s) => {
            const char = CHARACTERS.find((c) => c.id === s.id)!;
            const isActive = active === s.id;
            const isDimmed = active !== null && !isActive;
            const img = IMGS[s.id];

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
                {/* Name badge */}
                {isActive && visible && (
                  <div
                    className="name-badge pointer-events-none absolute rounded-2xl px-4 py-2 shadow-xl"
                    style={{
                      bottom: "calc(100% + 8px)",
                      left: "50%",
                      background: "rgba(255,255,255,0.92)",
                      border: `2px solid ${char.bgStart}`,
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  >
                    <p className="text-center text-sm font-black leading-tight" style={{ color: char.bgEnd }}>
                      {char.name}
                    </p>
                    <p className="mt-0.5 text-center text-[10px] font-bold text-slate-500">
                      {char.world}
                    </p>
                  </div>
                )}

                {/* Character image or placeholder */}
                <div
                  className="char-wrap"
                  style={{
                    filter: isDimmed
                      ? "grayscale(1) brightness(0.55)"
                      : isActive
                      ? `drop-shadow(0 0 20px ${char.bgStart}cc) brightness(1.06)`
                      : "none",
                    opacity: isDimmed ? 0.6 : 1,
                    animation: !isDimmed
                      ? isActive
                        ? `bobActive 2.2s ease-in-out ${char.bobDelay} infinite`
                        : `bob 2.8s ease-in-out ${char.bobDelay} infinite`
                      : "none",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive((prev) => (prev === s.id ? null : s.id));
                  }}
                >
                  {img ? (
                    <img src={img} alt={char.name} className="char-img" draggable={false} />
                  ) : (
                    <div
                      className="char-placeholder"
                      style={{
                        background: `linear-gradient(135deg, ${char.bgStart}, ${char.bgEnd})`,
                        boxShadow: isActive
                          ? `0 8px 32px ${char.bgStart}88`
                          : "0 4px 16px rgba(0,0,0,0.15)",
                      }}
                    >
                      {char.placeholder}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CTA button ── */}
      {activeChar && visible && (
        <div
          className="absolute inset-x-0 bottom-7 z-30 flex justify-center fade-up"
          style={{ animationDelay: "0.1s", opacity: 0 }}
        >
          <button
            type="button"
            className="rounded-full px-8 py-4 text-base font-black text-white shadow-2xl active:scale-95"
            style={{
              background: "rgba(255,255,255,0.22)",
              border: "2px solid rgba(255,255,255,0.6)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              transition: "transform 0.15s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            Enter {activeChar.name}'s {activeChar.world} →
          </button>
        </div>
      )}

      {/* ── Neutral name pills ── */}
      {!active && (
        <div className="absolute bottom-7 left-0 right-0 z-20 flex justify-center gap-3">
          {CHARACTERS.map((c) => (
            <button
              key={c.id + "-pill"}
              type="button"
              onClick={(e) => { e.stopPropagation(); setActive(c.id); }}
              className="rounded-full px-3 py-1.5 text-xs font-extrabold text-white shadow-md active:scale-95"
              style={{ background: c.bgEnd, opacity: 0.88, transition: "transform 0.15s ease" }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyJourney;