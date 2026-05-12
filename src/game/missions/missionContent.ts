// CMS-backed loaders for mission content (crossword + quiz) with
// hardcoded fallbacks. Components call load* on mount and use the
// existing content shape unchanged. Caches in-memory per session.

import { supabase } from "@/integrations/supabase/client";
import {
  PUZZLES as FALLBACK_PUZZLES,
  type Puzzle,
  type Difficulty,
  type SolCell,
  type WordRef,
  type Clue,
} from "./emotionsCrosswordPuzzles";
import { SELF_PACED_QUIZ as FALLBACK_SP, QUICK_FIRE_QUIZ as FALLBACK_QF, type MCQ } from "./emotionsQuiz";

// ----- Crossword -----

const xwordCache = new Map<Difficulty, Puzzle>();

type WordRow = { number: number; direction: "A" | "D"; row: number; col: number; answer: string; clue: string };

function buildPuzzle(diff: Difficulty, label: string, rows: number, cols: number, xp: number, words: WordRow[]): Puzzle {
  const solution: SolCell[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null as SolCell));
  for (const w of words) {
    const ans = (w.answer || "").toUpperCase();
    for (let i = 0; i < ans.length; i++) {
      const r = w.direction === "D" ? w.row + i : w.row;
      const c = w.direction === "A" ? w.col + i : w.col;
      if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
      solution[r][c] = { ch: ans[i] };
    }
  }
  // Apply numbers to first cell of each word
  for (const w of words) {
    const cell = solution[w.row]?.[w.col];
    if (cell) cell.num = w.number;
  }
  const across: Clue[] = words.filter((w) => w.direction === "A").map((w) => ({ num: w.number, text: w.clue }));
  const down: Clue[] = words.filter((w) => w.direction === "D").map((w) => ({ num: w.number, text: w.clue }));
  const wordRefs: WordRef[] = words.map((w) => ({
    num: w.number,
    dir: w.direction,
    r: w.row,
    c: w.col,
    len: (w.answer || "").length,
    answer: (w.answer || "").toUpperCase(),
  }));
  return { id: diff, label, rows, cols, xp, solution, across, down, words: wordRefs };
}

export async function loadCrosswordPuzzle(diff: Difficulty): Promise<Puzzle> {
  if (xwordCache.has(diff)) return xwordCache.get(diff)!;
  try {
    const { data: cw, error: e1 } = await supabase
      .from("mission_crosswords" as any)
      .select("id")
      .eq("slug", "emotions")
      .maybeSingle();
    if (e1 || !cw) throw e1 ?? new Error("no crossword");
    const { data: variant, error: e2 } = await supabase
      .from("mission_crossword_variants" as any)
      .select("id, label, rows, cols, xp_reward")
      .eq("crossword_id", (cw as any).id)
      .eq("difficulty", diff)
      .maybeSingle();
    if (e2 || !variant) throw e2 ?? new Error("no variant");
    const { data: words, error: e3 } = await supabase
      .from("mission_crossword_words" as any)
      .select("number, direction, row, col, answer, clue")
      .eq("variant_id", (variant as any).id);
    if (e3 || !words) throw e3 ?? new Error("no words");
    const v = variant as any;
    const built = buildPuzzle(diff, v.label, v.rows, v.cols, v.xp_reward, words as any);
    xwordCache.set(diff, built);
    return built;
  } catch (err) {
    console.warn("[missionContent] crossword fallback", err);
    const fb = FALLBACK_PUZZLES[diff];
    xwordCache.set(diff, fb);
    return fb;
  }
}

// ----- Quiz -----

const quizCache = new Map<"self-paced" | "quick", MCQ[]>();

export async function loadQuizQuestions(pace: "self-paced" | "quick"): Promise<MCQ[]> {
  if (quizCache.has(pace)) return quizCache.get(pace)!;
  try {
    const { data: quiz, error: e1 } = await supabase
      .from("mission_quizzes" as any)
      .select("id")
      .eq("pace", pace)
      .maybeSingle();
    if (e1 || !quiz) throw e1 ?? new Error("no quiz");
    const { data: questions, error: e2 } = await supabase
      .from("mission_quiz_questions" as any)
      .select("id, position, prompt, explain, mission_quiz_choices(position, label, is_correct)")
      .eq("quiz_id", (quiz as any).id)
      .order("position", { ascending: true });
    if (e2 || !questions) throw e2 ?? new Error("no questions");
    const built: MCQ[] = (questions as any[]).map((q) => {
      const choices = ((q.mission_quiz_choices as any[]) ?? []).slice().sort((a, b) => a.position - b.position);
      const answerIdx = Math.max(0, choices.findIndex((c) => c.is_correct));
      return {
        q: q.prompt,
        options: choices.map((c) => c.label),
        answer: answerIdx,
        explain: q.explain ?? undefined,
      };
    });
    if (built.length === 0) throw new Error("empty");
    quizCache.set(pace, built);
    return built;
  } catch (err) {
    console.warn("[missionContent] quiz fallback", err);
    const fb = pace === "quick" ? FALLBACK_QF : FALLBACK_SP;
    quizCache.set(pace, fb);
    return fb;
  }
}

export function clearMissionContentCache() {
  xwordCache.clear();
  quizCache.clear();
}
