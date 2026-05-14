import type { HPillar, HTopic, HModule, HClass } from "@/studio/catalog";

export type ProgressLike = {
  completedClassIds: Set<string>;
  perClass?: Map<string, { xp: number; lastAt: number; layersTouched: number }>;
};

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

/** Aggregate progress across all topics/modules of a pillar (published classes only). */
export function worldProgress(pillar: HPillar, p: ProgressLike) {
  let completed = 0;
  let total = 0;
  let xpEarned = 0;
  for (const t of pillar.topics) {
    for (const m of t.modules) {
      const pub = publishedClasses(m);
      total += pub.length;
      for (const c of pub) {
        if (p.completedClassIds.has(c.id)) completed += 1;
        const per = p.perClass?.get(c.id);
        if (per) xpEarned += per.xp;
      }
    }
  }
  return { completed, total, xpEarned, isComplete: total > 0 && completed >= total };
}

/** First locked topic + how many classes remain in the previous topic's first module. */
export function nextLockedTopic(pillar: HPillar, p: ProgressLike): { topic: HTopic; classesNeeded: number } | null {
  for (let i = 0; i < pillar.topics.length; i++) {
    if (!isTopicUnlocked(pillar, i, p)) {
      const prev = pillar.topics[i - 1];
      const firstModule = prev?.modules[0];
      if (!firstModule) return { topic: pillar.topics[i], classesNeeded: 1 };
      const mp = moduleProgress(firstModule, p);
      return { topic: pillar.topics[i], classesNeeded: Math.max(1, mp.total - mp.completed) };
    }
  }
  return null;
}

/** Most recently touched, not-yet-completed published class in this pillar. */
export function mostRecentInProgressClass(pillar: HPillar, p: ProgressLike): { cls: HClass; topic: HTopic; module: HModule } | null {
  let best: { cls: HClass; topic: HTopic; module: HModule; lastAt: number } | null = null;
  for (const t of pillar.topics) {
    for (const m of t.modules) {
      for (const c of publishedClasses(m)) {
        if (p.completedClassIds.has(c.id)) continue;
        const last = p.perClass?.get(c.id)?.lastAt ?? 0;
        if (!best || last > best.lastAt) best = { cls: c, topic: t, module: m, lastAt: last };
      }
    }
  }
  if (!best) return null;
  return { cls: best.cls, topic: best.topic, module: best.module };
}

/** Suggested "first" class to start in a pillar (Topic 1 → Module 1 → Class 1). */
export function firstPlayableClass(pillar: HPillar): { cls: HClass; topic: HTopic; module: HModule } | null {
  for (const t of pillar.topics) {
    for (const m of t.modules) {
      const pub = publishedClasses(m);
      if (pub.length > 0) return { cls: pub[0], topic: t, module: m };
    }
  }
  return null;
}

export function moduleEstimatedMinutes(module: HModule): number {
  let mins = 0;
  for (const c of publishedClasses(module)) mins += c.estimatedMinutes ?? 0;
  return mins;
}

export function topicEstimatedMinutes(topic: HTopic): number {
  let mins = 0;
  for (const m of topic.modules) mins += moduleEstimatedMinutes(m);
  return mins;
}

/** Class status within its module ladder. */
export type ClassStatus = "completed" | "in_progress" | "current" | "locked";
export function classStatus(module: HModule, classIndex: number, p: ProgressLike): ClassStatus {
  const pub = publishedClasses(module);
  const c = pub[classIndex];
  if (!c) return "locked";
  if (p.completedClassIds.has(c.id)) return "completed";
  if (!isClassUnlocked(module, classIndex, p)) return "locked";
  if ((p.perClass?.get(c.id)?.layersTouched ?? 0) > 0) return "in_progress";
  return "current";
}
