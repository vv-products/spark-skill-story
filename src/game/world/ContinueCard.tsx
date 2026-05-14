import { Link } from "@tanstack/react-router";
import { Play, Sparkles } from "lucide-react";
import type { HClass, HModule, HTopic } from "@/studio/catalog";

type Props = {
  cls: HClass;
  topic: HTopic;
  module: HModule;
  accent: string;
  kind: "continue" | "start";
};

export function ContinueCard({ cls, topic, module, accent, kind }: Props) {
  return (
    <Link
      to="/play/$slug"
      params={{ slug: cls.slug }}
      className="group relative flex items-center gap-3 overflow-hidden rounded-3xl bg-white px-4 py-3.5 shadow-md ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
        style={{ background: accent }}
      >
        {kind === "continue" ? <Play size={22} fill="currentColor" /> : <Sparkles size={22} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: accent }}>
          {kind === "continue" ? "Continue" : "Start your journey"}
        </div>
        <div className="truncate text-sm font-black text-foreground">{cls.title}</div>
        <div className="mt-0.5 truncate text-[11px] font-bold text-text-secondary">
          {topic.name} · {module.name}
        </div>
      </div>
      <div
        className="shrink-0 rounded-full px-3 py-1 text-[11px] font-black text-white"
        style={{ background: accent }}
      >
        Play →
      </div>
    </Link>
  );
}
