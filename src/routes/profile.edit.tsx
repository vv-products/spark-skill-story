import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { AvatarProfilePage } from "@/game/AvatarProfilePage";

export const Route = createFileRoute("/profile/edit")({
  head: () => ({
    meta: [
      { title: "Edit profile — Sementa" },
      { name: "description", content: "Customize your avatar and profile." },
    ],
  }),
  component: ProfileEditRoute,
});

function ProfileEditRoute() {
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <AvatarProfilePage />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
