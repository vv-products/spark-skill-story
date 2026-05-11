import { supabase } from "@/integrations/supabase/client";
import type { AvatarConfig } from "../avatar/config";

export type FriendCode = { user_id: string; code: string };
export type FriendshipStatus = "pending" | "accepted" | "declined";
export type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
};

export type FriendProfile = {
  user_id: string;
  display_name: string | null;
  avatar_image_url: string | null;
  avatar_config: AvatarConfig | null;
};

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars

function randomCode(): string {
  let out = "";
  for (let i = 0; i < 6; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out.slice(0, 3) + "-" + out.slice(3);
}

/** Get the current user's friend code, generating one if needed. */
export async function getOrCreateMyCode(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("friend_codes")
    .select("code")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("[club] read friend_code failed", error);
    throw new Error(error.message || "Couldn't load your code");
  }
  if (data?.code) return data.code;

  // Try a few times in case of `code` collision (user_id PK is also unique)
  let lastErr: unknown = null;
  for (let i = 0; i < 6; i++) {
    const code = randomCode();
    const { error: insErr } = await supabase
      .from("friend_codes")
      .insert({ user_id: userId, code });
    if (!insErr) return code;
    lastErr = insErr;
    const msg = String(insErr.message || "").toLowerCase();
    console.error("[club] insert friend_code failed", insErr);
    // If user already has a code (PK conflict on user_id), re-read it
    if (msg.includes("friend_codes_pkey") || msg.includes("user_id")) {
      const { data: again } = await supabase
        .from("friend_codes")
        .select("code")
        .eq("user_id", userId)
        .maybeSingle();
      if (again?.code) return again.code;
    }
    // Only retry on `code` unique-collision; otherwise surface the real error
    if (!msg.includes("friend_codes_code_key") && !msg.includes("duplicate")) {
      throw new Error(insErr.message || "Couldn't create your code");
    }
  }
  throw new Error(
    lastErr instanceof Error ? lastErr.message : "Couldn't generate a code, please try again",
  );
}

export async function rotateMyCode(userId: string): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = randomCode();
    const { error } = await supabase
      .from("friend_codes")
      .upsert({ user_id: userId, code }, { onConflict: "user_id" });
    if (!error) return code;
    if (!String(error.message).toLowerCase().includes("duplicate")) throw error;
  }
  throw new Error("Couldn't rotate code");
}

export async function lookupCode(code: string): Promise<FriendProfile | null> {
  const cleaned = code.trim().toUpperCase();
  const { data, error } = await supabase.rpc("lookup_friend_code", { _code: cleaned });
  if (error) throw error;
  const row = (data ?? [])[0];
  if (!row) return null;
  return {
    user_id: row.user_id,
    display_name: row.display_name,
    avatar_image_url: row.avatar_image_url,
    avatar_config: null,
  };
}

export async function listFriendships(userId: string): Promise<Friendship[]> {
  const { data, error } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status, created_at")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Friendship[];
}

export async function loadProfilesByIds(ids: string[]): Promise<Map<string, FriendProfile>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_config, avatars:avatar_id ( image_url )")
    .in("id", ids);
  if (error) throw error;
  const map = new Map<string, FriendProfile>();
  for (const p of data ?? []) {
    const av = (p as any).avatars;
    map.set(p.id, {
      user_id: p.id,
      display_name: (p as any).display_name ?? null,
      avatar_image_url: av?.image_url ?? null,
      avatar_config: ((p as any).avatar_config as AvatarConfig | null) ?? null,
    });
  }
  return map;
}

export async function sendFriendRequest(myId: string, otherUserId: string): Promise<void> {
  if (myId === otherUserId) throw new Error("That's you!");
  // Check if a friendship already exists in either direction
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status, requester_id, addressee_id")
    .or(
      `and(requester_id.eq.${myId},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${myId})`,
    )
    .maybeSingle();
  if (existing) {
    if (existing.status === "accepted") throw new Error("You're already friends");
    if (existing.status === "pending") throw new Error("A request is already pending");
    // declined -> allow re-sending by updating
    const { error } = await supabase
      .from("friendships")
      .update({ status: "pending", requester_id: myId, addressee_id: otherUserId })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: myId, addressee_id: otherUserId, status: "pending" });
  if (error) throw error;
}

export async function acceptRequest(id: string): Promise<void> {
  const { error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
  if (error) throw error;
}
export async function declineRequest(id: string): Promise<void> {
  const { error } = await supabase.from("friendships").update({ status: "declined" }).eq("id", id);
  if (error) throw error;
}
export async function removeFriendship(id: string): Promise<void> {
  const { error } = await supabase.from("friendships").delete().eq("id", id);
  if (error) throw error;
}

export function shareUrlFor(code: string): string {
  if (typeof window === "undefined") return `/club/join/${code}`;
  return `${window.location.origin}/club/join/${code}`;
}
