import { useRef, useState, useEffect } from "react";
import { useGame } from "../GameContext";
import { TopBar } from "../Chrome";
import { XpPop } from "../Effects";
import pip from "@/assets/pip-avatar.png";
import dash from "@/assets/dash-avatar.png";

const COLORS = [
  { name: "gold", value: "#F5A623" },
  { name: "coral", value: "#FF6B6B" },
  { name: "sky", value: "#5B9BD5" },
  { name: "sage", value: "#5BAD8A" },
];

export function ReflectionScreen() {
  const { setStep, addXp } = useGame();
  const [mode, setMode] = useState<"choose" | "draw" | "voice">("choose");
  const [submitted, setSubmitted] = useState(false);
  const [showXp, setShowXp] = useState(false);

  function submit() {
    setSubmitted(true);
    setTimeout(() => {
      addXp("reflection", 10);
      setShowXp(true);
    }, 1400);
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-gradient-to-b from-background to-sky/10">
      <TopBar layer={4} totalLayers={4} />

      <main className="flex flex-1 flex-col px-4 pb-6">
        {/* Pip peeking */}
        <div className="absolute -right-2 top-24 z-0">
          <img src={pip} alt="Pip the cat peeking" className="h-24 w-24 object-contain opacity-90 animate-float-soft" width={512} height={512} />
        </div>

        <div className="rounded-full bg-indigo/15 px-3 py-1 text-xs font-extrabold text-indigo ring-1 ring-indigo/30 self-start">
          💭 Reflection
        </div>

        <div className="mt-4 rounded-3xl bg-card p-5 shadow-soft">
          <p className="text-center text-lg font-extrabold leading-snug text-foreground">
            Draw or tell us — what made <span className="text-coral">YOU</span> feel happy this week?
          </p>
        </div>

        {!submitted && mode === "choose" && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode("draw")}
              className="flex h-44 flex-col items-center justify-center gap-2 rounded-3xl bg-gradient-to-br from-gold/30 to-coral/20 ring-2 ring-gold/40 shadow-soft transition-transform active:scale-95"
            >
              <span className="text-5xl">🎨</span>
              <span className="text-base font-extrabold text-foreground">Draw it</span>
            </button>
            <button
              onClick={() => setMode("voice")}
              className="flex h-44 flex-col items-center justify-center gap-2 rounded-3xl bg-gradient-to-br from-sky/30 to-indigo/20 ring-2 ring-sky/40 shadow-soft transition-transform active:scale-95"
            >
              <span className="text-5xl">🎤</span>
              <span className="text-base font-extrabold text-foreground">Say it</span>
            </button>
          </div>
        )}

        {!submitted && mode === "draw" && <DrawCanvas onSubmit={submit} onBack={() => setMode("choose")} />}
        {!submitted && mode === "voice" && <VoiceRecorder onSubmit={submit} onBack={() => setMode("choose")} />}

        {submitted && (
          <div className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
            <img src={dash} alt="Dash celebrating" className="animate-bounce-in h-40 w-40 object-contain" width={512} height={512} />
            <p className="mt-2 text-lg font-extrabold text-foreground">That's going in your Growth Journal!</p>
            <p className="text-sm font-semibold text-muted-foreground">Dash loves it. 💛</p>
          </div>
        )}
      </main>

      {showXp && <XpPop amount={10} message="Reflection saved!" onDone={() => setStep("complete")} />}
    </div>
  );
}

function DrawCanvas({ onSubmit, onBack }: { onSubmit: () => void; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState(COLORS[0].value);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio;
    c.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function getPos(e: React.PointerEvent) {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function start(e: React.PointerEvent) {
    drawing.current = true;
    last.current = getPos(e);
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = getPos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(last.current!.x, last.current!.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  }
  function end() { drawing.current = false; last.current = null; }
  function clear() {
    const c = canvasRef.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
  }

  return (
    <div className="mt-5">
      <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-2 ring-gold/30">
        <canvas
          ref={canvasRef}
          className="block h-64 w-full touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => setColor(c.value)}
              className={`h-9 w-9 rounded-full ring-2 transition-transform active:scale-90 ${color === c.value ? "ring-foreground scale-110" : "ring-transparent"}`}
              style={{ backgroundColor: c.value }}
              aria-label={c.name}
            />
          ))}
        </div>
        <button onClick={clear} className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground active:scale-95">
          Clear
        </button>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={onBack} className="rounded-2xl bg-muted px-4 py-3 text-sm font-extrabold text-muted-foreground active:scale-95">
          ←
        </button>
        <button onClick={onSubmit} className="flex-1 rounded-2xl bg-gradient-to-r from-gold to-coral py-3 text-base font-extrabold text-white shadow-pop active:scale-[0.97]">
          Save my drawing
        </button>
      </div>
    </div>
  );
}

function VoiceRecorder({ onSubmit, onBack }: { onSubmit: () => void; onBack: () => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!recording) return;
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [recording]);

  return (
    <div className="mt-6 flex flex-col items-center">
      <button
        onClick={() => setRecording((r) => !r)}
        className={`relative flex h-44 w-44 items-center justify-center rounded-full text-6xl shadow-pop transition-transform active:scale-95 ${
          recording ? "bg-coral text-white animate-pulse-glow" : "bg-gradient-to-br from-sky to-indigo text-white"
        }`}
      >
        🎤
        {recording && (
          <span className="absolute inset-0 animate-ping rounded-full bg-coral/40" />
        )}
      </button>
      <p className="mt-4 text-base font-extrabold text-foreground tabular-nums">
        {recording ? `Listening… ${seconds}s` : "Tap to start"}
      </p>
      <div className="mt-6 flex w-full gap-2">
        <button onClick={onBack} className="rounded-2xl bg-muted px-4 py-3 text-sm font-extrabold text-muted-foreground active:scale-95">
          ←
        </button>
        <button
          disabled={!recording && seconds === 0}
          onClick={onSubmit}
          className="flex-1 rounded-2xl bg-gradient-to-r from-sky to-indigo py-3 text-base font-extrabold text-white shadow-pop active:scale-[0.97] disabled:opacity-40"
        >
          Save my answer
        </button>
      </div>
    </div>
  );
}
