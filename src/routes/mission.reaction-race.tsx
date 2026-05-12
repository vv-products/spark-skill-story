import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { ReactionRace } from "@/game/missions/ReactionRace";

const search = z.object({ code: z.string().optional() });

export const Route = createFileRoute("/mission/reaction-race")({
  validateSearch: (raw) => search.parse(raw),
  head: () => ({
    meta: [
      { title: "Reaction Race — Sementa" },
      { name: "description", content: "Best-of-7 emotion reaction race against a friend. Friends-only multiplayer." },
    ],
  }),
  component: Page,
});

function Page() {
  const { code } = Route.useSearch();
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <ReactionRace initialCode={code} />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
