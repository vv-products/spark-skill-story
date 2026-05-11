import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { ClubPage } from "@/game/club/ClubPage";

export const Route = createFileRoute("/club")({
  head: () => ({
    meta: [
      { title: "Sementa Club — friends" },
      { name: "description", content: "Connect with your friends on Sementa." },
    ],
  }),
  component: ClubRoute,
});

function ClubRoute() {
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <ClubPage />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
