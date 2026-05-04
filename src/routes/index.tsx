import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
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
    <div className="min-h-[100dvh] w-full bg-[#E5E5F2]">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[430px] bg-background shadow-2xl">
        <PlayerAuthProvider>
          <GameHome />
          <Toaster position="bottom-center" richColors />
        </PlayerAuthProvider>
      </div>
    </div>
  );
}
