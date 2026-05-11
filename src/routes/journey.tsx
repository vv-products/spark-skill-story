import { createFileRoute } from "@tanstack/react-router";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { MyJourney } from "@/game/MyJourney";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "My Journey — Sementa" },
      { name: "description", content: "Choose your guide and explore their world." },
    ],
  }),
  component: JourneyRoute,
});

function JourneyRoute() {
  return (
    <PlayerAuthProvider>
      <PlayerShell bleed>
        <MyJourney />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
