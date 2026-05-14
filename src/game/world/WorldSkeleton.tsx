import { Skeleton } from "@/components/ui/skeleton";
import type { PillarTheme } from "../pillarTheme";

export function WorldSkeleton({ theme }: { theme: PillarTheme }) {
  return (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col"
      style={{ background: `linear-gradient(180deg, ${theme.glow} 0%, transparent 55%)` }}
      aria-busy="true"
      aria-label={`Loading ${theme.world}`}
    >
      <div className="px-5 pt-5 pb-4">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-7 w-20 rounded-full bg-white/70" />
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-2.5 w-2.5 rounded-full bg-white/70" />
            ))}
          </div>
        </div>

        {/* Title + mascot */}
        <div className="mt-3 flex items-end gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-7 w-2/3 rounded-md bg-white/70" />
            <Skeleton className="h-3 w-3/4 rounded bg-white/60" />
            <div className="mt-2 flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full bg-white/70" />
              <Skeleton className="h-6 w-24 rounded-full bg-white/70" />
            </div>
          </div>
          <Skeleton className="h-28 w-28 rounded-2xl bg-white/60" />
        </div>

        {/* Progress ring */}
        <div className="mt-4 flex items-center justify-center">
          <Skeleton className="h-28 w-28 rounded-full bg-white/70" />
        </div>

        {/* Continue card */}
        <div className="mt-4 space-y-2 rounded-3xl bg-white p-4 shadow-sm">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-5 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      </div>

      {/* Filters + topics */}
      <div className="flex-1 px-5 pb-8">
        <div className="flex gap-1.5 pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 shrink-0 rounded-full bg-white/70" />
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3 rounded" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                </div>
                <Skeleton className="h-7 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
