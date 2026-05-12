// Shared lobby + friend-gate for multiplayer-only missions.
// - Verifies the player has at least 1 friend (otherwise blocks with CTA to /club)
// - Generates a room code, gives a shareable invite link
// - Tracks presence so the host knows when their friend joins
// - Hands a ready supabase channel to the parent mission via onReady

import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Users, Copy, Check, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerAuth } from "@/game/PlayerAuth";
import { listFriendships } from "@/game/club/clubApi";

export function makeRoomCode(len = 5): string {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

export type LobbyPeer = { key: string; name: string };

export function FriendGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = usePlayerAuth();
  const [friendCount, setFriendCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    listFriendships(user.id)
      .then((fs) => setFriendCount(fs.filter((f) => f.status === "accepted").length))
      .catch(() => setFriendCount(0));
  }, [user]);

  if (loading || friendCount === null) {
    return <div className="flex h-[60vh] items-center justify-center text-[#666]">Loading…</div>;
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <p className="text-sm font-bold text-foreground">Sign in to play multiplayer missions.</p>
        <Link to="/" className="mt-3 inline-block rounded-pill bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground">Home</Link>
      </div>
    );
  }
  if (friendCount === 0) {
    return (
      <div className="mx-auto max-w-md px-5 py-6">
        <div className="rounded-3xl bg-gradient-to-br from-fuchsia-500 to-violet-600 p-6 text-center text-white shadow-pop">
          <div className="text-5xl">👯</div>
          <h1 className="mt-2 text-xl font-black">Friends only!</h1>
          <p className="mt-1 text-xs font-bold opacity-90">
            This mission is exclusive to players who have at least one friend in their Sementa Club.
          </p>
        </div>
        <Link
          to="/club"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-card p-4 shadow-card"
        >
          <UserPlus size={16} className="text-primary" />
          <span className="text-sm font-extrabold text-foreground">Add a friend in the Club</span>
        </Link>
        <Link to="/" className="mt-3 block text-center text-[11px] font-bold text-text-secondary underline">
          Back to home
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}

/** Lobby UI: shows code, copy-link, presence list, and a Start button when 2+ in room. */
export function MultiplayerLobby({
  title,
  subtitle,
  emoji,
  gradient,
  channelKey,
  initialCode,
  minPlayers = 2,
  startLabel = "Start",
  onStart,
  backTo = "/",
}: {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  channelKey: string;
  initialCode?: string;
  minPlayers?: number;
  startLabel?: string;
  onStart: (ctx: { code: string; channel: ReturnType<typeof supabase.channel>; isHost: boolean; me: LobbyPeer; peers: LobbyPeer[] }) => void;
  backTo?: string;
}) {
  const { user } = usePlayerAuth();
  const [code, setCode] = useState<string>(initialCode ?? "");
  const [phase, setPhase] = useState<"choose" | "lobby">(initialCode ? "lobby" : "choose");
  const [isHost, setIsHost] = useState<boolean>(!initialCode);
  const [peers, setPeers] = useState<LobbyPeer[]>([]);
  const [copied, setCopied] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const myName = (user?.user_metadata as any)?.display_name || user?.email?.split("@")[0] || "You";
  const myKey = user?.id ?? `g-${Math.random().toString(36).slice(2, 8)}`;
  const me: LobbyPeer = { key: myKey, name: myName };

  // join channel when in lobby
  useEffect(() => {
    if (phase !== "lobby" || !code) return;
    const ch = supabase.channel(`mission:${channelKey}:${code}`, {
      config: { broadcast: { self: false }, presence: { key: myKey } },
    });
    channelRef.current = ch;

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState() as Record<string, Array<{ name: string }>>;
      const list: LobbyPeer[] = Object.entries(state).map(([k, arr]) => ({
        key: k,
        name: arr[0]?.name ?? "Friend",
      }));
      setPeers(list);
    });

    ch.on("broadcast", { event: "start" }, (payload) => {
      const p = payload.payload as { hostKey: string };
      if (p.hostKey !== myKey) {
        // guest receives start signal
        const allPeers: LobbyPeer[] = (function getList() {
          const state = ch.presenceState() as Record<string, Array<{ name: string }>>;
          return Object.entries(state).map(([k, arr]) => ({ key: k, name: arr[0]?.name ?? "Friend" }));
        })();
        onStart({ code, channel: ch, isHost: false, me, peers: allPeers });
      }
    });

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({ name: myName });
      }
    });
    return () => {
      ch.untrack();
      ch.unsubscribe();
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, code, channelKey]);

  async function copy() {
    const url = `${window.location.origin}${window.location.pathname}?code=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  }

  if (phase === "choose") {
    return (
      <div className="mx-auto max-w-md px-5 py-6">
        <BackBar to={backTo} />
        <div className={`mt-3 rounded-3xl p-6 text-center text-white shadow-pop ${gradient}`}>
          <div className="text-5xl">{emoji}</div>
          <h1 className="mt-2 text-2xl font-black">{title}</h1>
          <p className="mt-1 text-xs font-bold opacity-90">{subtitle}</p>
          <div className="mt-3 inline-flex items-center gap-1 rounded-pill bg-white/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider">
            👯 Friends-only
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <button
            onClick={() => { setIsHost(true); setCode(makeRoomCode()); setPhase("lobby"); }}
            className="w-full rounded-2xl bg-card p-5 text-left shadow-card transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎫</span>
              <div className="flex-1">
                <div className="text-base font-black text-foreground">Create a room</div>
                <div className="text-xs font-bold text-text-secondary">Get an invite link to send a friend.</div>
              </div>
            </div>
          </button>

          <JoinByCode onJoin={(c) => { setIsHost(false); setCode(c); setPhase("lobby"); }} />
        </div>
      </div>
    );
  }

  const ready = peers.length >= minPlayers;

  return (
    <div className="mx-auto max-w-md px-5 py-6">
      <BackBar to={backTo} />
      <div className={`mt-3 rounded-3xl p-6 text-center text-white shadow-pop ${gradient}`}>
        <div className="text-5xl">{emoji}</div>
        <h1 className="mt-2 text-2xl font-black">{title}</h1>
        <p className="mt-1 text-xs font-bold opacity-90">{subtitle}</p>
      </div>

      <div className="mt-4 rounded-2xl bg-card p-4 shadow-card">
        <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
          <Users size={14} /> Room code
        </div>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 rounded-pill bg-muted px-4 py-2 text-center text-lg font-black tracking-[0.3em] text-foreground">
            {code}
          </code>
          <button
            onClick={copy}
            className="flex items-center gap-1 rounded-pill bg-primary px-3 py-2 text-[11px] font-extrabold text-primary-foreground"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Invite"}
          </button>
        </div>
        <p className="mt-2 text-[11px] font-bold text-text-secondary">
          Send the invite link to your friend. The mission starts when both of you are here.
        </p>

        <div className="mt-3 space-y-1">
          {peers.length === 0 && (
            <p className="text-[11px] font-bold text-text-secondary">Connecting…</p>
          )}
          {peers.map((p) => (
            <div key={p.key} className="flex items-center gap-2 rounded-pill bg-muted px-3 py-1.5 text-[11px] font-extrabold text-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {p.name}{p.key === myKey ? " (you)" : ""}
            </div>
          ))}
        </div>
      </div>

      {isHost ? (
        <button
          disabled={!ready}
          onClick={() => {
            const ch = channelRef.current!;
            ch.send({ type: "broadcast", event: "start", payload: { hostKey: myKey } });
            onStart({ code, channel: ch, isHost: true, me, peers });
          }}
          className={`mt-4 w-full rounded-2xl py-4 text-center text-sm font-black shadow-pop transition ${
            ready ? "bg-primary text-primary-foreground active:scale-[0.99]" : "bg-muted text-text-secondary"
          }`}
        >
          {ready ? `${startLabel} →` : `Waiting for friend (${peers.length}/${minPlayers})…`}
        </button>
      ) : (
        <div className="mt-4 rounded-2xl bg-muted p-4 text-center text-xs font-bold text-text-secondary">
          Waiting for the host to start…
        </div>
      )}
    </div>
  );
}

function JoinByCode({ onJoin }: { onJoin: (code: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const c = val.trim().toUpperCase(); if (c.length >= 4) onJoin(c); }}
      className="rounded-2xl bg-card p-5 shadow-card"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔑</span>
        <div className="flex-1">
          <div className="text-base font-black text-foreground">Join with a code</div>
          <div className="text-xs font-bold text-text-secondary">Got an invite from a friend?</div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value.toUpperCase())}
          placeholder="ABCDE"
          maxLength={6}
          className="flex-1 rounded-pill bg-muted px-4 py-2 text-center text-base font-black tracking-[0.25em] text-foreground focus:outline-none"
        />
        <button type="submit" className="rounded-pill bg-primary px-4 text-xs font-extrabold text-primary-foreground">Join</button>
      </div>
    </form>
  );
}

function BackBar({ to }: { to: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-xs font-extrabold text-text-secondary">
      <ArrowLeft size={14} /> Back
    </Link>
  );
}
