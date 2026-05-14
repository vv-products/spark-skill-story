import type { HPillar, HTopic, HModule, HClass } from "@/studio/catalog";

export type ProgressLike = { completedClassIds: Set<string> };

/** A class is "playable" only if it's published. We treat anything with status === "Published" as playable. */
export function publishedClasses(m: HModule): HClass[] {
  return m.classes.filter((c) => c.status === "Published");
}

export function moduleProgress(m: HModule, p: ProgressLike) {
  const pub = publishedClasses(m);
  const total = pub.length;
  const completed = pub.filter((c) => p.completedClassIds.has(c.id)).length;
  return { completed, total, isComplete: total > 0 && completed >= total };
}

export function topicProgress(t: HTopic, p: ProgressLike) {
  let completed = 0;
  let total = 0;
  for (const m of t.modules) {
    const mp = moduleProgress(m, p);
    completed += mp.completed;
    total += mp.total;
  }
  return { completed, total, isComplete: total > 0 && completed >= total };
}

/** Pillars are always unlocked. */
export function isPillarUnlocked(_pillar: HPillar): boolean {
  return true;
}

/** Topic N (0-indexed) unlocks once the FIRST module of topic N-1 is complete. */
export function isTopicUnlocked(pillar: HPillar, topicIndex: number, p: ProgressLike): boolean {
  if (topicIndex <= 0) return true;
  const prev = pillar.topics[topicIndex - 1];
  if (!prev) return true;
  const firstModule = prev.modules[0];
  if (!firstModule) return true; // nothing to gate on
  return moduleProgress(firstModule, p).isComplete;
}

/** Module N (0-indexed) within a topic unlocks once module N-1 is complete. */
export function isModuleUnlocked(topic: HTopic, moduleIndex: number, p: ProgressLike): boolean {
  if (moduleIndex <= 0) return true;
  const prev = topic.modules[moduleIndex - 1];
  if (!prev) return true;
  return moduleProgress(prev, p).isComplete;
}

/** Class N (0-indexed) within a module unlocks once class N-1 is complete. Operates on published classes only. */
export function isClassUnlocked(module: HModule, classIndex: number, p: ProgressLike): boolean {
  const pub = publishedClasses(module);
  if (classIndex <= 0) return true;
  const prev = pub[classIndex - 1];
  if (!prev) return true;
  return p.completedClassIds.has(prev.id);
}

/** First class to play in a module: first incomplete published class, falling back to first published. */
export function nextClassInModule(module: HModule, p: ProgressLike): HClass | null {
  const pub = publishedClasses(module);
  if (pub.length === 0) return null;
  return pub.find((c) => !p.completedClassIds.has(c.id)) ?? pub[0];
}
