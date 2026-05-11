import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { PlayerAuthProvider, usePlayerAuth } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { Avatar } from "@/game/avatar/Avatar";
import { avatarFromSeed } from "@/game/avatar/config";
import { lookupCode, sendFriendRequest, type FriendProfile } from "@/game/club/clubApi";

export const Route = createFileRoute("/club/join/$code")({
  head: () => ({
    meta: [
      { title: "Join on Sementa" },
      { name: "description", content: "Add a friend on Sementa." },
    ],
  }),
  component: JoinRoute,
});

function JoinRoute() {
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <JoinInner />
        <Toaster position="bottom-center" richColors />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}

function JoinInner() {
  const { code } = Route.useParams();
  const { user, loading } = usePlayerAuth();
  const navigate = useNavigate();
  const [target, setTarget] = useState<FriendProfile | null | "loading" | "notfound">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    lookupCode(code)
      .then((p) => setTarget(p ?? "notfound"))
      .catch(() => setTarget("notfound"));
  }, [code]);

  async function send() {
    if (!user) {
      toast.error("Sign in first to add a friend");
      navigate({ to: "/" });
      return;
    }
    if (!target || target === "loading" || target === "notfound") return;
    setBusy(true);
    try {
      await sendFriendRequest(user.id, target.user_id);
      toast.success(`Request sent to ${target.display_name ?? "your friend"}!`);
      navigate({ to: "/club" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Couldn't send request");
    } finally {
      setBusy(false);
    }
  }

  if (loading || target === "loading") {
    return <div className="flex h-[100dvh] items-center justify-center text-[#666]">Loading…</div>;
  }
  if (target === "notfound") {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl">🤔</div>
        <h1 className="mt-3 text-lg font-black text-[#1A1A2E]">Code not found</h1>
        <p className="mt-1 text-sm text-[#666]">The link "{code}" doesn't match anyone.</p>
        <button
          onClick={() => navigate({ to: "/club" })}
          className="mt-6 rounded-full bg-[#7B2FBE] px-6 py-3 text-sm font-extrabold text-white shadow"
        >
          Go to Sementa Club
        </button>
      </div>
    );
  }

  if (!target) return null;
  const cfg = target.avatar_config ?? avatarFromSeed(target.user_id);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-32 text-center">
      <p className="text-xs font-extrabold uppercase tracking-wider text-[#7B2FBE]">Sementa Club</p>
      <h1 className="mt-2 text-2xl font-black text-[#1A1A2E]">Add a friend?</h1>
      <div className="mt-6 h-32 w-32 overflow-hidden rounded-full ring-4 ring-[#F4ECFB] shadow bg-[#F0F0FA]">
        {target.avatar_image_url ? (
          <img src={target.avatar_image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <Avatar config={cfg} size={128} />
        )}
      </div>
      <p className="mt-4 text-lg font-black text-[#1A1A2E]">{target.display_name ?? "Explorer"}</p>
      <p className="mt-1 text-xs font-bold text-[#666]">wants to be your friend on Sementa</p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
        <button
          onClick={send}
          disabled={busy}
          className="rounded-full bg-gradient-to-r from-[#7B2FBE] to-[#9B5BE0] py-3.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(123,47,190,0.4)] disabled:opacity-60"
        >
          {busy ? "Sending…" : user ? "Send friend request" : "Sign in to add friend"}
        </button>
        <button
          onClick={() => navigate({ to: "/" })}
          className="rounded-full bg-white py-3 text-sm font-extrabold text-[#666] border border-[#E0E0EA]"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
