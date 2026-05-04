import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { AvatarProfilePage } from "@/game/AvatarProfilePage";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Sementa" },
      { name: "description", content: "Customize your avatar and profile." },
    ],
  }),
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <div className="min-h-[100dvh] w-full bg-[#E5E5F2]">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[430px] bg-background shadow-2xl">
        <PlayerAuthProvider>
          <AvatarProfilePage />
          <Toaster position="bottom-center" richColors />
        </PlayerAuthProvider>
      </div>
    </div>
  );
}
