import { supabase } from "@/integrations/supabase/client";

export async function recordLayerXp(opts: { userId: string; classId: string; layerId: string; amount: number; source: string }) {
  const { error } = await supabase.from("xp_events").insert({
    user_id: opts.userId, class_id: opts.classId, layer_id: opts.layerId,
    amount: opts.amount, source: opts.source,
  });
  if (error) console.error("[xp_events]", error);
}

export async function recordClassComplete(opts: { userId: string; classId: string; xpEarned: number }) {
  // Upsert progress row
  const { data: existing } = await supabase.from("class_progress")
    .select("id, xp_earned").eq("user_id", opts.userId).eq("class_id", opts.classId).maybeSingle();
  if (existing) {
    await supabase.from("class_progress").update({
      xp_earned: Math.max(existing.xp_earned, opts.xpEarned),
      completed_at: new Date().toISOString(),
    }).eq("id", existing.id);
  } else {
    await supabase.from("class_progress").insert({
      user_id: opts.userId, class_id: opts.classId,
      xp_earned: opts.xpEarned, completed_at: new Date().toISOString(),
    });
  }
}

export async function loadUserProgress(userId: string) {
  const [{ data: prog }, { data: xp }] = await Promise.all([
    supabase.from("class_progress").select("*").eq("user_id", userId),
    supabase.from("xp_events").select("amount").eq("user_id", userId),
  ]);
  const totalXp = (xp ?? []).reduce((s, e) => s + (e.amount ?? 0), 0);
  return { progress: prog ?? [], totalXp };
}
