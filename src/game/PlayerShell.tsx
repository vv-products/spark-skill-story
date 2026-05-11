import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Map, User, Settings } from "lucide-react";
import { usePlayerAuth } from "./PlayerAuth";
import { BottomNav } from "./Chrome";

type NavItem = {
  to: "/" | "/journey" | "/profile" | "/studio";
  label: string;
  icon: typeof Home;
};

const NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/journey", label: "Journey", icon: Map },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/studio", label: "Studio", icon: Settings },
];

/**
 * Shared responsive shell for player routes.
 *
 * - phone (< md):  centered 430px column with shadow on grey backdrop (today's look)
 * - tablet (md):   widened to ~720px column, same vertical layout
 * - desktop (lg+): persistent left sidebar nav + flexible content column up to ~960px,
 *                  decorative gradient backdrop. Bottom nav (where used) hides via `lg:hidden`.
 *
 * Children should be the screen content. The shell is auth-agnostic; place
 * <PlayerAuthProvider> inside the route file as today.
 */
export function PlayerShell({
  children,
  /** When true, the inner content area gets no padding so full-bleed scenes (MyJourney) can take over. */
  bleed = false,
}: {
  children: ReactNode;
  bleed?: boolean;
}) {
  return (
    <div className="min-h-[100dvh] w-full bg-[#E5E5F2] lg:bg-gradient-to-br lg:from-[#EFEAFB] lg:via-[#E5E5F2] lg:to-[#FCE9F0]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1440px] lg:gap-8 lg:px-8 lg:py-6">
        <DesktopSidebar />
        <div
          className={
            bleed
              ? "relative flex min-h-[100dvh] w-full flex-1 flex-col overflow-hidden bg-background lg:min-h-[calc(100dvh-3rem)] lg:rounded-[28px] lg:shadow-[0_30px_80px_-30px_rgba(60,40,120,0.35)]"
              : "relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-1 flex-col bg-background shadow-2xl md:max-w-[720px] lg:min-h-[calc(100dvh-3rem)] lg:max-w-[960px] lg:rounded-[28px] lg:shadow-[0_30px_80px_-30px_rgba(60,40,120,0.35)]"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function DesktopSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = usePlayerAuth();

  return (
    <aside className="sticky top-6 hidden h-[calc(100dvh-3rem)] w-[240px] shrink-0 flex-col rounded-[28px] bg-white/70 p-4 shadow-[0_20px_60px_-30px_rgba(60,40,120,0.3)] backdrop-blur-md lg:flex">
      <div className="flex items-center gap-2 px-2 py-3">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
        <span className="font-display text-2xl text-primary">Sementa</span>
      </div>
      <nav className="mt-4 flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const isActive =
            item.to === "/"
              ? pathname === "/"
              : pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-extrabold transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "text-foreground/70 hover:bg-white hover:text-foreground"
              }`}
            >
              <Icon size={18} strokeWidth={2.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {user && (
        <button
          onClick={signOut}
          className="mt-2 rounded-2xl border border-border bg-white px-3 py-2 text-xs font-bold text-text-secondary hover:bg-muted"
        >
          Sign out
        </button>
      )}
    </aside>
  );
}
