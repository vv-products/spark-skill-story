import { supabase } from "@/integrations/supabase/client";
import type { AvatarConfig } from "./avatar/config";

export type PlayerProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  avatar_config: AvatarConfig | null;
  bio: string | null;
  age: number | null;
};

export async function loadProfile(userId: string): Promise<PlayerProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, avatar_config, bio, age")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    display_name: data.display_name,
    avatar_url: data.avatar_url,
    avatar_config: (data.avatar_config as unknown as AvatarConfig | null) ?? null,
    bio: data.bio,
    age: data.age,
  };
}

export type LeaderboardEntry = {
  user_id: string;
  display_name: string | null;
  avatar_config: AvatarConfig | null;
  age: number | null;
  bio: string | null;
  total_xp: number;
};

export async function loadLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc("get_leaderboard", { _limit: limit });
  if (error) throw error;
  return (data ?? []).map((r: {
    user_id: string;
    display_name: string | null;
    avatar_config: unknown;
    age: number | null;
    bio: string | null;
    total_xp: number | string;
  }) => ({
    user_id: r.user_id,
    display_name: r.display_name,
    avatar_config: (r.avatar_config as AvatarConfig | null) ?? null,
    age: r.age,
    bio: r.bio,
    total_xp: Number(r.total_xp ?? 0),
  }));
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
