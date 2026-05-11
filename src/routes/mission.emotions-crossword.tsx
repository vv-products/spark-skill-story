import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { EmotionsCrossword } from "@/game/missions/EmotionsCrossword";

const search = z.object({ code: z.string().optional() });

export const Route = createFileRoute("/mission/emotions-crossword")({
  validateSearch: (raw) => search.parse(raw),
  head: () => ({
    meta: [
      { title: "Emotions Crossword — Sementa" },
      { name: "description", content: "A mini crossword about emotions. Play solo or with a friend." },
    ],
  }),
  component: MissionPage,
});

function MissionPage() {
  const { code } = Route.useSearch();
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <EmotionsCrossword initialCode={code} />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
