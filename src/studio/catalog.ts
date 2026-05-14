// DB-backed catalog API. Replaces SEED_PILLARS as the source of truth.
import { supabase } from "@/integrations/supabase/client";
import type { AgeGroup, Character, Status } from "./data";
import { TASK_BY_CODE } from "./data";

export type DbLayer = {
  id: string;
  class_id: string;
  position: number;
  type: "foundation" | "quiz" | "simulation" | "reflection";
  title: string;
  config: Record<string, any>;
  xp_reward: number;
};

export type DbClass = {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  position: number;
  status: "draft" | "in_review" | "published";
  estimated_minutes: number | null;
  hero_image_url: string | null;
};

export type DbModule = { id: string; topic_id: string; slug: string; title: string; subtitle: string | null; position: number };
export type DbTopic = { id: string; pillar_id: string; slug: string; title: string; subtitle: string | null; position: number; age_groups: string[] | null };
export type DbPillar = { id: string; slug: string; title: string; subtitle: string | null; emoji: string | null; position: number };

// Compose hierarchy types matching the old shape used by Studio screens
export type HClass = {
  id: string;
  number: number;
  title: string;
  status: Status;
  layers: HLayer[];
  storyRecapUrl?: string;
  characterFocus?: Character[];
  emotionTag?: string;
  slug: string;
  subtitle?: string;
  heroImageUrl?: string | null;
  estimatedMinutes?: number | null;
};
export type HLayer = { id: string; taskCode: string; preview: string; fields: Record<string, any> };
export type HModule = { id: string; name: string; slug: string; status: Status; ages: AgeGroup[]; classes: HClass[] };
export type HTopic = { id: string; name: string; slug: string; ages: AgeGroup[]; modules: HModule[] };
export type HPillar = { id: string; name: string; slug: string; emoji: string; topics: HTopic[] };

const STATUS_FROM_DB: Record<DbClass["status"], Status> = {
  draft: "Draft",
  in_review: "In Review",
  published: "Published",
};
export const STATUS_TO_DB: Record<Status, DbClass["status"]> = {
  Draft: "draft",
  "In Review": "in_review",
  Published: "published",
};

function layerToHLayer(l: DbLayer): HLayer {
  const cfg = l.config ?? {};
  const taskCode = (cfg as any).taskCode ?? guessTaskCodeFromType(l.type);
  return {
    id: l.id,
    taskCode,
    preview: l.title,
    fields: cfg as Record<string, any>,
  };
}
function guessTaskCodeFromType(t: DbLayer["type"]) {
  return t === "foundation" ? "T01" : t === "quiz" ? "T03" : t === "simulation" ? "T07" : "T14";
}

export async function loadFullCatalog(): Promise<HPillar[]> {
  const [pillarsRes, topicsRes, modulesRes, classesRes, layersRes] = await Promise.all([
    supabase.from("pillars").select("*").order("position"),
    supabase.from("topics").select("*").order("position"),
    supabase.from("modules").select("*").order("position"),
    supabase.from("classes").select("*").order("position"),
    supabase.from("layers").select("*").order("position"),
  ]);
  for (const r of [pillarsRes, topicsRes, modulesRes, classesRes, layersRes]) {
    if (r.error) throw r.error;
  }

  const layersByClass = new Map<string, DbLayer[]>();
  for (const l of (layersRes.data ?? []) as DbLayer[]) {
    const arr = layersByClass.get(l.class_id) ?? [];
    arr.push(l);
    layersByClass.set(l.class_id, arr);
  }

  const classesByModule = new Map<string, DbClass[]>();
  for (const c of (classesRes.data ?? []) as DbClass[]) {
    const arr = classesByModule.get(c.module_id) ?? [];
    arr.push(c);
    classesByModule.set(c.module_id, arr);
  }

  const modulesByTopic = new Map<string, DbModule[]>();
  for (const m of (modulesRes.data ?? []) as DbModule[]) {
    const arr = modulesByTopic.get(m.topic_id) ?? [];
    arr.push(m);
    modulesByTopic.set(m.topic_id, arr);
  }

  const topicsByPillar = new Map<string, DbTopic[]>();
  for (const t of (topicsRes.data ?? []) as DbTopic[]) {
    const arr = topicsByPillar.get(t.pillar_id) ?? [];
    arr.push(t);
    topicsByPillar.set(t.pillar_id, arr);
  }

  return ((pillarsRes.data ?? []) as DbPillar[]).map<HPillar>((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.title,
    emoji: p.emoji ?? "•",
    topics: (topicsByPillar.get(p.id) ?? []).map<HTopic>((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.title,
      ages: ((t.age_groups ?? ["Explorer", "Builder", "Leader"]) as AgeGroup[]),
      modules: (modulesByTopic.get(t.id) ?? []).map<HModule>((m) => {
        const cls = (classesByModule.get(m.id) ?? []).map<HClass>((c) => ({
          id: c.id,
          slug: c.slug,
          number: c.position,
          title: c.title,
          subtitle: c.subtitle ?? undefined,
          status: STATUS_FROM_DB[c.status],
          emotionTag: c.subtitle ?? undefined,
          heroImageUrl: c.hero_image_url ?? null,
          estimatedMinutes: c.estimated_minutes,
          layers: (layersByClass.get(c.id) ?? []).map(layerToHLayer),
        }));
        // Module status = highest among its classes (Published > In Review > Draft); default Draft
        const status: Status = cls.some((c) => c.status === "Published")
          ? "Published"
          : cls.some((c) => c.status === "In Review")
            ? "In Review"
            : "Draft";
        return {
          id: m.id,
          slug: m.slug,
          name: m.title,
          status,
          ages: ["Explorer", "Builder", "Leader"],
          classes: cls,
        };
      }),
    })),
  }));
}

// ----- Mutations -----
export async function createTopic(pillarId: string, name: string, ages?: AgeGroup[]) {
  const slug = slugify(name);
  const { count } = await supabase.from("topics").select("*", { count: "exact", head: true }).eq("pillar_id", pillarId);
  const insert = { pillar_id: pillarId, slug, title: name, position: (count ?? 0) + 1, ...(ages && ages.length ? { age_groups: ages } : {}) };
  const { error } = await supabase.from("topics").insert(insert);
  if (error) throw error;
}

export async function createModule(topicId: string, name: string) {
  const slug = slugify(name);
  const { count } = await supabase.from("modules").select("*", { count: "exact", head: true }).eq("topic_id", topicId);
  const { error } = await supabase.from("modules").insert({ topic_id: topicId, slug, title: name, position: (count ?? 0) + 1 });
  if (error) throw error;
}

export async function createClass(moduleId: string, title: string, position: number) {
  const slug = `${slugify(title) || "class"}-${Date.now().toString(36)}`;
  const { data, error } = await supabase.from("classes").insert({
    module_id: moduleId, slug, title: title || "Untitled", position, status: "draft",
  }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteClass(classId: string) {
  await supabase.from("layers").delete().eq("class_id", classId);
  const { error } = await supabase.from("classes").delete().eq("id", classId);
  if (error) throw error;
}

export async function renameTopic(topicId: string, name: string) {
  const { error } = await supabase.from("topics").update({ title: name }).eq("id", topicId);
  if (error) throw error;
}
export async function updateTopic(topicId: string, patch: { name?: string; ages?: AgeGroup[] }) {
  const update: { title?: string; age_groups?: string[] } = {};
  if (patch.name !== undefined) update.title = patch.name;
  if (patch.ages !== undefined) update.age_groups = patch.ages;
  if (Object.keys(update).length === 0) return;
  const { error } = await supabase.from("topics").update(update).eq("id", topicId);
  if (error) throw error;
}
export async function renameModule(moduleId: string, name: string) {
  const { error } = await supabase.from("modules").update({ title: name }).eq("id", moduleId);
  if (error) throw error;
}
export async function renameClass(classId: string, title: string) {
  const { error } = await supabase.from("classes").update({ title }).eq("id", classId);
  if (error) throw error;
}

export async function deleteTopic(topicId: string) {
  const { data: mods } = await supabase.from("modules").select("id").eq("topic_id", topicId);
  const moduleIds = (mods ?? []).map(m => m.id);
  if (moduleIds.length) {
    const { data: cls } = await supabase.from("classes").select("id").in("module_id", moduleIds);
    const classIds = (cls ?? []).map(c => c.id);
    if (classIds.length) await supabase.from("layers").delete().in("class_id", classIds);
    await supabase.from("classes").delete().in("module_id", moduleIds);
    await supabase.from("modules").delete().in("id", moduleIds);
  }
  const { error } = await supabase.from("topics").delete().eq("id", topicId);
  if (error) throw error;
}
export async function deleteModule(moduleId: string) {
  const { data: cls } = await supabase.from("classes").select("id").eq("module_id", moduleId);
  const classIds = (cls ?? []).map(c => c.id);
  if (classIds.length) await supabase.from("layers").delete().in("class_id", classIds);
  await supabase.from("classes").delete().eq("module_id", moduleId);
  const { error } = await supabase.from("modules").delete().eq("id", moduleId);
  if (error) throw error;
}

export async function saveClass(c: HClass, opts: { publish?: boolean } = {}) {
  const status = opts.publish ? "published" : STATUS_TO_DB[c.status];
  const { error } = await supabase.from("classes").update({
    title: c.title || c.slug,
    subtitle: c.emotionTag ?? c.subtitle ?? null,
    status,
    position: c.number,
    hero_image_url: c.heroImageUrl ?? null,
  }).eq("id", c.id);
  if (error) throw error;

  // Replace layers
  await supabase.from("layers").delete().eq("class_id", c.id);
  if (c.layers.length > 0) {
    const rows = c.layers.map((l, idx) => {
      const def = TASK_BY_CODE[l.taskCode];
      return {
        class_id: c.id,
        position: idx + 1,
        type: layerTypeForTask(l.taskCode),
        title: l.preview || def?.name || `Layer ${idx + 1}`,
        config: { taskCode: l.taskCode, ...l.fields },
        xp_reward: def?.xp ?? 10,
      };
    });
    const { error: insErr } = await supabase.from("layers").insert(rows);
    if (insErr) throw insErr;
  }
}

function layerTypeForTask(code: string): DbLayer["type"] {
  const map: Record<string, DbLayer["type"]> = {
    T01: "foundation", T02: "foundation",
    T03: "quiz", T04: "quiz", T05: "quiz", T06: "quiz",
    T07: "simulation", T08: "simulation", T09: "simulation",
    T10: "reflection", T11: "reflection", T12: "reflection",
    T13: "reflection", T14: "reflection", T15: "reflection",
  };
  return map[code] ?? "foundation";
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

// Public read for the player game
export async function loadPublishedClass(slug: string) {
  const { data: cls, error } = await supabase.from("classes").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) throw error;
  if (!cls) return null;
  const { data: layers, error: lErr } = await supabase.from("layers").select("*").eq("class_id", cls.id).order("position");
  if (lErr) throw lErr;
  return { cls: cls as DbClass, layers: (layers ?? []) as DbLayer[] };
}

export async function loadPublishedClasses(): Promise<DbClass[]> {
  const { data, error } = await supabase.from("classes").select("*").eq("status", "published").order("position");
  if (error) throw error;
  return (data ?? []) as DbClass[];
}

// Returns total xp_reward summed per class_id, only for published classes' layers.
export async function loadPublishedClassXpTotals(): Promise<Map<string, number>> {
  const { data: cls } = await supabase.from("classes").select("id").eq("status", "published");
  const ids = (cls ?? []).map((c) => c.id);
  if (ids.length === 0) return new Map();
  const { data: layers } = await supabase.from("layers").select("class_id, xp_reward").in("class_id", ids);
  const totals = new Map<string, number>();
  for (const l of layers ?? []) {
    totals.set(l.class_id, (totals.get(l.class_id) ?? 0) + (l.xp_reward ?? 0));
  }
  return totals;
}
