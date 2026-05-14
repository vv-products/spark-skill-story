import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Lock } from "lucide-react";
import { loadFullCatalog, type HPillar, type HTopic } from "@/studio/catalog";
import { loadUserProgress, type UserProgress } from "./progress";
import { usePlayerAuth } from "./PlayerAuth";
import {
  isTopicUnlocked,
  isModuleUnlocked,
  topicProgress,
  moduleProgress,
  nextClassInModule,
} from "./unlocks";

const EMPTY: UserProgress = {
  totalXp: 0,
  completedClassIds: new Set(),
  perClass: new Map(),
  streakDays: 0,
};

const PILLAR_THEME: Record<string, { accent: string; glow: string; world: string; tagline: string }> = {
  inner: { accent: "#7c3aed", glow: "rgba(167,139,250,0.25)", world: "Inner World", tagline: "Brave enough to try, strong enough to fail" },
  social: { accent: "#e11d48", glow: "rgba(251,113,133,0.25)", world: "Social World", tagline: "Kind heart, learning to speak up" },
  action: { accent: "#6366f1", glow: "rgba(129,140,248,0.25)", world: "Action World", tagline: "Full speed ahead, learning to pause" },
  real: { accent: "#f97316", glow: "rgba(251,191,36,0.25)", world: "Real World", tagline: "Small steps, giant leaps" },
};

export function WorldPage({ pillarSlug }: { pillarSlug: string }) {
  const { user } = usePlayerAuth();
  const navigate = useNavigate();
  const [pillars, setPillars] = useState<HPillar[]>([]);
  const [progress, setProgress] = useState<UserProgress>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  useEffect(() => {
    loadFullCatalog().then((p) => { setPillars(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    loadUserProgress(user.id).then(setProgress).catch(() => setProgress(EMPTY));
  }, [user]);

  const pillar = useMemo(() => pillars.find((p) => p.slug === pillarSlug) ?? null, [pillars, pillarSlug]);
  const theme = PILLAR_THEME[pillarSlug] ?? PILLAR_THEME.inner;
  const selectedTopic = useMemo(
    () => pillar?.topics.find((t) => t.id === selectedTopicId) ?? null,
    [pillar, selectedTopicId],
  );
  const selectedTopicIndex = useMemo(
    () => (pillar && selectedTopic ? pillar.topics.findIndex((t) => t.id === selectedTopic.id) : -1),
    [pillar, selectedTopic],
  );

  if (loading || !pillar) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center text-sm font-bold text-text-secondary">
        Loading world…
      </div>
    );
  }

  const goBack = () => {
    if (selectedTopic) setSelectedTopicId(null);
    else navigate({ to: "/journey" });
  };

  return (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col"
      style={{ background: `linear-gradient(180deg, ${theme.glow} 0%, transparent 60%)` }}
    >
      {/* Header */}
      <div className="relative px-5 pt-6 pb-4">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-xs font-extrabold text-foreground shadow-sm backdrop-blur hover:bg-white"
        >
          <ChevronLeft size={14} strokeWidth={3} /> Back
        </button>
        <h1 className="mt-4 text-3xl font-black leading-tight" style={{ color: theme.accent }}>
          {theme.world}
        </h1>
        <p className="mt-1 text-sm font-semibold text-text-secondary">{theme.tagline}</p>
      </div>

      {/* Topic list / Module list */}
      <div className="flex-1 px-5 pb-8">
        {!selectedTopic && (
          <div className="flex flex-col gap-3">
            {pillar.topics.map((t, i) => {
              const unlocked = isTopicUnlocked(pillar, i, progress);
              const tp = topicProgress(t, progress);
              return (
                <TopicPill
                  key={t.id}
                  topic={t}
                  unlocked={unlocked}
                  completed={tp.completed}
                  total={tp.total}
                  accent={theme.accent}
                  onClick={() => unlocked && setSelectedTopicId(t.id)}
                />
              );
            })}
            {pillar.topics.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-white/60 p-8 text-center text-sm font-bold text-text-secondary">
                No topics yet in this world. Check back soon!
              </div>
            )}
          </div>
        )}

        {selectedTopic && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <TopicPill
              topic={selectedTopic}
              unlocked
              completed={topicProgress(selectedTopic, progress).completed}
              total={topicProgress(selectedTopic, progress).total}
              accent={theme.accent}
              pinned
              onClick={() => setSelectedTopicId(null)}
            />
            <div className="mt-2 px-1 text-[11px] font-extrabold uppercase tracking-wider text-text-secondary">
              Modules
            </div>
            {selectedTopic.modules.map((m, i) => {
              const unlocked = isModuleUnlocked(selectedTopic, i, progress);
              const mp = moduleProgress(m, p => p, /* not used */ ) as any;
              const real = moduleProgress(m, progress);
              const next = nextClassInModule(m, progress);
              return (
                <ModulePill
                  key={m.id}
                  index={i + 1}
                  name={m.name}
                  unlocked={unlocked}
                  completed={real.completed}
                  total={real.total}
                  accent={theme.accent}
                  onClick={() => {
                    if (!unlocked) return;
                    if (!next) return;
                    navigate({ to: "/play/$slug", params: { slug: next.slug } });
                  }}
                  hasContent={!!next}
                />
              );
            })}
            {selectedTopic.modules.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-white/60 p-8 text-center text-sm font-bold text-text-secondary">
                No modules yet in this topic.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TopicPill({
  topic, unlocked, completed, total, accent, pinned, onClick,
}: {
  topic: HTopic; unlocked: boolean; completed: number; total: number; accent: string; pinned?: boolean; onClick: () => void;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <button
      type="button"
      disabled={!unlocked}
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-2xl border bg-white px-5 py-4 text-left shadow-sm transition-all ${
        unlocked ? "hover:-translate-y-0.5 hover:shadow-md cursor-pointer" : "opacity-55 cursor-not-allowed"
      } ${pinned ? "ring-2" : ""}`}
      style={pinned ? { borderColor: accent, boxShadow: `0 6px 20px -10px ${accent}` } : { borderColor: "rgba(0,0,0,0.06)" }}
    >
      <div
        className="absolute inset-y-0 left-0 transition-all"
        style={{ width: `${pct}%`, background: `${accent}14` }}
        aria-hidden
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-black text-foreground">{topic.name}</div>
          <div className="mt-0.5 text-[11px] font-bold text-text-secondary">
            {total > 0 ? `${completed} / ${total} classes` : "Coming soon"}
          </div>
        </div>
        {!unlocked ? (
          <Lock size={18} className="shrink-0 text-text-secondary" />
        ) : (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black text-white"
            style={{ background: accent }}
          >
            {pct}%
          </span>
        )}
      </div>
    </button>
  );
}

function ModulePill({
  index, name, unlocked, completed, total, accent, onClick, hasContent,
}: {
  index: number; name: string; unlocked: boolean; completed: number; total: number; accent: string; onClick: () => void; hasContent: boolean;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const playable = unlocked && hasContent;
  return (
    <button
      type="button"
      disabled={!playable}
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-2xl border border-border bg-white px-5 py-4 text-left shadow-sm transition-all ${
        playable ? "hover:-translate-y-0.5 hover:shadow-md cursor-pointer" : "opacity-55 cursor-not-allowed"
      }`}
    >
      <div
        className="absolute inset-y-0 left-0 transition-all"
        style={{ width: `${pct}%`, background: `${accent}14` }}
        aria-hidden
      />
      <div className="relative flex items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-black text-white"
          style={{ background: unlocked ? accent : "#9ca3af" }}
        >
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-black text-foreground">{name}</div>
          <div className="mt-0.5 text-[11px] font-bold text-text-secondary">
            {!unlocked
              ? "Locked — finish the previous module"
              : !hasContent
                ? "Coming soon"
                : total > 0
                  ? `${completed} / ${total} classes`
                  : "Ready to start"}
          </div>
        </div>
        {!unlocked ? (
          <Lock size={16} className="shrink-0 text-text-secondary" />
        ) : (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black text-white"
            style={{ background: accent }}
          >
            {pct}%
          </span>
        )}
      </div>
    </button>
  );
}
