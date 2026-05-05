// Custom task types layered on top of built-in TASK_TYPES.
// Persisted in localStorage; merged into TASK_BY_CODE at module load.
import { useEffect, useState } from "react";
import { TASK_TYPES, TASK_BY_CODE, type TaskTypeDef, type Family, type AgeGroup } from "./data";

const LS_KEY = "studio.customTaskTypes";
const EVT = "studio.customTaskTypes.change";

function readLS(): TaskTypeDef[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writeLS(arr: TaskTypeDef[]) {
  try { window.localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch {}
  window.dispatchEvent(new CustomEvent(EVT));
}

// Merge initial custom types into the shared TASK_BY_CODE map so the rest
// of the app (XP calc, previews, picker labels) sees them.
if (typeof window !== "undefined") {
  for (const t of readLS()) TASK_BY_CODE[t.code] = t;
}

export function getAllTaskTypes(): TaskTypeDef[] {
  return [...TASK_TYPES, ...readLS()];
}

export function isCustomTaskCode(code: string): boolean {
  return readLS().some(t => t.code === code);
}

export function nextTaskCode(): string {
  const all = getAllTaskTypes();
  let n = all.length + 1;
  // ensure uniqueness
  const used = new Set(all.map(t => t.code));
  while (used.has(`T${String(n).padStart(2, "0")}`)) n++;
  return `T${String(n).padStart(2, "0")}`;
}

export function addCustomTaskType(t: Omit<TaskTypeDef, "id"> & { id?: string }) {
  const def: TaskTypeDef = { id: t.id ?? t.code, ...t };
  const next = [...readLS(), def];
  writeLS(next);
  TASK_BY_CODE[def.code] = def;
}

export function useTaskTypes(): TaskTypeDef[] {
  const [items, setItems] = useState<TaskTypeDef[]>(() => getAllTaskTypes());
  useEffect(() => {
    const onChange = () => setItems(getAllTaskTypes());
    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return items;
}

export type { TaskTypeDef, Family, AgeGroup };
