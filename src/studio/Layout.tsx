import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { useStudio } from "./StudioContext";
import { useStudioAuth } from "./auth";
import { Btn } from "./ui";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "▦" },
  { key: "library", label: "Content Library", icon: "▤" },
  { key: "missions", label: "Missions", icon: "✦" },
  { key: "welcome-cards", label: "Welcome Cards", icon: "★" },
  { key: "avatars", label: "Avatars", icon: "☻" },
  { key: "task-types", label: "Task Types", icon: "◇" },
] as const;

export function StudioLayout({ children, title, actions }: { children: ReactNode; title: string; actions?: ReactNode }) {
  const { view, setView, unsaved, save } = useStudio();
  const { user, roles, signOut } = useStudioAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const active =
    view.kind === "dashboard" ? "dashboard" :
    view.kind === "task-types" ? "task-types" :
    view.kind === "welcome-cards" ? "welcome-cards" :
    view.kind === "avatars" ? "avatars" :
    "library";

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between gap-2 px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#7B2FBE]" />
          <span className="text-[17px] font-bold tracking-tight text-white">Sementa Studio</span>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-md p-1 text-white/70 hover:bg-white/10 md:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="mt-2 flex-1 px-3">
        {NAV.map(item => {
          const isActive = item.key === active || (item.key === "library" && (view.kind === "library" || view.kind === "module" || view.kind === "class"));
          return (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === "dashboard") setView({ kind: "dashboard" });
                else if (item.key === "library") setView({ kind: "library" });
                else if (item.key === "task-types") setView({ kind: "task-types" });
                else if (item.key === "welcome-cards") setView({ kind: "welcome-cards" });
                else if (item.key === "avatars") setView({ kind: "avatars" });
                setMobileOpen(false);
              }}
              className={`mb-1 flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                isActive ? "bg-[#7B2FBE] text-white" : "text-[#AAAACC] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="w-5 text-center text-base">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mx-3 mb-4 rounded-[8px] bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7B2FBE] text-sm font-bold uppercase text-white">
            {(user?.email ?? "?").slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">{user?.email ?? "Guest"}</div>
            <div className="text-[11px] text-[#AAAACC] capitalize">{roles.join(" · ") || "no role"}</div>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="mt-3 w-full rounded-[6px] border border-white/10 px-2 py-1.5 text-[11px] font-semibold text-[#AAAACC] hover:bg-white/5 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="studio-root flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside className="hidden w-[240px] flex-col bg-[#1A1A2E] text-[#AAAACC] md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile off-canvas */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[260px] max-w-[80vw] flex-col bg-[#1A1A2E] text-[#AAAACC] shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#F8F8FC]">
        <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between gap-3 border-b border-[#EBEBF5] bg-white px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-1.5 text-[#1A1A2E] hover:bg-[#F0F0F8] md:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="truncate text-[16px] font-bold text-[#1A1A2E] md:text-[18px]">{title}</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3">
            {unsaved && (
              <button onClick={save} className="inline-flex items-center gap-2 rounded-[8px] bg-[#FFF3D9] px-3 py-1.5 text-xs font-semibold text-[#A66D00] animate-pulse">
                ● Unsaved changes
              </button>
            )}
            {actions}
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export { Btn };
