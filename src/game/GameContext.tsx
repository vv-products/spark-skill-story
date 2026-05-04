import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Step =
  | "home"
  | "intro"
  | "video"
  | "quiz"
  | "branching"
  | "branching-result"
  | "reflection"
  | "complete";

type XpBreakdown = {
  foundation: number;
  quiz: number;
  simulation: number;
  reflection: number;
  bonus: number;
};

type GameContextType = {
  step: Step;
  setStep: (s: Step) => void;
  xp: number;
  totalXp: number;
  level: string;
  streak: number;
  breakdown: XpBreakdown;
  addXp: (key: keyof XpBreakdown, amount: number) => void;
  branchingPick: "A" | "B" | null;
  setBranchingPick: (p: "A" | "B" | null) => void;
  reset: () => void;
};

const GameContext = createContext<GameContextType | null>(null);

const START_XP = 145;
const NEXT_LEVEL_XP = 300;

export function GameProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<Step>("home");
  const [xp, setXp] = useState(START_XP);
  const [breakdown, setBreakdown] = useState<XpBreakdown>({
    foundation: 0, quiz: 0, simulation: 0, reflection: 0, bonus: 0,
  });

  const addXp = useCallback((key: keyof XpBreakdown, amount: number) => {
    setXp((v) => v + amount);
    setBreakdown((b) => ({ ...b, [key]: b[key] + amount }));
  }, []);

  const reset = useCallback(() => {
    setStep("home");
    setXp(START_XP);
    setBreakdown({ foundation: 0, quiz: 0, simulation: 0, reflection: 0, bonus: 0 });
  }, []);

  return (
    <GameContext.Provider
      value={{
        step, setStep, xp, totalXp: NEXT_LEVEL_XP,
        level: "Explorer", streak: 3, breakdown, addXp, reset,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
