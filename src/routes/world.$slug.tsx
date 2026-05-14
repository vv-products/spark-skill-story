import { createFileRoute } from "@tanstack/react-router";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { WorldPage } from "@/game/WorldPage";

export const Route = createFileRoute("/world/$slug")({
  head: () => ({
    meta: [
      { title: "World — Sementa" },
      { name: "description", content: "Explore topics and modules in this world." },
    ],
  }),
  component: WorldRoute,
});

function WorldRoute() {
  const { slug } = Route.useParams();
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <WorldPage pillarSlug={slug} />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
