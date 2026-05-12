// Empathy Relay — co-op. Players take turns answering 8 questions.
// Combined team score must hit a target to "save the day".

import { useEffect, useRef, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerAuth } from "@/game/PlayerAuth";
import { Confetti } from "@/game/Effects";
import { useMissionSettings, playFeedback } from "./missionSettings";
import { startMusic, type MusicHandle } from "./missionMusic";
import { SELF_PACED_QUIZ } from "./emotionsQuiz";
import { awardOrbs, xpToOrbs } from "@/game/shop/flaskOrbs";
import { FriendGate, MultiplayerLobby } from "./multiplayer/MultiplayerLobby";

const TOTAL_QUESTIONS = 8;
const TARGET = 6; // need 6 correct out of 8 combined

type Phase = "lobby" | "playing" | "done";

export function EmpathyRelay({ initialCode }: { initialCode?: string }) {
  return (
    <FriendGate>
      <RelayInner initialCode={initialCode} />
    </FriendGate>
  );
}

function RelayInner({ initialCode }: { initialCode?: string }) {
  const { user } = usePlayerAuth();
  const { settings } = useMissionSettings();
  const [phase, setPhase] = useState<Phase>("lobby");
  const [questions] = useState(() => SELF_PACED_QUIZ.slice(0, TOTAL_QUESTIONS));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0); // shared/team
  const [activeKey, setActiveKey] = useState<string>(""); // whose turn
  const [hostKey, setHostKey] = useState<string>("");
  const [guestKey, setGuestKey] = useState<string>("");
  const [oppName, setOppName] = useState("Friend");
  const [myName, setMyName] = useState("You");
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const myKeyRef = useRef<string>("");
  const musicRef = useRef<MusicHandle | null>(null);

  useEffect(() => {
    if (phase !== "playing") return;
    musicRef.current = startMusic("soothing", 0.06);
    return () => { musicRef.current?.stop(); musicRef.current = null; };
  }, [phase]);

  function pick(i: number) {
    if (picked != null || activeKey !== myKeyRef.current) return;
    const correct = i === questions[idx].answer;
    setPicked(i);
    const newCount = correct ? correctCount + 1 : correctCount;
    if (correct) setCorrectCount(newCount);
    playFeedback(correct ? "correct" : "incorrect", settings);
    const nextIdx = idx + 1;
    const nextActive = activeKey === hostKey ? guestKey : hostKey;
    setTimeout(() => {
      channelRef.current?.send({
        type: "broadcast", event: "relay-answer",
        payload: { i: nextIdx, correctCount: newCount, activeKey: nextActive, lastPicked: i, lastCorrect: correct },
      });
      setPicked(null);
      if (nextIdx >= questions.length) finish(newCount);
      else { setIdx(nextIdx); setActiveKey(nextActive); }
    }, 800);
  }

  async function finish(finalCorrect: number) {
    setPhase("done");
    musicRef.current?.stop();
    const success = finalCorrect >= TARGET;
    const xp = 30 + finalCorrect * 8 + (success ? 40 : 0);
    awardOrbs(xpToOrbs(xp));
    playFeedback(success ? "win" : "incorrect", settings);
    if (user) {
      const { error } = await supabase.from("xp_events").insert({
        user_id: user.id, amount: xp, source: `mission:empathy-relay:${success ? "win" : "lose"}`,
      });
      if (error) console.error(error);
    }
    toast.success(`+${xp} XP — ${success ? "Mission saved!" : "Good teamwork."}`);
  }

  if (phase === "lobby") {
    return (
      <MultiplayerLobby
        title="Empathy Relay"
        subtitle={`Take turns. Get ${TARGET} of ${TOTAL_QUESTIONS} right together to win.`}
        emoji="🤝"
        gradient="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500"
        channelKey="empathy-relay"
        startLabel="Start the relay"
        initialCode={initialCode}
        onStart={({ channel, me, peers, isHost }) => {
          channelRef.current = channel;
          myKeyRef.current = me.key;
          setMyName(me.name);
          const opp = peers.find((p) => p.key !== me.key);
          if (opp) setOppName(opp.name);
          // Resolve host/guest keys deterministically by sort so both sides agree
          const sorted = [...peers].sort((a, b) => a.key.localeCompare(b.key));
          const hk = sorted[0]?.key ?? me.key;
          const gk = sorted[1]?.key ?? me.key;
          setHostKey(hk); setGuestKey(gk); setActiveKey(hk);

          channel.on("broadcast", { event: "relay-answer" }, (p) => {
            const d = p.payload as { i: number; correctCount: number; activeKey: string };
            setCorrectCount(d.correctCount);
            setActiveKey(d.activeKey);
            setIdx(d.i);
            setPicked(null);
            if (d.i >= TOTAL_QUESTIONS) finish(d.correctCount);
          });

          setPhase("playing");
        }}
      />
    );
  }

  if (phase === "done") {
    const success = correctCount >= TARGET;
    return (
      <div className="mx-auto max-w-md px-5 py-10 text-center">
        {success && <Confetti />}
        <div className="text-6xl">{success ? "🎉" : "🌧"}</div>
        <h2 className="mt-3 text-2xl font-black text-foreground">
          {success ? "Mission saved!" : "Good teamwork."}
        </h2>
        <p className="mt-1 text-sm font-bold text-text-secondary">
          Team score: {correctCount} / {TOTAL_QUESTIONS} (target {TARGET})
        </p>
        <button onClick={() => location.reload()} className="mt-6 rounded-pill bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground">
          Play again
        </button>
      </div>
    );
  }

  const myTurn = activeKey === myKeyRef.current;
  const q = questions[idx];
  return (
    <div className="mx-auto max-w-md px-5 py-6">
      <div className="flex items-center justify-between text-xs font-extrabold text-text-secondary">
        <span>Q {idx + 1}/{TOTAL_QUESTIONS}</span>
        <span className="rounded-pill bg-emerald-100 px-3 py-1 text-emerald-800 flex items-center gap-1">
          <Heart size={11} /> Team {correctCount}/{TARGET}
        </span>
      </div>

      <div className={`mt-3 rounded-3xl p-5 text-white shadow-pop ${myTurn ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-slate-500 to-slate-700"}`}>
        <p className="text-[11px] font-extrabold uppercase tracking-widest opacity-90">
          {myTurn ? "Your turn" : `${oppName}'s turn`}
        </p>
        <p className="mt-2 text-base font-extrabold">{q.q}</p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2">
        {q.options.map((opt, i) => {
          const isCorrect = picked != null && i === q.answer;
          const isWrong = picked === i && i !== q.answer;
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={!myTurn || picked != null}
              className={`rounded-2xl px-4 py-3 text-left text-sm font-extrabold shadow-card transition active:scale-[0.99] disabled:opacity-60 ${
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

      <p className="mt-4 flex items-center justify-center gap-1 text-[10px] font-extrabold text-text-secondary">
        <Sparkles size={10} /> +8 XP per team correct · +40 XP if you reach the target
      </p>
    </div>
  );
}
