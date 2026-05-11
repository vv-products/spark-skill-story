import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { GrowthPage } from "@/game/GrowthPage";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Growth — Sementa" },
      { name: "description", content: "Your XP, leaderboard ranking, and friends." },
    ],
  }),
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <GrowthPage />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
