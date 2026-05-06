// Renders any layer based on its taskCode. Calls onComplete with the XP earned.
import { useEffect, useRef, useState } from "react";
import { Confetti } from "./Effects";
import { ReadAloudButton, useReadAloud } from "./useReadAloud";
import { useGame } from "./GameContext";

export type RenderableLayer = {
  id: string;
  position: number;
  type: string;
  title: string;
  config: Record<string, any>;
  xp_reward: number;
};

type Props = {
  layer: RenderableLayer;
  onComplete: (xp: number) => void;
};

export function LayerRenderer({ layer, onComplete }: Props) {
  const code: string = layer.config?.taskCode ?? "T01";
  const xp = layer.xp_reward ?? 10;

  switch (code) {
    case "T01": return <T01Video layer={layer} xp={xp} onComplete={onComplete} />;
    case "T02": return <T02MicroClip layer={layer} xp={xp} onComplete={onComplete} />;
    case "T03": return <T03Sort layer={layer} xp={xp} onComplete={onComplete} />;
    case "T04": return <T04RapidFire layer={layer} xp={xp} onComplete={onComplete} />;
    case "T05": return <T05Cards layer={layer} xp={xp} onComplete={onComplete} />;
    case "T06": return <T06BodyMap layer={layer} xp={xp} onComplete={onComplete} />;
    case "T07": return <T07Branching layer={layer} xp={xp} onComplete={onComplete} />;
    case "T08": return <T08AIChat layer={layer} xp={xp} onComplete={onComplete} />;
    case "T09": return <T09Guided layer={layer} xp={xp} onComplete={onComplete} />;
    case "T10": return <T10Voice layer={layer} xp={xp} onComplete={onComplete} />;
    case "T11": return <T11Draw layer={layer} xp={xp} onComplete={onComplete} />;
    case "T12": return <T12Build layer={layer} xp={xp} onComplete={onComplete} />;
    case "T13": return <T13Mission layer={layer} xp={xp} onComplete={onComplete} />;
    case "T14": return <T14Reflection layer={layer} xp={xp} onComplete={onComplete} />;
    case "T15": return <T15Rating layer={layer} xp={xp} onComplete={onComplete} />;
    default: return <Generic layer={layer} xp={xp} onComplete={onComplete} />;
  }
}

// ---------- shared UI ----------
function Frame({ title, subtitle, children, footer, speakText }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode; speakText?: string }) {
  const { level, autoRead } = useGame();
  const showReadAloud = level === "Explorer";
  const text = speakText ?? `${subtitle ? subtitle + ". " : ""}${title}`;
  const { supported, speak, stop } = useReadAloud();

  // Auto-read on mount / when text changes
  useEffect(() => {
    if (showReadAloud && autoRead && supported && text.trim()) {
      const t = setTimeout(() => speak(text), 200);
      return () => { clearTimeout(t); stop(); };
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoRead, showReadAloud, supported]);

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#7B2FBE]">{subtitle ?? "Layer"}</div>
            <h2 className="mt-1 text-xl font-black text-[#1A1A2E]">{title}</h2>
          </div>
          {showReadAloud && <ReadAloudButton text={text} />}
        </div>
      </div>
      <div className="flex-1 overflow-auto px-5 pb-4">{children}</div>
      {footer && <div className="border-t border-[#EBEBF5] bg-white p-4">{footer}</div>}
    </div>
  );
}
function PrimaryBtn({ disabled, onClick, children }: { disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button disabled={disabled} onClick={onClick}
      className="w-full rounded-full bg-[#7B2FBE] py-3 text-sm font-extrabold text-white disabled:bg-[#D8D8E8] disabled:text-[#999]">
      {children}
    </button>
  );
}

// ---------- T01: Video ----------
function getEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
      }
      if (u.pathname.startsWith("/shorts/") || u.pathname.startsWith("/embed/")) {
        const id = u.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
      }
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (host === "player.vimeo.com") return url;
  } catch {
    return null;
  }
  return null;
}

function T01Video({ layer, xp, onComplete }: any) {
  const url = layer.config?.videoUrl as string | undefined;
  const embedUrl = getEmbedUrl(url);
  const [done, setDone] = useState(false);
  return (
    <Frame title={layer.title} subtitle="Story video"
      footer={<PrimaryBtn disabled={!done} onClick={() => onComplete(xp)}>{done ? `Continue · +${xp} XP` : "Watch the video to continue"}</PrimaryBtn>}>
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            title={layer.title}
          />
        ) : url ? (
          <video src={url} controls className="h-full w-full" onEnded={() => setDone(true)} />
        ) : (
          <div className="flex h-full items-center justify-center text-white/60">📹 Story video</div>
        )}
      </div>
      {(!url || embedUrl) && (
        <button
          onClick={() => setDone(true)}
          disabled={done}
          className="mt-3 w-full rounded-full border-2 border-[#7B2FBE] py-2.5 text-sm font-extrabold text-[#7B2FBE] disabled:border-[#D8D8E8] disabled:text-[#999]">
          {done ? "✓ Marked as watched" : "I've watched it — mark as watched"}
        </button>
      )}
      {layer.config?.transcript && <p className="mt-3 text-sm text-[#666]">{layer.config.transcript}</p>}
    </Frame>
  );
}

// ---------- T02: Micro Clip ----------
function T02MicroClip({ layer, xp, onComplete }: any) {
  return (
    <Frame title={layer.title} subtitle="Micro clip"
      footer={<PrimaryBtn onClick={() => onComplete(xp)}>Got it · +{xp} XP</PrimaryBtn>}>
      <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-[#7B2FBE] to-[#3D1568] flex items-center justify-center text-6xl">⚡</div>
      <p className="mt-4 text-sm text-[#666]">{layer.config?.conceptTag ?? "One idea, one image."}</p>
    </Frame>
  );
}

// ---------- T03: Drag & Drop Sort ----------
function T03Sort({ layer, xp, onComplete }: any) {
  const items: { label: string; bucket: string }[] = layer.config?.items ?? [
    { label: "Getting a warm hug", bucket: "Happy" },
    { label: "Finding a surprise present", bucket: "Happy" },
    { label: "Someone takes your turn", bucket: "Sad" },
    { label: "Missing your grandma", bucket: "Sad" },
    { label: "A big dog suddenly barks", bucket: "Scared" },
    { label: "Losing your favourite toy", bucket: "Angry" },
  ];
  const buckets: { label: string; colour?: string }[] = layer.config?.buckets ?? [
    { label: "Happy", colour: "#F5A623" },
    { label: "Sad", colour: "#1565C0" },
    { label: "Scared", colour: "#7B2FBE" },
    { label: "Angry", colour: "#C0392B" },
  ];
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overBucket, setOverBucket] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ bucket: string; ok: boolean } | null>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const touchLabel = useRef<string>("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintTarget, setHintTarget] = useState<{ idx: number; wrongBucket: string; rightBucket: string } | null>(null);
  const HINT_LIMIT = 2;
  const [celebrating, setCelebrating] = useState(false);
  const celebratedRef = useRef(false);

  const allDone = items.every((_, i) => placed[i] != null);
  const correct = items.filter((it, i) => placed[i] === it.bucket).length;
  const wrongCount = items.filter((it, i) => placed[i] && placed[i] !== it.bucket).length;
  const allCorrect = allDone && wrongCount === 0;

  useEffect(() => {
    if (allCorrect && !celebratedRef.current) {
      celebratedRef.current = true;
      setCelebrating(true);
      const t = setTimeout(() => setCelebrating(false), 2500);
      return () => clearTimeout(t);
    }
  }, [allCorrect]);

  function revealHint() {
    if (hintsUsed >= HINT_LIMIT) return;
    const wrongIdx = items.findIndex((it, i) => placed[i] && placed[i] !== it.bucket);
    if (wrongIdx === -1) return;
    const it = items[wrongIdx];
    setHintTarget({ idx: wrongIdx, wrongBucket: placed[wrongIdx], rightBucket: it.bucket });
    setHintsUsed((n) => n + 1);
    setTimeout(() => setHintTarget(null), 1800);
  }

  function place(idx: number, bucket: string) {
    const ok = items[idx].bucket === bucket;
    setPlaced((p) => ({ ...p, [idx]: bucket }));
    setFlash({ bucket, ok });
    setTimeout(() => setFlash(null), 500);
  }

  function unplace(idx: number) {
    setPlaced((p) => {
      const n = { ...p };
      delete n[idx];
      return n;
    });
  }

  // ---- touch / pointer drag fallback ----
  function onPointerDown(e: React.PointerEvent, idx: number) {
    if (e.pointerType === "mouse") return; // let HTML5 DnD handle mouse
    setDragIdx(idx);
    touchLabel.current = items[idx].label;
    setTouchPos({ x: e.clientX, y: e.clientY });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragIdx == null || e.pointerType === "mouse") return;
    setTouchPos({ x: e.clientX, y: e.clientY });
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const bucket = el?.closest<HTMLElement>("[data-bucket]")?.dataset.bucket ?? null;
    setOverBucket(bucket);
  }
  function onPointerUp(e: React.PointerEvent) {
    if (dragIdx == null || e.pointerType === "mouse") return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const bucket = el?.closest<HTMLElement>("[data-bucket]")?.dataset.bucket;
    if (bucket) place(dragIdx, bucket);
    setDragIdx(null);
    setOverBucket(null);
    setTouchPos(null);
  }

  return (
    <Frame title={layer.title} subtitle="Sort it out"
      speakText={`${layer.title}. Drag each item into the right jar. The items are: ${items.map((it) => it.label).join(", ")}. The jars are: ${buckets.map((b) => b.label).join(", ")}.`}
      footer={<PrimaryBtn disabled={!allDone || wrongCount > 0} onClick={() => onComplete(xp)}>
        {!allDone
          ? "Drag all items into a jar"
          : wrongCount > 0
            ? "Fix wrong items to continue"
            : `All correct · +${xp} XP`}
      </PrimaryBtn>}>

      {/* Tray of unplaced items */}
      <div className="flex flex-wrap gap-2 min-h-[44px]">
        {items.every((_, i) => placed[i] != null) ? (
          <div className="text-xs text-[#888] italic">All sorted — tap a pill in a jar to move it back.</div>
        ) : items.map((it, i) => placed[i] ? null : (
          <div
            key={i}
            draggable
            onDragStart={(e) => {
              setDragIdx(i);
              e.dataTransfer.setData("text/plain", String(i));
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => { setDragIdx(null); setOverBucket(null); }}
            onPointerDown={(e) => onPointerDown(e, i)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className={`select-none rounded-full bg-white px-3 py-2 text-sm font-semibold shadow border border-[#EBEBF5] cursor-grab active:cursor-grabbing touch-none ${
              dragIdx === i ? "opacity-40" : ""
            }`}
          >
            {it.label}
          </div>
        ))}
      </div>

      {/* Hint banner — shown only when everything is placed but some are wrong */}
      {allDone && wrongCount > 0 && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
          <div className="text-xs font-semibold text-red-700">
            Almost! {wrongCount} {wrongCount === 1 ? "item is" : "items are"} in the wrong jar. Tap a red pill to move it back.
          </div>
          <button
            type="button"
            onClick={revealHint}
            disabled={hintsUsed >= HINT_LIMIT}
            className="shrink-0 rounded-full border border-red-300 bg-white px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {hintsUsed >= HINT_LIMIT ? "No more hints" : `💡 Hint (${HINT_LIMIT - hintsUsed} left)`}
          </button>
        </div>
      )}

      {/* Celebration banner */}
      {allCorrect && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-green-50 px-3 py-2 animate-scale-in">
          <span className="text-base">🎉</span>
          <span className="text-sm font-extrabold text-green-700">Perfect sort! +{xp} XP</span>
        </div>
      )}

      {celebrating && <Confetti />}

      {/* Buckets */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {buckets.map((b) => {
          const isOver = overBucket === b.label || (flash?.bucket === b.label);
          const isHintWrong = hintTarget?.wrongBucket === b.label;
          const isHintRight = hintTarget?.rightBucket === b.label;
          const ringClass = flash?.bucket === b.label
            ? (flash.ok ? "ring-4 ring-green-300" : "ring-4 ring-red-300")
            : isHintRight ? "ring-4 ring-green-300 animate-pulse"
            : isHintWrong ? "ring-4 ring-red-400 animate-pulse"
            : isOver ? "ring-4 ring-white/70 scale-[1.02]" : "";
          return (
            <div
              key={b.label}
              data-bucket={b.label}
              onDragOver={(e) => { e.preventDefault(); setOverBucket(b.label); }}
              onDragLeave={() => setOverBucket((cur) => (cur === b.label ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                const idx = Number(e.dataTransfer.getData("text/plain"));
                if (!Number.isNaN(idx)) place(idx, b.label);
                setOverBucket(null);
                setDragIdx(null);
              }}
              className={`relative min-h-[140px] rounded-2xl p-3 text-white transition-all ${ringClass}`}
              style={{ background: b.colour ?? "#7B2FBE" }}
            >
              <div className="mb-2 flex items-center justify-between text-sm font-extrabold">
                <span>{b.label}</span>
                {isHintRight && (
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold text-green-700">
                    move it here
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((it, i) => {
                  if (placed[i] !== b.label) return null;
                  const isCorrect = placed[i] === it.bucket;
                  const isWrong = allDone && !isCorrect;
                  return (
                    <div
                      key={i}
                      draggable
                      onDragStart={(e) => {
                        setDragIdx(i);
                        e.dataTransfer.setData("text/plain", String(i));
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => { setDragIdx(null); setOverBucket(null); }}
                      onPointerDown={(e) => onPointerDown(e, i)}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onClick={() => { if (!isCorrect) unplace(i); }}
                      style={celebrating && isCorrect ? { animation: `scale-in 0.3s ease-out ${i * 80}ms both` } : undefined}
                      className={`select-none cursor-grab active:cursor-grabbing touch-none rounded-full px-2 py-1 text-[12px] font-semibold transition-all ${
                        isCorrect
                          ? "bg-green-400 text-green-950 ring-2 ring-green-200"
                          : isWrong
                            ? "bg-white text-red-700 ring-2 ring-red-400"
                            : "bg-white/25 hover:bg-white/40"
                      } ${dragIdx === i ? "opacity-40" : ""}`}
                      title={
                        isCorrect
                          ? "Correct! Drag to another jar to move it."
                          : isWrong
                            ? "Not quite — drag to another jar or tap to send back"
                            : "Drag to another jar or tap to send back"
                      }
                    >
                      {isCorrect && <span className="mr-1">✓</span>}
                      {isWrong && <span className="mr-1">✗</span>}
                      {it.label}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating ghost while touch-dragging */}
      {touchPos && dragIdx != null && (
        <div
          className="pointer-events-none fixed z-50 rounded-full bg-white px-3 py-2 text-sm font-semibold shadow-lg border border-[#EBEBF5]"
          style={{ left: touchPos.x + 12, top: touchPos.y + 12 }}
        >
          {touchLabel.current}
        </div>
      )}
    </Frame>
  );
}

// ---------- T04: Rapid Fire ----------
function T04RapidFire({ layer, xp, onComplete }: any) {
  const qs: { prompt: string; correct: string; options?: string[] }[] = layer.config?.questions ?? [
    { prompt: "Sharing happy feelings makes them grow.", correct: "True", options: ["True", "False"] },
  ];
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const q = qs[i];
  const opts = q.options ?? ["True", "False"];

  function pick(o: string) {
    if (picked) return;
    setPicked(o);
    if (o === q.correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (i + 1 < qs.length) { setI(i + 1); setPicked(null); }
      else onComplete(xp);
    }, 600);
  }
  return (
    <Frame title={layer.title} subtitle={`Question ${i + 1} of ${qs.length}`} speakText={q.prompt}>
      <div className="rounded-2xl bg-white p-6 text-center shadow border border-[#EBEBF5]">
        <p className="text-base font-bold text-[#1A1A2E]">{q.prompt}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {opts.map((o) => {
          const isCorrect = picked && o === q.correct;
          const isWrong = picked === o && o !== q.correct;
          return (
            <button key={o} onClick={() => pick(o)} disabled={!!picked}
              className={`rounded-2xl py-4 text-base font-extrabold transition-colors ${
                isCorrect ? "bg-[#2E7D32] text-white" :
                isWrong ? "bg-[#E5484D] text-white" :
                "bg-white text-[#1A1A2E] border border-[#EBEBF5]"}`}>{o}</button>
          );
        })}
      </div>
      <div className="mt-4 text-center text-sm text-[#666]">Score: {score}/{qs.length}</div>
    </Frame>
  );
}

// ---------- T05: Scenario Cards ----------
function T05Cards({ layer, xp, onComplete }: any) {
  const cards = layer.config?.cards ?? [
    { scenario: "A friend tripped over.", helpful: true },
    { scenario: "You laughed at them.", helpful: false },
  ];
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const card = cards[i];

  function pick(v: boolean) {
    setPicked(v);
    setTimeout(() => {
      if (i + 1 < cards.length) { setI(i + 1); setPicked(null); }
      else onComplete(xp);
    }, 600);
  }
  return (
    <Frame title={layer.title} subtitle={`Card ${i + 1} of ${cards.length}`} speakText={card.scenario}>
      <div className="aspect-[3/4] rounded-3xl bg-gradient-to-br from-white to-[#F8F8FC] p-6 shadow-xl border border-[#EBEBF5] flex items-center justify-center text-center">
        <p className="text-lg font-bold text-[#1A1A2E]">{card.scenario}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => pick(true)} disabled={picked != null}
          className={`rounded-2xl py-4 text-base font-extrabold ${picked === true ? "bg-[#2E7D32] text-white" : "bg-white border border-[#EBEBF5] text-[#1A1A2E]"}`}>Helpful</button>
        <button onClick={() => pick(false)} disabled={picked != null}
          className={`rounded-2xl py-4 text-base font-extrabold ${picked === false ? "bg-[#E5484D] text-white" : "bg-white border border-[#EBEBF5] text-[#1A1A2E]"}`}>Not helpful</button>
      </div>
    </Frame>
  );
}

// ---------- T06: Body Map Tap ----------
function T06BodyMap({ layer, xp, onComplete }: any) {
  const [taps, setTaps] = useState<{ x: number; y: number }[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  function add(e: React.MouseEvent) {
    const r = ref.current!.getBoundingClientRect();
    setTaps([...taps, { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }]);
  }
  return (
    <Frame title={layer.title} subtitle="Where do you feel it?"
      footer={<PrimaryBtn disabled={taps.length === 0} onClick={() => onComplete(xp)}>Done · +{xp} XP</PrimaryBtn>}>
      <p className="mb-3 text-sm text-[#666]">{layer.config?.emotionPrompt ?? "Tap on the body where you feel this most."}</p>
      <div ref={ref} onClick={add} className="relative mx-auto aspect-[3/5] w-3/4 rounded-3xl bg-[#F0F0FA] cursor-crosshair">
        <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-40">🧍</div>
        {taps.map((t, i) => (
          <span key={i} className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7B2FBE]/70" style={{ left: `${t.x}%`, top: `${t.y}%` }} />
        ))}
      </div>
    </Frame>
  );
}

// ---------- T07: Branching Story ----------
function T07Branching({ layer, xp, onComplete }: any) {
  const opts: { label: string; isOptimal?: boolean }[] = layer.config?.options ?? [
    { label: "Option A", isOptimal: false }, { label: "Option B", isOptimal: true },
  ];
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <Frame title={layer.title} subtitle="Make your choice"
      speakText={`${layer.config?.decisionPrompt ?? "What would you do?"} Your options are: ${opts.map((o, i) => `${String.fromCharCode(65 + i)}: ${o.label}`).join(". ")}`}
      footer={picked != null ? <PrimaryBtn onClick={() => onComplete(xp)}>Continue · +{xp} XP</PrimaryBtn> : undefined}>
      <p className="text-sm text-[#666]">{layer.config?.decisionPrompt ?? "What would you do?"}</p>
      <div className="mt-4 space-y-3">
        {opts.map((o, i) => (
          <button key={i} onClick={() => setPicked(i)} disabled={picked != null}
            className={`w-full rounded-2xl border p-4 text-left text-sm font-bold ${
              picked === i ? "border-[#7B2FBE] bg-[#F0F0FA]" : "border-[#EBEBF5] bg-white"
            }`}>
            <span className="mr-2 inline-block h-6 w-6 rounded-full bg-[#7B2FBE] text-center text-xs font-extrabold leading-6 text-white">{String.fromCharCode(65 + i)}</span>
            {o.label}
            {picked === i && o.isOptimal && <div className="mt-2 text-xs font-semibold text-[#2E7D32]">✓ Great choice!</div>}
            {picked === i && !o.isOptimal && <div className="mt-2 text-xs font-semibold text-[#A66D00]">Hmm — there might be a kinder way.</div>}
          </button>
        ))}
      </div>
    </Frame>
  );
}

// ---------- T08: AI Chat (mock) ----------
function T08AIChat({ layer, xp, onComplete }: any) {
  const [msgs, setMsgs] = useState<{ role: "ai" | "me"; text: string }[]>([
    { role: "ai", text: layer.config?.opener ?? "Hi! Tell me what's on your mind." },
  ]);
  const [input, setInput] = useState("");
  function send() {
    if (!input.trim()) return;
    setMsgs([...msgs, { role: "me", text: input }, { role: "ai", text: "I hear you. What feeling sits with that?" }]);
    setInput("");
  }
  const enough = msgs.filter((m) => m.role === "me").length >= 2;
  return (
    <Frame title={layer.title} subtitle="Role-play chat"
      footer={<PrimaryBtn disabled={!enough} onClick={() => onComplete(xp)}>{enough ? `Wrap up · +${xp} XP` : "Send 2 messages"}</PrimaryBtn>}>
      <div className="space-y-2">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === "me" ? "ml-auto bg-[#7B2FBE] text-white" : "bg-white border border-[#EBEBF5] text-[#1A1A2E]"}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a reply…"
          className="flex-1 rounded-full border border-[#EBEBF5] bg-white px-4 py-2 text-sm" />
        <button onClick={send} className="rounded-full bg-[#7B2FBE] px-4 text-sm font-bold text-white">Send</button>
      </div>
    </Frame>
  );
}

// ---------- T09: Guided breathing ----------
function T09Guided({ layer, xp, onComplete }: any) {
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (phase === "idle") return;
    const id = setInterval(() => {
      setPhase((p) => (p === "in" ? "out" : "in"));
      setCount((c) => c + 1);
    }, 4000);
    return () => clearInterval(id);
  }, [phase]);
  const done = count >= 6;
  return (
    <Frame title={layer.title} subtitle="Guided experience"
      footer={<PrimaryBtn disabled={!done} onClick={() => onComplete(xp)}>{done ? `Done · +${xp} XP` : "Breathe with the orb"}</PrimaryBtn>}>
      <div className="flex flex-col items-center justify-center py-8">
        <div className={`h-40 w-40 rounded-full bg-gradient-to-br from-[#7B2FBE] to-[#3D1568] transition-transform duration-[3500ms] ${phase === "in" ? "scale-150" : "scale-100"}`} />
        <p className="mt-6 text-base font-bold text-[#1A1A2E]">{phase === "idle" ? "Tap to start" : phase === "in" ? "Breathe in…" : "Breathe out…"}</p>
        {phase === "idle" && <button onClick={() => setPhase("in")} className="mt-3 rounded-full bg-[#7B2FBE] px-5 py-2 text-sm font-bold text-white">Begin</button>}
      </div>
    </Frame>
  );
}

// ---------- T10: Voice ----------
function T10Voice({ layer, xp, onComplete }: any) {
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  return (
    <Frame title={layer.title} subtitle="Speak your answer"
      footer={<PrimaryBtn disabled={!recorded} onClick={() => onComplete(xp)}>{recorded ? `Save · +${xp} XP` : "Record first"}</PrimaryBtn>}>
      <p className="text-sm text-[#666]">{layer.config?.prompt ?? "Press the mic and share your answer."}</p>
      <div className="mt-8 flex flex-col items-center">
        <button onClick={() => { if (recording) { setRecording(false); setRecorded(true); } else { setRecording(true); } }}
          className={`flex h-28 w-28 items-center justify-center rounded-full text-4xl shadow-lg ${recording ? "bg-[#E5484D] text-white animate-pulse" : "bg-[#7B2FBE] text-white"}`}>🎙️</button>
        <p className="mt-3 text-xs font-semibold text-[#666]">{recording ? "Recording… tap to stop" : recorded ? "Recorded" : "Tap to record"}</p>
      </div>
    </Frame>
  );
}

// ---------- T11: Drawing ----------
function T11Draw({ layer, xp, onComplete }: any) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [touched, setTouched] = useState(false);
  function start(e: React.PointerEvent) {
    drawing.current = true;
    const r = cvs.current!.getBoundingClientRect();
    const ctx = cvs.current!.getContext("2d")!;
    ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.strokeStyle = "#7B2FBE";
    ctx.beginPath(); ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
    setTouched(true);
  }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const r = cvs.current!.getBoundingClientRect();
    const ctx = cvs.current!.getContext("2d")!;
    ctx.lineTo(e.clientX - r.left, e.clientY - r.top); ctx.stroke();
  }
  function end() { drawing.current = false; }
  return (
    <Frame title={layer.title} subtitle="Draw it" speakText={layer.config?.prompt ?? "Draw what you feel."}
      footer={<PrimaryBtn disabled={!touched} onClick={() => onComplete(xp)}>{touched ? `Save · +${xp} XP` : "Draw something"}</PrimaryBtn>}>
      <p className="text-sm text-[#666]">{layer.config?.prompt ?? "Draw what you feel."}</p>
      <canvas ref={cvs} width={320} height={320} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end}
        className="mt-3 w-full touch-none rounded-2xl border border-[#EBEBF5] bg-white" style={{ aspectRatio: "1/1" }} />
    </Frame>
  );
}

// ---------- T12: Build & Arrange ----------
function T12Build({ layer, xp, onComplete }: any) {
  const items = ["Notebook", "Headphones", "Water", "Kindness", "Patience", "A friend"];
  const [picked, setPicked] = useState<string[]>([]);
  function toggle(i: string) { setPicked(picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i]); }
  return (
    <Frame title={layer.title} subtitle="Build your kit"
      footer={<PrimaryBtn disabled={picked.length < 3} onClick={() => onComplete(xp)}>Save kit · +{xp} XP</PrimaryBtn>}>
      <p className="text-sm text-[#666]">Pick at least 3 things for your personal kit.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {items.map((i) => {
          const on = picked.includes(i);
          return <button key={i} onClick={() => toggle(i)}
            className={`rounded-2xl border p-3 text-sm font-bold ${on ? "border-[#7B2FBE] bg-[#F0F0FA] text-[#7B2FBE]" : "border-[#EBEBF5] bg-white text-[#1A1A2E]"}`}>
            {on ? "✓ " : ""}{i}
          </button>;
        })}
      </div>
    </Frame>
  );
}

// ---------- T13: Real-Life Mission ----------
function T13Mission({ layer, xp, onComplete }: any) {
  const [accepted, setAccepted] = useState(false);
  return (
    <Frame title={layer.title} subtitle="Real-life mission"
      footer={<PrimaryBtn onClick={() => onComplete(xp)}>{accepted ? `Got it · +${xp} XP` : `Skip for now · +${xp} XP`}</PrimaryBtn>}>
      <div className="rounded-3xl bg-gradient-to-br from-[#00695C] to-[#003D33] p-6 text-white">
        <div className="mb-2 text-2xl">🌍</div>
        <h3 className="text-lg font-extrabold">{layer.config?.title ?? "Your mission"}</h3>
        <p className="mt-2 text-sm opacity-90">{layer.config?.instruction ?? "Try this in real life today."}</p>
      </div>
      {!accepted && (
        <button onClick={() => setAccepted(true)}
          className="mt-4 w-full rounded-full bg-[#00695C] py-3 text-sm font-extrabold text-white">I accept this mission</button>
      )}
      {accepted && <div className="mt-4 rounded-xl bg-[#E8F5E9] p-3 text-sm font-semibold text-[#00695C]">Mission accepted. Come back when you've done it!</div>}
    </Frame>
  );
}

// ---------- T14: Open Reflection ----------
function T14Reflection({ layer, xp, onComplete }: any) {
  const [text, setText] = useState("");
  return (
    <Frame title={layer.title} subtitle="Reflection" speakText={layer.config?.prompt ?? "Share what's on your mind."}
      footer={<PrimaryBtn disabled={text.trim().length < 5} onClick={() => onComplete(xp)}>Save · +{xp} XP</PrimaryBtn>}>
      <p className="text-sm text-[#666]">{layer.config?.prompt ?? "Share what's on your mind."}</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="In your own words…"
        className="mt-3 w-full rounded-2xl border border-[#EBEBF5] bg-white p-3 text-sm" />
    </Frame>
  );
}

// ---------- T15: Self-Rating ----------
function T15Rating({ layer, xp, onComplete }: any) {
  const [v, setV] = useState<number | null>(null);
  return (
    <Frame title={layer.title} subtitle="Self-rating" speakText={layer.config?.prompt ?? "How would you rate yourself today?"}
      footer={<PrimaryBtn disabled={v == null} onClick={() => onComplete(xp)}>Save · +{xp} XP</PrimaryBtn>}>
      <p className="text-sm text-[#666]">{layer.config?.prompt ?? "How would you rate yourself today?"}</p>
      <div className="mt-6 flex justify-between">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setV(n)}
            className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-extrabold ${v === n ? "bg-[#7B2FBE] text-white" : "bg-white text-[#1A1A2E] border border-[#EBEBF5]"}`}>{n}</button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#666]">
        <span>Just learning</span><span>Got this</span>
      </div>
    </Frame>
  );
}

// ---------- Generic / unknown ----------
function Generic({ layer, xp, onComplete }: any) {
  return (
    <Frame title={layer.title} subtitle={layer.config?.taskCode ?? "Layer"}
      footer={<PrimaryBtn onClick={() => onComplete(xp)}>Continue · +{xp} XP</PrimaryBtn>}>
      <div className="rounded-2xl border border-dashed border-[#D8D8E8] bg-white p-6 text-center text-sm text-[#666]">
        This layer type doesn't have a custom view yet. Tap continue to claim XP.
      </div>
    </Frame>
  );
}
