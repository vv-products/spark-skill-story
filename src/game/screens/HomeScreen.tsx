import { useGame } from "../GameContext";
import { BottomNav } from "../Chrome";
import leo from "@/assets/leo.jpg";
import zara from "@/assets/maya.jpg";
import dash from "@/assets/dash.jpg";
import pip from "@/assets/pip.jpg";
import liveEvents from "@/assets/live-events.jpg";
import meetCharacters from "@/assets/meet-characters.jpg";
import leoAvatar from "@/assets/leo-avatar.png";
import mayaAvatar from "@/assets/maya-avatar.png";
import dashAvatar from "@/assets/dash-avatar.png";
import pipAvatar from "@/assets/pip-avatar.png";

export function HomeScreen() {
  const { setStep, xp, totalXp, streak } = useGame();
  const ringPct = Math.min(100, (xp / totalXp) * 100);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-background px-5 pt-5 pb-3">
        <h1 className="font-display text-3xl text-primary">Sementa</h1>
        <div className="flex items-center gap-3">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-card text-base">🔍</button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-card text-base">🔔</button>
          <div className="h-10 w-10 overflow-hidden rounded-full bg-card-gold ring-2 ring-card shadow-card">
            <img src={pipAvatar} alt="Alex" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>

      <main className="flex-1 px-5 pb-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-[24px] [background:var(--gradient-hero)] p-5 text-primary-foreground shadow-pop">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex-1 pt-1">
              <p className="text-xs font-bold text-white/85">Welcome back,</p>
              <p className="text-base font-extrabold text-text-accent drop-shadow-sm">
                Alex <span>👋</span>
              </p>
              <h2 className="mt-3 text-2xl font-black leading-tight drop-shadow-md">
                Leo needs your<br />help today...
              </h2>
              <button
                onClick={() => setStep("intro")}
                className="mt-4 inline-flex items-center gap-1 rounded-pill bg-white px-5 py-2.5 text-sm font-extrabold text-primary shadow-card transition-transform active:scale-[0.97]"
              >
                Start →
              </button>
            </div>
            <img
              src={leo}
              alt="Leo holding a small bird"
              className="h-40 w-32 -mr-2 -mt-2 rounded-2xl object-cover shadow-pop animate-float-soft"
            />
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatCard bg="bg-card-warm" icon="⭐" label="Your Stars" value="2,450" />
          <StatCard bg="bg-card-gold" icon="🏆" label="Your Level" value="Level 12" />
          <StatCard bg="bg-card-warm" icon="🔥" label="Learning Streak" value={`${streak} days`} />
        </div>

        {/* Your Journey */}
        <SectionHeader title="Your Journey" />
        <div className="-mx-5 mt-2 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <JourneyCard
            image={zara}
            title="Zara Gets Angry 😤"
            subtitle="Emotional Control"
            tags={["Emotions", "Episode 5"]}
            cta="Continue →"
            ctaVariant="primary"
            progress={ringPct}
            onClick={() => setStep("intro")}
            current
          />
          <JourneyCard
            image={dash}
            title="The Big Choice"
            subtitle="Decision Making"
            tags={["Decisions", "Episode 3"]}
            cta="Continue →"
            ctaVariant="primary"
            onClick={() => setStep("intro")}
          />
          <JourneyCard
            image={pip}
            title="Pip's Curiosity"
            subtitle="Discovery"
            tags={["Curiosity", "Episode 2"]}
            cta="Start →"
            ctaVariant="dark"
            onClick={() => setStep("intro")}
          />
        </div>

        {/* Your Missions */}
        <SectionHeader title="Your Missions" />
        <div className="-mx-5 mt-2 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <JourneyCard
            image={leo}
            title="Leo's Story Time"
            subtitle="Reading Skills"
            tags={["Reading", "Episode 1"]}
            cta="Start →"
            ctaVariant="dark"
            onClick={() => setStep("intro")}
          />
          <JourneyCard
            image={pip}
            title="Pip's Treasure"
            subtitle="Exploration Skills"
            tags={["Curiosity", "Episode 2"]}
            cta="Continue →"
            ctaVariant="primary"
            onClick={() => setStep("intro")}
          />
        </div>

        {/* Fun Activities */}
        <SectionHeader title="Fun Activities" hideAll />
        <div className="-mx-5 mt-2 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ActivityCard
            bg="bg-card-amber"
            image={meetCharacters}
            imageMode="top"
            title="Meet the Characters"
            description="Get to know your friends and their stories."
            cta="Explore →"
            onClick={() => setStep("intro")}
          />
          <ActivityCard
            bg="bg-[#E8E0F8]"
            image={liveEvents}
            imageMode="top"
            title="Live Events"
            description="Join live shows, challenges, and special events."
            cta="Join Now →"
            onClick={() => setStep("intro")}
          />
        </div>

        {/* Leaderboard */}
        <SectionHeader title="Leaderboard" subtitle="April 2026" />
        <div className="mt-2 rounded-[20px] bg-card p-4 shadow-card">
          {/* Podium */}
          <div className="grid grid-cols-3 items-end gap-2 pt-2">
            <PodiumStep
              rank={2}
              name="Charlie William"
              stars={509}
              avatar={dashAvatar}
              height="h-20"
              color="bg-gradient-to-b from-[#BFD7FF] to-[#8FB8FF]"
            />
            <PodiumStep
              rank={1}
              name="Alex"
              stars={520}
              avatar={leoAvatar}
              height="h-28"
              color="[background:var(--gradient-hero)]"
              crown
            />
            <PodiumStep
              rank={3}
              name="Zara Harry"
              stars={506}
              avatar={mayaAvatar}
              height="h-16"
              color="bg-gradient-to-b from-[#FFD9B0] to-[#FFB870]"
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <LeaderRow avatar={mayaAvatar} name="Ellison Caroll" stars={345} delta={20} up />
            <LeaderRow avatar={pipAvatar} name="Emma James" stars={340} delta={10} up={false} />
          </div>
        </div>

        <p className="mt-6 flex items-center justify-between text-[11px] font-bold text-text-secondary">
          <span>© 2026 Copyright. All rights reserved.</span>
          <span className="font-display text-base text-text-secondary">Sementa</span>
        </p>
      </main>

      <BottomNav />
    </div>
  );
}

/* ---------- Sub components ---------- */

function StatCard({ bg, icon, label, value }: { bg: string; icon: string; label: string; value: string }) {
  return (
    <div className={`rounded-2xl ${bg} p-3 shadow-card`}>
      <div className="text-2xl">{icon}</div>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">{label}</p>
      <p className="mt-0.5 text-sm font-black text-foreground">{value}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle, hideAll }: { title: string; subtitle?: string; hideAll?: boolean }) {
  return (
    <div className="mt-6 flex items-end justify-between">
      <div>
        <h3 className="text-base font-extrabold text-foreground">{title}</h3>
        {subtitle && <p className="text-[11px] font-bold text-text-secondary">{subtitle}</p>}
      </div>
      {!hideAll && (
        <button className="rounded-pill border border-border bg-card px-3 py-1 text-[11px] font-extrabold text-foreground shadow-card">
          View All ›
        </button>
      )}
      {hideAll && (
        <button className="rounded-pill border border-border bg-card px-3 py-1 text-[11px] font-extrabold text-foreground shadow-card">
          View All ›
        </button>
      )}
    </div>
  );
}

function JourneyCard({
  image, title, subtitle, tags, cta, ctaVariant, progress, onClick, current,
}: {
  image: string; title: string; subtitle: string; tags: string[]; cta: string;
  ctaVariant: "primary" | "dark"; progress?: number; onClick?: () => void; current?: boolean;
}) {
  return (
    <div className={`flex w-[260px] shrink-0 flex-col overflow-hidden rounded-2xl bg-card shadow-card ${current ? "ring-2 ring-primary" : ""}`}>
      <div className="relative h-32 w-full overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover" />
        {progress !== undefined && (
          <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded-pill bg-black/55 px-2 py-1 text-[10px] font-extrabold text-white backdrop-blur-sm">
            {Math.round(progress)}% <span className="text-white/70">◐</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-sm font-extrabold leading-tight text-foreground">{title}</p>
        <p className="mt-0.5 text-[11px] font-bold text-text-secondary">{subtitle}</p>
        <button
          onClick={onClick}
          className={`mt-3 w-full rounded-pill py-2 text-xs font-extrabold transition-transform active:scale-[0.97] ${
            ctaVariant === "primary"
              ? "bg-primary text-primary-foreground shadow-pop"
              : "bg-foreground text-primary-foreground"
          }`}
        >
          {cta}
        </button>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <span key={t} className="rounded-pill bg-tag px-2 py-0.5 text-[10px] font-extrabold text-tag-foreground">
                {t}
              </span>
            ))}
          </div>
          <span className="text-sm text-text-secondary">🔖</span>
        </div>
      </div>
    </div>
  );
}

function ActivityCard({
  bg, image, title, description, cta, onClick, imageMode = "bleed",
}: { bg: string; image: string; title: string; description: string; cta: string; onClick?: () => void; imageMode?: "bleed" | "top" }) {
  if (imageMode === "top") {
    return (
      <div className={`relative flex h-[456px] w-[300px] shrink-0 flex-col overflow-hidden rounded-[20px] ${bg} shadow-card`}>
        <img src={image} alt={title} className="h-[280px] w-full shrink-0 object-cover object-top" />
        <div className="flex flex-1 flex-col px-6 pb-6 pt-2">
          <p className="text-[20px] font-black leading-tight text-foreground">{title}</p>
          <p className="mt-3 text-base font-bold leading-snug text-text-secondary">{description}</p>
          <button
            onClick={onClick}
            className="mt-auto w-full rounded-pill bg-foreground py-4 text-lg font-extrabold text-primary-foreground transition-transform active:scale-[0.97]"
          >
            {cta}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={`relative flex h-56 w-[300px] shrink-0 flex-col justify-end overflow-hidden rounded-[20px] ${bg} p-4 shadow-card`}>
      <img
        src={image}
        alt={title}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-95 [mask-image:linear-gradient(to_bottom,black_45%,transparent_85%)]"
      />
      <div className="relative">
        <p className="text-base font-black text-foreground">{title}</p>
        <p className="mt-1 text-[11px] font-bold text-text-secondary">{description}</p>
        <button
          onClick={onClick}
          className="mt-3 w-full rounded-pill bg-foreground py-2.5 text-xs font-extrabold text-primary-foreground transition-transform active:scale-[0.97]"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

function PodiumStep({
  rank, name, stars, avatar, height, color, crown,
}: { rank: number; name: string; stars: number; avatar: string; height: string; color: string; crown?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {crown && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-base">👑</div>}
        <div className={`h-12 w-12 overflow-hidden rounded-full ring-4 ${rank === 1 ? "ring-primary" : "ring-card"} shadow-card`}>
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        </div>
      </div>
      <p className="mt-1.5 text-[11px] font-extrabold text-foreground">{name}</p>
      <p className="text-[10px] font-bold text-text-secondary">{stars} stars</p>
      <div className={`mt-2 flex w-full items-start justify-center rounded-t-xl ${color} ${height} pt-2 text-base font-black text-white`}>
        {rank}
      </div>
    </div>
  );
}

function LeaderRow({
  avatar, name, stars, delta, up,
}: { avatar: string; name: string; stars: number; delta: number; up: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-background/60 p-2.5">
      <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-card">
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-extrabold text-foreground">{name}</p>
        <p className="text-[10px] font-bold text-text-secondary">{stars} stars</p>
      </div>
      <span className={`flex items-center gap-0.5 text-xs font-extrabold ${up ? "text-[#2E7D32]" : "text-destructive"}`}>
        {delta} {up ? "▲" : "▼"}
      </span>
    </div>
  );
}
