import { createFileRoute } from "@tanstack/react-router";
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
    <div className="min-h-[100dvh] w-full bg-[#E5E5F2]">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[430px] overflow-hidden bg-background shadow-2xl">
        <MyJourney />
      </div>
    </div>
  );
}
