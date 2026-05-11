// Procedural background music loops for missions, using the Web Audio API.
// Two presets: "fast" (energetic arpeggio) and "soothing" (slow ambient pad).
// No external assets needed.

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const C = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!C) return null;
  ctx = new C();
  return ctx;
}

export type MusicHandle = { stop: () => void };
export type MusicKind = "fast" | "soothing";

function noteHz(midi: number) { return 440 * Math.pow(2, (midi - 69) / 12); }

export function startMusic(kind: MusicKind, volume = 0.08): MusicHandle {
  const acNullable = getCtx();
  if (!acNullable) return { stop: () => {} };
  const ac: AudioContext = acNullable;
  // Ensure context is resumed (browser autoplay policies)
  if (ac.state === "suspended") void ac.resume();

  const master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);
  // Fade in
  master.gain.linearRampToValueAtTime(volume, ac.currentTime + 0.4);

  const stops: Array<() => void> = [];
  let stopped = false;

  if (kind === "fast") {
    // Driving 16th-note arpeggio in A minor + kick pulse on every quarter
    const bpm = 132;
    const stepSec = 60 / bpm / 4; // 16th
    const scale = [57, 60, 64, 67, 69, 72, 64, 60]; // A minor pattern
    let i = 0;
    const interval = setInterval(() => {
      if (stopped) return;
      const t = ac.currentTime;
      // Arp note
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = "square";
      osc.frequency.value = noteHz(scale[i % scale.length] + 12);
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.5, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + stepSec * 0.9);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + stepSec);
      // Kick on every 4th step
      if (i % 4 === 0) {
        const k = ac.createOscillator();
        const kg = ac.createGain();
        k.type = "sine";
        k.frequency.setValueAtTime(120, t);
        k.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        kg.gain.value = 0;
        kg.gain.linearRampToValueAtTime(0.9, t + 0.005);
        kg.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        k.connect(kg).connect(master);
        k.start(t);
        k.stop(t + 0.18);
      }
      i++;
    }, stepSec * 1000);
    stops.push(() => clearInterval(interval));
  } else {
    // Soothing: two detuned slow sine pads over a rotating chord progression
    const chords = [
      [60, 64, 67], // C
      [57, 60, 64], // Am
      [65, 69, 72], // F
      [67, 71, 74], // G
    ];
    let chordIdx = 0;
    let activeOscs: Array<{ osc: OscillatorNode; g: GainNode }> = [];
    function playChord() {
      if (stopped) return;
      const t = ac.currentTime;
      // Fade out previous
      activeOscs.forEach(({ osc, g }) => {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0, t + 1.2);
        osc.stop(t + 1.4);
      });
      activeOscs = [];
      const chord = chords[chordIdx % chords.length];
      chordIdx++;
      for (const n of chord) {
        for (const detune of [-5, 5]) {
          const osc = ac.createOscillator();
          const g = ac.createGain();
          osc.type = "sine";
          osc.frequency.value = noteHz(n);
          osc.detune.value = detune;
          g.gain.value = 0;
          g.gain.linearRampToValueAtTime(0.18, t + 1.2);
          osc.connect(g).connect(master);
          osc.start(t);
          activeOscs.push({ osc, g });
        }
      }
    }
    playChord();
    const interval = setInterval(playChord, 4000);
    stops.push(() => {
      clearInterval(interval);
      const t = ac.currentTime;
      activeOscs.forEach(({ osc, g }) => {
        g.gain.cancelScheduledValues(t);
        g.gain.linearRampToValueAtTime(0, t + 0.4);
        osc.stop(t + 0.5);
      });
    });
  }

  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      const t = ac.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.linearRampToValueAtTime(0, t + 0.3);
      stops.forEach((s) => s());
      setTimeout(() => master.disconnect(), 500);
    },
  };
}
