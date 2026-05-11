// Mission accessibility settings, persisted in localStorage.
// Used by the Emotions Crossword (and reusable for future missions).

import { useEffect, useState } from "react";

export type MissionSettings = {
  largeText: boolean;
  colorblind: boolean; // use icons + safer hues instead of red/green only
  sound: boolean;
  vibration: boolean;
};

const KEY = "sementa.mission.settings";
const DEFAULTS: MissionSettings = {
  largeText: false,
  colorblind: false,
  sound: true,
  vibration: true,
};

function read(): MissionSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function useMissionSettings() {
  const [settings, setSettings] = useState<MissionSettings>(DEFAULTS);

  useEffect(() => {
    setSettings(read());
  }, []);

  function update(patch: Partial<MissionSettings>) {
    setSettings((cur) => {
      const next = { ...cur, ...patch };
      try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  return { settings, update };
}

// ---- Feedback helpers (sound + vibration) ----
let audioCtx: AudioContext | null = null;
function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  const C = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!C) return null;
  audioCtx = new C();
  return audioCtx;
}

function beep(freq: number, durMs: number, type: OscillatorType = "sine", volume = 0.08) {
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain).connect(ac.destination);
  const t = ac.currentTime;
  osc.start(t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + durMs / 1000);
  osc.stop(t + durMs / 1000);
}

export function playFeedback(kind: "correct" | "incorrect" | "win", settings: MissionSettings) {
  if (settings.sound) {
    if (kind === "correct") beep(880, 90, "triangle");
    else if (kind === "incorrect") beep(180, 140, "sawtooth", 0.06);
    else { beep(660, 120, "triangle"); setTimeout(() => beep(990, 200, "triangle"), 120); }
  }
  if (settings.vibration && typeof navigator !== "undefined" && (navigator as any).vibrate) {
    if (kind === "correct") (navigator as any).vibrate(20);
    else if (kind === "incorrect") (navigator as any).vibrate([40, 40, 40]);
    else (navigator as any).vibrate([80, 60, 80, 60, 200]);
  }
}
