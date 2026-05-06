import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

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
  autoRead: boolean;
  setAutoRead: (v: boolean) => void;
};

const GameContext = createContext<GameContextType | null>(null);

const START_XP = 145;
const NEXT_LEVEL_XP = 300;
const AUTO_READ_KEY = "sementa.autoRead";

export function GameProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<Step>("home");
  const [xp, setXp] = useState(START_XP);
  const [breakdown, setBreakdown] = useState<XpBreakdown>({
    foundation: 0, quiz: 0, simulation: 0, reflection: 0, bonus: 0,
  });
  const [branchingPick, setBranchingPick] = useState<"A" | "B" | null>(null);
  const [autoRead, setAutoReadState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return window.localStorage.getItem(AUTO_READ_KEY) === "1"; } catch { return false; }
  });

  const setAutoRead = useCallback((v: boolean) => {
    setAutoReadState(v);
    try { window.localStorage.setItem(AUTO_READ_KEY, v ? "1" : "0"); } catch {}
  }, []);

  const addXp = useCallback((key: keyof XpBreakdown, amount: number) => {
    setXp((v) => v + amount);
    setBreakdown((b) => ({ ...b, [key]: b[key] + amount }));
  }, []);

  const reset = useCallback(() => {
    setStep("home");
    setXp(START_XP);
    setBreakdown({ foundation: 0, quiz: 0, simulation: 0, reflection: 0, bonus: 0 });
    setBranchingPick(null);
  }, []);

  // stop any ongoing speech when unmounted
  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        step, setStep, xp, totalXp: NEXT_LEVEL_XP,
        level: "Explorer", streak: 3, breakdown, addXp,
        branchingPick, setBranchingPick, reset,
        autoRead, setAutoRead,
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
