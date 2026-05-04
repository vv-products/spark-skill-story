import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { SEED_PILLARS, TASK_BY_CODE, type Pillar, type AgeGroup, type Layer, type Class, type Status } from "./data";
import { saveClassToDb } from "./db";
import { toast } from "sonner";

type View =
  | { kind: "dashboard" }
  | { kind: "library" }
  | { kind: "module"; pillarId: string; topicId: string; moduleId: string }
  | { kind: "class"; pillarId: string; topicId: string; moduleId: string; classId: string }
  | { kind: "task-types" };

type Ctx = {
  pillars: Pillar[];
  view: View;
  setView: (v: View) => void;
  selectedPillarId: string;
  selectedTopicId: string;
  setSelectedPillar: (id: string) => void;
  setSelectedTopic: (id: string) => void;
  ageGroup: AgeGroup;
  setAgeGroup: (a: AgeGroup) => void;

  // class editor
  expandedLayerId: string | null;
  setExpandedLayerId: (id: string | null) => void;
  addLayer: (taskCode: string) => void;
  removeLayer: (id: string) => void;
  reorderLayer: (id: string, dir: -1 | 1) => void;
  updateLayerField: (id: string, key: string, value: any) => void;
  updateClass: (patch: Partial<Class>) => void;
  unsaved: boolean;
  save: () => void;
  publish: () => void;

  // helpers
  currentClass: Class | null;
  classXp: number;
};

const StudioCtx = createContext<Ctx | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [pillars, setPillars] = useState<Pillar[]>(SEED_PILLARS);
  // default open class editor on Class 02
  const [view, setView] = useState<View>({ kind: "class", pillarId: "inner", topicId: "self-eq", moduleId: "meet-emotions", classId: "c2" });
  const [selectedPillarId, setSelectedPillar] = useState("inner");
  const [selectedTopicId, setSelectedTopic] = useState("self-eq");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("Explorer");
  const [expandedLayerId, setExpandedLayerId] = useState<string | null>("l2b");
  const [unsaved, setUnsaved] = useState(false);

  const currentClass = useMemo<Class | null>(() => {
    if (view.kind !== "class") return null;
    const p = pillars.find(p => p.id === view.pillarId);
    const t = p?.topics.find(t => t.id === view.topicId);
    const m = t?.modules.find(m => m.id === view.moduleId);
    return m?.classes.find(c => c.id === view.classId) ?? null;
  }, [pillars, view]);

  const classXp = useMemo(() => {
    if (!currentClass) return 0;
    return currentClass.layers.reduce((sum, l) => sum + (TASK_BY_CODE[l.taskCode]?.xp ?? 0), 0);
  }, [currentClass]);

  function mutateClass(fn: (c: Class) => Class) {
    if (view.kind !== "class") return;
    setPillars(prev => prev.map(p => p.id !== view.pillarId ? p : ({
      ...p,
      topics: p.topics.map(t => t.id !== view.topicId ? t : ({
        ...t,
        modules: t.modules.map(m => m.id !== view.moduleId ? m : ({
          ...m,
          classes: m.classes.map(c => c.id !== view.classId ? c : fn(c)),
        })),
      })),
    })));
    setUnsaved(true);
  }

  function addLayer(taskCode: string) {
    const def = TASK_BY_CODE[taskCode];
    const id = `l-${Date.now()}`;
    mutateClass(c => ({ ...c, layers: [...c.layers, { id, taskCode, preview: def.name, fields: {} }] }));
    setExpandedLayerId(id);
  }
  function removeLayer(id: string) {
    mutateClass(c => ({ ...c, layers: c.layers.filter(l => l.id !== id) }));
    if (expandedLayerId === id) setExpandedLayerId(null);
  }
  function reorderLayer(id: string, dir: -1 | 1) {
    mutateClass(c => {
      const i = c.layers.findIndex(l => l.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= c.layers.length) return c;
      const arr = c.layers.slice();
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...c, layers: arr };
    });
  }
  function updateLayerField(id: string, key: string, value: any) {
    mutateClass(c => ({ ...c, layers: c.layers.map(l => l.id === id ? { ...l, fields: { ...l.fields, [key]: value } } : l) }));
  }
  function updateClass(patch: Partial<Class>) {
    mutateClass(c => ({ ...c, ...patch }));
  }
  async function save() {
    if (!currentClass) return;
    try {
      await saveClassToDb(currentClass, { publish: false });
      setUnsaved(false);
      toast.success("Saved to database");
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    }
  }
  async function publish() {
    if (!currentClass || currentClass.layers.length === 0) return;
    try {
      await saveClassToDb(currentClass, { publish: true });
      mutateClass(c => ({ ...c, status: "Published" as Status }));
      setUnsaved(false);
      toast.success("Published");
    } catch (e: any) {
      toast.error(e?.message ?? "Publish failed");
    }
  }

  return (
    <StudioCtx.Provider value={{
      pillars, view, setView, selectedPillarId, selectedTopicId, setSelectedPillar, setSelectedTopic,
      ageGroup, setAgeGroup, expandedLayerId, setExpandedLayerId,
      addLayer, removeLayer, reorderLayer, updateLayerField, updateClass,
      unsaved, save, publish, currentClass, classXp,
    }}>
      {children}
    </StudioCtx.Provider>
  );
}

export function useStudio() {
  const c = useContext(StudioCtx);
  if (!c) throw new Error("useStudio outside provider");
  return c;
}
