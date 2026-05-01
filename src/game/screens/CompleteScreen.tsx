import { useEffect, useState } from "react";
import { useGame } from "../GameContext";
import { Confetti } from "../Effects";
import maya from "@/assets/maya-avatar.png";
import leo from "@/assets/leo-avatar.png";
import dash from "@/assets/dash-avatar.png";
import pip from "@/assets/pip-avatar.png";

export function CompleteScreen() {
  const { breakdown, xp, totalXp, level, streak, reset, addXp } = useGame();
  const [bonusGiven, setBonusGiven] = useState(false);
  const [animatedXp, setAnimatedXp] = useState(xp);

  useEffect(() => {
    if (!bonusGiven) {
      addXp("bonus", 15);
      setBonusGiven(true);
    }
  }, [bonusGiven, addXp]);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedXp(xp), 100);
    return () => clearTimeout(t);
  }, [xp]);

  const total = breakdown.foundation + breakdown.quiz + breakdown.simulation + breakdown.reflection + breakdown.bonus;
  const pct = Math.min(100, (animatedXp / totalXp) * 100);

  const rows = [
    { label: "Foundation", emoji: "🎬", value: breakdown.foundation },
    { label: "Quiz", emoji: "⚡", value: breakdown.quiz },
    { label: "Simulation", emoji: "🎭", value: breakdown.simulation },
    { label: "Reflection", emoji: "💭", value: breakdown.reflection },
    { label: "Class Bonus", emoji: "🌟", value: breakdown.bonus },
  ];

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-background">
      <Confetti />

      <main className="relative z-10 flex flex-1 flex-col px-5 pb-6 pt-8">
        {/* Hero celebration card */}
        <div className="overflow-hidden rounded-[20px] bg-[var(--gradient-hero)] p-5 text-primary-foreground shadow-pop">
          <div className="flex items-center justify-center gap-1">
            {[maya, leo, dash, pip].map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="animate-bounce-in h-20 w-20 object-contain drop-shadow-xl"
                style={{ animationDelay: `${i * 0.12}s` }}
                width={512}
                height={512}
              />
            ))}
          </div>
          <h1 className="mt-2 text-balance text-center text-3xl font-black leading-tight">
            You lit up<br />The Happy Stall! 🌟
          </h1>
        </div>

        {/* XP card */}
        <div className="mt-4 rounded-2xl bg-card p-5 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">XP Earned</p>
          <ul className="mt-2 divide-y divide-border">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <span className="text-base">{r.emoji}</span>{r.label}
                </span>
                <span className="text-sm font-extrabold text-gold-dark tabular-nums">+{r.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-card-gold px-4 py-3">
            <span className="text-sm font-extrabold text-foreground">Total</span>
            <span className="text-2xl font-black text-gold-dark tabular-nums">+{total} XP</span>
          </div>
        </div>

        {/* Level + streak */}
        <div className="mt-4 rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="animate-pulse-glow flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl text-primary-foreground">
              ⭐
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-text-secondary">Level</p>
              <p className="text-base font-extrabold text-foreground">{level}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-text-secondary tabular-nums">{animatedXp} / {totalXp}</p>
            </div>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-pill bg-muted">
            <div
              className="h-full rounded-pill bg-primary transition-[width] duration-1000 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-card-warm px-4 py-2.5">
            <span className="text-xl">🔥</span>
            <span className="text-sm font-extrabold text-foreground">Day {streak} streak — keep it up!</span>
          </div>
        </div>

        {/* Teaser */}
        <div className="mt-4 rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-warm text-2xl">
              🌧️
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Up next</p>
              <p className="text-base font-extrabold text-foreground">The Sad Corner</p>
              <p className="text-xs font-semibold text-text-secondary">Leo has something to tell you…</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={reset}
            className="w-full rounded-pill bg-primary py-4 text-lg font-extrabold text-primary-foreground shadow-pop transition-transform active:scale-[0.97]"
          >
            Keep Going →
          </button>
          <button
            onClick={reset}
            className="w-full rounded-pill border-2 border-primary bg-card py-3 text-sm font-extrabold text-primary active:scale-[0.98]"
          >
            Come Back Tomorrow
          </button>
        </div>
      </main>
    </div>
  );
}
