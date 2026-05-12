import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { EmotionDuel } from "@/game/missions/EmotionDuel";

const search = z.object({ code: z.string().optional() });

export const Route = createFileRoute("/mission/emotion-duel")({
  validateSearch: (raw) => search.parse(raw),
  head: () => ({
    meta: [
      { title: "Emotion Duel — Sementa" },
      { name: "description", content: "Head-to-head quick-fire emotions duel. Friends-only multiplayer." },
    ],
  }),
  component: Page,
});

function Page() {
  const { code } = Route.useSearch();
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <EmotionDuel initialCode={code} />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
