import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Bell } from "lucide-react";
import { usePlayerAuth } from "./PlayerAuth";
import { PlayerSignIn } from "./PlayerSignIn";
import { loadPublishedClasses, loadPublishedClassXpTotals, type DbClass } from "@/studio/catalog";
import { loadUserProgress, type UserProgress } from "./progress";
import { Avatar } from "./avatar/Avatar";
import { avatarFromSeed, type AvatarConfig } from "./avatar/config";
import { loadProfile } from "./profileApi";
import { ProfilePreviewCard } from "./Leaderboard";
import { loadLeaderboard, type LeaderboardEntry } from "./profileApi";
import leoImg from "@/assets/leo.jpg";
import leoHeroImg from "@/assets/leo-hero.jpg";
import mayaImg from "@/assets/maya.jpg";
import dashImg from "@/assets/dash.jpg";
import pipImg from "@/assets/pip.jpg";
import meetCharactersImg from "@/assets/meet-characters.jpg";
import liveEventsImg from "@/assets/live-events.jpg";
import missionStorytimeImg from "@/assets/mission-storytime.jpg";
import missionTreasureImg from "@/assets/mission-treasure.jpg";
import iconStar from "@/assets/icon-star.png";
import iconTrophy from "@/assets/icon-trophy.png";
import iconFire from "@/assets/icon-fire.png";

const FALLBACK_IMAGES = [leoImg, mayaImg, dashImg, pipImg];
const classImage = (c: DbClass) => c.hero_image_url || FALLBACK_IMAGES[c.position % FALLBACK_IMAGES.length];

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
        // First-time onboarding: brand-new account → send to avatar setup before showing Home.
        if (!p?.avatar_config && !p?.display_name) {
          navigate({ to: "/profile" });
          return;
        }
        setAvatarCfg(p?.avatar_config ?? avatarFromSeed(user.id));
        setDisplayName(p?.display_name ?? null);
      })
      .catch(() => setAvatarCfg(avatarFromSeed(user.id)));
  }, [user, navigate]);

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

  const journeyClasses = (classes ?? []).slice(0, 5);
  const greetName = displayName ?? user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "Explorer";

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-background px-5 pt-5 pb-3">
        <h1 className="font-display text-3xl text-primary">Sementa</h1>
        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card text-foreground" aria-label="Search">
            <Search className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card text-foreground" aria-label="Notifications">
            <Bell className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            onClick={() => user && navigate({ to: "/profile" })}
            disabled={!user}
            className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-card shadow-card disabled:cursor-default"
            aria-label="Edit your profile"
          >
            <Avatar config={avatarCfg} size={40} />
          </button>
        </div>
      </div>

      <main className="flex-1 px-5 pb-24">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-[24px] p-5 text-primary-foreground shadow-pop">
          <img
            src={leoHeroImg}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-right"
          />

          <div className="relative flex items-stretch min-h-[240px]">
            <div className="relative z-10 flex w-[58%] flex-col pt-1">
              <p className="text-[14px] font-semibold text-white/90">Welcome back,</p>
              <p className="text-[18px] font-extrabold text-text-accent drop-shadow-sm">
                {greetName} <span>👋</span>
              </p>
              <h2 className="mt-4 text-[26px] font-black leading-[1.1] drop-shadow-md">
                Leo needs your help today...
              </h2>
              <div className="mt-auto pt-5">
                <Link
                  to={continueClass ? "/play/$slug" : "/"}
                  params={continueClass ? { slug: continueClass.slug } : undefined}
                  className="inline-flex items-center gap-1 rounded-pill bg-white px-7 py-3 text-[15px] font-extrabold text-primary shadow-card transition-transform active:scale-[0.97]"
                >
                  Start →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatCard bg="bg-card-warm" icon={iconStar} label="Your Stars" value={user ? progress.totalXp.toLocaleString() : "—"} />
          <StatCard bg="bg-card-gold" icon={iconTrophy} label="Your Level" value={user ? `Level ${Math.max(1, Math.floor(progress.totalXp / 200) + 1)}` : "—"} />
          <StatCard
            bg="bg-card-warm"
            icon={iconFire}
            label="Learning Streak"
            value={user ? `${progress.streakDays} ${progress.streakDays === 1 ? "day" : "days"}` : "—"}
          />
        </div>

        {!user && isGuest && (
          <div className="mt-3 rounded-xl bg-card-gold px-3 py-2 text-[12px] font-semibold text-[#A66D00]">
            Playing as guest — your progress won't be saved.
          </div>
        )}

        {/* Your Journey */}
        <SectionHeader title="Your Journey" viewAllSlug={classes?.[0]?.slug} />
        <div className="-mx-5 mt-2 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {classes == null ? (
            <div className="text-sm text-text-secondary">Loading…</div>
          ) : journeyClasses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-text-secondary">
              No classes yet.
            </div>
          ) : journeyClasses.map((c) => {
            const done = progress.completedClassIds.has(c.id);
            const earnedHere = progress.perClass.get(c.id)?.xp ?? 0;
            const totalHere = xpTotals.get(c.id) ?? 0;
            const inProgress = !done && earnedHere > 0;
            const pct = totalHere > 0 ? Math.min(100, Math.round((earnedHere / totalHere) * 100)) : 0;
            return (
              <JourneyCard
                key={c.id}
                slug={c.slug}
                image={classImage(c)}
                title={c.title}
                subtitle={c.subtitle ?? `Class ${String(c.position).padStart(2, "0")}`}
                tags={[done ? "Completed" : inProgress ? "In progress" : "New", `Class ${c.position}`]}
                cta={done ? "Replay →" : inProgress ? "Continue →" : "Start →"}
                ctaVariant={inProgress || done ? "primary" : "dark"}
                progress={inProgress ? pct : undefined}
                current={continueClass?.id === c.id}
              />
            );
          })}
        </div>

        {/* Your Missions */}
        <SectionHeader title="Your Missions" viewAllSlug={classes?.[0]?.slug} />
        <div className="-mx-5 mt-2 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <JourneyCard
            slug={classes?.[0]?.slug ?? ""}
            image={missionStorytimeImg}
            title="Leo's Story Time"
            subtitle="Reading Skills"
            tags={["Reading", "Episode 1"]}
            cta="Start →"
            ctaVariant="dark"
          />
          <JourneyCard
            slug={classes?.[1]?.slug ?? ""}
            image={missionTreasureImg}
            title="Pip's Treasure"
            subtitle="Exploration Skills"
            tags={["Curiosity", "Episode 2"]}
            cta="Continue →"
            ctaVariant="primary"
            progress={45}
          />
        </div>

        {/* Fun Activities */}
        <SectionHeader title="Fun Activities" hideAll />
        <div className="-mx-5 mt-2 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ActivityCard
            bg="bg-card-amber"
            image={meetCharactersImg}
            imageMode="top"
            title="Meet the Characters"
            description="Get to know your friends and their stories."
            cta="Explore →"
            to={classes?.[0]?.slug}
          />
          <ActivityCard
            bg="bg-[#AFB0FB]"
            image={liveEventsImg}
            imageMode="top"
            title="Live Events"
            description="Join live shows, challenges, and special events."
            cta="Join Now →"
            to={classes?.[0]?.slug}
          />
        </div>

        {/* Leaderboard with podium */}
        <SectionHeader
          title="Leaderboard"
          subtitle={new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        />
        <PodiumLeaderboard currentUserId={user?.id ?? null} onSelect={setPreviewEntry} />

        {/* Footer */}
        <p className="mt-6 flex items-center justify-between text-[11px] font-bold text-text-secondary">
          <span>© {new Date().getFullYear()} Copyright. All rights reserved.</span>
          <span className="font-display text-base text-text-secondary">Sementa</span>
        </p>
        {user && (
          <div className="mt-3 text-center">
            <button onClick={signOut} className="text-[11px] font-bold text-text-secondary underline">
              Sign out
            </button>
          </div>
        )}
        {!user && isGuest && (
          <div className="mt-3 text-center">
            <button onClick={() => setGuest(false)} className="text-[11px] font-bold text-primary underline">
              Sign in
            </button>
          </div>
        )}
      </main>

      {previewEntry && (
        <ProfilePreviewCard entry={previewEntry} onClose={() => setPreviewEntry(null)} />
      )}
    </div>
  );
}

/* ---------- Sub components ---------- */

function StatCard({ bg, icon, label, value }: { bg: string; icon: string; label: string; value: string }) {
  return (
    <div
      className={`relative flex flex-col items-center ${bg} shadow-card`}
      style={{
        borderRadius: "var(--stat-card-radius)",
        paddingTop: "calc(var(--stat-card-icon-size) * 0.55)",
        paddingLeft: "var(--stat-card-padding)",
        paddingRight: "var(--stat-card-padding)",
        paddingBottom: "var(--stat-card-padding)",
        marginTop: "calc(var(--stat-card-icon-size) * 0.45)",
      }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 flex shrink-0 items-center justify-center"
        style={{
          width: "var(--stat-card-icon-size)",
          height: "var(--stat-card-icon-size)",
          top: "calc(var(--stat-card-icon-size) * -0.45)",
        }}
      >
        <img
          src={icon}
          alt=""
          width={44}
          height={44}
          loading="lazy"
          className="block h-full w-full object-contain drop-shadow-md"
        />
      </div>
      <p
        className="font-medium text-text-secondary leading-tight whitespace-nowrap text-center"
        style={{
          fontSize: "var(--stat-card-label-size)",
        }}
      >
        {label}
      </p>
      <p
        className="font-black text-foreground leading-none text-center"
        style={{
          marginTop: "var(--stat-card-label-gap)",
          fontSize: "var(--stat-card-value-size)",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function SectionHeader({ title, subtitle, hideAll, viewAllSlug }: { title: string; subtitle?: string; hideAll?: boolean; viewAllSlug?: string }) {
  return (
    <div className="mt-6 flex items-end justify-between">
      <div>
        <h3 className="text-base font-extrabold text-foreground">{title}</h3>
        {subtitle && <p className="text-[11px] font-bold text-text-secondary">{subtitle}</p>}
      </div>
      {!hideAll && viewAllSlug && (
        <Link
          to="/play/$slug"
          params={{ slug: viewAllSlug }}
          className="rounded-pill border border-border bg-card px-3 py-1 text-[11px] font-extrabold text-foreground shadow-card"
        >
          View All ›
        </Link>
      )}
    </div>
  );
}

function JourneyCard({
  slug, image, title, subtitle, tags, cta, ctaVariant, progress, current,
}: {
  slug: string; image: string; title: string; subtitle: string; tags: string[]; cta: string;
  ctaVariant: "primary" | "dark"; progress?: number; current?: boolean;
}) {
  return (
    <Link
      to="/play/$slug"
      params={{ slug }}
      className={`flex w-[260px] shrink-0 flex-col overflow-hidden rounded-2xl bg-card shadow-card ${current ? "ring-2 ring-primary" : ""}`}
    >
      <div className="relative h-32 w-full overflow-hidden">
        <img src={image} alt="" className="h-full w-full object-cover" />
        {progress !== undefined && (
          <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded-pill bg-black/55 px-2 py-1 text-[10px] font-extrabold text-white backdrop-blur-sm">
            {Math.round(progress)}% <span className="text-white/70">◐</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-sm font-extrabold leading-tight text-foreground">{title}</p>
        <p className="mt-0.5 text-[11px] font-bold text-text-secondary">{subtitle}</p>
        <div
          className={`mt-3 w-full rounded-pill py-2 text-center text-xs font-extrabold ${
            ctaVariant === "primary"
              ? "bg-primary text-primary-foreground shadow-pop"
              : "bg-foreground text-primary-foreground"
          }`}
        >
          {cta}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <span key={t} className="rounded-pill bg-tag px-2 py-0.5 text-[10px] font-extrabold text-tag-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ActivityCard({
  bg, image, title, description, cta, imageMode = "bleed", to,
}: { bg: string; image: string; title: string; description: string; cta: string; imageMode?: "bleed" | "top"; to?: string }) {
  const linkProps = to
    ? { to: "/play/$slug" as const, params: { slug: to } }
    : { to: "/" as const };
  if (imageMode === "top") {
    return (
      <Link {...linkProps} className={`relative flex h-[456px] w-[300px] shrink-0 flex-col overflow-hidden rounded-[20px] ${bg} shadow-card`}>
        <img src={image} alt="" className="h-[280px] w-full shrink-0 object-cover object-top" />
        <div className="flex flex-1 flex-col px-6 pb-6 pt-2">
          <p className="text-[20px] font-black leading-tight text-foreground">{title}</p>
          <p className="mt-3 text-base font-bold leading-snug text-text-secondary">{description}</p>
          <div className="mt-auto w-full rounded-pill bg-foreground py-4 text-center text-lg font-extrabold text-primary-foreground transition-transform active:scale-[0.97]">
            {cta}
          </div>
        </div>
      </Link>
    );
  }
  return (
    <Link {...linkProps} className={`relative flex h-56 w-[300px] shrink-0 flex-col justify-end overflow-hidden rounded-[20px] ${bg} p-4 shadow-card`}>
      <img
        src={image}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-95 [mask-image:linear-gradient(to_bottom,black_45%,transparent_85%)]"
      />
      <div className="relative">
        <p className="text-base font-black text-foreground">{title}</p>
        <p className="mt-1 text-[11px] font-bold text-text-secondary">{description}</p>
        <div className="mt-3 w-full rounded-pill bg-foreground py-2.5 text-center text-xs font-extrabold text-primary-foreground transition-transform active:scale-[0.97]">
          {cta}
        </div>
      </div>
    </Link>
  );
}

function PodiumLeaderboard({
  currentUserId, onSelect,
}: { currentUserId?: string | null; onSelect: (e: LeaderboardEntry) => void }) {
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(null);
  useEffect(() => { loadLeaderboard(20).then(setRows).catch(() => setRows([])); }, []);

  if (!rows) return <div className="mt-2 rounded-2xl bg-card p-4 text-sm text-text-secondary shadow-card">Loading leaderboard…</div>;
  if (rows.length === 0) return <div className="mt-2 rounded-2xl bg-card p-4 text-sm text-text-secondary shadow-card">No players yet.</div>;

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  // Reorder podium so #1 is in the middle
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="mt-2 rounded-[20px] bg-card p-4 shadow-card">
      {/* Podium */}
      <div className="grid grid-cols-3 items-end gap-2 pt-2">
        {podium.map((entry) => {
          const realRank = top3.indexOf(entry) + 1;
          const isFirst = realRank === 1;
          const height = isFirst ? "h-28" : realRank === 2 ? "h-20" : "h-16";
          const color = isFirst
            ? "[background:var(--gradient-hero)]"
            : realRank === 2
            ? "bg-gradient-to-b from-[#BFD7FF] to-[#8FB8FF]"
            : "bg-gradient-to-b from-[#FFD9B0] to-[#FFB870]";
          const cfg = entry.avatar_config ?? avatarFromSeed(entry.user_id);
          return (
            <button
              key={entry.user_id}
              type="button"
              onClick={() => onSelect(entry)}
              className="flex flex-col items-center text-center"
            >
              <div className="relative">
                {isFirst && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-base">👑</div>}
                <div className={`h-12 w-12 overflow-hidden rounded-full ring-4 ${isFirst ? "ring-primary" : "ring-card"} shadow-card`}>
                  <Avatar config={cfg} size={48} />
                </div>
              </div>
              <p className="mt-1.5 max-w-[6.5rem] truncate text-[11px] font-extrabold text-foreground">
                {entry.display_name ?? "Explorer"}
              </p>
              <p className="text-[10px] font-bold text-text-secondary">{entry.total_xp} XP</p>
              <div className={`mt-2 flex w-full items-start justify-center rounded-t-xl ${color} ${height} pt-2 text-base font-black text-white`}>
                {realRank}
              </div>
            </button>
          );
        })}
      </div>

      {/* Rest of the list */}
      {rest.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {rest.map((entry, i) => {
            const cfg = entry.avatar_config ?? avatarFromSeed(entry.user_id);
            const me = entry.user_id === currentUserId;
            return (
              <button
                key={entry.user_id}
                type="button"
                onClick={() => onSelect(entry)}
                className={`flex items-center gap-3 rounded-2xl p-2.5 text-left transition active:scale-[0.99] ${
                  me ? "bg-[#F4ECFB] ring-1 ring-primary/30" : "bg-background/60"
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-black text-text-secondary">
                  {i + 4}
                </span>
                <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-card">
                  <Avatar config={cfg} size={36} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-foreground">
                    {entry.display_name ?? "Explorer"}
                    {me && <span className="ml-1 text-[10px] font-bold text-primary">YOU</span>}
                  </p>
                  <p className="text-[10px] font-bold text-text-secondary">{entry.total_xp} XP</p>
                </div>
                <span className="text-primary">→</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ClassPlayer({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const { user, isGuest } = usePlayerAuth();
  const [data, setData] = useState<{ cls: any; layers: any[] } | null | "missing">(null);
  const [idx, setIdx] = useState(0);
  const [earned, setEarned] = useState(0);
  const [playerAvatar, setPlayerAvatar] = useState<AvatarConfig | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    import("@/studio/catalog").then(async ({ loadPublishedClass }) => {
      const r = await loadPublishedClass(slug);
      setData(r ?? "missing");
    });
  }, [slug]);

  useEffect(() => {
    if (!user) { setPlayerAvatar(null); setPlayerName(null); return; }
    loadProfile(user.id)
      .then((p) => {
        setPlayerAvatar(p?.avatar_config ?? avatarFromSeed(user.id));
        setPlayerName(p?.display_name ?? user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? null);
      })
      .catch(() => setPlayerAvatar(avatarFromSeed(user.id)));
  }, [user]);

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
    const greetName = playerName ?? "friend";
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-[#7B2FBE] to-[#3D1568] p-6 text-center text-white">
        <div className="mt-10 flex justify-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-white/40 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <Avatar config={playerAvatar} size={112} />
          </div>
        </div>
        <div className="mt-3 text-4xl">🎉</div>
        <h1 className="mt-2 text-2xl font-black">Great job, {greetName}!</h1>
        <p className="mt-1 text-sm opacity-90">You earned</p>
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
