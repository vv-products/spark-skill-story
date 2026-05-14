import { Check, Lock, Play, RotateCcw, Clock } from "lucide-react";
import type { HClass } from "@/studio/catalog";
import type { ClassStatus } from "../unlocks";

type Props = {
  cls: HClass;
  index: number;
  status: ClassStatus;
  xp: number;
  accent: string;
  onClick: () => void;
};

export function ClassPill({ cls, index, status, xp, accent, onClick }: Props) {
  const playable = status !== "locked";
  const ctaLabel =
    status === "completed" ? "Replay" : status === "in_progress" ? "Continue" : status === "current" ? "Play" : "Locked";
  const Icon =
    status === "completed" ? Check : status === "locked" ? Lock : status === "in_progress" ? Play : Play;

  return (
    <button
      type="button"
      disabled={!playable}
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border bg-white px-4 py-3 text-left shadow-sm transition-all ${
        playable ? "hover:-translate-y-0.5 hover:shadow-md cursor-pointer" : "opacity-55 cursor-not-allowed"
      }`}
      style={{
        borderColor: status === "completed" ? `${accent}55` : "rgba(0,0,0,0.06)",
        background: status === "completed" ? `${accent}0a` : "white",
      }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
        style={{
          background:
            status === "completed" ? accent : status === "locked" ? "#9ca3af" : `${accent}cc`,
        }}
      >
        {status === "completed" ? <Check size={18} strokeWidth={3} /> : status === "locked" ? <Lock size={14} /> : <span className="text-[12px] font-black">{index}</span>}
      </span>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-black text-foreground">{cls.title}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] font-bold text-text-secondary">
          {cls.estimatedMinutes ? (
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> ~{cls.estimatedMinutes} min
            </span>
          ) : null}
          {xp > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-extrabold text-gold-foreground">
              ⚡ {xp} XP
            </span>
          )}
          {status === "in_progress" && <span style={{ color: accent }}>· in progress</span>}
        </div>
      </div>

      {status === "locked" ? (
        <Lock size={16} className="shrink-0 text-text-secondary" />
      ) : (
        <span
          className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black text-white"
          style={{ background: status === "completed" ? "#16a34a" : accent }}
        >
          {status === "completed" ? <RotateCcw size={11} /> : <Play size={11} fill="currentColor" />}
          {ctaLabel}
        </span>
      )}
    </button>
  );
}
