// Puzzle definitions for the Emotions Crossword mission.
// Three difficulties. Each puzzle has a SOLUTION grid (2D array; null = blocked),
// across/down clue lists, a list of word references for hit-testing, and an XP reward.

export type Difficulty = "easy" | "medium" | "hard";
export type SolCell = { ch: string; num?: number } | null;
export type Clue = { num: number; text: string };
export type WordRef = { num: number; dir: "A" | "D"; r: number; c: number; len: number; answer: string };

export type Puzzle = {
  id: Difficulty;
  label: string;
  rows: number;
  cols: number;
  xp: number;
  solution: SolCell[][];
  across: Clue[];
  down: Clue[];
  words: WordRef[];
};

// ----- EASY -----
//  S A D . .
//  H . . . .
//  Y A Y . .
const EASY: Puzzle = {
  id: "easy",
  label: "Easy",
  rows: 3,
  cols: 5,
  xp: 25,
  solution: [
    [{ ch: "S", num: 1 }, { ch: "A" }, { ch: "D" }, null, null],
    [{ ch: "H" }, null, null, null, null],
    [{ ch: "Y", num: 2 }, { ch: "A" }, { ch: "Y" }, null, null],
  ],
  across: [
    { num: 1, text: "Unhappy (3)" },
    { num: 2, text: "A cheer when you're happy (3)" },
  ],
  down: [
    { num: 1, text: "Quiet — doesn't say much (3)" },
  ],
  words: [
    { num: 1, dir: "A", r: 0, c: 0, len: 3, answer: "SAD" },
    { num: 2, dir: "A", r: 2, c: 0, len: 3, answer: "YAY" },
    { num: 1, dir: "D", r: 0, c: 0, len: 3, answer: "SHY" },
  ],
};

// ----- MEDIUM (the original puzzle) -----
//  H A P P Y .
//  B O R E D .
//  . . O . . .
//  . . U . . .
//  . . D U L L
const MEDIUM: Puzzle = {
  id: "medium",
  label: "Medium",
  rows: 5,
  cols: 6,
  xp: 50,
  solution: [
    [{ ch: "H", num: 1 }, { ch: "A" }, { ch: "P", num: 2 }, { ch: "P" }, { ch: "Y" }, null],
    [{ ch: "B", num: 3 }, { ch: "O" }, { ch: "R" }, { ch: "E" }, { ch: "D" }, null],
    [null, null, { ch: "O" }, null, null, null],
    [null, null, { ch: "U" }, null, null, null],
    [null, null, { ch: "D", num: 4 }, { ch: "U" }, { ch: "L" }, { ch: "L" }],
  ],
  across: [
    { num: 1, text: "Feeling great with a big smile (5)" },
    { num: 3, text: "Feeling uninterested or tired of something (5)" },
    { num: 4, text: "Boring; not exciting (4)" },
  ],
  down: [
    { num: 2, text: "Pleased with what you did (5)" },
  ],
  words: [
    { num: 1, dir: "A", r: 0, c: 0, len: 5, answer: "HAPPY" },
    { num: 3, dir: "A", r: 1, c: 0, len: 5, answer: "BORED" },
    { num: 4, dir: "A", r: 4, c: 2, len: 4, answer: "DULL" },
    { num: 2, dir: "D", r: 0, c: 2, len: 5, answer: "PROUD" },
  ],
};

// ----- HARD -----
//  H A P P Y .
//  B O R E D .
//  . H O P E .
//  . . U G L Y
//  . . D U L L
const HARD: Puzzle = {
  id: "hard",
  label: "Hard",
  rows: 5,
  cols: 6,
  xp: 100,
  solution: [
    [{ ch: "H", num: 1 }, { ch: "A" }, { ch: "P", num: 2 }, { ch: "P" }, { ch: "Y" }, null],
    [{ ch: "B", num: 3 }, { ch: "O" }, { ch: "R" }, { ch: "E" }, { ch: "D" }, null],
    [null, { ch: "H", num: 4 }, { ch: "O" }, { ch: "P" }, { ch: "E" }, null],
    [null, null, { ch: "U", num: 5 }, { ch: "G" }, { ch: "L" }, { ch: "Y" }],
    [null, null, { ch: "D", num: 6 }, { ch: "U" }, { ch: "L" }, { ch: "L" }],
  ],
  across: [
    { num: 1, text: "Feeling great with a big smile (5)" },
    { num: 3, text: "Feeling uninterested or tired of something (5)" },
    { num: 4, text: "A feeling that good things will happen (4)" },
    { num: 5, text: "Not nice to look at (4)" },
    { num: 6, text: "Boring; not exciting (4)" },
  ],
  down: [
    { num: 2, text: "Pleased with what you did (5)" },
  ],
  words: [
    { num: 1, dir: "A", r: 0, c: 0, len: 5, answer: "HAPPY" },
    { num: 3, dir: "A", r: 1, c: 0, len: 5, answer: "BORED" },
    { num: 4, dir: "A", r: 2, c: 1, len: 4, answer: "HOPE" },
    { num: 5, dir: "A", r: 3, c: 2, len: 4, answer: "UGLY" },
    { num: 6, dir: "A", r: 4, c: 2, len: 4, answer: "DULL" },
    { num: 2, dir: "D", r: 0, c: 2, len: 5, answer: "PROUD" },
  ],
};

export const PUZZLES: Record<Difficulty, Puzzle> = { easy: EASY, medium: MEDIUM, hard: HARD };

export function emptyGridFor(p: Puzzle): string[][] {
  return p.solution.map((row) => row.map(() => ""));
}

export function badgeForDifficulty(d: Difficulty): { emoji: string; name: string } {
  if (d === "easy") return { emoji: "🌱", name: "Sprout Solver" };
  if (d === "medium") return { emoji: "🧩", name: "Puzzle Pal" };
  return { emoji: "🏆", name: "Emotion Master" };
}
