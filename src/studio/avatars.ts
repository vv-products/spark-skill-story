import { supabase } from "@/integrations/supabase/client";

export type AvatarItem = {
  id: string;
  image_url: string;
  position: number;
  active: boolean;
};

export async function listAvatars(): Promise<AvatarItem[]> {
  const { data, error } = await supabase
    .from("avatars")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AvatarItem[];
}

export async function listActiveAvatars(): Promise<AvatarItem[]> {
  const { data, error } = await supabase
    .from("avatars")
    .select("*")
    .eq("active", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AvatarItem[];
}

export async function createAvatar(image_url: string): Promise<AvatarItem> {
  const { data, error } = await supabase
    .from("avatars")
    .insert({ image_url })
    .select("*")
    .single();
  if (error) throw error;
  return data as AvatarItem;
}

export async function updateAvatar(id: string, patch: Partial<AvatarItem>) {
  const { error } = await supabase.from("avatars").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteAvatar(id: string) {
  const { error } = await supabase.from("avatars").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadAvatarImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
