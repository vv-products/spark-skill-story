import { supabase } from "@/integrations/supabase/client";
import type { AvatarConfig } from "./avatar/config";

export type PlayerProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  avatar_config: AvatarConfig | null;
  bio: string | null;
  age: number | null;
  avatar_id: string | null;
  avatar_image_url: string | null;
};

export async function loadProfile(userId: string): Promise<PlayerProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, avatar_config, bio, age, avatar_id, avatars:avatar_id ( image_url )")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const av = (data as any).avatars;
  return {
    id: data.id,
    display_name: data.display_name,
    avatar_url: data.avatar_url,
    avatar_config: (data.avatar_config as unknown as AvatarConfig | null) ?? null,
    bio: data.bio,
    age: data.age,
    avatar_id: (data as any).avatar_id ?? null,
    avatar_image_url: av?.image_url ?? null,
  };
}

export type LeaderboardEntry = {
  user_id: string;
  display_name: string | null;
  avatar_config: AvatarConfig | null;
  avatar_image_url: string | null;
  age: number | null;
  bio: string | null;
  total_xp: number;
};

export async function loadLeaderboard(limit = 20, scope: "all" | "friends" = "all"): Promise<LeaderboardEntry[]> {
  const fn = scope === "friends" ? "get_friend_leaderboard" : "get_leaderboard";
  const { data, error } = await supabase.rpc(fn, { _limit: limit });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    user_id: r.user_id,
    display_name: r.display_name,
    avatar_config: (r.avatar_config as AvatarConfig | null) ?? null,
    avatar_image_url: r.avatar_image_url ?? null,
    age: r.age,
    bio: r.bio,
    total_xp: Number(r.total_xp ?? 0),
  }));
}

export type XpBreakdownRow = { source: string; events: number; total_xp: number };
export async function loadXpBreakdown(userId: string): Promise<XpBreakdownRow[]> {
  const { data, error } = await supabase.rpc("get_user_xp_breakdown" as any, { _user_id: userId });
  if (error) throw error;
  return ((data ?? []) as any[]).map((r) => ({ source: r.source, events: Number(r.events ?? 0), total_xp: Number(r.total_xp ?? 0) }));
}

export async function saveProfile(
  userId: string,
  patch: { display_name?: string; bio?: string | null; age?: number | null; avatar_config?: AvatarConfig }
) {
  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId);
  if (error) throw error;
}
