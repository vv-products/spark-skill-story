import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
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
    <div className="min-h-[100dvh] w-full bg-[#E5E5F2]">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[430px] bg-background shadow-2xl">
        <PlayerAuthProvider>
          <ClassPlayer slug={slug} />
          <Toaster position="bottom-center" richColors />
        </PlayerAuthProvider>
      </div>
    </div>
  );
}
