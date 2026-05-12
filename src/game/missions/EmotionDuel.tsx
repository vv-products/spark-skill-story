// Emotion Duel — competitive head-to-head quick-fire (10 questions).
// Live opponent score visible. Highest score wins; tie = both win.

import { useEffect, useRef, useState } from "react";
import { Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerAuth } from "@/game/PlayerAuth";
import { Confetti } from "@/game/Effects";
import { useMissionSettings, playFeedback } from "./missionSettings";
import { startMusic, type MusicHandle } from "./missionMusic";
import { QUICK_FIRE_QUIZ } from "./emotionsQuiz";
import { awardOrbs, xpToOrbs } from "@/game/shop/flaskOrbs";
import { FriendGate, MultiplayerLobby } from "./multiplayer/MultiplayerLobby";

const QUESTION_COUNT = 10;
const PER_Q_SECONDS = 8;

export function EmotionDuel({ initialCode }: { initialCode?: string }) {
  return (
    <FriendGate>
      <DuelInner initialCode={initialCode} />
    </FriendGate>
  );
}

type Phase = "lobby" | "playing" | "done";

function DuelInner({ initialCode }: { initialCode?: string }) {
  const { user } = usePlayerAuth();
  const { settings } = useMissionSettings();
  const [phase, setPhase] = useState<Phase>("lobby");
  const [questions] = useState(() => QUICK_FIRE_QUIZ.slice(0, QUESTION_COUNT));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [oppName, setOppName] = useState("Friend");
  const [timeLeft, setTimeLeft] = useState(PER_Q_SECONDS);
  const [outcome, setOutcome] = useState<"win" | "lose" | "tie" | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const musicRef = useRef<MusicHandle | null>(null);
  const myKeyRef = useRef<string>("");

  // music
  useEffect(() => {
    if (phase !== "playing") return;
    musicRef.current = startMusic("fast", 0.07);
    return () => { musicRef.current?.stop(); musicRef.current = null; };
  }, [phase]);

  // timer
  useEffect(() => {
    if (phase !== "playing" || picked != null) return;
    setTimeLeft(PER_Q_SECONDS);
    const start = Date.now();
    const id = setInterval(() => {
      const left = Math.max(0, PER_Q_SECONDS - (Date.now() - start) / 1000);
      setTimeLeft(left);
      if (left <= 0) { clearInterval(id); pick(-1); }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase, picked]);

  function broadcastScore(score: number) {
    channelRef.current?.send({ type: "broadcast", event: "duel-score", payload: { key: myKeyRef.current, score } });
  }

  function pick(i: number) {
    if (picked != null) return;
    const correct = i === questions[idx].answer;
    setPicked(i);
    if (correct) {
      const gain = 10 + Math.round(timeLeft * 2);
      const next = myScore + gain;
      setMyScore(next);
      broadcastScore(next);
      playFeedback("correct", settings);
    } else {
      playFeedback("incorrect", settings);
    }
    setTimeout(() => {
      setPicked(null);
      if (idx + 1 >= questions.length) finish();
      else setIdx((n) => n + 1);
    }, 700);
  }

  async function finish() {
    setPhase("done");
    musicRef.current?.stop();
    // wait briefly for opponent's last broadcast
    setTimeout(async () => {
      const win = myScore > oppScore ? "win" : myScore < oppScore ? "lose" : "tie";
      setOutcome(win);
      playFeedback(win === "lose" ? "incorrect" : "win", settings);
      const xp = 30 + myScore + (win === "win" ? 50 : win === "tie" ? 20 : 0);
      awardOrbs(xpToOrbs(xp));
      if (user) {
        const { error } = await supabase.from("xp_events").insert({
          user_id: user.id, amount: xp, source: `mission:emotion-duel:${win}`,
        });
        if (error) console.error(error);
      }
      toast.success(`+${xp} XP — ${win === "win" ? "You win!" : win === "tie" ? "It's a tie!" : "Good fight!"}`);
    }, 600);
  }

  if (phase === "lobby") {
    return (
      <MultiplayerLobby
        title="Emotion Duel"
        subtitle="Head-to-head 10 quick-fire questions. Highest score wins."
        emoji="⚔️"
        gradient="bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-600"
        channelKey="emotion-duel"
        initialCode={initialCode}
        startLabel="Start the duel"
        onStart={({ channel, me, peers }) => {
          channelRef.current = channel;
          myKeyRef.current = me.key;
          const opp = peers.find((p) => p.key !== me.key);
          if (opp) setOppName(opp.name);
          channel.on("broadcast", { event: "duel-score" }, (p) => {
            const d = p.payload as { key: string; score: number };
            if (d.key !== me.key) setOppScore(d.score);
          });
          setPhase("playing");
        }}
      />
    );
  }

  if (phase === "done") {
    const win = outcome ?? "tie";
    return (
      <div className="mx-auto max-w-md px-5 py-10 text-center">
        {win === "win" && <Confetti />}
        <div className="text-6xl">{win === "win" ? "🏆" : win === "tie" ? "🤝" : "🌱"}</div>
        <h2 className="mt-3 text-2xl font-black text-foreground">
          {win === "win" ? "Victory!" : win === "tie" ? "It's a tie!" : "Good fight!"}
        </h2>
        <p className="mt-1 text-sm font-bold text-text-secondary">
          You: {myScore} · {oppName}: {oppScore}
        </p>
        <button onClick={() => location.reload()} className="mt-6 rounded-pill bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground">
          Play again
        </button>
      </div>
    );
  }

  const q = questions[idx];
  return (
    <div className="mx-auto max-w-md px-5 py-6">
      <div className="flex items-center justify-between text-xs font-extrabold text-text-secondary">
        <span>Q {idx + 1}/{questions.length}</span>
        <span className="rounded-pill bg-rose-100 px-3 py-1 text-rose-700">⏱ {timeLeft.toFixed(1)}s</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <ScoreTile name="You"    score={myScore}  highlight />
        <ScoreTile name={oppName} score={oppScore} />
      </div>
      <div className="mt-4 rounded-3xl bg-gradient-to-br from-rose-500 to-fuchsia-600 p-5 text-white shadow-pop">
        <p className="text-base font-extrabold">{q.q}</p>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        {q.options.map((opt, i) => {
          const isCorrect = picked != null && i === q.answer;
          const isWrong = picked === i && i !== q.answer;
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={picked != null}
              className={`rounded-2xl px-4 py-3 text-left text-sm font-extrabold shadow-card transition active:scale-[0.99] ${
                isCorrect ? "bg-emerald-500 text-white" :
                isWrong   ? "bg-rose-500 text-white" :
                            "bg-card text-foreground"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <p className="mt-4 flex items-center gap-1 text-[10px] font-extrabold text-text-secondary">
        <Sparkles size={10} /> +10 XP per correct, +2 per second left, +50 win bonus
      </p>
    </div>
  );
}

function ScoreTile({ name, score, highlight }: { name: string; score: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 text-center shadow-card ${highlight ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" : "bg-card text-foreground"}`}>
      <p className="text-[10px] font-extrabold opacity-90 truncate">{name}</p>
      <p className="text-2xl font-black">{score}</p>
    </div>
  );
}
