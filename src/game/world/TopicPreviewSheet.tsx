import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Lock, Clock } from "lucide-react";
import type { HTopic } from "@/studio/catalog";
import { isModuleUnlocked, moduleEstimatedMinutes, moduleProgress, topicEstimatedMinutes, type ProgressLike } from "../unlocks";

type Props = {
  topic: HTopic | null;
  progress: ProgressLike;
  accent: string;
  onClose: () => void;
  onPickModule: (topicId: string, moduleId: string) => void;
};

export function TopicPreviewSheet({ topic, progress, accent, onClose, onPickModule }: Props) {
  const open = !!topic;
  const totalMins = topic ? topicEstimatedMinutes(topic) : 0;
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        {topic && (
          <>
            <SheetHeader className="text-left">
              <SheetTitle className="text-xl font-black" style={{ color: accent }}>
                {topic.name}
              </SheetTitle>
              <SheetDescription className="flex flex-wrap gap-3 text-xs font-bold">
                <span>{topic.modules.length} modules</span>
                {totalMins > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} /> ~{totalMins} min total
                  </span>
                )}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-4 flex flex-col gap-2">
              {topic.modules.map((m, i) => {
                const unlocked = isModuleUnlocked(topic, i, progress);
                const mp = moduleProgress(m, progress);
                const mins = moduleEstimatedMinutes(m);
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => unlocked && onPickModule(topic.id, m.id)}
                    className={`flex items-center gap-3 rounded-2xl border border-border bg-white px-3 py-2.5 text-left transition-all ${
                      unlocked ? "hover:-translate-y-0.5 hover:shadow-md cursor-pointer" : "opacity-55 cursor-not-allowed"
                    }`}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white"
                      style={{ background: unlocked ? accent : "#9ca3af" }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-black text-foreground">{m.name}</div>
                      <div className="mt-0.5 text-[11px] font-bold text-text-secondary">
                        {mp.total > 0 ? `${mp.completed}/${mp.total} classes` : "Coming soon"}
                        {mins > 0 ? ` · ~${mins} min` : ""}
                      </div>
                    </div>
                    {!unlocked && <Lock size={14} className="text-text-secondary" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
