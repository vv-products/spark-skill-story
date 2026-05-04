import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { TASK_BY_CODE, type AgeGroup, type Class, type Status } from "./data";
import {
  loadFullCatalog, saveClass, createTopic, createModule, createClass, deleteClass,
  renameTopic, renameModule, renameClass, deleteTopic, deleteModule,
  type HPillar, type HClass,
} from "./catalog";
import { toast } from "sonner";

type View =
  | { kind: "dashboard" }
  | { kind: "library" }
  | { kind: "module"; pillarId: string; topicId: string; moduleId: string }
  | { kind: "class"; pillarId: string; topicId: string; moduleId: string; classId: string }
  | { kind: "task-types" }
  | { kind: "admin" };

type Ctx = {
  loadingCatalog: boolean;
  pillars: HPillar[];
  reload: () => Promise<void>;
  view: View;
  setView: (v: View) => void;
  selectedPillarId: string;
  selectedTopicId: string;
  setSelectedPillar: (id: string) => void;
  setSelectedTopic: (id: string) => void;
  ageGroup: AgeGroup;
  setAgeGroup: (a: AgeGroup) => void;

  // class editor (in-memory while editing)
  expandedLayerId: string | null;
  setExpandedLayerId: (id: string | null) => void;
  addLayer: (taskCode: string) => void;
  removeLayer: (id: string) => void;
  reorderLayer: (id: string, dir: -1 | 1) => void;
  updateLayerField: (id: string, key: string, value: any) => void;
  updateClass: (patch: Partial<Class>) => void;
  unsaved: boolean;
  saving: boolean;
  publishing: boolean;
  save: () => Promise<void>;
  publish: () => Promise<void>;

  // catalog mutations
  newTopic: (pillarId: string, name: string) => Promise<void>;
  newModule: (topicId: string, name: string) => Promise<void>;
  newClass: (moduleId: string, title: string) => Promise<string | null>;
  removeClass: (classId: string) => Promise<void>;
  editTopic: (topicId: string, name: string) => Promise<void>;
  editModule: (moduleId: string, name: string) => Promise<void>;
  editClass: (classId: string, title: string) => Promise<void>;
  removeTopic: (topicId: string) => Promise<void>;
  removeModule: (moduleId: string) => Promise<void>;

  currentClass: HClass | null;
  classXp: number;
};

const StudioCtx = createContext<Ctx | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [pillars, setPillars] = useState<HPillar[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [view, setView] = useState<View>({ kind: "dashboard" });
  const [selectedPillarId, setSelectedPillar] = useState<string>("");
  const [selectedTopicId, setSelectedTopic] = useState<string>("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("Explorer");
  const [expandedLayerId, setExpandedLayerId] = useState<string | null>(null);
  const [unsaved, setUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  // local working copy of the class being edited (so edits don't clobber other classes)
  const [editing, setEditing] = useState<HClass | null>(null);

  const reload = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      const data = await loadFullCatalog();
      setPillars(data);
      // initialise default selections if empty
      if (!selectedPillarId && data[0]) {
        setSelectedPillar(data[0].id);
        if (data[0].topics[0]) setSelectedTopic(data[0].topics[0].id);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load catalog");
    } finally {
      setLoadingCatalog(false);
    }
  }, [selectedPillarId]);

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, []);

  // When entering class view, load the class into the editing buffer
  useEffect(() => {
    if (view.kind !== "class") { setEditing(null); setUnsaved(false); return; }
    const found = findClass(pillars, view.pillarId, view.topicId, view.moduleId, view.classId);
    if (found) {
      setEditing(structuredClone(found));
      setUnsaved(false);
    }
  }, [view, pillars]);

  const currentClass = editing;

  const classXp = useMemo(() => {
    if (!currentClass) return 0;
    return currentClass.layers.reduce((sum, l) => sum + (TASK_BY_CODE[l.taskCode]?.xp ?? 0), 0);
  }, [currentClass]);

  function mutate(fn: (c: HClass) => HClass) {
    setEditing((prev) => prev ? fn(prev) : prev);
    setUnsaved(true);
  }

  function addLayer(taskCode: string) {
    const def = TASK_BY_CODE[taskCode];
    if (!def) return;
    const id = `tmp-${Date.now()}`;
    mutate((c) => ({ ...c, layers: [...c.layers, { id, taskCode, preview: def.name, fields: {} }] }));
    setExpandedLayerId(id);
  }
  function removeLayer(id: string) {
    mutate((c) => ({ ...c, layers: c.layers.filter((l) => l.id !== id) }));
    if (expandedLayerId === id) setExpandedLayerId(null);
  }
  function reorderLayer(id: string, dir: -1 | 1) {
    mutate((c) => {
      const i = c.layers.findIndex((l) => l.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= c.layers.length) return c;
      const arr = c.layers.slice();
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...c, layers: arr };
    });
  }
  function updateLayerField(id: string, key: string, value: any) {
    mutate((c) => ({ ...c, layers: c.layers.map((l) => l.id === id ? { ...l, fields: { ...l.fields, [key]: value } } : l) }));
  }
  function updateClass(patch: Partial<Class>) {
    mutate((c) => ({ ...c, ...patch } as HClass));
  }

  async function save() {
    if (!currentClass || saving) return;
    setSaving(true);
    try {
      await saveClass(currentClass);
      setUnsaved(false);
      toast.success("Saved");
      await reload();
    } catch (e: any) { toast.error(e?.message ?? "Save failed"); }
    finally { setSaving(false); }
  }
  async function publish() {
    if (!currentClass || currentClass.layers.length === 0 || publishing) return;
    setPublishing(true);
    try {
      await saveClass(currentClass, { publish: true });
      setEditing((prev) => prev ? { ...prev, status: "Published" as Status } : prev);
      setUnsaved(false);
      toast.success("Published");
      await reload();
    } catch (e: any) { toast.error(e?.message ?? "Publish failed"); }
    finally { setPublishing(false); }
  }

  async function newTopic(pillarId: string, name: string) {
    try { await createTopic(pillarId, name); toast.success("Topic added"); await reload(); }
    catch (e: any) { toast.error(e?.message ?? "Failed to add topic"); throw e; }
  }
  async function newModule(topicId: string, name: string) {
    try { await createModule(topicId, name); toast.success("Module added"); await reload(); }
    catch (e: any) { toast.error(e?.message ?? "Failed to add module"); throw e; }
  }
  async function newClass(moduleId: string, title: string) {
    try {
      // find current module to compute next position
      let nextPos = 1;
      for (const p of pillars) for (const t of p.topics) for (const m of t.modules) {
        if (m.id === moduleId) nextPos = Math.max(nextPos, ...m.classes.map((c) => c.number)) + 1;
      }
      const id = await createClass(moduleId, title, nextPos);
      toast.success("Class created");
      await reload();
      return id;
    } catch (e: any) { toast.error(e?.message ?? "Failed to create class"); throw e; }
  }
  async function removeClass(classId: string) {
    try { await deleteClass(classId); toast.success("Class deleted"); await reload(); }
    catch (e: any) { toast.error(e?.message ?? "Failed to delete class"); throw e; }
  }

  return (
    <StudioCtx.Provider value={{
      loadingCatalog, pillars, reload, view, setView,
      selectedPillarId, selectedTopicId, setSelectedPillar, setSelectedTopic,
      ageGroup, setAgeGroup, expandedLayerId, setExpandedLayerId,
      addLayer, removeLayer, reorderLayer, updateLayerField, updateClass,
      unsaved, saving, publishing, save, publish, currentClass, classXp,
      newTopic, newModule, newClass, removeClass,
    }}>{children}</StudioCtx.Provider>
  );
}

function findClass(pillars: HPillar[], pid: string, tid: string, mid: string, cid: string): HClass | null {
  return pillars.find((p) => p.id === pid)?.topics.find((t) => t.id === tid)
    ?.modules.find((m) => m.id === mid)?.classes.find((c) => c.id === cid) ?? null;
}

export function useStudio() {
  const c = useContext(StudioCtx);
  if (!c) throw new Error("useStudio outside provider");
  return c;
}
