import { useState } from "react";
import { useStudio } from "../StudioContext";
import { StudioLayout } from "../Layout";
import { Btn, StatusPill, Tag } from "../ui";
import { PromptDialog } from "../PromptDialog";
import { TopicEditDialog } from "../TopicEditDialog";
import type { AgeGroup } from "../data";
import type { HTopic } from "../catalog";

export function LibraryScreen() {
  const { pillars, selectedPillarId, setSelectedPillar, selectedTopicId, setSelectedTopic, setView, newTopic, newModule, editTopicMeta } = useStudio();
  const [dialog, setDialog] = useState<null | "topic" | "module">(null);
  const [editing, setEditing] = useState<HTopic | null>(null);
  const pillar = pillars.find(p => p.id === selectedPillarId);
  if (!pillar) return <StudioLayout title="Content Library"><div className="p-8 text-sm text-[#666680]">Loading…</div></StudioLayout>;
  const topic = pillar.topics.find(t => t.id === selectedTopicId);

  function openAddTopic() { setDialog("topic"); }
  function openAddModule() {
    if (!topic) { alert("Select a topic first."); return; }
    setDialog("module");
  }

  return (
    <StudioLayout title="Content Library">
      {/* Breadcrumb */}
      <div className="border-b border-[#EBEBF5] bg-white px-8 py-3 text-[13px] text-[#666680]">
        <span className="font-semibold text-[#1A1A2E]">{pillar.emoji} {pillar.name}</span>
        {topic && <> <span className="mx-2 text-[#CCC]">›</span> <span className="font-semibold text-[#1A1A2E]">{topic.name}</span></>}
      </div>

      <div className="grid grid-cols-3 gap-px bg-[#EBEBF5]" style={{ minHeight: "calc(100vh - 60px - 49px)" }}>
        {/* Panel 1 — Pillars */}
        <Panel title="Pillars">
          {pillars.map(p => {
            const active = p.id === selectedPillarId;
            return (
              <button key={p.id} onClick={() => { setSelectedPillar(p.id); setSelectedTopic(p.topics[0]?.id ?? ""); }}
                className={`flex w-full items-center justify-between rounded-[8px] px-3 py-3 text-left transition-colors ${active ? "bg-[#F0F0FA]" : "hover:bg-[#F8F8FC]"}`}>
                <span className="flex items-center gap-2">
                  <span className="text-lg">{p.emoji}</span>
                  <span className={`text-sm ${active ? "font-bold text-[#7B2FBE]" : "font-semibold text-[#1A1A2E]"}`}>{p.name}</span>
                </span>
                <span className="rounded-[6px] bg-[#F0F0FA] px-2 py-0.5 text-[11px] font-semibold text-[#7B2FBE]">{p.topics.length} topics</span>
              </button>
            );
          })}
        </Panel>

        {/* Panel 2 — Topics */}
        <Panel title="Topics">
          {pillar.topics.map(t => {
            const active = t.id === selectedTopicId;
            return (
              <div key={t.id}
                onClick={() => setSelectedTopic(t.id)}
                className={`group block w-full cursor-pointer rounded-[8px] px-3 py-3 text-left transition-colors ${active ? "bg-[#F0F0FA]" : "hover:bg-[#F8F8FC]"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`flex-1 text-sm ${active ? "font-bold text-[#7B2FBE]" : "font-semibold text-[#1A1A2E]"}`}>{t.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditing(t); }}
                    className="rounded-[6px] px-1.5 py-0.5 text-[11px] text-[#7B2FBE] opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
                    aria-label="Edit topic"
                  >
                    ✎ Edit
                  </button>
                  <span className="rounded-[6px] bg-[#F0F0FA] px-2 py-0.5 text-[11px] font-semibold text-[#7B2FBE]">{t.modules.length} modules</span>
                </div>
                <div className="mt-1.5 flex gap-1">
                  {t.ages.map(a => <Tag key={a}>{a}</Tag>)}
                </div>
              </div>
            );
          })}
          <button onClick={openAddTopic} className="mt-2 w-full rounded-[8px] border border-dashed border-[#D8D8E8] px-3 py-2.5 text-sm font-semibold text-[#7B2FBE] hover:bg-[#F8F8FC]">+ Add Topic</button>
        </Panel>

        {/* Panel 3 — Modules */}
        <Panel title="Modules">
          {topic?.modules.length ? topic.modules.map(m => {
            const built = m.classes.filter(c => c.layers.length > 0).length;
            return (
              <button key={m.id} onClick={() => setView({ kind: "module", pillarId: pillar.id, topicId: topic.id, moduleId: m.id })}
                className="block w-full rounded-[8px] px-3 py-3 text-left transition-colors hover:bg-[#F8F8FC]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1A1A2E]">{m.name}</span>
                  <StatusPill status={m.status} />
                </div>
                <div className="mt-1 text-[12px] text-[#666680]">{built}/10 classes built</div>
              </button>
            );
          }) : <div className="px-3 py-8 text-center text-sm text-[#888]">No modules yet.</div>}
          <button onClick={openAddModule} className="mt-2 w-full rounded-[8px] border border-dashed border-[#D8D8E8] px-3 py-2.5 text-sm font-semibold text-[#7B2FBE] hover:bg-[#F8F8FC]">+ Add Module</button>
        </Panel>
      </div>
      <PromptDialog
        open={dialog === "topic"}
        title="New topic"
        label="Topic name"
        placeholder="e.g. Self-awareness"
        withAgeGroups
        onCancel={() => setDialog(null)}
        onSubmit={async (name, ages) => { await newTopic(pillar.id, name, ages); setDialog(null); }}
      />
      <PromptDialog
        open={dialog === "module"}
        title="New module"
        label="Module name"
        placeholder="e.g. Identity foundations"
        onCancel={() => setDialog(null)}
        onSubmit={async (name) => { if (topic) await newModule(topic.id, name); setDialog(null); }}
      />
      <TopicEditDialog
        open={editing !== null}
        initialName={editing?.name ?? ""}
        initialAges={editing?.ages ?? (["Explorer","Builder","Leader"] as AgeGroup[])}
        onCancel={() => setEditing(null)}
        onSubmit={async ({ name, ages }) => {
          if (editing) await editTopicMeta(editing.id, { name, ages });
          setEditing(null);
        }}
      />
    </StudioLayout>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-4">
      <div className="mb-3 px-1 text-[11px] font-bold uppercase tracking-wider text-[#888]">{title}</div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}
