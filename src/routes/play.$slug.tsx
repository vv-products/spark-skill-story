import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { GameProvider } from "@/game/GameContext";
import { ClassPlayer } from "@/game/GamePlayer";

export const Route = createFileRoute("/play/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Sementa — ${params.slug.replace(/-/g, " ")}` },
      { name: "description", content: "Play this Sementa class." },
    ],
  }),
  component: PlayPage,
  errorComponent: ({ error }) => <div className="p-6">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Class not found</div>,
});

function PlayPage() {
  const { slug } = Route.useParams();
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <GameProvider>
          <ClassPlayer slug={slug} />
          <Toaster position="bottom-center" richColors />
        </GameProvider>
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
