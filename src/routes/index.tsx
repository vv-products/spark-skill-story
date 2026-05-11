import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { GameHome } from "@/game/GamePlayer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sementa — Grow your inner world" },
      { name: "description", content: "Bite-sized social-emotional learning for kids and teens." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <GameHome />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
