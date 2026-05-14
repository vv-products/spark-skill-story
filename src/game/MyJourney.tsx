import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";

type CharId = "maya" | "leo" | "dash" | "pip";

const PILLAR_SLUG: Record<CharId, "inner" | "social" | "action" | "real"> = {
  maya: "inner",
  leo: "social",
  dash: "action",
  pip: "real",
};

import mayaImg from "@/assets/images/maya-world.png";
import leoImg  from "@/assets/images/leo-world.png";
import dashImg from "@/assets/images/dash-world.png";
import pipImg  from "@/assets/images/pip-world.png";
import bgImg   from "@/assets/images/scene-bg.png";

const BG_IMG: string = bgImg;

const IMGS: Record<CharId, string> = {
  maya: mayaImg,
  leo:  leoImg,
  dash: dashImg,
  pip:  pipImg,
};

type Character = {
  id: CharId;
  name: string;
  world: string;
  tagline: string;
  accentColor: string;
  glowColor: string;
  bobDelay: string;
};

const CHARACTERS: Character[] = [
  {
    id: "maya",
    name: "Maya",
    world: "Inner World",
    tagline: "Brave enough to try, strong enough to fail",
    accentColor: "#7c3aed",
    glowColor: "rgba(167,139,250,0.7)",
    bobDelay: "0s",
  },
  {
    id: "leo",
    name: "Leo",
    world: "Social World",
    tagline: "Kind heart, learning to speak up",
    accentColor: "#e11d48",
    glowColor: "rgba(251,113,133,0.7)",
    bobDelay: "0.5s",
  },
  {
    id: "dash",
    name: "Dash",
    world: "Action World",
    tagline: "Full speed ahead, learning to pause",
    accentColor: "#6366f1",
    glowColor: "rgba(129,140,248,0.7)",
    bobDelay: "0.25s",
  },
  {
    id: "pip",
    name: "Pip",
    world: "Real World",
    tagline: "Small steps, giant leaps",
    accentColor: "#f97316",
    glowColor: "rgba(251,191,36,0.7)",
    bobDelay: "0.7s",
  },
];

// ─── TUNED SCENE LAYOUT ──────────────────────────────────────────────────────
// Based on screenshot feedback:
//   • Pip: smaller (cat on bench, back-left)
//   • Leo: larger, more visible behind Dash
//   • Maya: larger, right side
//   • Dash: centered front
//
// footOffset: how much empty transparent space is at the bottom of each PNG.
// This shifts the name pill to sit at the actual character's feet.
// Positions are in % of the scene wrapper, which has the SAME aspect ratio
// as scene-bg.png (848×1264). One calibration → matches at every viewport.
const SCENE: Array<{
  id: CharId;
  left: string;
  width: string;
  bottom: string;
  zIndex: number;
  footOffset: string;
  // Approximate visible body center as % of the scene box.
  // Used by the scene's click handler to pick the nearest character,
  // since transparent PNG bboxes overlap heavily.
  bodyCenter: { x: number; y: number };
}> = [
  { id: "pip",  left: "10%",  width: "18%", bottom: "38%", zIndex: 10, footOffset: "0px",
    bodyCenter: { x: 18, y: 58 } },
  { id: "leo",  left: "26%",  width: "47%", bottom: "2%",  zIndex: 11, footOffset: "12px",
    bodyCenter: { x: 38, y: 48 } },
  { id: "maya", left: "61%",  width: "57%", bottom: "2%",  zIndex: 11, footOffset: "12px",
    bodyCenter: { x: 70, y: 48 } },
  { id: "dash", left: "44%",  width: "45%", bottom: "0%",  zIndex: 14, footOffset: "0px",
    bodyCenter: { x: 56, y: 78 } },
];
// Note: tune footOffset per-character (e.g. "24px") if name pills
// appear mid-body due to transparent padding at bottom of PNG.

export function MyJourney() {
  const [active, setActive] = useState<CharId | null>(null);
  const [bouncing, setBouncing] = useState<CharId | null>(null);
  const [visible, setVisible] = useState(false);

  const activeChar = CHARACTERS.find((c) => c.id === active) ?? null;

  useEffect(() => {
    setVisible(false);
    if (active) {
      const t = setTimeout(() => setVisible(true), 60);
      return () => clearTimeout(t);
    }
  }, [active]);

  const triggerTap = (id: CharId) => {
    setBouncing(id);
    setTimeout(() => setBouncing(null), 520);
    setActive((prev) => (prev === id ? null : id));
  };

  // Pick the character whose body center is nearest to the click point
  // (in % of the scene box). Avoids transparent-PNG bbox overlap issues.
  const handleSceneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    let best: { id: CharId; d: number } | null = null;
    for (const s of SCENE) {
      const dx = x - s.bodyCenter.x;
      const dy = y - s.bodyCenter.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (!best || d < best.d) best = { id: s.id, d };
    }
    if (best && best.d < 22) triggerTap(best.id);
    else setActive(null);
  };

  return (
    <div
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden select-none"
      onClick={() => setActive(null)}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; box-sizing: border-box; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes floatActive {
          0%, 100% { transform: translateY(-3px) scale(1.06); }
          50%       { transform: translateY(-11px) scale(1.06); }
        }
        @keyframes bounce {
          0%   { transform: translateY(0px)   scale(1);    }
          28%  { transform: translateY(-22px) scale(1.07); }
          52%  { transform: translateY(-7px)  scale(1.03); }
          72%  { transform: translateY(-15px) scale(1.05); }
          100% { transform: translateY(0px)   scale(1);    }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes riseUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fade-down { animation: fadeDown 0.35s ease-out forwards; }
        .rise-up   { animation: riseUp  0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        .char-img {
          width: 100%;
          display: block;
          background: transparent;
          transform-origin: bottom center;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: filter 0.45s ease, opacity 0.4s ease;
          user-select: none;
          -webkit-user-drag: none;
        }

        .name-pill {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          border-radius: 999px;
          padding: 3px 11px;
          font-size: 11px;
          font-weight: 900;
          color: white;
          pointer-events: none;
          letter-spacing: 0.03em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: background 0.4s ease, opacity 0.4s ease, transform 0.3s ease;
        }

        .cta-btn {
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 2px solid rgba(255,255,255,0.65);
          transition: transform 0.15s ease;
        }
        .cta-btn:active { transform: scale(0.95) !important; }
      `}</style>

      {/* Backdrop fill behind the scene box */}
      <div className="absolute inset-0 z-0 bg-background" />

      {/* Dark gradient at top for header legibility */}
      <div
        className="absolute inset-x-0 top-0 z-30 pointer-events-none"
        style={{
          height: "22%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, transparent 100%)",
        }}
      />

      {/* Colour tint overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: activeChar ? activeChar.glowColor : "transparent",
          opacity: active ? 0.22 : 0,
          transition: "opacity 0.55s ease, background 0.55s ease",
          mixBlendMode: "soft-light",
        }}
      />

      {/* ── Header ── */}
      <div className="relative z-30 px-6 pt-10 text-center">
        {activeChar ? (
          <div key={activeChar.id + "-hdr"} className="fade-down">
            <h1
              className="text-[2rem] font-black leading-tight"
              style={{ color: "white", textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}
            >
              {activeChar.world}
            </h1>
            <p
              className="mt-1 text-[0.82rem] font-semibold"
              style={{ color: "rgba(255,255,255,0.92)", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
            >
              {activeChar.tagline}
            </p>
          </div>
        ) : (
          <div key="neutral-hdr" className="fade-down">
            <h1
              className="text-[2rem] font-black"
              style={{ color: "white", textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}
            >
              My Journey
            </h1>
            <p
              className="mt-1 text-[0.82rem] font-semibold"
              style={{ color: "rgba(255,255,255,0.88)", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
            >
              Tap a character to explore their world
            </p>
          </div>
        )}
      </div>

      {/* ── Scene (BG + characters share one coordinate system) ── */}
      <div className="relative z-20 flex flex-1 items-end justify-center pb-24">
        <div
          className="relative mx-auto h-full w-auto max-h-[78dvh]"
          style={{ aspectRatio: "848 / 1264" }}
          onClick={handleSceneClick}
        >
          {/* Background image — same box as characters */}
          <img
            src={BG_IMG}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover rounded-2xl"
            style={{
              transition: "filter 0.55s ease",
              filter: active ? "brightness(0.45) blur(3px)" : "brightness(1) blur(0px)",
            }}
          />

          {SCENE.map((s) => {
            const char = CHARACTERS.find((c) => c.id === s.id)!;
            const isActive   = active === s.id;
            const isDimmed   = active !== null && !isActive;
            const isBouncing = bouncing === s.id;

            let anim = "";
            if (isBouncing) {
              anim = "bounce 0.52s cubic-bezier(0.34,1.56,0.64,1) forwards";
            } else if (isActive) {
              anim = `floatActive 2.6s ease-in-out ${char.bobDelay} infinite`;
            } else if (!isDimmed) {
              anim = `float 3s ease-in-out ${char.bobDelay} infinite`;
            }

            return (
              <div
                key={s.id}
                style={{
                  position: "absolute",
                  left: s.left,
                  bottom: s.bottom,
                  width: s.width,
                  zIndex: isActive ? 22 : s.zIndex,
                }}
              >
                <img
                  src={IMGS[s.id]}
                  alt={char.name}
                  className="char-img"
                  draggable={false}
                  style={{
                    filter: isDimmed
                      ? "grayscale(0.9) brightness(0.35)"
                      : isActive
                        ? `drop-shadow(0 0 30px ${char.glowColor}) drop-shadow(0 8px 16px rgba(0,0,0,0.3)) brightness(1.08)`
                        : "drop-shadow(0 4px 10px rgba(0,0,0,0.25))",
                    opacity: isDimmed ? 0.4 : 1,
                    animation: anim,
                  }}
                  onClick={(e) => handleTap(s.id, e)}
                />

                {/* Name pill — positioned at feet using footOffset */}
                <div
                  className="name-pill"
                  style={{
                    bottom: s.footOffset,
                    background: isDimmed ? "rgba(60,60,60,0.55)" : char.accentColor,
                    opacity: isDimmed ? 0.35 : 1,
                    transform: isActive
                      ? "translateX(-50%) scale(1.12)"
                      : "translateX(-50%) scale(1)",
                  }}
                >
                  {char.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CTA ── */}
      {activeChar && visible && (
        <div className="absolute inset-x-0 bottom-28 z-30 flex justify-center rise-up lg:bottom-8">
          <Link
            to="/world/$slug"
            params={{ slug: PILLAR_SLUG[activeChar.id] }}
            className="cta-btn rounded-full px-8 py-4 text-[0.95rem] font-black text-white shadow-2xl"
            style={{ background: `${activeChar.accentColor}dd` }}
            onClick={(e) => e.stopPropagation()}
          >
            Explore {activeChar.name}'s {activeChar.world} →
          </Link>
        </div>
      )}

      {/* ── Neutral hint ── */}
      {!active && (
        <div className="absolute bottom-28 left-0 right-0 z-20 flex justify-center lg:bottom-8">
          <div
            className="rounded-full px-5 py-2 text-xs font-bold text-white shadow-md"
            style={{
              background: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            👆 Tap any character
          </div>
        </div>
      )}
    </div>
  );
}

export default MyJourney;