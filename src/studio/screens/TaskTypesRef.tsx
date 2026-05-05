import { useMemo, useState } from "react";
import { StudioLayout, Btn } from "../Layout";
import { FAMILY_COLOR, type AgeGroup, type Family } from "../data";
import { useTaskTypes, addCustomTaskType, nextTaskCode, isCustomTaskCode } from "../taskTypes";
import { useStudio } from "../StudioContext";
import { toast } from "sonner";

const FAMILIES: Family[] = ["Foundation","Knowledge Check","Simulation","Performance","Real-Life","Reflection"];
const AGES: AgeGroup[] = ["Explorer","Builder","Leader"];

export function TaskTypesScreen() {
  const taskTypes = useTaskTypes();
  const { pillars } = useStudio();
  const [adding, setAdding] = useState(false);

  // Compute usage counts: for each task code, count layers + classes using it.
  const usage = useMemo(() => {
    const map: Record<string, { layers: number; classes: number }> = {};
    for (const p of pillars) for (const t of p.topics) for (const m of t.modules) for (const c of m.classes) {
      const seen = new Set<string>();
      for (const l of c.layers) {
        const code = l.taskCode;
        if (!map[code]) map[code] = { layers: 0, classes: 0 };
        map[code].layers += 1;
        seen.add(code);
      }
      for (const code of seen) map[code].classes += 1;
    }
    return map;
  }, [pillars]);

  return (
    <StudioLayout
      title="Task Types Reference"
      actions={<Btn variant="primary" onClick={() => setAdding(true)}>+ New Task Type</Btn>}
    >
      <div className="mx-auto max-w-[900px] px-8 py-6">
        <p className="mb-6 text-sm text-[#666680]">All {taskTypes.length} task types available in the Sementa platform. Use this as a quick reference while building classes.</p>
        <div className="flex flex-col gap-3">
          {taskTypes.map(t => {
            const u = usage[t.code] ?? { layers: 0, classes: 0 };
            const custom = isCustomTaskCode(t.code);
            return (
              <div key={t.code} className="rounded-[12px] border border-[#EBEBF5] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="h-1 w-full rounded-full mb-4" style={{ background: FAMILY_COLOR[t.family] }} />
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] bg-[#F8F8FC] text-3xl">{t.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#888]">{t.code}</span>
                      <span className="rounded-[6px] px-2 py-0.5 text-[11px] font-semibold" style={{ background: `${FAMILY_COLOR[t.family]}1A`, color: FAMILY_COLOR[t.family] }}>{t.family}</span>
                      <span className="rounded-[6px] bg-[#FFF8E8] px-2 py-0.5 text-[11px] font-bold text-[#A66D00]">+{t.xp} XP</span>
                      {custom && <span className="rounded-[6px] bg-[#EEF0FF] px-2 py-0.5 text-[11px] font-semibold text-[#3D3D8F]">Custom</span>}
                      <span className="ml-auto rounded-[6px] bg-[#F0FAF0] px-2 py-0.5 text-[11px] font-semibold text-[#1B6B1B]">
                        Active in {u.classes} {u.classes === 1 ? "class" : "classes"} · {u.layers} {u.layers === 1 ? "layer" : "layers"}
                      </span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-[#1A1A2E]">{t.name}</h3>
                    <p className="mt-1 text-sm text-[#666680]">{t.description}</p>
                    <div className="mt-3 flex gap-1.5">
                      {AGES.map(a => (
                        <span key={a} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.ages.includes(a) ? "bg-[#F0F0FA] text-[#7B2FBE]" : "bg-[#F8F8FC] text-[#CCC]"}`}>{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {adding && <AddTaskTypeDialog onClose={() => setAdding(false)} />}
    </StudioLayout>
  );
}

function AddTaskTypeDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState(nextTaskCode());
  const [emoji, setEmoji] = useState("✨");
  const [family, setFamily] = useState<Family>("Foundation");
  const [description, setDescription] = useState("");
  const [xp, setXp] = useState(10);
  const [ages, setAges] = useState<AgeGroup[]>(["Explorer","Builder","Leader"]);

  function toggleAge(a: AgeGroup) {
    setAges(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }

  function submit() {
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!code.trim()) { toast.error("Code is required"); return; }
    if (ages.length === 0) { toast.error("Pick at least one age group"); return; }
    addCustomTaskType({ code: code.trim(), name: name.trim(), emoji: emoji.trim() || "✨", family, description: description.trim(), xp, ages });
    toast.success(`${name.trim()} added`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-[480px] max-w-[92vw] rounded-[12px] bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-bold text-[#1A1A2E]">New Task Type</h2>
        <div className="flex flex-col gap-3">
          <Field label="Name">
            <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-[8px] border border-[#EBEBF5] px-3 py-2 text-sm" placeholder="e.g. Photo Mission" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Code">
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full rounded-[8px] border border-[#EBEBF5] px-3 py-2 text-sm" />
            </Field>
            <Field label="Emoji">
              <input value={emoji} onChange={e => setEmoji(e.target.value)} className="w-full rounded-[8px] border border-[#EBEBF5] px-3 py-2 text-sm" />
            </Field>
          </div>
          <Field label="Family">
            <select value={family} onChange={e => setFamily(e.target.value as Family)} className="w-full rounded-[8px] border border-[#EBEBF5] px-3 py-2 text-sm">
              {FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Description">
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full rounded-[8px] border border-[#EBEBF5] px-3 py-2 text-sm" />
          </Field>
          <Field label="XP">
            <input type="number" min={0} value={xp} onChange={e => setXp(Number(e.target.value) || 0)} className="w-full rounded-[8px] border border-[#EBEBF5] px-3 py-2 text-sm" />
          </Field>
          <Field label="Age Groups">
            <div className="flex gap-2">
              {AGES.map(a => (
                <button key={a} type="button" onClick={() => toggleAge(a)} className={`rounded-full px-3 py-1 text-xs font-semibold ${ages.includes(a) ? "bg-[#7B2FBE] text-white" : "bg-[#F0F0FA] text-[#666680]"}`}>{a}</button>
              ))}
            </div>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={submit}>Add Task Type</Btn>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#888]">{label}</span>
      {children}
    </label>
  );
}
