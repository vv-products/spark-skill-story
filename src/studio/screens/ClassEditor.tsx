import { useEffect, useRef, useState } from "react";
import { useStudio } from "../StudioContext";
import { StudioLayout } from "../Layout";
import { Btn, StatusPill, Tag, Field, Input, Textarea, Select, Toggle, Chip, FamilyBadge } from "../ui";
import { PromptDialog } from "../PromptDialog";
import { ConfirmDialog } from "../ConfirmDialog";
import { TASK_BY_CODE, FAMILY_COLOR, type Character, type Family, type AgeGroup } from "../data";
import { useTaskTypes } from "../taskTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CHARACTERS: Character[] = ["Maya", "Leo", "Dash", "Pip"];

type CatalogTarget = "topic" | "module" | "class";
type AddDialog = { action: "create" | "rename"; target: CatalogTarget } | null;
type ConfirmTarget = { target: CatalogTarget } | null;

export function ClassEditorScreen() {
  const { view, pillars, setView, currentClass, classXp, expandedLayerId, setExpandedLayerId,
    removeLayer, reorderLayer, updateLayerField, updateClass, save, publish, saving, publishing, ageGroup,
    newTopic, newModule, newClass,
    editTopic, editModule, editClass,
    removeTopic, removeModule, removeClass } = useStudio();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [addDialog, setAddDialog] = useState<AddDialog>(null);
  const [confirmCatalog, setConfirmCatalog] = useState<ConfirmTarget>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  // Restore focus to "+ Add" button after closing any dialog spawned from the menu
  function closeAddDialog() { setAddDialog(null); setTimeout(() => addBtnRef.current?.focus(), 0); }
  function closeConfirm() { setConfirmCatalog(null); setTimeout(() => addBtnRef.current?.focus(), 0); }

  useEffect(() => {
    if (!addMenuOpen) return;
    function onDoc(e: MouseEvent) {
      if (!addMenuRef.current?.contains(e.target as Node)) setAddMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [addMenuOpen]);

  if (view.kind !== "class" || !currentClass) return null;
  const pillar = pillars.find(p => p.id === view.pillarId)!;
  const topic = pillar.topics.find(t => t.id === view.topicId)!;
  const module = topic.modules.find(m => m.id === view.moduleId)!;

  const xpColor = classXp >= 50 && classXp <= 100 ? "#2E7D32" : "#F5A623";
  const totalDuration = currentClass.layers.reduce((s, l) => s + (TASK_BY_CODE[l.taskCode]?.xp ?? 0), 0); // proxy for duration
  const canPublish = currentClass.layers.length > 0;

  return (
    <StudioLayout
      title="Class Editor"
      actions={
        <>
          <Btn variant="outline" onClick={save} loading={saving} disabled={publishing}>{saving ? "Saving…" : "Save"}</Btn>
          <Btn variant="success" onClick={publish} loading={publishing} disabled={!canPublish || saving} title={canPublish ? undefined : "Add at least one layer to publish."}>{publishing ? "Publishing…" : "Publish"}</Btn>
        </>
      }
    >
      <div className="border-b border-[#EBEBF5] bg-white px-8 py-3 text-[13px] text-[#666680]">
        <button onClick={() => setView({ kind: "library" })} className="hover:underline">{pillar.emoji} {pillar.name}</button>
        <span className="mx-2 text-[#CCC]">›</span>
        <span>{topic.name}</span>
        <span className="mx-2 text-[#CCC]">›</span>
        <button onClick={() => setView({ kind: "module", pillarId: pillar.id, topicId: topic.id, moduleId: module.id })} className="hover:underline">{module.name}</button>
        <span className="mx-2 text-[#CCC]">›</span>
        <span className="font-semibold text-[#1A1A2E]">Class {String(currentClass.number).padStart(2, "0")} — {currentClass.title || "Untitled"}</span>
        <div ref={addMenuRef} className="relative ml-3 inline-block">
          <button
            ref={addBtnRef}
            onClick={() => setAddMenuOpen(o => !o)}
            className="inline-flex h-7 items-center gap-1 rounded-[8px] border border-[#EBEBF5] bg-white px-2.5 text-[12px] font-semibold text-[#7B2FBE] hover:bg-[#F8F8FC]"
            title="Manage catalog"
            aria-haspopup="menu"
            aria-expanded={addMenuOpen}
          >
            + Add
          </button>
          {addMenuOpen && (
            <div role="menu" className="absolute left-0 top-9 z-20 w-64 overflow-hidden rounded-[10px] border border-[#EBEBF5] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
              <MenuSection label="Topic" sub={pillar.name}>
                <MenuItem onClick={() => { setAddMenuOpen(false); setAddDialog({ action: "create", target: "topic" }); }}>New topic</MenuItem>
                <MenuItem onClick={() => { setAddMenuOpen(false); setAddDialog({ action: "rename", target: "topic" }); }}>Rename “{topic.name}”</MenuItem>
                <MenuItem destructive onClick={() => { setAddMenuOpen(false); setConfirmCatalog({ target: "topic" }); }}>Delete “{topic.name}”</MenuItem>
              </MenuSection>
              <MenuSection label="Module" sub={topic.name}>
                <MenuItem onClick={() => { setAddMenuOpen(false); setAddDialog({ action: "create", target: "module" }); }}>New module</MenuItem>
                <MenuItem onClick={() => { setAddMenuOpen(false); setAddDialog({ action: "rename", target: "module" }); }}>Rename “{module.name}”</MenuItem>
                <MenuItem destructive onClick={() => { setAddMenuOpen(false); setConfirmCatalog({ target: "module" }); }}>Delete “{module.name}”</MenuItem>
              </MenuSection>
              <MenuSection label="Class" sub={module.name}>
                <MenuItem onClick={() => { setAddMenuOpen(false); setAddDialog({ action: "create", target: "class" }); }}>New class</MenuItem>
                <MenuItem onClick={() => { setAddMenuOpen(false); setAddDialog({ action: "rename", target: "class" }); }}>Rename this class</MenuItem>
                <MenuItem destructive onClick={() => { setAddMenuOpen(false); setConfirmCatalog({ target: "class" }); }}>Delete this class</MenuItem>
              </MenuSection>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[320px_1fr_60px] gap-px bg-[#EBEBF5]" style={{ minHeight: "calc(100vh - 60px - 49px)" }}>
        {/* LEFT: Settings */}
        <aside className="bg-white p-5 overflow-auto">
          <div className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[#888]">Class Settings</div>
          <div className="space-y-4">
            <Field label="Class Title">
              <Input value={currentClass.title} onChange={e => updateClass({ title: e.target.value })} placeholder="Untitled Class" />
            </Field>
            <Field label="Class Number">
              <Input type="number" value={currentClass.number} onChange={e => updateClass({ number: Number(e.target.value) })} />
            </Field>
            <Field label="Story Recap Clip URL">
              <Input value={currentClass.storyRecapUrl ?? ""} onChange={e => updateClass({ storyRecapUrl: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Character Focus">
              <div className="flex flex-wrap gap-1.5">
                {CHARACTERS.map(c => {
                  const active = currentClass.characterFocus?.includes(c);
                  return (
                    <Chip key={c} active={active} onClick={() => {
                      const cur = currentClass.characterFocus ?? [];
                      updateClass({ characterFocus: active ? cur.filter(x => x !== c) : [...cur, c] });
                    }}>{c}</Chip>
                  );
                })}
              </div>
            </Field>
            <Field label="Hero Image">
              <HeroImagePicker
                classId={currentClass.id}
                value={currentClass.heroImageUrl ?? null}
                onChange={(url) => updateClass({ heroImageUrl: url })}
              />
            </Field>
            <Field label="Age Group">
              <div className="rounded-[8px] bg-[#F0F0FA] px-3 py-2 text-sm text-[#7B2FBE] font-semibold">{ageGroup}</div>
            </Field>
            <Field label="Emotion / Topic Tag">
              <Input value={currentClass.emotionTag ?? ""} onChange={e => updateClass({ emotionTag: e.target.value })} placeholder="e.g. Joy" />
            </Field>
            <Field label="Estimated Duration">
              <div className="rounded-[8px] bg-[#F8F8FC] px-3 py-2 text-sm text-[#666680]">~{Math.max(3, Math.round(currentClass.layers.length * 2.5))} min</div>
            </Field>
            <Field label="Status">
              <Select value={currentClass.status} onChange={e => updateClass({ status: e.target.value as any })}>
                <option>Draft</option><option>In Review</option><option>Published</option>
              </Select>
            </Field>
          </div>
        </aside>

        {/* CENTER: Layers */}
        <section className="bg-[#F8F8FC] p-6 overflow-auto">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#888]">Layer Builder</div>
              <h2 className="mt-0.5 text-lg font-bold text-[#1A1A2E]">{currentClass.layers.length} task layer{currentClass.layers.length === 1 ? "" : "s"}</h2>
            </div>
            <StatusPill status={currentClass.status} />
          </div>

          <div className="flex flex-col gap-3">
            {currentClass.layers.map((layer, i) => {
              const def = TASK_BY_CODE[layer.taskCode];
              const expanded = expandedLayerId === layer.id;
              return (
                <div key={layer.id} className="rounded-[12px] border border-[#EBEBF5] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="cursor-grab text-[#CCC]">⋮⋮</span>
                    <span className="w-6 text-center text-xs font-bold text-[#666680] tabular-nums">{i + 1}</span>
                    <FamilyBadge family={def.family} />
                    <span className="text-base">{def.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-[#1A1A2E]">{def.name}</div>
                      <div className="truncate text-[12px] text-[#666680]">{layer.preview}</div>
                    </div>
                    <span className="rounded-[6px] bg-[#FFF8E8] px-2 py-0.5 text-[11px] font-bold text-[#A66D00]">+{def.xp} XP</span>
                    <button onClick={() => reorderLayer(layer.id, -1)} className="text-[#888] hover:text-[#1A1A2E]" title="Move up">▲</button>
                    <button onClick={() => reorderLayer(layer.id, 1)} className="text-[#888] hover:text-[#1A1A2E]" title="Move down">▼</button>
                    <button onClick={() => setExpandedLayerId(expanded ? null : layer.id)} className="text-[#7B2FBE] hover:underline text-sm font-semibold">{expanded ? "Close" : "Edit"}</button>
                    <button onClick={() => setConfirmRemove(layer.id)} className="text-[#888] hover:text-[#E5484D]" title="Delete">✕</button>
                  </div>
                  {expanded && (
                    <div className="border-t border-[#EBEBF5] bg-[#FAFAFC] p-5">
                      <LayerFields taskCode={layer.taskCode} fields={layer.fields} onChange={(k, v) => updateLayerField(layer.id, k, v)} />
                    </div>
                  )}
                </div>
              );
            })}
            <button onClick={() => setPickerOpen(true)}
              className="rounded-[12px] border-2 border-dashed border-[#7B2FBE]/40 bg-white py-5 text-base font-bold text-[#7B2FBE] hover:bg-[#F0F0FA]">
              + Add Layer
            </button>
          </div>
        </section>

        {/* RIGHT: XP strip */}
        <aside className="flex flex-col items-center bg-white py-6">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#888]" style={{ writingMode: "vertical-rl" }}>XP Total</div>
          <div className="my-3 text-2xl font-bold tabular-nums" style={{ color: xpColor }}>{classXp}</div>
          <div className="h-32 w-2 rounded-full bg-[#F0F0FA] overflow-hidden">
            <div className="w-full rounded-full transition-all" style={{ height: `${Math.min(100, classXp)}%`, background: xpColor, marginTop: `${100 - Math.min(100, classXp)}%` }} />
          </div>
          <div className="mt-3 text-[10px] font-semibold text-[#888] text-center">
            {classXp >= 50 && classXp <= 100 ? "✓ in range" : classXp < 50 ? "⚠ low" : "↑ high"}
          </div>
        </aside>
      </div>

      {pickerOpen && <TaskPicker onClose={() => setPickerOpen(false)} />}
      {confirmRemove && (
        <ConfirmDialog
          open={true}
          title="Remove this layer?"
          message="This cannot be undone."
          confirmLabel="Remove"
          destructive
          onCancel={() => setConfirmRemove(null)}
          onConfirm={() => { removeLayer(confirmRemove); setConfirmRemove(null); }}
        />
      )}
      {/* Catalog create / rename via PromptDialog. On thrown error, dialog stays open (toast already shown). */}
      <PromptDialog
        open={addDialog?.target === "topic"}
        title={addDialog?.action === "rename" ? `Rename topic “${topic.name}”` : `New topic in ${pillar.name}`}
        label="Topic name"
        placeholder="e.g. Self-awareness"
        defaultValue={addDialog?.action === "rename" ? topic.name : ""}
        submitLabel={addDialog?.action === "rename" ? "Save" : "Create"}
        withAgeGroups={addDialog?.action !== "rename"}
        onCancel={closeAddDialog}
        onSubmit={async (name, ages) => {
          if (addDialog?.action === "rename") await editTopic(topic.id, name);
          else await newTopic(pillar.id, name, ages);
          closeAddDialog();
        }}
      />
      <PromptDialog
        open={addDialog?.target === "module"}
        title={addDialog?.action === "rename" ? `Rename module “${module.name}”` : `New module in ${topic.name}`}
        label="Module name"
        placeholder="e.g. Identity foundations"
        defaultValue={addDialog?.action === "rename" ? module.name : ""}
        submitLabel={addDialog?.action === "rename" ? "Save" : "Create"}
        onCancel={closeAddDialog}
        onSubmit={async (name) => {
          if (addDialog?.action === "rename") await editModule(module.id, name);
          else await newModule(topic.id, name);
          closeAddDialog();
        }}
      />
      <PromptDialog
        open={addDialog?.target === "class"}
        title={addDialog?.action === "rename" ? `Rename class “${currentClass.title || "Untitled"}”` : `New class in ${module.name}`}
        label="Class title"
        placeholder="e.g. What is identity?"
        defaultValue={addDialog?.action === "rename" ? (currentClass.title || "") : "Untitled class"}
        submitLabel={addDialog?.action === "rename" ? "Save" : "Create"}
        onCancel={closeAddDialog}
        onSubmit={async (name) => {
          if (addDialog?.action === "rename") {
            await editClass(currentClass.id, name);
            updateClass({ title: name });
            closeAddDialog();
          } else {
            const id = await newClass(module.id, name);
            closeAddDialog();
            if (id) setView({ kind: "class", pillarId: pillar.id, topicId: topic.id, moduleId: module.id, classId: id });
          }
        }}
      />

      {/* Catalog deletion confirms */}
      <ConfirmDialog
        open={confirmCatalog?.target === "topic"}
        title={`Delete topic “${topic.name}”?`}
        message="This permanently removes the topic and every module, class, and layer inside it."
        confirmLabel="Delete topic"
        destructive
        onCancel={closeConfirm}
        onConfirm={async () => {
          await removeTopic(topic.id);
          closeConfirm();
          setView({ kind: "library" });
        }}
      />
      <ConfirmDialog
        open={confirmCatalog?.target === "module"}
        title={`Delete module “${module.name}”?`}
        message="This permanently removes the module and every class and layer inside it."
        confirmLabel="Delete module"
        destructive
        onCancel={closeConfirm}
        onConfirm={async () => {
          await removeModule(module.id);
          closeConfirm();
          setView({ kind: "library" });
        }}
      />
      <ConfirmDialog
        open={confirmCatalog?.target === "class"}
        title={`Delete this class?`}
        message="This permanently removes the class and all its layers."
        confirmLabel="Delete class"
        destructive
        onCancel={closeConfirm}
        onConfirm={async () => {
          await removeClass(currentClass.id);
          closeConfirm();
          setView({ kind: "module", pillarId: pillar.id, topicId: topic.id, moduleId: module.id });
        }}
      />
    </StudioLayout>
  );
}

function MenuSection({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#F0F0FA] py-1 last:border-b-0">
      <div className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-[#888]">
        {label} <span className="font-semibold normal-case tracking-normal text-[#666680]">· {sub}</span>
      </div>
      {children}
    </div>
  );
}
function MenuItem({ children, onClick, destructive = false }: { children: React.ReactNode; onClick: () => void; destructive?: boolean }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`block w-full truncate px-3 py-1.5 text-left text-[13px] hover:bg-[#F8F8FC] ${destructive ? "text-[#E5484D]" : "text-[#1A1A2E]"}`}
    >
      {children}
    </button>
  );
}

function TaskPicker({ onClose }: { onClose: () => void }) {
  const { addLayer, ageGroup } = useStudio();
  const [filter, setFilter] = useState<Family | "All">("All");
  const [selected, setSelected] = useState<string | null>(null);
  const allTaskTypes = useTaskTypes();

  const families: (Family | "All")[] = ["All","Foundation","Knowledge Check","Simulation","Performance","Real-Life","Reflection"];
  const filtered = allTaskTypes.filter(t => filter === "All" || t.family === filter);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50 p-6">
      <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col rounded-[12px] bg-white shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between border-b border-[#EBEBF5] p-6">
          <div>
            <h2 className="text-[20px] font-bold text-[#1A1A2E]">Choose a Task Type</h2>
            <p className="text-sm text-[#666680]">Select the interaction format for this layer</p>
          </div>
          <button onClick={onClose} className="rounded-[8px] p-2 text-[#666680] hover:bg-[#F0F0FA]">✕</button>
        </div>

        <div className="border-b border-[#EBEBF5] px-6 py-3 flex gap-2 flex-wrap">
          {families.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-colors ${filter === f ? "bg-[#7B2FBE] text-white" : "bg-[#F8F8FC] text-[#666680] hover:bg-[#F0F0FA]"}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 overflow-auto p-6">
          {filtered.map(t => {
            const isSel = selected === t.code;
            const compat = t.ages.includes(ageGroup);
            return (
              <button key={t.code} onClick={() => setSelected(t.code)}
                className={`rounded-[12px] border bg-white p-4 text-left transition-all ${isSel ? "border-[#7B2FBE] ring-2 ring-[#7B2FBE]/30 shadow-[0_0_0_4px_rgba(123,47,190,0.1)]" : "border-[#EBEBF5] hover:border-[#7B2FBE]/40"}`}>
                <div className="h-1 w-full rounded-full mb-3" style={{ background: FAMILY_COLOR[t.family] }} />
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{t.emoji}</span>
                  <span className="rounded-[6px] bg-[#FFF8E8] px-2 py-0.5 text-[11px] font-bold text-[#A66D00]">+{t.xp} XP</span>
                </div>
                <div className="mt-3 text-[11px] font-bold uppercase tracking-wide text-[#888]">{t.code}</div>
                <div className="text-[15px] font-bold text-[#1A1A2E]">{t.name}</div>
                <div className="mt-1 text-[12px] text-[#666680] line-clamp-2">{t.description}</div>
                <div className="mt-3 flex gap-1">
                  {(["Explorer","Builder","Leader"] as AgeGroup[]).map(a => (
                    <span key={a} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.ages.includes(a) ? "bg-[#F0F0FA] text-[#7B2FBE]" : "bg-[#F8F8FC] text-[#CCC]"}`}>{a}</span>
                  ))}
                </div>
                {!compat && <div className="mt-2 text-[11px] font-semibold text-[#F5A623]">Not optimised for {ageGroup}</div>}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-[#EBEBF5] p-4">
          <span className="text-sm text-[#666680]">{selected ? `Selected: ${TASK_BY_CODE[selected].name}` : "Pick a task type to continue"}</span>
          <div className="flex gap-2">
            <Btn variant="outline" onClick={onClose}>Cancel</Btn>
            <Btn disabled={!selected} onClick={() => { if (selected) { addLayer(selected); onClose(); } }}>Add to Class</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Field renderers per task type ----------
function LayerFields({ taskCode, fields, onChange }: { taskCode: string; fields: any; onChange: (k: string, v: any) => void }) {
  const F = (label: string, key: string, type: "text" | "url" | "number" | "textarea" = "text", placeholder?: string) => (
    <Field label={label}>
      {type === "textarea"
        ? <Textarea rows={3} value={fields[key] ?? ""} onChange={e => onChange(key, e.target.value)} placeholder={placeholder} />
        : <Input type={type === "number" ? "number" : "text"} value={fields[key] ?? ""} onChange={e => onChange(key, type === "number" ? Number(e.target.value) : e.target.value)} placeholder={placeholder} />}
    </Field>
  );
  const T = (label: string, key: string, defaultVal = false) => (
    <div><div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#666680]">{label}</div><Toggle checked={fields[key] ?? defaultVal} onChange={v => onChange(key, v)} label={fields[key] ?? defaultVal ? "On" : "Off"} /></div>
  );
  const CharSelect = (key = "character", label = "Character") => (
    <Field label={label}>
      <Select value={fields[key] ?? ""} onChange={e => onChange(key, e.target.value)}>
        <option value="">— None —</option>
        {CHARACTERS.map(c => <option key={c}>{c}</option>)}
      </Select>
    </Field>
  );
  const CharMulti = (key = "characterFocus", label = "Character Focus") => (
    <Field label={label}>
      <div className="flex flex-wrap gap-1.5">
        {CHARACTERS.map(c => {
          const arr: Character[] = fields[key] ?? [];
          const active = arr.includes(c);
          return <Chip key={c} active={active} onClick={() => onChange(key, active ? arr.filter(x => x !== c) : [...arr, c])}>{c}</Chip>;
        })}
      </div>
    </Field>
  );

  switch (taskCode) {
    case "T01": return (
      <div className="grid grid-cols-2 gap-4">
        {F("Video URL", "videoUrl", "url", "https://...")}
        {F("Duration (sec)", "durationSec", "number")}
        {F("Recap Clip URL", "recapUrl", "url")}
        {CharMulti()}
        <div className="col-span-2">{F("Transcript", "transcript", "textarea")}</div>
        {F("Subtitle File URL", "subtitleUrl", "url")}
        {T("Skip Allowed", "skipAllowed")}
      </div>
    );
    case "T02": return (
      <div className="grid grid-cols-2 gap-4">
        {F("Clip URL", "clipUrl", "url")}{F("Concept Tag", "conceptTag")}
        {CharSelect()}{T("Loop Once", "loopOnce")}
      </div>
    );
    case "T03": return (
      <div className="grid grid-cols-2 gap-4">
        <Field label="Items"><Textarea rows={3} value={fields.itemsText ?? "A warm hug → Happy\nLost toy → Sad"} onChange={e => onChange("itemsText", e.target.value)} placeholder="One per line: label → bucket" /></Field>
        <Field label="Buckets"><Textarea rows={3} value={fields.bucketsText ?? "Happy #F5A623\nSad #1565C0"} onChange={e => onChange("bucketsText", e.target.value)} placeholder="One per line: label colour" /></Field>
        {T("Allow Partial Credit", "partialCredit", true)}{F("Hint after attempt #", "hintAfter", "number")}
        {T("Shuffle Items", "shuffle", true)}
      </div>
    );
    case "T04": return (
      <div className="space-y-4">
        <Field label="Questions">
          <Textarea rows={5} value={fields.questionsText ?? (fields.questions ? fields.questions.map((q: any) => `${q.prompt} | ${q.correct}`).join("\n") : "Sharing happy feelings makes them grow. | True\nBragging is the same as celebrating. | False\nJumping with a friend doubles the joy. | True")} onChange={e => onChange("questionsText", e.target.value)} placeholder="One per line: prompt | correct" />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          {F("Time Limit (sec)", "timeLimitSec", "number")}
          {F("Speed Bonus (sec)", "speedBonusSec", "number")}
          <div>{T("Shuffle Questions", "shuffle", true)}</div>
        </div>
      </div>
    );
    case "T05": return (
      <div className="space-y-4">
        <Field label="Cards"><Textarea rows={4} value={fields.cardsText ?? ""} onChange={e => onChange("cardsText", e.target.value)} placeholder="One per line: scenario | response | insight" /></Field>
        <div className="grid grid-cols-2 gap-4">{T("Allow 'Depends' Option", "allowDepends")}{T("Show Reasoning Prompt", "showReasoning")}</div>
      </div>
    );
    case "T06": return (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">{F("Emotion Prompt", "emotionPrompt", "text")}</div>
        <div className="col-span-2"><Field label="Body Zones"><Textarea rows={3} value={fields.zonesText ?? ""} onChange={e => onChange("zonesText", e.target.value)} placeholder="zoneId | label | description" /></Field></div>
        {F("Min Taps", "minTaps", "number")}{F("Max Taps", "maxTaps", "number")}
        {T("Show Heatmap (11+ only)", "showHeatmap")}{F("Character Reaction", "characterReaction")}
      </div>
    );
    case "T07": return (
      <div className="space-y-4">
        {F("Setup Clip URL", "setupClipUrl", "url")}
        {F("Decision Prompt", "decisionPrompt", "textarea")}
        <Field label="Options"><Textarea rows={4} value={fields.optionsText ?? ""} onChange={e => onChange("optionsText", e.target.value)} placeholder="label | consequence url | debrief | optimal(y/n)" /></Field>
        {T("Show All Paths After", "showAllPaths")}
      </div>
    );
    case "T08": return (
      <div className="grid grid-cols-2 gap-4">
        {F("Scenario Title", "scenarioTitle")}{F("AI Persona Name", "personaName")}
        <Field label="AI Tone"><Select value={fields.tone ?? "Friendly Peer"} onChange={e => onChange("tone", e.target.value)}><option>Friendly Peer</option><option>Authority Figure</option><option>Professional</option><option>Casual</option></Select></Field>
        {F("AI Relationship to User", "relationship")}
        <div className="col-span-2">{F("Opening Message", "openingMessage", "textarea")}</div>
        <div className="col-span-2">{F("Scenario Context", "scenarioContext", "textarea")}</div>
        {F("Max Exchanges", "maxExchanges", "number")}
        <div className="col-span-2">{F("Debrief Prompt", "debriefPrompt", "textarea")}</div>
        {CharSelect("coach", "Coach Character")}
        <Field label="Input Type"><Select value={fields.inputType ?? "Both"} onChange={e => onChange("inputType", e.target.value)}><option>Text</option><option>Voice</option><option>Both</option></Select></Field>
      </div>
    );
    case "T09": return (
      <div className="grid grid-cols-2 gap-4">
        {F("Audio Guide URL", "audioUrl", "url")}{F("Background Visual URL", "visualUrl", "url")}
        {F("Duration (sec)", "durationSec", "number")}{CharSelect()}
        <div className="col-span-2">{F("Debrief Prompt", "debriefPrompt", "textarea")}</div>
        <div className="col-span-2">{F("Parent Note", "parentNote", "textarea")}</div>
      </div>
    );
    case "T10": return (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">{F("Prompt Text", "prompt", "textarea")}</div>
        {F("Prompt Audio URL", "promptAudioUrl", "url")}
        <Field label="Max Duration (sec)"><Select value={fields.maxDuration ?? 90} onChange={e => onChange("maxDuration", Number(e.target.value))}><option value={60}>60</option><option value={90}>90</option><option value={180}>180</option></Select></Field>
        {CharSelect()}{F("Parent Dashboard Label", "parentLabel")}
        {T("Drawing Fallback", "drawingFallback")}{T("Content Moderation", "moderation", true)}
      </div>
    );
    case "T11": return (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">{F("Prompt Text", "prompt", "textarea")}</div>
        {F("Prompt Image URL", "promptImageUrl", "url")}
        <Field label="Available Stamps"><Input value={fields.stamps ?? ""} onChange={e => onChange("stamps", e.target.value)} placeholder="emoji-pack, hearts, stars" /></Field>
        <Field label="Default Background"><Input type="color" value={fields.bg ?? "#FFFFFF"} onChange={e => onChange("bg", e.target.value)} /></Field>
        {T("Voice Layer Enabled", "voiceLayer")}
        <div className="col-span-2">{F("Parent Dashboard Label", "parentLabel")}</div>
      </div>
    );
    case "T12": return (
      <div className="space-y-4">
        {F("Prompt Text", "prompt", "textarea")}
        <Field label="Item Pool"><Textarea rows={4} value={fields.itemsText ?? ""} onChange={e => onChange("itemsText", e.target.value)} placeholder="label | category | description" /></Field>
        <div className="grid grid-cols-3 gap-4">
          {F("Min Selections", "minSel", "number")}{F("Max Selections", "maxSel", "number")}
          <Field label="Layout Type"><Select value={fields.layout ?? "Grid"} onChange={e => onChange("layout", e.target.value)}><option>Grid</option><option>Rank</option><option>Map</option><option>Timeline</option></Select></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">{F("Output Label", "outputLabel")}{F("Parent Dashboard Label", "parentLabel")}</div>
      </div>
    );
    case "T13": return (
      <div className="grid grid-cols-2 gap-4">
        {F("Mission Title", "title")}
        <Field label="Mission Type"><Select value={fields.missionType ?? "Observe"} onChange={e => onChange("missionType", e.target.value)}><option>Observe</option><option>Converse</option><option>Practise</option><option>Teach</option><option>Create</option><option>Challenge</option></Select></Field>
        <div className="col-span-2">{F("Mission Instruction", "instruction", "textarea")}</div>
        {F("Time Window (days)", "windowDays", "number")}
        {T("Verify for Bonus", "verifyForBonus")}
        <div className="col-span-2">{F("Parent Notification", "parentNotice", "textarea")}</div>
        <div className="col-span-2">{F("Parent Conversation Starter", "parentStarter", "textarea")}</div>
        {F("Printable Card URL", "printableUrl", "url")}
      </div>
    );
    case "T14": return (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">{F("Prompt Text", "prompt", "textarea")}</div>
        {F("Prompt Audio URL", "promptAudioUrl", "url")}
        <Field label="Input Type"><Select value={fields.inputType ?? "Both"} onChange={e => onChange("inputType", e.target.value)}><option>Voice</option><option>Text</option><option>Both</option><option>Tap Select</option></Select></Field>
        {fields.inputType === "Tap Select" && <div className="col-span-2"><Field label="Tap Options"><Textarea rows={3} value={fields.tapOptionsText ?? ""} onChange={e => onChange("tapOptionsText", e.target.value)} placeholder="label | icon" /></Field></div>}
        {CharSelect("narrator", "Character Narrator")}
        {F("Journal Label", "journalLabel")}
        <div className="col-span-2">{F("Parent Note", "parentNote")}</div>
        {F("Min Response Length", "minLen", "number")}
      </div>
    );
    case "T15": return (
      <div className="space-y-4">
        <Field label="Items"><Textarea rows={4} value={fields.itemsText ?? ""} onChange={e => onChange("itemsText", e.target.value)} placeholder="skill | scaleType | low anchor | high anchor" /></Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Display Type"><Select value={fields.displayType ?? "Emoji Faces"} onChange={e => onChange("displayType", e.target.value)}><option>Emoji Faces</option><option>Slider</option><option>Numerical</option></Select></Field>
          <Field label="Module Position"><Select value={fields.position ?? "Pre"} onChange={e => onChange("position", e.target.value)}><option>Pre</option><option>Mid</option><option>Post</option></Select></Field>
          <div>{T("Show Previous Score", "showPrev")}</div>
        </div>
        {T("Feed to Dashboard", "feedDashboard", true)}
      </div>
    );
    default: return <div className="text-sm text-[#666680]">No fields defined for this task type.</div>;
  }
}

function HeroImagePicker({ classId, value, onChange }: { classId: string; value: string | null; onChange: (url: string | null) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be 5MB or smaller."); return; }
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${classId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("class-hero").upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("class-hero").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Hero image uploaded — remember to Save.");
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="aspect-video w-full overflow-hidden rounded-[8px] border border-dashed border-[#EBEBF5] bg-[#F8F8FC]">
        {value ? (
          <img src={value} alt="Class hero" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px] text-[#888]">No image</div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <div className="flex gap-2">
        <Btn size="sm" variant="outline" onClick={() => fileRef.current?.click()} loading={uploading} disabled={uploading}>
          {uploading ? "Uploading…" : value ? "Replace" : "Upload image"}
        </Btn>
        {value && !uploading && (
          <Btn size="sm" variant="ghost" onClick={() => onChange(null)}>Remove</Btn>
        )}
      </div>
    </div>
  );
}
