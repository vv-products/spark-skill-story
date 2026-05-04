import { supabase } from "@/integrations/supabase/client";

export async function recordLayerXp(opts: { userId: string; classId: string; layerId: string; amount: number; source: string }) {
  const { error } = await supabase.from("xp_events").insert({
    user_id: opts.userId, class_id: opts.classId, layer_id: opts.layerId,
    amount: opts.amount, source: opts.source,
  });
  if (error) console.error("[xp_events]", error);
}

export async function recordClassComplete(opts: { userId: string; classId: string; xpEarned: number }) {
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

export type UserProgress = {
  totalXp: number;
  completedClassIds: Set<string>;
  // For each class the user has touched: aggregate xp earned + last activity timestamp
  perClass: Map<string, { xp: number; lastAt: number; layersTouched: number }>;
  streakDays: number;
};

function computeStreak(daySet: Set<string>): number {
  if (daySet.size === 0) return 0;
  // walk back from today (UTC date string) until a gap appears
  let streak = 0;
  const d = new Date();
  for (;;) {
    const key = d.toISOString().slice(0, 10);
    if (daySet.has(key)) { streak += 1; d.setUTCDate(d.getUTCDate() - 1); }
    else break;
  }
  // Allow streak to "still count" if the user simply hasn't played today yet:
  // if streak===0 but yesterday is in the set, count from yesterday.
  if (streak === 0) {
    const y = new Date();
    y.setUTCDate(y.getUTCDate() - 1);
    if (daySet.has(y.toISOString().slice(0, 10))) {
      streak = 1;
      const d2 = new Date(y);
      d2.setUTCDate(d2.getUTCDate() - 1);
      for (;;) {
        const key = d2.toISOString().slice(0, 10);
        if (daySet.has(key)) { streak += 1; d2.setUTCDate(d2.getUTCDate() - 1); }
        else break;
      }
    }
  }
  return streak;
}

export async function loadUserProgress(userId: string): Promise<UserProgress> {
  const [{ data: prog }, { data: xp }] = await Promise.all([
    supabase.from("class_progress").select("class_id, xp_earned, completed_at").eq("user_id", userId),
    supabase.from("xp_events").select("class_id, amount, created_at").eq("user_id", userId),
  ]);
  const events = xp ?? [];
  const totalXp = events.reduce((s, e) => s + (e.amount ?? 0), 0);

  const completedClassIds = new Set<string>(
    (prog ?? []).filter((p) => p.completed_at).map((p) => p.class_id),
  );

  const perClass = new Map<string, { xp: number; lastAt: number; layersTouched: number }>();
  for (const e of events) {
    if (!e.class_id) continue;
    const cur = perClass.get(e.class_id) ?? { xp: 0, lastAt: 0, layersTouched: 0 };
    cur.xp += e.amount ?? 0;
    cur.layersTouched += 1;
    const t = e.created_at ? new Date(e.created_at).getTime() : 0;
    if (t > cur.lastAt) cur.lastAt = t;
    perClass.set(e.class_id, cur);
  }

  const days = new Set<string>(
    events.filter((e) => e.created_at).map((e) => new Date(e.created_at!).toISOString().slice(0, 10)),
  );
  const streakDays = computeStreak(days);

  return { totalXp, completedClassIds, perClass, streakDays };
}
