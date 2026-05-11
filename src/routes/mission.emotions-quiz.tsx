import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { EmotionsQuiz } from "@/game/missions/EmotionsQuiz";

const search = z.object({ code: z.string().optional() });

export const Route = createFileRoute("/mission/emotions-quiz")({
  validateSearch: (raw) => search.parse(raw),
  head: () => ({
    meta: [
      { title: "Emotions Quiz — Sementa" },
      { name: "description", content: "Self-paced 10-question emotions quiz with soothing music. Play solo or with a friend." },
    ],
  }),
  component: MissionPage,
});

function MissionPage() {
  const { code } = Route.useSearch();
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <EmotionsQuiz pace="self-paced" initialCode={code} />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
