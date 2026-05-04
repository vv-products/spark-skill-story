import { supabase } from "@/integrations/supabase/client";
import type { Class, Layer } from "./data";
import { TASK_BY_CODE } from "./data";

// Map our local class id (e.g. "c2") to a stable DB slug.
const CLASS_SLUG_BY_ID: Record<string, string> = {
  c1: "fair-appears",
  c2: "happy-stall",
  c3: "sad-corner",
  c4: "fear-house",
};

// Map task code -> DB layer_type enum
const TASK_TO_LAYER_TYPE: Record<string, "foundation" | "quiz" | "simulation" | "reflection"> = {
  T01: "foundation", T02: "foundation",
  T03: "quiz", T04: "quiz", T05: "quiz", T06: "quiz",
  T07: "simulation", T08: "simulation", T09: "simulation",
  T10: "reflection", T11: "reflection", T12: "reflection",
  T13: "reflection", T14: "reflection", T15: "reflection",
};

export function classSlug(localClassId: string) {
  return CLASS_SLUG_BY_ID[localClassId] ?? localClassId;
}

/**
 * Upsert one class (matched by slug under the Emotion Fair module) and
 * replace its layers with the current editor state.
 */
export async function saveClassToDb(localClass: Class, opts: { publish?: boolean } = {}) {
  const slug = classSlug(localClass.id);

  // Find or create the DB class row by slug under the seeded module
  const { data: moduleRow, error: modErr } = await supabase
    .from("modules").select("id").eq("slug", "emotion-fair").maybeSingle();
  if (modErr) throw modErr;
  if (!moduleRow) throw new Error("Module 'emotion-fair' not found in DB. Re-seed required.");

  const status = opts.publish ? "published" : "draft";

  const { data: existing, error: exErr } = await supabase
    .from("classes")
    .select("id")
    .eq("module_id", moduleRow.id)
    .eq("slug", slug)
    .maybeSingle();
  if (exErr) throw exErr;

  let classId = existing?.id;

  if (classId) {
    const { error } = await supabase.from("classes").update({
      title: localClass.title || slug,
      subtitle: localClass.emotionTag ?? null,
      status,
      position: localClass.number,
    }).eq("id", classId);
    if (error) throw error;
  } else {
    const { data: inserted, error } = await supabase.from("classes").insert({
      module_id: moduleRow.id,
      slug,
      title: localClass.title || slug,
      subtitle: localClass.emotionTag ?? null,
      status,
      position: localClass.number,
    }).select("id").single();
    if (error) throw error;
    classId = inserted.id;
  }

  // Replace layers
  const { error: delErr } = await supabase.from("layers").delete().eq("class_id", classId);
  if (delErr) throw delErr;

  if (localClass.layers.length > 0) {
    const rows = localClass.layers.map((l: Layer, idx: number) => {
      const def = TASK_BY_CODE[l.taskCode];
      return {
        class_id: classId!,
        position: idx + 1,
        type: TASK_TO_LAYER_TYPE[l.taskCode] ?? "foundation",
        title: l.preview || def?.name || `Layer ${idx + 1}`,
        config: { taskCode: l.taskCode, ...l.fields },
        xp_reward: def?.xp ?? 10,
      };
    });
    const { error: insErr } = await supabase.from("layers").insert(rows);
    if (insErr) throw insErr;
  }

  return { classId };
}
