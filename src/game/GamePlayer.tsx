import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { usePlayerAuth } from "./PlayerAuth";
import { PlayerSignIn } from "./PlayerSignIn";
import { loadPublishedClasses, loadPublishedClassXpTotals, type DbClass } from "@/studio/catalog";
import { loadUserProgress, type UserProgress } from "./progress";
import { Avatar } from "./avatar/Avatar";
import { avatarFromSeed, type AvatarConfig } from "./avatar/config";
import { loadProfile } from "./profileApi";
import { Leaderboard, ProfilePreviewCard } from "./Leaderboard";
import type { LeaderboardEntry } from "./profileApi";

const EMPTY_PROGRESS: UserProgress = {
  totalXp: 0, completedClassIds: new Set(), perClass: new Map(), streakDays: 0,
};

export function GameHome() {
  const { user, loading, isGuest, setGuest, signOut } = usePlayerAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<DbClass[] | null>(null);
  const [xpTotals, setXpTotals] = useState<Map<string, number>>(new Map());
  const [progress, setProgress] = useState<UserProgress>(EMPTY_PROGRESS);
  const [avatarCfg, setAvatarCfg] = useState<AvatarConfig | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [previewEntry, setPreviewEntry] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    Promise.all([loadPublishedClasses(), loadPublishedClassXpTotals()])
      .then(([cls, totals]) => { setClasses(cls); setXpTotals(totals); })
      .catch(() => setClasses([]));
  }, []);
  useEffect(() => {
    if (!user) { setProgress(EMPTY_PROGRESS); setAvatarCfg(null); setDisplayName(null); return; }
    loadUserProgress(user.id).then(setProgress).catch(() => setProgress(EMPTY_PROGRESS));
    loadProfile(user.id)
      .then((p) => {
        setAvatarCfg(p?.avatar_config ?? avatarFromSeed(user.id));
        setDisplayName(p?.display_name ?? null);
      })
      .catch(() => setAvatarCfg(avatarFromSeed(user.id)));
  }, [user]);

  // "Continue" = the most-recently-touched class that isn't completed yet.
  // Fallback for a brand-new signed-in user: first non-completed published class.
  const continueClass = useMemo<DbClass | null>(() => {
    if (!classes || classes.length === 0) return null;
    const byId = new Map(classes.map((c) => [c.id, c]));
    let best: { c: DbClass; t: number } | null = null;
    for (const [classId, info] of progress.perClass) {
      if (progress.completedClassIds.has(classId)) continue;
      const c = byId.get(classId);
      if (!c) continue;
      if (!best || info.lastAt > best.t) best = { c, t: info.lastAt };
    }
    if (best) return best.c;
    return classes.find((c) => !progress.completedClassIds.has(c.id)) ?? null;
  }, [classes, progress]);

  if (loading) return <div className="flex h-[100dvh] items-center justify-center bg-[#F8F8FC] text-[#666]">Loading…</div>;

  if (!user && !isGuest) return <PlayerSignIn onContinueAsGuest={() => setGuest(true)} />;

  const continueXpEarned = continueClass ? (progress.perClass.get(continueClass.id)?.xp ?? 0) : 0;
  const continueXpTotal = continueClass ? (xpTotals.get(continueClass.id) ?? 0) : 0;
  const continuePct = continueXpTotal > 0 ? Math.min(100, Math.round((continueXpEarned / continueXpTotal) * 100)) : 0;
  const isResume = continueClass ? (progress.perClass.get(continueClass.id)?.layersTouched ?? 0) > 0 : false;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#F0F0FA] to-white">
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => user && navigate({ to: "/profile" })}
            disabled={!user}
            className="flex items-center gap-3 rounded-full p-1 -m-1 text-left disabled:cursor-default"
            aria-label="Edit your profile"
          >
            <span className="block h-12 w-12 overflow-hidden rounded-full ring-2 ring-white shadow">
              <Avatar config={avatarCfg} size={48} />
            </span>
            <span>
              <span className="block text-xs font-semibold text-[#666]">Hello,</span>
              <span className="block text-xl font-black text-[#1A1A2E]">
                {displayName ?? user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "Explorer"}
              </span>
            </span>
          </button>
          {user ? (
            <button onClick={signOut} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#7B2FBE] shadow border border-[#EBEBF5]">Sign out</button>
          ) : (
            <button onClick={() => setGuest(false)} className="rounded-full bg-[#7B2FBE] px-3 py-1.5 text-xs font-bold text-white">Sign in</button>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="XP" value={user ? progress.totalXp : "—"} />
          <Stat label="Classes" value={user ? progress.completedClassIds.size : "—"} />
          <Stat label="Streak" value={user ? (progress.streakDays > 0 ? `${progress.streakDays}🔥` : "0") : "—"} />
        </div>
        {!user && isGuest && (
          <div className="mt-3 rounded-xl bg-[#FFF8E8] px-3 py-2 text-[12px] font-semibold text-[#A66D00]">
            Playing as guest — your progress won't be saved.
          </div>
        )}
      </header>

      {/* Continue card — only for signed-in users with at least one class to play */}
      {user && continueClass && (
        <section className="px-5 pb-2">
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#666]">
            {isResume ? "Continue where you left off" : "Start your first class"}
          </h2>
          <Link
            to="/play/$slug"
            params={{ slug: continueClass.slug }}
            className="block rounded-2xl bg-gradient-to-br from-[#7B2FBE] to-[#5A1F9A] p-5 text-white shadow-[0_8px_24px_rgba(123,47,190,0.35)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                  Class {String(continueClass.position).padStart(2, "0")}
                </div>
                <div className="mt-0.5 truncate text-lg font-black">{continueClass.title}</div>
                {continueClass.subtitle && (
                  <div className="mt-0.5 truncate text-xs text-white/80">{continueClass.subtitle}</div>
                )}
              </div>
              <div className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold backdrop-blur">
                {isResume ? "Resume →" : "Start →"}
              </div>
            </div>
            {isResume && continueXpTotal > 0 && (
              <>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                  <div className="h-full bg-white transition-all" style={{ width: `${continuePct}%` }} />
                </div>
                <div className="mt-1.5 text-[11px] font-semibold text-white/80">
                  {continueXpEarned} / {continueXpTotal} XP · {continuePct}%
                </div>
              </>
            )}
          </Link>
        </section>
      )}

      <section className="px-5 pb-20 pt-4">
        <h2 className="mb-3 text-base font-extrabold text-[#1A1A2E]">All classes</h2>
        {classes == null ? (
          <div className="text-sm text-[#666]">Loading classes…</div>
        ) : classes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D8D8E8] bg-white p-6 text-center text-sm text-[#666]">
            No published classes yet. Check back soon!
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map((c) => {
              const done = progress.completedClassIds.has(c.id);
              const earnedHere = progress.perClass.get(c.id)?.xp ?? 0;
              const totalHere = xpTotals.get(c.id) ?? 0;
              const inProgress = !done && earnedHere > 0;
              const pct = totalHere > 0 ? Math.min(100, Math.round((earnedHere / totalHere) * 100)) : 0;
              return (
                <Link key={c.id} to="/play/$slug" params={{ slug: c.slug }}
                  className="block rounded-2xl bg-white p-4 shadow border border-[#EBEBF5]">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${done ? "bg-[#E8F5E9]" : inProgress ? "bg-[#FFF3D9]" : "bg-[#F0F0FA]"}`}>
                      {done ? "✅" : inProgress ? "⏳" : "▶️"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#7B2FBE]">Class {String(c.position).padStart(2, "0")}</div>
                      <div className="truncate text-base font-extrabold text-[#1A1A2E]">{c.title}</div>
                      {c.subtitle && <div className="truncate text-xs text-[#666]">{c.subtitle}</div>}
                      {inProgress && totalHere > 0 && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#F0F0FA]">
                            <div className="h-full bg-[#7B2FBE] transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-[10px] font-bold text-[#666]">{pct}%</div>
                        </div>
                      )}
                      {done && totalHere > 0 && (
                        <div className="mt-1 text-[10px] font-bold text-[#2E7D32]">+{earnedHere} XP earned</div>
                      )}
                    </div>
                    <span className="text-[#7B2FBE]">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl bg-white p-3 text-center shadow-sm border border-[#EBEBF5]">
      <div className="text-lg font-black text-[#1A1A2E]">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#666]">{label}</div>
    </div>
  );
}

export function ClassPlayer({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const { user, isGuest } = usePlayerAuth();
  const [data, setData] = useState<{ cls: any; layers: any[] } | null | "missing">(null);
  const [idx, setIdx] = useState(0);
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    import("@/studio/catalog").then(async ({ loadPublishedClass }) => {
      const r = await loadPublishedClass(slug);
      setData(r ?? "missing");
    });
  }, [slug]);

  const totalXp = useMemo(() => data && data !== "missing" ? data.layers.reduce((s, l) => s + (l.xp_reward ?? 0), 0) : 0, [data]);

  if (data == null) return <div className="flex h-[100dvh] items-center justify-center bg-white">Loading class…</div>;
  if (data === "missing") return (
    <div className="flex h-[100dvh] flex-col items-center justify-center gap-3 bg-white p-6 text-center">
      <div className="text-3xl">🤔</div>
      <h1 className="text-lg font-bold">Class not found</h1>
      <button onClick={() => navigate({ to: "/" })} className="rounded-full bg-[#7B2FBE] px-4 py-2 text-sm font-bold text-white">Back home</button>
    </div>
  );

  const layer = data.layers[idx];
  const isLast = idx >= data.layers.length - 1;

  async function handleComplete(xp: number) {
    const newEarned = earned + xp;
    setEarned(newEarned);
    const d = data as { cls: any; layers: any[] };
    if (user && !isGuest) {
      const { recordLayerXp, recordClassComplete } = await import("./progress");
      await recordLayerXp({ userId: user.id, classId: d.cls.id, layerId: layer.id, amount: xp, source: layer.config?.taskCode ?? "layer" });
      if (isLast) await recordClassComplete({ userId: user.id, classId: d.cls.id, xpEarned: newEarned });
    }
    setIdx((i) => i + 1);
  }

  if (idx >= data.layers.length) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-[#7B2FBE] to-[#3D1568] p-6 text-center text-white">
        <div className="mt-12 text-6xl">🎉</div>
        <h1 className="mt-4 text-2xl font-black">Class complete!</h1>
        <p className="mt-2 text-sm opacity-90">You earned</p>
        <div className="mt-1 text-5xl font-black">+{earned} XP</div>
        {!user && <p className="mt-4 text-xs text-white/70">Sign in next time to save your progress.</p>}
        <div className="mt-8 flex flex-col gap-3">
          <button onClick={() => navigate({ to: "/" })} className="rounded-full bg-white py-3 text-sm font-extrabold text-[#7B2FBE]">Back to home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-[#F8F8FC]">
      <header className="border-b border-[#EBEBF5] bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate({ to: "/" })} className="text-sm font-bold text-[#7B2FBE]">← Exit</button>
          <div className="text-xs font-bold text-[#666]">{idx + 1} / {data.layers.length}</div>
          <div className="text-xs font-bold text-[#A66D00]">+{earned}/{totalXp} XP</div>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#F0F0FA]">
          <div className="h-full bg-[#7B2FBE] transition-all" style={{ width: `${((idx) / data.layers.length) * 100}%` }} />
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <LayerWrap layer={layer} onComplete={handleComplete} />
      </div>
    </div>
  );
}

function LayerWrap({ layer, onComplete }: { layer: any; onComplete: (xp: number) => void }) {
  const [Comp, setComp] = useState<any>(null);
  useEffect(() => { import("./LayerRenderer").then((m) => setComp(() => m.LayerRenderer)); }, []);
  if (!Comp) return <div className="flex h-full items-center justify-center text-[#666]">Loading…</div>;
  return <Comp layer={layer} onComplete={onComplete} />;
}
