import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Users, Inbox, QrCode } from "lucide-react";
import { usePlayerAuth } from "../PlayerAuth";
import { loadProfile } from "../profileApi";
import { JoinCard } from "./JoinCard";
import { AddFriend } from "./AddFriend";
import { FriendsList } from "./FriendsList";
import { RequestsInbox, type InboxItem } from "./RequestsInbox";
import {
  acceptRequest,
  declineRequest,
  listFriendships,
  loadProfilesByIds,
  removeFriendship,
  type FriendProfile,
  type Friendship,
} from "./clubApi";

type Tab = "code" | "friends" | "requests";

export function ClubPage({ initialTab = "code" }: { initialTab?: Tab }) {
  const { user, loading } = usePlayerAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [displayName, setDisplayName] = useState("Explorer");
  const [friendships, setFriendships] = useState<Friendship[] | null>(null);
  const [profiles, setProfiles] = useState<Map<string, FriendProfile>>(new Map());

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const fs = await listFriendships(user.id);
      setFriendships(fs);
      const ids = Array.from(
        new Set(fs.map((f) => (f.requester_id === user.id ? f.addressee_id : f.requester_id))),
      );
      const map = await loadProfilesByIds(ids);
      setProfiles(map);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Couldn't load your club");
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/" }); return; }
    loadProfile(user.id)
      .then((p) => setDisplayName(p?.display_name ?? user.user_metadata?.display_name ?? "Explorer"))
      .catch(() => {});
    refresh();
  }, [user, loading, navigate, refresh]);

  const friends = useMemo<FriendProfile[]>(() => {
    if (!friendships || !user) return [];
    return friendships
      .filter((f) => f.status === "accepted")
      .map((f) => profiles.get(f.requester_id === user.id ? f.addressee_id : f.requester_id))
      .filter((p): p is FriendProfile => Boolean(p));
  }, [friendships, profiles, user]);

  const inboxItems = useMemo<InboxItem[]>(() => {
    if (!friendships || !user) return [];
    return friendships
      .filter((f) => f.status === "pending")
      .map((f): InboxItem | null => {
        const otherId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
        const profile = profiles.get(otherId);
        if (!profile) return null;
        return {
          friendship: f,
          profile,
          direction: f.requester_id === user.id ? "outgoing" : "incoming",
        };
      })
      .filter((x): x is InboxItem => Boolean(x));
  }, [friendships, profiles, user]);

  const incomingCount = inboxItems.filter((i) => i.direction === "incoming").length;

  async function handleAccept(id: string) {
    try { await acceptRequest(id); toast.success("Friend added!"); await refresh(); }
    catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Couldn't accept"); }
  }
  async function handleDecline(id: string) {
    try { await declineRequest(id); await refresh(); }
    catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Couldn't decline"); }
  }
  async function handleRemove(otherUserId: string) {
    const f = friendships?.find(
      (x) => x.status === "accepted" && (x.requester_id === otherUserId || x.addressee_id === otherUserId),
    );
    if (!f) return;
    try { await removeFriendship(f.id); toast.success("Friend removed"); await refresh(); }
    catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Couldn't remove"); }
  }
  async function handleCancel(id: string) {
    try { await removeFriendship(id); await refresh(); }
    catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Couldn't cancel"); }
  }

  if (loading) {
    return <div className="flex h-[100dvh] items-center justify-center text-[#666]">Loading…</div>;
  }
  if (!user) return null;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#F4EEFD] to-white pb-32">
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#7B2FBE] shadow-sm border border-[#EBEBF5]"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-black text-[#1A1A2E]">Sementa Club</h1>
        <span className="w-10" />
      </header>

      {/* Tabs */}
      <div className="mx-5 mb-4 flex gap-1 rounded-full bg-white p-1 shadow-sm border border-[#F0F0F8]">
        <TabBtn active={tab === "code"} onClick={() => setTab("code")} icon={<QrCode size={14} />} label="My Code" />
        <TabBtn active={tab === "friends"} onClick={() => setTab("friends")} icon={<Users size={14} />} label={`Friends${friends.length ? ` (${friends.length})` : ""}`} />
        <TabBtn active={tab === "requests"} onClick={() => setTab("requests")} icon={<Inbox size={14} />} label="Requests" badge={incomingCount} />
      </div>

      <div className="space-y-4 px-5">
        {tab === "code" && (
          <>
            <JoinCard userId={user.id} displayName={displayName} />
            <AddFriend myUserId={user.id} onSent={refresh} />
          </>
        )}
        {tab === "friends" && <FriendsList friends={friends} onRemove={handleRemove} />}
        {tab === "requests" && (
          <RequestsInbox
            items={inboxItems}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}

function TabBtn({
  active, onClick, icon, label, badge,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-[11px] font-extrabold transition-colors ${
        active ? "bg-[#7B2FBE] text-white shadow" : "text-[#666]"
      }`}
    >
      {icon} {label}
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF3D71] px-1 text-[9px] font-black text-white shadow">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
