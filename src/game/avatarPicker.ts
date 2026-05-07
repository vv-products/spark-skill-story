import { supabase } from "@/integrations/supabase/client";
import { listActiveAvatars, type AvatarItem } from "@/studio/avatars";

export type { AvatarItem };
export { listActiveAvatars };

export async function setUserAvatar(userId: string, avatarId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_id: avatarId })
    .eq("id", userId);
  if (error) throw error;
}

export async function loadUserAvatar(userId: string): Promise<{ id: string; image_url: string } | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("avatar_id, avatars:avatar_id ( id, image_url )")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  const a = (data as any)?.avatars;
  return a ? { id: a.id, image_url: a.image_url } : null;
}
