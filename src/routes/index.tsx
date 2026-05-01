import { createFileRoute } from "@tanstack/react-router";
import { GameProvider, useGame } from "@/game/GameContext";
import { HomeScreen } from "@/game/screens/HomeScreen";
import { IntroScreen } from "@/game/screens/IntroScreen";
import { VideoScreen } from "@/game/screens/VideoScreen";
import { QuizScreen } from "@/game/screens/QuizScreen";
import { BranchingScreen, BranchingResultScreen } from "@/game/screens/BranchingScreen";
import { ReflectionScreen } from "@/game/screens/ReflectionScreen";
import { CompleteScreen } from "@/game/screens/CompleteScreen";

export const Route = createFileRoute("/")({
  component: Index,
});

function Stage() {
  const { step } = useGame();
  switch (step) {
    case "home": return <HomeScreen />;
    case "intro": return <IntroScreen />;
    case "video": return <VideoScreen />;
    case "quiz": return <QuizScreen />;
    case "branching": return <BranchingScreen />;
    case "branching-result": return <BranchingResultScreen />;
    case "reflection": return <ReflectionScreen />;
    case "complete": return <CompleteScreen />;
  }
}

function Index() {
  return (
    <div className="min-h-[100dvh] w-full bg-[#E5E5F2]">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[430px] bg-background shadow-2xl">
        <GameProvider>
          <Stage />
        </GameProvider>
      </div>
    </div>
  );
}
