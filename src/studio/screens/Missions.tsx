import { Link } from "@tanstack/react-router";
import { StudioLayout } from "../Layout";
import { useStudio } from "../StudioContext";
import { PUZZLES, type Difficulty } from "@/game/missions/emotionsCrosswordPuzzles";
import { SELF_PACED_QUIZ, QUICK_FIRE_QUIZ } from "@/game/missions/emotionsQuiz";

type MissionEntry = {
  id: string;
  title: string;
  emoji: string;
  type: "Crossword" | "Quiz" | "Quick-Fire MCQ";
  rarity: "Standard" | "Rare";
  modes: string[];
  music: string;
  baseXp: number;
  bonusNote?: string;
  to: string;
  contentSummary: string;
};

const MISSIONS: MissionEntry[] = [
  {
    id: "emotions-crossword",
    title: "Emotions Crossword",
    emoji: "🧩",
    type: "Crossword",
    rarity: "Standard",
    modes: ["Solo", "Co-op"],
    music: "—",
    baseXp: PUZZLES.medium.xp,
    bonusNote: `Easy +${PUZZLES.easy.xp} · Medium +${PUZZLES.medium.xp} · Hard +${PUZZLES.hard.xp} · Co-op +20 bonus`,
    to: "/mission/emotions-crossword",
    contentSummary: `${(["easy","medium","hard"] as Difficulty[]).map(d => `${PUZZLES[d].label}: ${PUZZLES[d].words.length} words`).join(" · ")}`,
  },
  {
    id: "emotions-quiz",
    title: "Emotions Quiz",
    emoji: "🌿",
    type: "Quiz",
    rarity: "Standard",
    modes: ["Solo", "Co-op"],
    music: "Soothing ambient",
    baseXp: 25,
    bonusNote: "+5 XP per correct answer",
    to: "/mission/emotions-quiz",
    contentSummary: `${SELF_PACED_QUIZ.length} multiple-choice questions`,
  },
  {
    id: "emotions-quickfire",
    title: "Emotions Quick-Fire",
    emoji: "⚡",
    type: "Quick-Fire MCQ",
    rarity: "Rare",
    modes: ["Solo", "Co-op"],
    music: "Fast & energetic",
    baseXp: 50,
    bonusNote: "+8 XP per correct + speed bonus + streak bonus",
    to: "/mission/emotions-quickfire",
    contentSummary: `${QUICK_FIRE_QUIZ.length} questions · 8s timer each`,
  },
  {
    id: "emotions-catcher",
    title: "Emotion Catcher",
    emoji: "🦋",
    type: "Quick-Fire MCQ",
    rarity: "Rare",
    modes: ["Solo"],
    music: "Fast & energetic",
    baseXp: 40,
    bonusNote: "+10 XP per catch · streak bonus up to +15",
    to: "/mission/emotions-catcher",
    contentSummary: "45s round · fliers cross in 1–2s · 3 lives",
  },
  {
    id: "emotion-duel",
    title: "Emotion Duel",
    emoji: "⚔️",
    type: "Quick-Fire MCQ",
    rarity: "Rare",
    modes: ["Vs Friend"],
    music: "Fast & energetic",
    baseXp: 30,
    bonusNote: "+10 per correct + speed bonus + win bonus +50 · Friends-only",
    to: "/mission/emotion-duel",
    contentSummary: "10 head-to-head questions · live opponent score",
  },
  {
    id: "reaction-race",
    title: "Reaction Race",
    emoji: "⚡",
    type: "Quick-Fire MCQ",
    rarity: "Rare",
    modes: ["Vs Friend"],
    music: "Fast & energetic",
    baseXp: 25,
    bonusNote: "+8 per round won + win bonus +40 · Friends-only",
    to: "/mission/reaction-race",
    contentSummary: "Best of 7 rounds · first correct tap claims the round",
  },
  {
    id: "empathy-relay",
    title: "Empathy Relay",
    emoji: "🤝",
    type: "Quiz",
    rarity: "Standard",
    modes: ["Co-op"],
    music: "Soothing ambient",
    baseXp: 30,
    bonusNote: "+8 per team correct + target bonus +40 · Friends-only",
    to: "/mission/empathy-relay",
    contentSummary: "Take turns · 8 questions · hit team target of 6",
  },
  {
    id: "mood-match",
    title: "Mood Match",
    emoji: "💞",
    type: "Quiz",
    rarity: "Standard",
    modes: ["Co-op"],
    music: "Soothing ambient",
    baseXp: 25,
    bonusNote: "+10 XP per matched emotion · Friends-only",
    to: "/mission/mood-match",
    contentSummary: "8 scenario rounds · pick the same emotion as your friend",
  },
];

export function MissionsScreen() {
  return (
    <StudioLayout title="Missions">
      <div className="px-8 py-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A2E]">Standalone Missions</h2>
            <p className="text-sm text-[#666680]">
              Mini-games outside the main class flow. XP earned here flows into the global leaderboard via{" "}
              <code className="rounded bg-[#F0F0FA] px-1.5 py-0.5 text-[11px] text-[#7B2FBE]">xp_events</code>.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {MISSIONS.map((m) => (
            <div key={m.id} className="rounded-[12px] border border-[#EBEBF5] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between">
                <span className="text-3xl">{m.emoji}</span>
                <span
                  className={`rounded-[6px] px-2 py-0.5 text-[11px] font-bold ${
                    m.rarity === "Rare" ? "bg-orange-100 text-orange-700" : "bg-[#F0F0FA] text-[#7B2FBE]"
                  }`}
                >
                  {m.rarity}
                </span>
              </div>
              <div className="mt-3 text-[11px] font-bold uppercase tracking-wide text-[#888]">{m.type}</div>
              <div className="text-[15px] font-bold text-[#1A1A2E]">{m.title}</div>
              <div className="mt-1 text-[12px] text-[#666680]">{m.contentSummary}</div>

              <div className="mt-4 space-y-1.5 border-t border-[#F0F0FA] pt-3 text-[12px]">
                <Row label="Modes" value={m.modes.join(" · ")} />
                <Row label="Music" value={m.music} />
                <Row label="Base XP" value={`+${m.baseXp}`} />
                {m.bonusNote && <Row label="Bonus" value={m.bonusNote} small />}
              </div>

              <div className="mt-4 flex gap-2">
                <Link to={m.to} className="flex-1 rounded-[8px] bg-[#7B2FBE] px-3 py-2 text-center text-[12px] font-semibold text-white hover:bg-[#6a26a6]">
                  Preview ↗
                </Link>
                {m.id === "emotions-crossword" && <EditBtn view="crossword-builder">Edit</EditBtn>}
                {(m.id === "emotions-quiz" || m.id === "emotions-quickfire") && <EditBtn view="quiz-editor">Edit</EditBtn>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[10px] border border-[#EBEBF5] bg-white p-4 text-[12px] text-[#666680]">
          <strong className="text-[#1A1A2E]">Note:</strong> Crossword & Quiz content is now CMS-managed. Edit grids, words, clues, questions and choices from the side panels.
        </div>
      </div>
    </StudioLayout>
  );
}

function EditBtn({ view, children }: { view: "crossword-builder" | "quiz-editor"; children: React.ReactNode }) {
  const { setView } = useStudio();
  return (
    <button onClick={() => setView({ kind: view })} className="rounded-[8px] border border-[#EBEBF5] bg-white px-3 py-2 text-[12px] font-semibold text-[#1A1A2E] hover:bg-[#F8F8FC]">
      {children}
    </button>
  );
}

function Row({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="font-semibold text-[#888]">{label}</span>
      <span className={`text-right font-semibold text-[#1A1A2E] ${small ? "text-[11px]" : ""}`}>{value}</span>
    </div>
  );
}
