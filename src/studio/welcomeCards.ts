import { supabase } from "@/integrations/supabase/client";

export type WelcomeCard = {
  id: string;
  hero_image_url: string | null;
  headline: string;
  subtitle: string | null;
  cta_label: string;
  cta_destination: string;
  active: boolean;
  position: number;
};

export async function listWelcomeCards(): Promise<WelcomeCard[]> {
  const { data, error } = await supabase
    .from("welcome_cards")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as WelcomeCard[];
}

export async function listActiveWelcomeCards(): Promise<WelcomeCard[]> {
  const { data, error } = await supabase
    .from("welcome_cards")
    .select("*")
    .eq("active", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as WelcomeCard[];
}

export async function createWelcomeCard(): Promise<WelcomeCard> {
  const { data, error } = await supabase
    .from("welcome_cards")
    .insert({ headline: "New welcome card", cta_label: "Start →", cta_destination: "/" })
    .select("*")
    .single();
  if (error) throw error;
  return data as WelcomeCard;
}

export async function updateWelcomeCard(id: string, patch: Partial<WelcomeCard>) {
  const { error } = await supabase.from("welcome_cards").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteWelcomeCard(id: string) {
  const { error } = await supabase.from("welcome_cards").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadWelcomeCardImage(cardId: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${cardId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("welcome-cards")
    .upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from("welcome-cards").getPublicUrl(path);
  return data.publicUrl;
}
