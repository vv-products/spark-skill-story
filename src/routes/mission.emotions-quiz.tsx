import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { EmotionsQuiz } from "@/game/missions/EmotionsQuiz";

export const Route = createFileRoute("/mission/emotions-quiz")({
  head: () => ({
    meta: [
      { title: "Emotions Quiz — Sementa" },
      { name: "description", content: "Self-paced 10-question emotions quiz with soothing music." },
    ],
  }),
  component: () => (
    <PlayerAuthProvider>
      <PlayerShell>
        <EmotionsQuiz pace="self-paced" />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  ),
});
