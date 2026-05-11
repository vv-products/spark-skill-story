import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { EmotionsQuiz } from "@/game/missions/EmotionsQuiz";

export const Route = createFileRoute("/mission/emotions-quickfire")({
  head: () => ({
    meta: [
      { title: "Emotions Quick-Fire — Sementa" },
      { name: "description", content: "Rare quick-fire 10-question emotions challenge with fast music." },
    ],
  }),
  component: () => (
    <PlayerAuthProvider>
      <PlayerShell>
        <EmotionsQuiz pace="quick" />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  ),
});
