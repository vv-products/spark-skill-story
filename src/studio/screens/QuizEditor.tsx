import { useEffect, useState } from "react";
import { Plus, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StudioLayout } from "../Layout";
import { Btn } from "../ui";
import { clearMissionContentCache } from "@/game/missions/missionContent";

type Pace = "self-paced" | "quick";
type Choice = { id?: string; label: string; is_correct: boolean };
type Question = { id?: string; prompt: string; explain: string | null; choices: Choice[] };
type Quiz = { id: string; slug: string; title: string; pace: Pace; base_xp: number; per_right_xp: number; time_limit_sec: number | null; questions: Question[] };

export function QuizEditorScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activePace, setActivePace] = useState<Pace>("self-paced");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    const { data: qs } = await supabase.from("mission_quizzes" as any).select("*");
    const out: Quiz[] = [];
    for (const q of (qs ?? []) as any[]) {
      const { data: questions } = await supabase
        .from("mission_quiz_questions" as any)
        .select("id, prompt, explain, position, mission_quiz_choices(id, label, is_correct, position)")
        .eq("quiz_id", q.id).order("position");
      out.push({
        id: q.id, slug: q.slug, title: q.title, pace: q.pace, base_xp: q.base_xp, per_right_xp: q.per_right_xp, time_limit_sec: q.time_limit_sec,
        questions: ((questions ?? []) as any[]).map((qq) => ({
          id: qq.id, prompt: qq.prompt, explain: qq.explain,
          choices: ((qq.mission_quiz_choices as any[]) ?? []).slice().sort((a, b) => a.position - b.position).map((c) => ({ id: c.id, label: c.label, is_correct: c.is_correct })),
        })),
      });
    }
    setQuizzes(out);
    setLoading(false);
  }

  const quiz = quizzes.find((q) => q.pace === activePace);

  function patchQuiz(patch: Partial<Quiz>) {
    setQuizzes((qs) => qs.map((q) => q.pace === activePace ? { ...q, ...patch } : q));
  }
  function patchQuestion(idx: number, patch: Partial<Question>) {
    setQuizzes((qs) => qs.map((q) => {
      if (q.pace !== activePace) return q;
      const questions = q.questions.slice();
      questions[idx] = { ...questions[idx], ...patch };
      return { ...q, questions };
    }));
  }
  function patchChoice(qIdx: number, cIdx: number, patch: Partial<Choice>) {
    setQuizzes((qs) => qs.map((q) => {
      if (q.pace !== activePace) return q;
      const questions = q.questions.slice();
      const choices = questions[qIdx].choices.slice();
      choices[cIdx] = { ...choices[cIdx], ...patch };
      questions[qIdx] = { ...questions[qIdx], choices };
      return { ...q, questions };
    }));
  }
  function setCorrect(qIdx: number, cIdx: number) {
    setQuizzes((qs) => qs.map((q) => {
      if (q.pace !== activePace) return q;
      const questions = q.questions.slice();
      questions[qIdx] = { ...questions[qIdx], choices: questions[qIdx].choices.map((c, i) => ({ ...c, is_correct: i === cIdx })) };
      return { ...q, questions };
    }));
  }
  function moveQuestion(idx: number, dir: -1 | 1) {
    setQuizzes((qs) => qs.map((q) => {
      if (q.pace !== activePace) return q;
      const j = idx + dir;
      if (j < 0 || j >= q.questions.length) return q;
      const arr = q.questions.slice();
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...q, questions: arr };
    }));
  }
  function addQuestion() {
    patchQuiz({ questions: [...(quiz?.questions ?? []), { prompt: "New question?", explain: null, choices: [
      { label: "Option A", is_correct: true }, { label: "Option B", is_correct: false }, { label: "Option C", is_correct: false }, { label: "Option D", is_correct: false },
    ] }] });
  }
  function removeQuestion(idx: number) {
    if (!quiz) return;
    patchQuiz({ questions: quiz.questions.filter((_, i) => i !== idx) });
  }
  function addChoice(qIdx: number) {
    if (!quiz) return;
    const q = quiz.questions[qIdx];
    patchQuestion(qIdx, { choices: [...q.choices, { label: "New option", is_correct: false }] });
  }
  function removeChoice(qIdx: number, cIdx: number) {
    if (!quiz) return;
    const q = quiz.questions[qIdx];
    if (q.choices.length <= 2) { toast.error("Need at least 2 choices"); return; }
    patchQuestion(qIdx, { choices: q.choices.filter((_, i) => i !== cIdx) });
  }

  async function saveAll() {
    if (!quiz) return;
    // Validate
    for (const [i, q] of quiz.questions.entries()) {
      if (!q.prompt.trim()) { toast.error(`Question ${i + 1}: prompt is empty`); return; }
      if (q.choices.length < 2) { toast.error(`Question ${i + 1}: needs ≥2 choices`); return; }
      if (q.choices.filter((c) => c.is_correct).length !== 1) { toast.error(`Question ${i + 1}: pick exactly one correct answer`); return; }
    }
    setSaving(true);
    try {
      const { error: qe } = await supabase.from("mission_quizzes" as any).update({
        title: quiz.title, base_xp: quiz.base_xp, per_right_xp: quiz.per_right_xp, time_limit_sec: quiz.time_limit_sec,
      }).eq("id", quiz.id);
      if (qe) throw qe;
      // Replace questions+choices
      const { error: de } = await supabase.from("mission_quiz_questions" as any).delete().eq("quiz_id", quiz.id);
      if (de) throw de;
      for (const [i, q] of quiz.questions.entries()) {
        const { data: inserted, error: ie } = await supabase.from("mission_quiz_questions" as any).insert({
          quiz_id: quiz.id, position: i, prompt: q.prompt, explain: q.explain,
        }).select("id").single();
        if (ie) throw ie;
        const newId = (inserted as any).id;
        const { error: ce } = await supabase.from("mission_quiz_choices" as any).insert(q.choices.map((c, j) => ({
          question_id: newId, position: j, label: c.label, is_correct: c.is_correct,
        })));
        if (ce) throw ce;
      }
      clearMissionContentCache();
      toast.success("Quiz saved");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally { setSaving(false); }
  }

  return (
    <StudioLayout title="Quiz Editor" actions={<Btn onClick={saveAll} disabled={saving || loading || !quiz}><Save size={14} className="mr-1 inline" />{saving ? "Saving…" : "Save quiz"}</Btn>}>
      <div className="px-6 py-5">
        {loading ? (<div className="text-sm text-[#666]">Loading…</div>) : (
          <>
            <div className="mb-4 flex gap-2">
              {(["self-paced", "quick"] as Pace[]).map((p) => {
                const q = quizzes.find((x) => x.pace === p);
                return (
                  <button key={p} onClick={() => setActivePace(p)}
                    className={`rounded-[8px] px-4 py-2 text-sm font-bold ${activePace === p ? "bg-[#7B2FBE] text-white" : "bg-white text-[#1A1A2E] border border-[#EBEBF5]"}`}>
                    {p === "quick" ? "⚡ Quick-Fire" : "🌿 Self-paced"} {q ? `(${q.questions.length})` : "—"}
                  </button>
                );
              })}
            </div>

            {!quiz ? (
              <div className="rounded-[10px] border border-[#EBEBF5] bg-white p-6 text-sm text-[#666]">No quiz for {activePace}.</div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-[10px] border border-[#EBEBF5] bg-white p-4">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <FieldStudio label="Title"><input className="w-full rounded border border-[#EBEBF5] px-2 py-1.5 text-sm" value={quiz.title} onChange={(e) => patchQuiz({ title: e.target.value })} /></FieldStudio>
                    <FieldStudio label="Base XP"><input type="number" className="w-full rounded border border-[#EBEBF5] px-2 py-1.5 text-sm" value={quiz.base_xp} onChange={(e) => patchQuiz({ base_xp: parseInt(e.target.value) || 0 })} /></FieldStudio>
                    <FieldStudio label="XP per correct"><input type="number" className="w-full rounded border border-[#EBEBF5] px-2 py-1.5 text-sm" value={quiz.per_right_xp} onChange={(e) => patchQuiz({ per_right_xp: parseInt(e.target.value) || 0 })} /></FieldStudio>
                    <FieldStudio label="Time limit (sec, blank = none)"><input type="number" className="w-full rounded border border-[#EBEBF5] px-2 py-1.5 text-sm" value={quiz.time_limit_sec ?? ""} onChange={(e) => patchQuiz({ time_limit_sec: e.target.value === "" ? null : (parseInt(e.target.value) || 0) })} /></FieldStudio>
                  </div>
                </div>

                <div className="space-y-3">
                  {quiz.questions.map((q, qi) => (
                    <div key={qi} className="rounded-[10px] border border-[#EBEBF5] bg-white p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-[#888]">Question {qi + 1}</div>
                        <div className="flex gap-1">
                          <button onClick={() => moveQuestion(qi, -1)} className="rounded p-1 hover:bg-[#F0F0FA]"><ArrowUp size={14} /></button>
                          <button onClick={() => moveQuestion(qi, 1)} className="rounded p-1 hover:bg-[#F0F0FA]"><ArrowDown size={14} /></button>
                          <button onClick={() => removeQuestion(qi)} className="rounded p-1 text-[#A33] hover:bg-red-50"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <textarea className="w-full rounded border border-[#EBEBF5] px-2 py-1.5 text-sm" rows={2} value={q.prompt} onChange={(e) => patchQuestion(qi, { prompt: e.target.value })} />
                      <div className="mt-2 grid gap-1.5">
                        {q.choices.map((c, ci) => (
                          <div key={ci} className="flex items-center gap-2">
                            <input type="radio" name={`correct-${qi}`} checked={c.is_correct} onChange={() => setCorrect(qi, ci)} />
                            <input className="flex-1 rounded border border-[#EBEBF5] px-2 py-1 text-sm" value={c.label} onChange={(e) => patchChoice(qi, ci, { label: e.target.value })} />
                            <button onClick={() => removeChoice(qi, ci)} className="rounded p-1 text-[#A33] hover:bg-red-50"><Trash2 size={12} /></button>
                          </div>
                        ))}
                        <button onClick={() => addChoice(qi)} className="self-start text-[11px] font-bold text-[#7B2FBE] hover:underline">+ Add choice</button>
                      </div>
                      <input placeholder="Optional explanation shown after answering" className="mt-2 w-full rounded border border-[#EBEBF5] px-2 py-1 text-xs italic" value={q.explain ?? ""} onChange={(e) => patchQuestion(qi, { explain: e.target.value || null })} />
                    </div>
                  ))}
                  <Btn onClick={addQuestion}><Plus size={14} className="mr-1 inline" />Add question</Btn>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </StudioLayout>
  );
}

function FieldStudio({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#888]">{label}</div>
      {children}
    </div>
  );
}
