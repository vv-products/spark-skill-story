import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StudioLayout } from "../Layout";
import { Btn } from "../ui";
import { clearMissionContentCache } from "@/game/missions/missionContent";

type Difficulty = "easy" | "medium" | "hard";
type WordRow = {
  id?: string;
  number: number;
  direction: "A" | "D";
  row: number;
  col: number;
  answer: string;
  clue: string;
};
type Variant = { id: string; difficulty: Difficulty; label: string; rows: number; cols: number; xp_reward: number; words: WordRow[] };

const DIFFS: Difficulty[] = ["easy", "medium", "hard"];

export function CrosswordBuilderScreen() {
  const [crosswordId, setCrosswordId] = useState<string | null>(null);
  const [variants, setVariants] = useState<Record<Difficulty, Variant | null>>({ easy: null, medium: null, hard: null });
  const [activeDiff, setActiveDiff] = useState<Difficulty>("medium");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    const { data: cw } = await supabase
      .from("mission_crosswords" as any).select("id").eq("slug", "emotions").maybeSingle();
    if (!cw) { setLoading(false); toast.error("Crossword 'emotions' not found"); return; }
    setCrosswordId((cw as any).id);
    const { data: vs } = await supabase
      .from("mission_crossword_variants" as any).select("*").eq("crossword_id", (cw as any).id);
    const next: Record<Difficulty, Variant | null> = { easy: null, medium: null, hard: null };
    for (const v of (vs ?? []) as any[]) {
      const { data: ws } = await supabase
        .from("mission_crossword_words" as any).select("*").eq("variant_id", v.id).order("position");
      next[v.difficulty as Difficulty] = {
        id: v.id, difficulty: v.difficulty, label: v.label, rows: v.rows, cols: v.cols, xp_reward: v.xp_reward,
        words: ((ws ?? []) as any[]).map((w) => ({
          id: w.id, number: w.number, direction: w.direction, row: w.row, col: w.col, answer: w.answer, clue: w.clue,
        })),
      };
    }
    setVariants(next);
    setLoading(false);
  }

  function patchVariant(d: Difficulty, patch: Partial<Variant>) {
    setVariants((vs) => ({ ...vs, [d]: vs[d] ? { ...vs[d]!, ...patch } : vs[d] }));
  }
  function patchWord(d: Difficulty, idx: number, patch: Partial<WordRow>) {
    setVariants((vs) => {
      const v = vs[d]; if (!v) return vs;
      const words = v.words.slice();
      words[idx] = { ...words[idx], ...patch };
      return { ...vs, [d]: { ...v, words } };
    });
  }
  function addWord(d: Difficulty) {
    setVariants((vs) => {
      const v = vs[d]; if (!v) return vs;
      const nextNum = (v.words.reduce((m, w) => Math.max(m, w.number), 0)) + 1;
      return { ...vs, [d]: { ...v, words: [...v.words, { number: nextNum, direction: "A", row: 0, col: 0, answer: "", clue: "" }] } };
    });
  }
  function removeWord(d: Difficulty, idx: number) {
    setVariants((vs) => {
      const v = vs[d]; if (!v) return vs;
      return { ...vs, [d]: { ...v, words: v.words.filter((_, i) => i !== idx) } };
    });
  }

  async function saveAll() {
    if (!crosswordId) return;
    setSaving(true);
    try {
      for (const d of DIFFS) {
        const v = variants[d];
        if (!v) continue;
        const { error: ve } = await supabase.from("mission_crossword_variants" as any).update({
          label: v.label, rows: v.rows, cols: v.cols, xp_reward: v.xp_reward,
        }).eq("id", v.id);
        if (ve) throw ve;
        // Replace words: simplest reliable approach
        const { error: de } = await supabase.from("mission_crossword_words" as any).delete().eq("variant_id", v.id);
        if (de) throw de;
        if (v.words.length > 0) {
          const { error: ie } = await supabase.from("mission_crossword_words" as any).insert(v.words.map((w, i) => ({
            variant_id: v.id, number: w.number, direction: w.direction, row: w.row, col: w.col,
            answer: w.answer.toUpperCase().trim(), clue: w.clue, position: i,
          })));
          if (ie) throw ie;
        }
      }
      clearMissionContentCache();
      toast.success("Crossword saved");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally { setSaving(false); }
  }

  const v = variants[activeDiff];

  return (
    <StudioLayout title="Crossword Builder" actions={<Btn onClick={saveAll} disabled={saving || loading}><Save size={14} className="mr-1 inline" />{saving ? "Saving…" : "Save all"}</Btn>}>
      <div className="px-6 py-5">
        {loading ? (
          <div className="text-sm text-[#666]">Loading…</div>
        ) : (
          <>
            <div className="mb-4 flex gap-2">
              {DIFFS.map((d) => (
                <button key={d} onClick={() => setActiveDiff(d)}
                  className={`rounded-[8px] px-4 py-2 text-sm font-bold capitalize ${activeDiff === d ? "bg-[#7B2FBE] text-white" : "bg-white text-[#1A1A2E] border border-[#EBEBF5]"}`}>
                  {d} {variants[d] ? `(${variants[d]!.words.length})` : "—"}
                </button>
              ))}
            </div>

            {!v ? (
              <div className="rounded-[10px] border border-[#EBEBF5] bg-white p-6 text-sm text-[#666]">
                No variant exists for {activeDiff}.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-[10px] border border-[#EBEBF5] bg-white p-4">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Field label="Label"><input className="w-full rounded border border-[#EBEBF5] px-2 py-1.5 text-sm" value={v.label} onChange={(e) => patchVariant(activeDiff, { label: e.target.value })} /></Field>
                    <Field label="Rows"><input type="number" min={1} max={20} className="w-full rounded border border-[#EBEBF5] px-2 py-1.5 text-sm" value={v.rows} onChange={(e) => patchVariant(activeDiff, { rows: parseInt(e.target.value) || 0 })} /></Field>
                    <Field label="Cols"><input type="number" min={1} max={20} className="w-full rounded border border-[#EBEBF5] px-2 py-1.5 text-sm" value={v.cols} onChange={(e) => patchVariant(activeDiff, { cols: parseInt(e.target.value) || 0 })} /></Field>
                    <Field label="XP reward"><input type="number" min={0} className="w-full rounded border border-[#EBEBF5] px-2 py-1.5 text-sm" value={v.xp_reward} onChange={(e) => patchVariant(activeDiff, { xp_reward: parseInt(e.target.value) || 0 })} /></Field>
                  </div>
                </div>

                <GridPreview variant={v} />

                <div className="rounded-[10px] border border-[#EBEBF5] bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-bold text-[#1A1A2E]">Words & Clues</div>
                    <Btn onClick={() => addWord(activeDiff)}><Plus size={14} className="mr-1 inline" />Add word</Btn>
                  </div>
                  <div className="space-y-2">
                    {v.words.map((w, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 rounded border border-[#F0F0FA] p-2">
                        <input type="number" placeholder="#" className="col-span-1 rounded border border-[#EBEBF5] px-1.5 py-1 text-sm" value={w.number} onChange={(e) => patchWord(activeDiff, i, { number: parseInt(e.target.value) || 0 })} />
                        <select className="col-span-1 rounded border border-[#EBEBF5] px-1 py-1 text-sm" value={w.direction} onChange={(e) => patchWord(activeDiff, i, { direction: e.target.value as "A" | "D" })}>
                          <option value="A">A</option>
                          <option value="D">D</option>
                        </select>
                        <input type="number" placeholder="row" className="col-span-1 rounded border border-[#EBEBF5] px-1.5 py-1 text-sm" value={w.row} onChange={(e) => patchWord(activeDiff, i, { row: parseInt(e.target.value) || 0 })} />
                        <input type="number" placeholder="col" className="col-span-1 rounded border border-[#EBEBF5] px-1.5 py-1 text-sm" value={w.col} onChange={(e) => patchWord(activeDiff, i, { col: parseInt(e.target.value) || 0 })} />
                        <input placeholder="ANSWER" className="col-span-2 rounded border border-[#EBEBF5] px-2 py-1 text-sm font-mono uppercase" value={w.answer} onChange={(e) => patchWord(activeDiff, i, { answer: e.target.value.toUpperCase() })} />
                        <input placeholder="Clue text" className="col-span-5 rounded border border-[#EBEBF5] px-2 py-1 text-sm" value={w.clue} onChange={(e) => patchWord(activeDiff, i, { clue: e.target.value })} />
                        <button onClick={() => removeWord(activeDiff, i)} className="col-span-1 rounded text-[#A33] hover:bg-red-50"><Trash2 size={14} className="mx-auto" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </StudioLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#888]">{label}</div>
      {children}
    </div>
  );
}

function GridPreview({ variant }: { variant: Variant }) {
  const grid = useMemo(() => {
    const g: { ch: string; num?: number }[][] = Array.from({ length: variant.rows }, () => Array.from({ length: variant.cols }, () => ({ ch: "" })));
    for (const w of variant.words) {
      const ans = w.answer.toUpperCase();
      for (let i = 0; i < ans.length; i++) {
        const r = w.direction === "D" ? w.row + i : w.row;
        const c = w.direction === "A" ? w.col + i : w.col;
        if (r < 0 || c < 0 || r >= variant.rows || c >= variant.cols) continue;
        const cur = g[r][c];
        if (cur.ch && cur.ch !== ans[i]) g[r][c] = { ch: "!" }; // crossing conflict marker
        else g[r][c] = { ch: ans[i], num: cur.num };
      }
      const head = g[w.row]?.[w.col];
      if (head) head.num = w.number;
    }
    return g;
  }, [variant]);

  return (
    <div className="rounded-[10px] border border-[#EBEBF5] bg-white p-4">
      <div className="mb-2 text-sm font-bold text-[#1A1A2E]">Grid preview</div>
      <div className="inline-block">
        {grid.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <div key={c} className={`relative h-7 w-7 border border-[#E0E0F0] text-center text-[12px] font-bold leading-7 ${
                cell.ch === "!" ? "bg-red-200 text-red-800" : cell.ch ? "bg-[#FAFAFC] text-[#1A1A2E]" : "bg-[#1A1A2E]"
              }`}>
                {cell.num != null && <span className="absolute left-0.5 top-0 text-[7px] font-bold text-[#7B2FBE]">{cell.num}</span>}
                {cell.ch && cell.ch !== "!" ? cell.ch : ""}
                {cell.ch === "!" ? "!" : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-[#888]">Red ! = letters disagree at a crossing — fix before saving.</div>
    </div>
  );
}
