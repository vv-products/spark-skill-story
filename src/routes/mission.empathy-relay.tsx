import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { EmpathyRelay } from "@/game/missions/EmpathyRelay";

const search = z.object({ code: z.string().optional() });

export const Route = createFileRoute("/mission/empathy-relay")({
  validateSearch: (raw) => search.parse(raw),
  head: () => ({
    meta: [
      { title: "Empathy Relay — Sementa" },
      { name: "description", content: "Take turns answering with a friend to hit the team target. Co-op friends-only mission." },
    ],
  }),
  component: Page,
});

function Page() {
  const { code } = Route.useSearch();
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <EmpathyRelay initialCode={code} />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
