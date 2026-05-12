import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { Shop } from "@/game/shop/Shop";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Orb Lab — Sementa Shop" },
      { name: "description", content: "Spend Flask Orbs earned from missions on frames, titles, and boosts." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <Shop />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
