import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { usePlayerAuth } from "./PlayerAuth";
import { PlayerSignIn } from "./PlayerSignIn";
import { loadPublishedClasses, type DbClass } from "@/studio/catalog";
import { loadUserProgress } from "./progress";

export function GameHome() {
  const { user, loading, isGuest, setGuest, signOut } = usePlayerAuth();
  const [classes, setClasses] = useState<DbClass[] | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    loadPublishedClasses().then(setClasses).catch(() => setClasses([]));
  }, []);
  useEffect(() => {
    if (!user) { setCompleted(new Set()); setTotalXp(0); return; }
    loadUserProgress(user.id).then((r) => {
      setCompleted(new Set(r.progress.filter((p) => p.completed_at).map((p) => p.class_id)));
      setTotalXp(r.totalXp);
    });
  }, [user]);

  if (loading) return <div className="flex h-[100dvh] items-center justify-center bg-[#F8F8FC] text-[#666]">Loading…</div>;

  if (!user && !isGuest) return <PlayerSignIn onContinueAsGuest={() => setGuest(true)} />;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#F0F0FA] to-white">
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#666]">Hello,</div>
            <div className="text-xl font-black text-[#1A1A2E]">
              {user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "Explorer"}
            </div>
          </div>
          {user ? (
            <button onClick={signOut} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#7B2FBE] shadow border border-[#EBEBF5]">Sign out</button>
          ) : (
            <button onClick={() => setGuest(false)} className="rounded-full bg-[#7B2FBE] px-3 py-1.5 text-xs font-bold text-white">Sign in</button>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="XP" value={user ? totalXp : "—"} />
          <Stat label="Classes" value={user ? completed.size : "—"} />
          <Stat label="Streak" value={user ? "3🔥" : "—"} />
        </div>
        {!user && isGuest && (
          <div className="mt-3 rounded-xl bg-[#FFF8E8] px-3 py-2 text-[12px] font-semibold text-[#A66D00]">
            Playing as guest — your progress won't be saved.
          </div>
        )}
      </header>

      <section className="px-5 pb-20">
        <h2 className="mb-3 text-base font-extrabold text-[#1A1A2E]">Today's classes</h2>
        {classes == null ? (
          <div className="text-sm text-[#666]">Loading classes…</div>
        ) : classes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D8D8E8] bg-white p-6 text-center text-sm text-[#666]">
            No published classes yet. Check back soon!
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map((c) => {
              const done = completed.has(c.id);
              return (
                <Link key={c.id} to="/play/$slug" params={{ slug: c.slug }}
                  className="block rounded-2xl bg-white p-4 shadow border border-[#EBEBF5]">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${done ? "bg-[#E8F5E9]" : "bg-[#F0F0FA]"}`}>
                      {done ? "✅" : "▶️"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#7B2FBE]">Class {String(c.position).padStart(2, "0")}</div>
                      <div className="truncate text-base font-extrabold text-[#1A1A2E]">{c.title}</div>
                      {c.subtitle && <div className="truncate text-xs text-[#666]">{c.subtitle}</div>}
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
