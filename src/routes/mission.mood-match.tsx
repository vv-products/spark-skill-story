import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { MoodMatch } from "@/game/missions/MoodMatch";

const search = z.object({ code: z.string().optional() });

export const Route = createFileRoute("/mission/mood-match")({
  validateSearch: (raw) => search.parse(raw),
  head: () => ({
    meta: [
      { title: "Mood Match — Sementa" },
      { name: "description", content: "Pick the same emotion as your friend. Co-op friends-only mission." },
    ],
  }),
  component: Page,
});

function Page() {
  const { code } = Route.useSearch();
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <MoodMatch initialCode={code} />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
