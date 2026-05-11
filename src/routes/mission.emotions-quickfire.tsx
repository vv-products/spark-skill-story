import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { EmotionsQuiz } from "@/game/missions/EmotionsQuiz";

const search = z.object({ code: z.string().optional() });

export const Route = createFileRoute("/mission/emotions-quickfire")({
  validateSearch: (raw) => search.parse(raw),
  head: () => ({
    meta: [
      { title: "Emotions Quick-Fire — Sementa" },
      { name: "description", content: "Rare quick-fire 10-question emotions challenge with fast music. Play solo or against a friend." },
    ],
  }),
  component: MissionPage,
});

function MissionPage() {
  const { code } = Route.useSearch();
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <EmotionsQuiz pace="quick" initialCode={code} />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
