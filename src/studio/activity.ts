import { supabase } from "@/integrations/supabase/client";

export type ActivityItem = {
  id: string;
  kind: "class" | "module" | "topic" | "pillar";
  title: string;
  context?: string;
  status?: "draft" | "in_review" | "published";
  when: string; // ISO timestamp
};

export async function loadRecentActivity(limit = 8): Promise<ActivityItem[]> {
  const [cls, mods, tops] = await Promise.all([
    supabase.from("classes").select("id, title, status, updated_at").order("updated_at", { ascending: false }).limit(limit),
    supabase.from("modules").select("id, title, updated_at").order("updated_at", { ascending: false }).limit(limit),
    supabase.from("topics").select("id, title, updated_at").order("updated_at", { ascending: false }).limit(limit),
  ]);

  const items: ActivityItem[] = [];
  for (const c of cls.data ?? []) {
    items.push({ id: `c-${c.id}`, kind: "class", title: c.title, status: c.status as any, when: c.updated_at });
  }
  for (const m of mods.data ?? []) {
    items.push({ id: `m-${m.id}`, kind: "module", title: m.title, when: m.updated_at });
  }
  for (const t of tops.data ?? []) {
    items.push({ id: `t-${t.id}`, kind: "topic", title: t.title, when: t.updated_at });
  }

  items.sort((a, b) => (a.when < b.when ? 1 : -1));
  return items.slice(0, limit);
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
