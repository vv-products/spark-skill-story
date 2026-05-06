import { useCallback, useEffect, useRef, useState } from "react";

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const prefs = [
    /Samantha/i,
    /Google US English/i,
    /Google UK English Female/i,
    /Microsoft Aria/i,
    /Microsoft Jenny/i,
    /en-US.*Female/i,
    /en-GB.*Female/i,
  ];
  for (const re of prefs) {
    const v = voices.find((v) => re.test(v.name));
    if (v) return (cachedVoice = v);
  }
  const en = voices.find((v) => v.lang?.toLowerCase().startsWith("en"));
  return (cachedVoice = en ?? voices[0]);
}

export function useReadAloud() {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!supported) return;
    // prime voices (some browsers load async)
    window.speechSynthesis.getVoices();
    const onChange = () => {
      cachedVoice = null;
      pickVoice();
    };
    window.speechSynthesis.addEventListener?.("voiceschanged", onChange);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", onChange);
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text?.trim()) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = pickVoice();
      if (v) u.voice = v;
      u.rate = 0.9;
      u.pitch = 1.05;
      u.lang = v?.lang ?? "en-US";
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      utterRef.current = u;
      window.speechSynthesis.speak(u);
    },
    [supported]
  );

  useEffect(() => () => {
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  return { supported, speaking, speak, stop };
}

export function ReadAloudButton({ text, className = "" }: { text: string; className?: string }) {
  const { supported, speaking, speak, stop } = useReadAloud();
  if (!supported) return null;
  return (
    <button
      type="button"
      aria-label={speaking ? "Stop reading" : "Read aloud"}
      onClick={() => (speaking ? stop() : speak(text))}
      className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0F0FA] text-lg shadow-sm transition-transform active:scale-95 ${
        speaking ? "ring-2 ring-[#7B2FBE] animate-pulse" : "hover:bg-[#E5E5F2]"
      } ${className}`}
    >
      <span aria-hidden>{speaking ? "🔈" : "🔊"}</span>
    </button>
  );
}
