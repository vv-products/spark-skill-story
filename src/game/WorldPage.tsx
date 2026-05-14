import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Lock, Info, Clock, Flame } from "lucide-react";
import { toast } from "sonner";
import { loadFullCatalog, type HModule, type HPillar, type HTopic } from "@/studio/catalog";
import { loadUserProgress, type UserProgress } from "./progress";
import { usePlayerAuth } from "./PlayerAuth";
import {
  isTopicUnlocked,
  isModuleUnlocked,
  topicProgress,
  moduleProgress,
  nextClassInModule,
  worldProgress,
  nextLockedTopic,
  mostRecentInProgressClass,
  firstPlayableClass,
  moduleEstimatedMinutes,
  publishedClasses,
  classStatus,
} from "./unlocks";
import { pillarThemeFromSlug } from "./pillarTheme";
import { ProgressRing } from "./world/ProgressRing";
import { ContinueCard } from "./world/ContinueCard";
import { PillarDots } from "./world/PillarDots";
import { ClassPill } from "./world/ClassPill";
import { TopicPreviewSheet } from "./world/TopicPreviewSheet";
import { Confetti } from "./Effects";

const EMPTY: UserProgress = {
  totalXp: 0,
  completedClassIds: new Set(),
  perClass: new Map(),
  streakDays: 0,
};

type Filter = "all" | "in_progress" | "completed" | "locked";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "in_progress", label: "In progress" },
  { id: "completed", label: "Completed" },
  { id: "locked", label: "Locked" },
];

export function WorldPage({ pillarSlug }: { pillarSlug: string }) {
  const { user } = usePlayerAuth();
  const navigate = useNavigate();
  const theme = pillarThemeFromSlug(pillarSlug);

  const [pillars, setPillars] = useState<HPillar[]>([]);
  const [progress, setProgress] = useState<UserProgress>(EMPTY);
  const [loading, setLoading] = useState(true);

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [previewTopic, setPreviewTopic] = useState<HTopic | null>(null);
  const [filter, setFilter] = useState<Filter>(() => {
    if (typeof window === "undefined") return "all";
    return (localStorage.getItem(`world-filter-${pillarSlug}`) as Filter) ?? "all";
  });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadFullCatalog().then((p) => { setPillars(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    loadUserProgress(user.id).then(setProgress).catch(() => setProgress(EMPTY));
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(`world-filter-${pillarSlug}`, filter);
  }, [filter, pillarSlug]);

  const pillar = useMemo(() => pillars.find((p) => p.slug === pillarSlug) ?? null, [pillars, pillarSlug]);
  const selectedTopic = useMemo(
    () => pillar?.topics.find((t) => t.id === selectedTopicId) ?? null,
    [pillar, selectedTopicId],
  );
  const selectedModule = useMemo(
    () => selectedTopic?.modules.find((m) => m.id === selectedModuleId) ?? null,
    [selectedTopic, selectedModuleId],
  );

  // Detect newly-completed modules/topics; fire celebration once.
  useEffect(() => {
    if (!pillar || !user) return;
    const key = `world-seen-${pillarSlug}-${user.id}`;
    const seen: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    const seenSet = new Set(seen);
    const fresh: { kind: "module" | "topic"; name: string; id: string }[] = [];
    for (const t of pillar.topics) {
      const tp = topicProgress(t, progress);
      if (tp.isComplete && !seenSet.has(`t:${t.id}`)) fresh.push({ kind: "topic", name: t.name, id: `t:${t.id}` });
      for (const m of t.modules) {
        const mp = moduleProgress(m, progress);
        if (mp.isComplete && !seenSet.has(`m:${m.id}`)) fresh.push({ kind: "module", name: m.name, id: `m:${m.id}` });
      }
    }
    if (fresh.length > 0) {
      setShowConfetti(true);
      const top = fresh[0];
      toast.success(top.kind === "topic" ? `Topic complete: ${top.name} 🎉` : `Module complete: ${top.name} ✨`);
      const next = [...seen, ...fresh.map((f) => f.id)];
      localStorage.setItem(key, JSON.stringify(next));
      const t = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(t);
    }
  }, [pillar, progress, pillarSlug, user]);

  if (loading || !pillar) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center text-sm font-bold text-text-secondary">
        Loading world…
      </div>
    );
  }

  const wp = worldProgress(pillar, progress);
  const nextLocked = nextLockedTopic(pillar, progress);
  const continueCls = mostRecentInProgressClass(pillar, progress);
  const startCls = !continueCls && !wp.isComplete ? firstPlayableClass(pillar) : null;

  const view: "topics" | "modules" | "classes" =
    selectedModule ? "classes" : selectedTopic ? "modules" : "topics";

  const goBack = () => {
    if (view === "classes") setSelectedModuleId(null);
    else if (view === "modules") setSelectedTopicId(null);
    else navigate({ to: "/journey" });
  };

  const filteredTopics = pillar.topics.filter((t, i) => {
    if (filter === "all") return true;
    const unlocked = isTopicUnlocked(pillar, i, progress);
    const tp = topicProgress(t, progress);
    if (filter === "locked") return !unlocked;
    if (filter === "completed") return tp.isComplete;
    if (filter === "in_progress") return unlocked && !tp.isComplete && tp.completed > 0;
    return true;
  });

  return (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col"
      style={{ background: `linear-gradient(180deg, ${theme.glow} 0%, transparent 55%)` }}
    >
      {showConfetti && <Confetti />}

      {/* Hero */}
      <div className="relative px-5 pt-5 pb-4">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1.5 text-xs font-extrabold text-foreground shadow-sm backdrop-blur hover:bg-white"
          >
            <ChevronLeft size={14} strokeWidth={3} /> Back
          </button>
          <PillarDots active={theme.slug} />
        </div>

        <div className="mt-3 flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black leading-tight" style={{ color: theme.accent }}>
              {theme.world}
            </h1>
            <p className="mt-1 text-xs font-semibold text-text-secondary">{theme.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Stat label={`${wp.completed}/${wp.total}`} sub="classes" accent={theme.accent} />
              <Stat label={`${wp.xpEarned}`} sub="XP earned" accent={theme.accent} />
              {progress.streakDays > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold shadow-sm"
                  style={{ color: "#ea580c" }}
                >
                  <Flame size={12} fill="#ea580c" /> {progress.streakDays}d streak
                </span>
              )}
            </div>
          </div>
          <div className="relative shrink-0">
            <img
              src={theme.mascot}
              alt={theme.name}
              className="h-28 w-auto object-contain drop-shadow-md"
              draggable={false}
              style={{ filter: `drop-shadow(0 6px 16px ${theme.glow})` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center">
          <ProgressRing
            pct={wp.total > 0 ? Math.round((wp.completed / wp.total) * 100) : 0}
            accent={theme.accent}
            label={wp.isComplete ? "Complete!" : "Mastered"}
          />
        </div>

        {/* Continue / Start card */}
        {continueCls && (
          <div className="mt-4">
            <ContinueCard
              cls={continueCls.cls}
              topic={continueCls.topic}
              module={continueCls.module}
              accent={theme.accent}
              kind="continue"
            />
          </div>
        )}
        {startCls && (
          <div className="mt-4">
            <ContinueCard
              cls={startCls.cls}
              topic={startCls.topic}
              module={startCls.module}
              accent={theme.accent}
              kind="start"
            />
          </div>
        )}
        {wp.isComplete && (
          <div
            className="mt-4 rounded-3xl bg-white p-4 text-center shadow-md ring-1 ring-black/5"
            style={{ borderTop: `3px solid ${theme.accent}` }}
          >
            <div className="text-2xl">🏆</div>
            <div className="mt-1 text-base font-black text-foreground">{theme.world} mastered!</div>
            <div className="mt-0.5 text-[11px] font-bold text-text-secondary">
              You've completed every class in this world.
            </div>
          </div>
        )}

        {/* Next-unlock teaser */}
        {nextLocked && view === "topics" && (
          <div
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-extrabold backdrop-blur"
            style={{ color: theme.accent }}
          >
            ✨ Finish {nextLocked.classesNeeded} more {nextLocked.classesNeeded === 1 ? "class" : "classes"} to unlock {nextLocked.topic.name}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 px-5 pb-8">
        {view === "topics" && (
          <>
            <FilterRow filter={filter} onChange={setFilter} accent={theme.accent} />
            <div className="mt-3 flex flex-col gap-3 animate-in fade-in duration-300">
              {filteredTopics.map((t) => {
                const i = pillar.topics.findIndex((x) => x.id === t.id);
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
                    onPreview={() => setPreviewTopic(t)}
                  />
                );
              })}
              {filteredTopics.length === 0 && (
                <EmptyHint label={filter === "all" ? "No topics yet in this world. Check back soon!" : `No topics match "${FILTERS.find((f) => f.id === filter)?.label}".`} />
              )}
            </div>
          </>
        )}

        {view === "modules" && selectedTopic && (
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
            <div className="mt-2 flex items-center justify-between px-1">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-text-secondary">
                Modules
              </div>
            </div>
            {selectedTopic.modules.map((m, i) => {
              const unlocked = isModuleUnlocked(selectedTopic, i, progress);
              const real = moduleProgress(m, progress);
              const mins = moduleEstimatedMinutes(m);
              return (
                <ModulePill
                  key={m.id}
                  index={i + 1}
                  name={m.name}
                  unlocked={unlocked}
                  completed={real.completed}
                  total={real.total}
                  minutes={mins}
                  accent={theme.accent}
                  onClick={() => unlocked && real.total > 0 && setSelectedModuleId(m.id)}
                  hasContent={real.total > 0}
                />
              );
            })}
            {selectedTopic.modules.length === 0 && (
              <EmptyHint label="No modules yet in this topic." />
            )}
          </div>
        )}

        {view === "classes" && selectedTopic && selectedModule && (
          <ClassListView
            topic={selectedTopic}
            module={selectedModule}
            accent={theme.accent}
            progress={progress}
            onBack={() => setSelectedModuleId(null)}
            onPlay={(slug) => navigate({ to: "/play/$slug", params: { slug } })}
          />
        )}
      </div>

      <TopicPreviewSheet
        topic={previewTopic}
        progress={progress}
        accent={theme.accent}
        onClose={() => setPreviewTopic(null)}
        onPickModule={(topicId, moduleId) => {
          setPreviewTopic(null);
          setSelectedTopicId(topicId);
          setSelectedModuleId(moduleId);
        }}
      />
    </div>
  );
}

function Stat({ label, sub, accent }: { label: string; sub: string; accent: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-full bg-white px-2.5 py-1 shadow-sm">
      <span className="text-[12px] font-black tabular-nums" style={{ color: accent }}>{label}</span>
      <span className="text-[10px] font-bold text-text-secondary">{sub}</span>
    </span>
  );
}

function FilterRow({ filter, onChange, accent }: { filter: Filter; onChange: (f: Filter) => void; accent: string }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {FILTERS.map((f) => {
        const active = filter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className="shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold transition-all"
            style={
              active
                ? { background: accent, color: "white" }
                : { background: "white", color: "var(--text-secondary, #6b7280)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }
            }
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyHint({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white/60 p-8 text-center text-sm font-bold text-text-secondary">
      {label}
    </div>
  );
}

function TopicPill({
  topic, unlocked, completed, total, accent, pinned, onClick, onPreview,
}: {
  topic: HTopic; unlocked: boolean; completed: number; total: number; accent: string;
  pinned?: boolean; onClick: () => void; onPreview?: () => void;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div
      className={`group relative w-full overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
        unlocked ? "hover:-translate-y-0.5 hover:shadow-md" : "opacity-55"
      } ${pinned ? "ring-2" : ""}`}
      style={pinned ? { borderColor: accent, boxShadow: `0 6px 20px -10px ${accent}` } : { borderColor: "rgba(0,0,0,0.06)" }}
    >
      <div
        className="absolute inset-y-0 left-0 transition-all"
        style={{ width: `${pct}%`, background: `${accent}14` }}
        aria-hidden
      />
      <button
        type="button"
        disabled={!unlocked}
        onClick={onClick}
        className={`relative flex w-full items-center justify-between gap-3 px-5 py-4 text-left ${
          unlocked ? "cursor-pointer" : "cursor-not-allowed"
        }`}
      >
        <div className="min-w-0">
          <div className="truncate text-base font-black text-foreground">{topic.name}</div>
          <div className="mt-0.5 text-[11px] font-bold text-text-secondary">
            {total > 0 ? `${completed} / ${total} classes` : "Coming soon"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {!unlocked ? (
            <Lock size={18} className="text-text-secondary" />
          ) : (
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-black text-white"
              style={{ background: accent }}
            >
              {pct}%
            </span>
          )}
        </div>
      </button>
      {onPreview && unlocked && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPreview(); }}
          className="absolute right-12 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-text-secondary hover:bg-black/5"
          aria-label="Preview topic"
        >
          <Info size={16} />
        </button>
      )}
    </div>
  );
}

function ModulePill({
  index, name, unlocked, completed, total, minutes, accent, onClick, hasContent,
}: {
  index: number; name: string; unlocked: boolean; completed: number; total: number; minutes: number;
  accent: string; onClick: () => void; hasContent: boolean;
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
          <div className="mt-0.5 flex items-center gap-2 text-[11px] font-bold text-text-secondary">
            {!unlocked ? (
              "Locked — finish the previous module"
            ) : !hasContent ? (
              "Coming soon"
            ) : (
              <>
                <span>{completed} / {total} classes</span>
                {minutes > 0 && (
                  <span className="inline-flex items-center gap-1">
                    · <Clock size={11} /> ~{minutes} min
                  </span>
                )}
              </>
            )}
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

function ClassListView({
  topic, module: m, accent, progress, onBack, onPlay,
}: {
  topic: HTopic; module: HModule; accent: string; progress: UserProgress;
  onBack: () => void; onPlay: (slug: string) => void;
}) {
  const pub = publishedClasses(m);
  const mp = moduleProgress(m, progress);
  const mins = moduleEstimatedMinutes(m);
  const next = nextClassInModule(m, progress);

  return (
    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-text-secondary shadow-sm hover:bg-white/90"
      >
        <ChevronLeft size={12} strokeWidth={3} /> Back to modules
      </button>
      <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: accent }}>
          {topic.name}
        </div>
        <div className="text-base font-black text-foreground">{m.name}</div>
        <div className="mt-1 flex items-center gap-2 text-[11px] font-bold text-text-secondary">
          <span>{mp.completed} / {mp.total} classes</span>
          {mins > 0 && (
            <span className="inline-flex items-center gap-1">
              · <Clock size={11} /> ~{mins} min
            </span>
          )}
        </div>
        {next && !mp.isComplete && (
          <button
            type="button"
            onClick={() => onPlay(next.slug)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black text-white"
            style={{ background: accent }}
          >
            ▶ Continue: {next.title}
          </button>
        )}
      </div>

      <div className="mt-1 px-1 text-[11px] font-extrabold uppercase tracking-wider text-text-secondary">
        Classes
      </div>
      {pub.map((c, i) => {
        const status = classStatus(m, i, progress);
        const xp = progress.perClass.get(c.id)?.xp ?? 0;
        return (
          <ClassPill
            key={c.id}
            cls={c}
            index={i + 1}
            status={status}
            xp={xp}
            accent={accent}
            onClick={() => status !== "locked" && onPlay(c.slug)}
          />
        );
      })}
      {pub.length === 0 && <EmptyHint label="No published classes yet in this module." />}
    </div>
  );
}

export default WorldPage;
