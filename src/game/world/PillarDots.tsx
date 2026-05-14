import { Link } from "@tanstack/react-router";
import { PILLAR_ORDER, PILLAR_THEMES, type PillarSlug } from "../pillarTheme";

export function PillarDots({ active }: { active: PillarSlug }) {
  return (
    <div className="flex items-center gap-2">
      {PILLAR_ORDER.map((slug) => {
        const t = PILLAR_THEMES[slug];
        const isActive = slug === active;
        return (
          <Link
            key={slug}
            to="/world/$slug"
            params={{ slug }}
            className="relative flex h-7 items-center gap-1.5 rounded-full bg-white/80 px-2 shadow-sm backdrop-blur transition-all hover:scale-105"
            style={isActive ? { outline: `2px solid ${t.accent}`, outlineOffset: 1 } : undefined}
            title={t.world}
          >
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: t.accent }}
              aria-hidden
            />
            {isActive && (
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: t.accent }}>
                {t.name}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
