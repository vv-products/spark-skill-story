import { useState } from "react";
import { useStudio } from "../StudioContext";
import { StudioLayout } from "../Layout";
import { Btn, StatusPill, Chip } from "../ui";
import { PromptDialog } from "../PromptDialog";
import { TASK_BY_CODE, type AgeGroup } from "../data";

export function ModuleScreen() {
  const { view, pillars, setView, ageGroup, setAgeGroup, newClass } = useStudio();
  if (view.kind !== "module") return null;
  const pillar = pillars.find(p => p.id === view.pillarId)!;
  const topic = pillar.topics.find(t => t.id === view.topicId)!;
  const module = topic.modules.find(m => m.id === view.moduleId)!;

  const [addOpen, setAddOpen] = useState(false);

  function openAddClass() { setAddOpen(true); }
  async function submitAddClass(title: string) {
    const id = await newClass(module.id, title);
    setAddOpen(false);
    if (id) setView({ kind: "class", pillarId: pillar.id, topicId: topic.id, moduleId: module.id, classId: id });
  }

  return (
    <StudioLayout
      title={module.name}
      actions={<><StatusPill status={module.status} /><Btn>Publish Module</Btn></>}
    >
      <div className="px-8 py-6">
        <div className="mb-4 text-[13px] text-[#666680]">
          <button onClick={() => setView({ kind: "library" })} className="hover:underline">{pillar.emoji} {pillar.name}</button>
          <span className="mx-2 text-[#CCC]">›</span>
          <span>{topic.name}</span>
          <span className="mx-2 text-[#CCC]">›</span>
          <span className="font-semibold text-[#1A1A2E]">{module.name}</span>
        </div>

        <input defaultValue={module.name} className="w-full bg-transparent text-[26px] font-bold text-[#1A1A2E] outline-none focus:bg-white focus:px-2 focus:rounded-[8px] focus:ring-2 focus:ring-[#7B2FBE]/20" />

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase text-[#666680]">Age group:</span>
          {(["Explorer","Builder","Leader"] as AgeGroup[]).map(a => (
            <Chip key={a} active={ageGroup === a} onClick={() => {
              if (ageGroup !== a && confirm(`You're switching to ${a} content. Any unsaved changes to ${ageGroup} content will be lost. Continue?`)) {
                setAgeGroup(a);
              }
            }}>
              {a} {a === "Explorer" ? "(7–10)" : a === "Builder" ? "(11–14)" : "(15–18)"}
            </Chip>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {module.classes.map(c => {
            const empty = c.layers.length === 0;
            const layerSummary = empty ? "" : c.layers.map(l => TASK_BY_CODE[l.taskCode]?.code).join(" · ");
            return (
              <div key={c.id}
                className={`group flex items-center gap-4 rounded-[12px] border bg-white px-4 py-3 transition-shadow ${empty ? "border-dashed border-[#D8D8E8]" : "border-[#EBEBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"}`}>
                <span className="cursor-grab text-[#CCC]">⋮⋮</span>
                <span className="w-8 text-center text-xs font-bold text-[#666680] tabular-nums">{String(c.number).padStart(2, "0")}</span>
                {empty ? (
                  <button onClick={() => setView({ kind: "class", pillarId: pillar.id, topicId: topic.id, moduleId: module.id, classId: c.id })} className="flex-1 text-left text-sm font-semibold text-[#888]">+ Empty — click to build this class.</button>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-[#1A1A2E]">{c.title}</div>
                      <div className="truncate text-[12px] text-[#666680]">{layerSummary}</div>
                    </div>
                    <span className="rounded-[6px] bg-[#F0F0FA] px-2 py-0.5 text-[11px] font-semibold text-[#7B2FBE]">{c.layers.length} layers</span>
                    <StatusPill status={c.status} />
                    <Btn size="sm" variant="outline" onClick={() => setView({ kind: "class", pillarId: pillar.id, topicId: topic.id, moduleId: module.id, classId: c.id })}>Edit</Btn>
                  </>
                )}
              </div>
            );
          })}
          <button onClick={handleAddClass} className="mt-1 w-full rounded-[12px] border border-dashed border-[#D8D8E8] py-3 text-sm font-semibold text-[#7B2FBE] hover:bg-white">+ Add Class</button>
        </div>
      </div>
    </StudioLayout>
  );
}
