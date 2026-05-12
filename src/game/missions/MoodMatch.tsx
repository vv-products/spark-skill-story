// Mood Match — co-op. Both players see a scenario and pick the emotion they
// feel matches best. If they pick the SAME emotion (or both pick a "best" answer),
// the team scores. 8 rounds. No wrong answers — just connection.

import { useEffect, useRef, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerAuth } from "@/game/PlayerAuth";
import { Confetti } from "@/game/Effects";
import { useMissionSettings, playFeedback } from "./missionSettings";
import { startMusic, type MusicHandle } from "./missionMusic";
import { awardOrbs, xpToOrbs } from "@/game/shop/flaskOrbs";
import { FriendGate, MultiplayerLobby } from "./multiplayer/MultiplayerLobby";
import { EMOTION_TARGETS, MOOD_SCENARIOS, type MoodScenario } from "./multiplayer/missionScenarios";

const TOTAL_ROUNDS = 8;

type Phase = "lobby" | "playing" | "done";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MoodMatch({ initialCode }: { initialCode?: string }) {
  return (
    <FriendGate>
      <MoodInner initialCode={initialCode} />
    </FriendGate>
  );
}

function MoodInner({ initialCode }: { initialCode?: string }) {
  const { user } = usePlayerAuth();
  const { settings } = useMissionSettings();
  const [phase, setPhase] = useState<Phase>("lobby");
  const [rounds, setRounds] = useState<MoodScenario[]>([]);
  const [idx, setIdx] = useState(0);
  const [myPick, setMyPick] = useState<string | null>(null);
  const [oppPick, setOppPick] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [oppName, setOppName] = useState("Friend");
  const [reveal, setReveal] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const myKeyRef = useRef<string>("");
  const isHostRef = useRef(false);
  const musicRef = useRef<MusicHandle | null>(null);

  useEffect(() => {
    if (phase !== "playing") return;
    musicRef.current = startMusic("soothing", 0.06);
    return () => { musicRef.current?.stop(); musicRef.current = null; };
  }, [phase]);

  // when both picks are in, evaluate
  useEffect(() => {
    if (myPick && oppPick) {
      const scenario = rounds[idx];
      if (!scenario) return;
      const matched = myPick === oppPick || (scenario.bestAnswers.includes(myPick) && scenario.bestAnswers.includes(oppPick));
      if (matched) {
        setScore((s) => s + 1);
        playFeedback("correct", settings);
      }
      setReveal(true);
      setTimeout(() => {
        setMyPick(null); setOppPick(null); setReveal(false);
        const next = idx + 1;
        if (next >= TOTAL_ROUNDS) finish(matched ? score + 1 : score);
        else setIdx(next);
      }, 1600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myPick, oppPick]);

  function pick(label: string) {
    if (myPick) return;
    setMyPick(label);
    channelRef.current?.send({ type: "broadcast", event: "mood-pick", payload: { key: myKeyRef.current, i: idx, pick: label } });
  }

  async function finish(finalScore: number) {
    setPhase("done");
    musicRef.current?.stop();
    const xp = 25 + finalScore * 10;
    awardOrbs(xpToOrbs(xp));
    playFeedback("win", settings);
    if (user) {
      const { error } = await supabase.from("xp_events").insert({
        user_id: user.id, amount: xp, source: "mission:mood-match",
      });
      if (error) console.error(error);
    }
    toast.success(`+${xp} XP — Connected ${finalScore}/${TOTAL_ROUNDS} times.`);
  }

  if (phase === "lobby") {
    return (
      <MultiplayerLobby
        title="Mood Match"
        subtitle="Both pick the emotion you feel — see how often you match!"
        emoji="💞"
        gradient="bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600"
        channelKey="mood-match"
        startLabel="Start matching"
        initialCode={initialCode}
        onStart={({ channel, me, peers, isHost }: import("./multiplayer/MultiplayerLobby").LobbyStartCtx) => {
          channelRef.current = channel;
          myKeyRef.current = me.key;
          isHostRef.current = isHost;
          const opp = peers.find((p) => p.key !== me.key);
          if (opp) setOppName(opp.name);

          channel.on("broadcast", { event: "mood-rounds" }, (p) => {
            const d = p.payload as { rounds: MoodScenario[] };
            setRounds(d.rounds);
          });
          channel.on("broadcast", { event: "mood-pick" }, (p) => {
            const d = p.payload as { key: string; i: number; pick: string };
            if (d.key !== me.key) setOppPick(d.pick);
          });

          if (isHost) {
            const r = shuffle(MOOD_SCENARIOS).slice(0, TOTAL_ROUNDS);
            setRounds(r);
            setTimeout(() => channel.send({ type: "broadcast", event: "mood-rounds", payload: { rounds: r } }), 200);
          }
          setPhase("playing");
        }}
      />
    );
  }

  if (phase === "done") {
    return (
      <div className="mx-auto max-w-md px-5 py-10 text-center">
        {score >= TOTAL_ROUNDS / 2 && <Confetti />}
        <div className="text-6xl">💞</div>
        <h2 className="mt-3 text-2xl font-black text-foreground">In sync!</h2>
        <p className="mt-1 text-sm font-bold text-text-secondary">
          You and {oppName} matched {score} / {TOTAL_ROUNDS} times.
        </p>
        <button onClick={() => location.reload()} className="mt-6 rounded-pill bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground">
          Play again
        </button>
      </div>
    );
  }

  if (rounds.length === 0) {
    return <div className="flex h-[60vh] items-center justify-center text-[#666]">Loading rounds…</div>;
  }
  const scenario = rounds[idx];
  return (
    <div className="mx-auto max-w-md px-5 py-6">
      <div className="flex items-center justify-between text-xs font-extrabold text-text-secondary">
        <span>Round {idx + 1}/{TOTAL_ROUNDS}</span>
        <span className="rounded-pill bg-pink-100 px-3 py-1 text-pink-700 flex items-center gap-1">
          <Heart size={11} /> Matches: {score}
        </span>
      </div>

      <div className="mt-3 rounded-3xl bg-gradient-to-br from-pink-500 to-fuchsia-600 p-5 text-white shadow-pop">
        <p className="text-[11px] font-extrabold uppercase tracking-widest opacity-90">Scenario</p>
        <p className="mt-2 text-base font-extrabold">{scenario.prompt}</p>
      </div>

      <div className="mt-4 flex items-center justify-around text-[11px] font-extrabold text-text-secondary">
        <PickPill label="You" value={myPick} reveal={reveal} />
        <span>vs</span>
        <PickPill label={oppName} value={oppPick} reveal={reveal} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {EMOTION_TARGETS.map((e) => (
          <button
            key={e.label}
            onClick={() => pick(e.label)}
            disabled={!!myPick}
            className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-sm font-black shadow-card transition active:scale-95 disabled:opacity-60 ${
              myPick === e.label ? "ring-4 ring-white " + e.color : e.color
            }`}
          >
            <span className="text-2xl">{e.emoji}</span> {e.label}
          </button>
        ))}
      </div>

      <p className="mt-4 flex items-center justify-center gap-1 text-[10px] font-extrabold text-text-secondary">
        <Sparkles size={10} /> No wrong answers — match for +10 XP each.
      </p>
    </div>
  );
}

function PickPill({ label, value, reveal }: { label: string; value: string | null; reveal: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>
      <span className="mt-1 rounded-pill bg-card px-3 py-1 text-foreground shadow-card">
        {reveal ? (value ?? "—") : (value ? "✓ picked" : "thinking…")}
      </span>
    </div>
  );
}
