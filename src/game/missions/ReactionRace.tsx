// Reaction Race — competitive. Best of 7 rounds.
// Each round shows a target emotion. Both players see the same 4 options
// (host generates and broadcasts). First to tap the matching emoji wins the round.

import { useEffect, useRef, useState } from "react";
import { Zap, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerAuth } from "@/game/PlayerAuth";
import { Confetti } from "@/game/Effects";
import { useMissionSettings, playFeedback } from "../missionSettings";
import { startMusic, type MusicHandle } from "../missionMusic";
import { awardOrbs, xpToOrbs } from "@/game/shop/flaskOrbs";
import { FriendGate, MultiplayerLobby } from "../multiplayer/MultiplayerLobby";
import { EMOTION_TARGETS } from "../multiplayer/missionScenarios";

const TOTAL_ROUNDS = 7;

type Round = { target: string; options: string[] };

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeRound(): Round {
  const pool = shuffle(EMOTION_TARGETS).slice(0, 4);
  const target = pool[Math.floor(Math.random() * pool.length)].label;
  return { target, options: pool.map((p) => p.label) };
}

type Phase = "lobby" | "playing" | "done";

export function ReactionRace({ initialCode }: { initialCode?: string }) {
  return (
    <FriendGate>
      <RaceInner initialCode={initialCode} />
    </FriendGate>
  );
}

function RaceInner({ initialCode }: { initialCode?: string }) {
  const { user } = usePlayerAuth();
  const { settings } = useMissionSettings();
  const [phase, setPhase] = useState<Phase>("lobby");
  const [round, setRound] = useState<Round | null>(null);
  const [roundIdx, setRoundIdx] = useState(0);
  const [myWins, setMyWins] = useState(0);
  const [oppWins, setOppWins] = useState(0);
  const [oppName, setOppName] = useState("Friend");
  const [locked, setLocked] = useState(false);
  const [winnerKeyThisRound, setWinnerKeyThisRound] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isHostRef = useRef(false);
  const myKeyRef = useRef<string>("");
  const musicRef = useRef<MusicHandle | null>(null);

  useEffect(() => {
    if (phase !== "playing") return;
    musicRef.current = startMusic("fast", 0.06);
    return () => { musicRef.current?.stop(); musicRef.current = null; };
  }, [phase]);

  function startRound(i: number) {
    setLocked(false);
    setWinnerKeyThisRound(null);
    if (isHostRef.current) {
      const r = makeRound();
      setRound(r);
      setRoundIdx(i);
      channelRef.current?.send({ type: "broadcast", event: "race-round", payload: { i, round: r } });
    }
  }

  function pick(label: string) {
    if (locked || !round) return;
    if (label === round.target) {
      // claim the round
      setLocked(true);
      channelRef.current?.send({ type: "broadcast", event: "race-claim", payload: { key: myKeyRef.current, i: roundIdx } });
      setMyWins((s) => s + 1);
      setWinnerKeyThisRound(myKeyRef.current);
      playFeedback("correct", settings);
      scheduleNext();
    } else {
      playFeedback("incorrect", settings);
      // small lock so they can't spam
      setLocked(true);
      setTimeout(() => setLocked(false), 400);
    }
  }

  function scheduleNext() {
    setTimeout(() => {
      const next = roundIdx + 1;
      if (next >= TOTAL_ROUNDS) finish();
      else startRound(next);
    }, 900);
  }

  async function finish() {
    setPhase("done");
    musicRef.current?.stop();
    const win = myWins > oppWins ? "win" : myWins < oppWins ? "lose" : "tie";
    const xp = 25 + myWins * 8 + (win === "win" ? 40 : win === "tie" ? 15 : 0);
    awardOrbs(xpToOrbs(xp));
    playFeedback(win === "lose" ? "incorrect" : "win", settings);
    if (user) {
      const { error } = await supabase.from("xp_events").insert({
        user_id: user.id, amount: xp, source: `mission:reaction-race:${win}`,
      });
      if (error) console.error(error);
    }
    toast.success(`+${xp} XP — ${win === "win" ? "Champion!" : win === "tie" ? "Tied!" : "Nice try!"}`);
  }

  if (phase === "lobby") {
    return (
      <MultiplayerLobby
        title="Reaction Race"
        subtitle="Best of 7. Tap the matching emotion before your friend does."
        emoji="⚡"
        gradient="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500"
        channelKey="reaction-race"
        initialCode={initialCode}
        startLabel="Start the race"
        onStart={({ channel, me, peers, isHost }) => {
          channelRef.current = channel;
          isHostRef.current = isHost;
          myKeyRef.current = me.key;
          const opp = peers.find((p) => p.key !== me.key);
          if (opp) setOppName(opp.name);

          channel.on("broadcast", { event: "race-round" }, (p) => {
            const d = p.payload as { i: number; round: Round };
            setLocked(false);
            setWinnerKeyThisRound(null);
            setRound(d.round);
            setRoundIdx(d.i);
          });
          channel.on("broadcast", { event: "race-claim" }, (p) => {
            const d = p.payload as { key: string; i: number };
            if (d.key === me.key) return;
            // opponent claimed first
            setLocked(true);
            setOppWins((s) => s + 1);
            setWinnerKeyThisRound(d.key);
            // host moves things along
            if (isHostRef.current) scheduleNext();
          });

          setPhase("playing");
          if (isHost) setTimeout(() => startRound(0), 400);
        }}
      />
    );
  }

  if (phase === "done") {
    const win = myWins > oppWins ? "win" : myWins < oppWins ? "lose" : "tie";
    return (
      <div className="mx-auto max-w-md px-5 py-10 text-center">
        {win === "win" && <Confetti />}
        <div className="text-6xl">{win === "win" ? "🏆" : win === "tie" ? "🤝" : "💨"}</div>
        <h2 className="mt-3 text-2xl font-black text-foreground">
          {win === "win" ? "Champion!" : win === "tie" ? "Dead heat!" : "So close!"}
        </h2>
        <p className="mt-1 text-sm font-bold text-text-secondary">You: {myWins} · {oppName}: {oppWins}</p>
        <button onClick={() => location.reload()} className="mt-6 rounded-pill bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground">
          Race again
        </button>
      </div>
    );
  }

  if (!round) {
    return <div className="flex h-[60vh] items-center justify-center text-[#666]">Loading round…</div>;
  }
  const targetCfg = EMOTION_TARGETS.find((e) => e.label === round.target)!;
  return (
    <div className="mx-auto max-w-md px-5 py-6">
      <div className="flex items-center justify-between text-xs font-extrabold text-text-secondary">
        <span>Round {roundIdx + 1}/{TOTAL_ROUNDS}</span>
        <span className="rounded-pill bg-amber-100 px-3 py-1 text-amber-800">You {myWins} — {oppWins} {oppName}</span>
      </div>

      <div className="mt-4 rounded-3xl bg-gradient-to-br from-amber-500 to-red-500 p-6 text-center text-white shadow-pop">
        <p className="text-[11px] font-extrabold uppercase tracking-widest opacity-90">Tap the…</p>
        <p className="mt-2 text-3xl font-black">{targetCfg.emoji} {round.target}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {round.options.map((label) => {
          const cfg = EMOTION_TARGETS.find((e) => e.label === label)!;
          return (
            <button
              key={label}
              onClick={() => pick(label)}
              disabled={locked}
              className={`flex flex-col items-center gap-1 rounded-2xl py-6 text-base font-black shadow-card transition active:scale-95 disabled:opacity-50 ${cfg.color}`}
            >
              <span className="text-4xl">{cfg.emoji}</span>
              {label}
            </button>
          );
        })}
      </div>

      {winnerKeyThisRound && (
        <p className="mt-3 text-center text-xs font-extrabold text-text-secondary">
          {winnerKeyThisRound === myKeyRef.current ? "🎉 You took that one!" : `💨 ${oppName} got there first.`}
        </p>
      )}

      <p className="mt-3 flex items-center justify-center gap-1 text-[10px] font-extrabold text-text-secondary">
        <Zap size={10} /> Speed wins. No timer — first correct tap claims the round.
      </p>
    </div>
  );
}
