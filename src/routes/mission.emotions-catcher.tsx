import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { EmotionsCatcher } from "@/game/missions/EmotionsCatcher";

export const Route = createFileRoute("/mission/emotions-catcher")({
  head: () => ({
    meta: [
      { title: "Emotion Catcher — Sementa" },
      { name: "description", content: "Tap the flying answers that match the emotion prompt before they fly off-screen." },
    ],
  }),
  component: MissionPage,
});

function MissionPage() {
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <EmotionsCatcher />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
