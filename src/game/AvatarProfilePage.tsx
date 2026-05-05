import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Check, Shuffle, ArrowLeft } from "lucide-react";
import { usePlayerAuth } from "./PlayerAuth";
import { Avatar } from "./avatar/Avatar";
import {
  type AvatarConfig,
  SKIN, HAIR_STYLES, HAIR_COLORS, EYES, EXPRESSIONS, BACKDROPS,
  DEFAULT_AVATAR, normalizeAvatar, randomAvatar, colorOf,
} from "./avatar/config";
import { loadProfile, saveProfile } from "./profileApi";

type TabKey = "skin" | "hairStyle" | "hairColor" | "eyes" | "expression";

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: "skin",       label: "Skin",       emoji: "🧑" },
  { key: "hairStyle",  label: "Hair",       emoji: "💇" },
  { key: "hairColor",  label: "Colour",     emoji: "🎨" },
  { key: "eyes",       label: "Eyes",       emoji: "👀" },
  { key: "expression", label: "Expression", emoji: "😊" },
];

export function AvatarProfilePage() {
  const { user, loading } = usePlayerAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("skin");
  const [config, setConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [busy, setBusy] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [bounceKey, setBounceKey] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/" }); return; }
    let cancelled = false;
    (async () => {
      try {
        const p = await loadProfile(user.id);
        if (cancelled) return;
        setConfig(normalizeAvatar(p?.avatar_config ?? null));
        setDisplayName(p?.display_name ?? user.user_metadata?.display_name ?? "");
        setBio(p?.bio ?? "");
        setAge(p?.age != null ? String(p.age) : "");
      } catch {
        toast.error("Couldn't load your profile");
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, loading, navigate]);

  const update = (patch: Partial<AvatarConfig>) => {
    setConfig((c) => ({ ...c, ...patch }));
    setBounceKey((k) => k + 1);
  };

  const burstConfetti = () => {
    const rect = previewRef.current?.getBoundingClientRect();
    const origin = rect
      ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight }
      : { x: 0.5, y: 0.35 };
    confetti({
      particleCount: 90,
      spread: 75,
      startVelocity: 38,
      origin,
      colors: ["#7B2FBE", "#C8A6F0", "#FF7AB6", "#FFB23F", "#3FB9B0"],
    });
  };

  const randomize = () => {
    setConfig(randomAvatar());
    setBounceKey((k) => k + 1);
    burstConfetti();
  };

  async function save() {
    if (!user) return;
    const trimmedName = displayName.trim();
    if (!trimmedName) { toast.error("Pick a display name"); return; }
    let ageNum: number | null = null;
    if (age.trim()) {
      const n = parseInt(age, 10);
      if (Number.isNaN(n) || n < 1 || n > 120) { toast.error("Age must be 1–120"); return; }
      ageNum = n;
    }
    setBusy(true);
    try {
      await saveProfile(user.id, {
        display_name: trimmedName,
        bio: bio.trim() || null,
        age: ageNum,
        avatar_config: config,
      });
      toast.success("Saved!");
      navigate({ to: "/" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Couldn't save your profile");
    } finally {
      setBusy(false);
    }
  }

  const [gradFrom, gradTo] = BACKDROPS[config.hairColor] ?? BACKDROPS.default;

  if (loading || hydrating) {
    return <div className="flex h-[100dvh] items-center justify-center bg-[#F8F8FC] text-[#666]">Loading…</div>;
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#F4EEFD] to-white pb-32">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#7B2FBE] shadow-sm border border-[#EBEBF5]"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-black text-[#1A1A2E]">Make your avatar</h1>
        <button
          onClick={randomize}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF7AB6] to-[#FFB23F] px-3.5 py-2 text-xs font-extrabold text-white shadow-md active:scale-95 transition"
        >
          <Shuffle size={14} /> Random!
        </button>
      </header>

      {/* Preview card with animated gradient */}
      <div className="px-5">
        <motion.div
          ref={previewRef}
          className="relative overflow-hidden rounded-[28px] p-6 text-center shadow-[0_12px_36px_rgba(123,47,190,0.3)]"
          animate={{
            background: [
              `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
              `linear-gradient(225deg, ${gradFrom}, ${gradTo})`,
              `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Floating sparkle dots */}
          <div className="pointer-events-none absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-2 w-2 rounded-full bg-white/40"
                style={{ left: `${10 + i * 15}%`, top: `${15 + (i % 3) * 25}%` }}
                animate={{ y: [0, -8, 0], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
              />
            ))}
          </div>

          <div className="relative mx-auto h-44 w-44">
            {/* Idle bob */}
            <motion.div
              className="h-full w-full"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Happy bounce on change */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={bounceKey}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="h-full w-full"
                >
                  <Avatar config={config} size={176} noBackground rounded={false} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="relative mt-3 text-lg font-black text-white drop-shadow-sm">
            {displayName || "Your name"}
          </div>
          {age && <div className="relative text-xs font-bold text-white/85">Age {age}</div>}
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mt-5 px-5">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition ${
                  active
                    ? "bg-[#7B2FBE] text-white shadow-md"
                    : "bg-white text-[#1A1A2E] border border-[#EBEBF5]"
                }`}
              >
                <span className="mr-1">{t.emoji}</span>{t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Picker grid */}
      <div className="mt-3 px-5">
        <div className="rounded-3xl bg-white p-4 shadow-sm border border-[#F0F0F8]">
          <FeaturePicker tab={tab} config={config} onChange={update} />
        </div>
      </div>

      {/* Profile fields */}
      <div className="mt-4 px-5">
        <div className="rounded-3xl bg-white p-4 shadow-sm border border-[#F0F0F8]">
          <h2 className="mb-3 text-sm font-black text-[#1A1A2E]">About you</h2>
          <Field label="Display name">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
              className="mt-1 w-full rounded-xl border border-[#E0E0EA] bg-white px-3 py-2 text-sm font-semibold text-[#1A1A2E] focus:border-[#7B2FBE] focus:outline-none"
            />
          </Field>
          <Field label="Age (optional)">
            <input
              type="number" min={1} max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E0E0EA] bg-white px-3 py-2 text-sm font-semibold text-[#1A1A2E] focus:border-[#7B2FBE] focus:outline-none"
            />
          </Field>
          <Field label="Bio (optional)">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160} rows={3}
              placeholder="Tell us something fun about you!"
              className="mt-1 w-full rounded-xl border border-[#E0E0EA] bg-white px-3 py-2 text-sm text-[#1A1A2E] focus:border-[#7B2FBE] focus:outline-none"
            />
            <span className="mt-1 block text-right text-[10px] text-[#999]">{bio.length}/160</span>
          </Field>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 z-10 w-full max-w-[430px] -translate-x-1/2 border-t border-[#EBEBF5] bg-white/95 px-5 py-3 backdrop-blur">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7B2FBE] to-[#9B5BE0] py-3.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(123,47,190,0.4)] disabled:opacity-60"
        >
          <Check size={18} strokeWidth={3} />
          {busy ? "Saving…" : "That's me!"}
        </motion.button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-3 block text-[11px] font-bold text-[#666] first:mt-0">
      {label}
      {children}
    </label>
  );
}

/* ---------- Picker ---------- */

function FeaturePicker({
  tab, config, onChange,
}: {
  tab: TabKey;
  config: AvatarConfig;
  onChange: (patch: Partial<AvatarConfig>) => void;
}) {
  const view = useMemo(() => {
    switch (tab) {
      case "skin":
        return {
          kind: "color" as const,
          items: SKIN.map((s) => ({ id: s.id, label: s.label, color: s.color })),
          current: config.skin,
          set: (id: string) => onChange({ skin: id }),
        };
      case "hairColor":
        return {
          kind: "color" as const,
          items: HAIR_COLORS.map((s) => ({ id: s.id, label: s.label, color: s.color })),
          current: config.hairColor,
          set: (id: string) => onChange({ hairColor: id }),
        };
      case "hairStyle":
        return {
          kind: "preview" as const,
          items: HAIR_STYLES,
          current: config.hairStyle,
          set: (id: string) => onChange({ hairStyle: id }),
          field: "hairStyle" as const,
        };
      case "eyes":
        return {
          kind: "preview" as const,
          items: EYES,
          current: config.eyes,
          set: (id: string) => onChange({ eyes: id }),
          field: "eyes" as const,
        };
      case "expression":
        return {
          kind: "expression" as const,
          items: EXPRESSIONS,
          current: config.expression,
          set: (id: string) => onChange({ expression: id }),
          field: "expression" as const,
        };
    }
  }, [tab, config, onChange]);

  return (
    <div className="grid grid-cols-3 gap-3">
      {view.items.map((opt) => {
        const selected = opt.id === view.current;
        return (
          <motion.button
            key={opt.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => view.set(opt.id)}
            className={`flex flex-col items-center gap-1.5 rounded-2xl p-2.5 transition ${
              selected
                ? "bg-[#F4ECFB] ring-2 ring-[#7B2FBE] shadow-[0_4px_12px_rgba(123,47,190,0.18)]"
                : "bg-[#FAFAFC] ring-1 ring-transparent hover:bg-[#F4ECFB]/50"
            }`}
          >
            <SwatchVisual view={view} opt={opt} config={config} selected={selected} />
            <span className="text-[10px] font-bold leading-tight text-[#1A1A2E] text-center">
              {opt.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

type ViewShape =
  | { kind: "color"; items: { id: string; label: string; color: string }[]; current: string; set: (id: string) => void }
  | { kind: "preview"; items: { id: string; label: string }[]; current: string; set: (id: string) => void; field: "hairStyle" | "eyes" }
  | { kind: "expression"; items: { id: string; label: string; emoji: string }[]; current: string; set: (id: string) => void; field: "expression" };

function SwatchVisual({
  view, opt, config, selected,
}: {
  view: ViewShape;
  opt: { id: string; label: string; color?: string; emoji?: string };
  config: AvatarConfig;
  selected: boolean;
}) {
  if (view.kind === "color") {
    const ringSkin = colorOf(SKIN, config.skin, "#F5C9A4");
    return (
      <span
        className={`block h-12 w-12 rounded-full border-2 ${selected ? "border-[#7B2FBE]" : "border-white"} shadow-inner`}
        style={{ background: opt.color ?? ringSkin }}
      />
    );
  }
  if (view.kind === "preview") {
    const previewConfig = { ...config, [view.field]: opt.id } as AvatarConfig;
    return (
      <span className="block h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-[#C8A6F0] to-[#7B2FBE]">
        <Avatar size={56} config={previewConfig} rounded={false} noBackground />
      </span>
    );
  }
  // expression — show full mini character with that expression
  const previewConfig = { ...config, expression: opt.id } as AvatarConfig;
  return (
    <span className="block h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-[#C8A6F0] to-[#7B2FBE]">
      <Avatar size={56} config={previewConfig} rounded={false} noBackground />
    </span>
  );
}
