import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { usePlayerAuth } from "./PlayerAuth";
import { Avatar } from "./avatar/Avatar";
import {
  type AvatarConfig,
  SKIN, HAIR_STYLES, HAIR_COLORS, EYES, MOUTHS, ACCESSORIES, BACKGROUNDS,
  DEFAULT_AVATAR, avatarFromSeed,
} from "./avatar/config";
import { loadProfile, saveProfile } from "./profileApi";

type FeatureKey = "skin" | "hairStyle" | "hairColor" | "eyes" | "mouth" | "accessory" | "background";

const TABS: { key: FeatureKey; label: string; emoji: string }[] = [
  { key: "skin",       label: "Skin",       emoji: "🎨" },
  { key: "hairStyle",  label: "Hair",       emoji: "💇" },
  { key: "hairColor",  label: "Hair color", emoji: "🌈" },
  { key: "eyes",       label: "Eyes",       emoji: "👀" },
  { key: "mouth",      label: "Mouth",      emoji: "😀" },
  { key: "accessory",  label: "Extras",     emoji: "✨" },
  { key: "background", label: "Backdrop",   emoji: "🟣" },
];

export function AvatarProfilePage() {
  const { user, loading } = usePlayerAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<FeatureKey>("skin");
  const [config, setConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  // Hydrate from DB once we know who the user is.
  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/" }); return; }
    let cancelled = false;
    (async () => {
      try {
        const p = await loadProfile(user.id);
        if (cancelled) return;
        setConfig(p?.avatar_config ?? avatarFromSeed(user.id));
        setDisplayName(p?.display_name ?? user.user_metadata?.display_name ?? "");
        setBio(p?.bio ?? "");
        setAge(p?.age != null ? String(p.age) : "");
      } catch (e) {
        toast.error("Couldn't load your profile");
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, loading, navigate]);

  const update = (patch: Partial<AvatarConfig>) => setConfig((c) => ({ ...c, ...patch }));

  const randomize = () => {
    const seed = `${Math.random()}-${Date.now()}`;
    setConfig(avatarFromSeed(seed));
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
      const msg = e instanceof Error ? e.message : "Couldn't save your profile";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  if (loading || hydrating) {
    return <div className="flex h-[100dvh] items-center justify-center bg-[#F8F8FC] text-[#666]">Loading…</div>;
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#F0F0FA] to-white pb-32">
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <button
          onClick={() => navigate({ to: "/" })}
          className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#7B2FBE] shadow border border-[#EBEBF5]"
        >
          ← Back
        </button>
        <h1 className="text-base font-black text-[#1A1A2E]">Your profile</h1>
        <button
          onClick={randomize}
          className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#7B2FBE] shadow border border-[#EBEBF5]"
        >
          🎲 Random
        </button>
      </header>

      {/* Live preview */}
      <div className="px-5">
        <div className="rounded-3xl bg-gradient-to-br from-[#7B2FBE] to-[#5A1F9A] p-6 text-center text-white shadow-[0_8px_24px_rgba(123,47,190,0.35)]">
          <div className="mx-auto h-32 w-32 overflow-hidden rounded-full ring-4 ring-white/30">
            <Avatar config={config} size={128} />
          </div>
          <div className="mt-3 text-lg font-black">{displayName || "Your name"}</div>
          {age && <div className="text-xs text-white/80">Age {age}</div>}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 px-5">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                tab === t.key
                  ? "bg-[#7B2FBE] text-white shadow"
                  : "bg-white text-[#1A1A2E] border border-[#EBEBF5]"
              }`}
            >
              <span className="mr-1">{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Picker grid */}
      <div className="mt-3 px-5">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <FeaturePicker tab={tab} config={config} onChange={update} />
        </div>
      </div>

      {/* Profile fields */}
      <div className="mt-5 px-5">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-black text-[#1A1A2E]">About you</h2>
          <label className="block text-[11px] font-bold text-[#666]">
            Display name
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
              className="mt-1 w-full rounded-lg border border-[#E0E0EA] bg-white px-3 py-2 text-sm font-semibold text-[#1A1A2E]"
            />
          </label>
          <label className="mt-3 block text-[11px] font-bold text-[#666]">
            Age (optional)
            <input
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E0E0EA] bg-white px-3 py-2 text-sm font-semibold text-[#1A1A2E]"
            />
          </label>
          <label className="mt-3 block text-[11px] font-bold text-[#666]">
            Bio (optional)
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              placeholder="Tell us something fun about you!"
              className="mt-1 w-full rounded-lg border border-[#E0E0EA] bg-white px-3 py-2 text-sm text-[#1A1A2E]"
            />
            <span className="mt-1 block text-right text-[10px] text-[#999]">{bio.length}/160</span>
          </label>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-1/2 z-10 w-full max-w-[430px] -translate-x-1/2 border-t border-[#EBEBF5] bg-white/95 px-5 py-3 backdrop-blur">
        <button
          onClick={save}
          disabled={busy}
          className="w-full rounded-full bg-[#7B2FBE] py-3 text-sm font-extrabold text-white shadow disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save profile"}
        </button>
      </div>
    </div>
  );
}

function FeaturePicker({
  tab, config, onChange,
}: {
  tab: FeatureKey;
  config: AvatarConfig;
  onChange: (patch: Partial<AvatarConfig>) => void;
}) {
  // Each tab maps to (a) the option list, (b) the config field, (c) how to render the swatch.
  const view = useMemo(() => {
    switch (tab) {
      case "skin":
        return { items: SKIN, current: config.skin, set: (id: string) => onChange({ skin: id }), kind: "color" as const };
      case "hairColor":
        return { items: HAIR_COLORS, current: config.hairColor, set: (id: string) => onChange({ hairColor: id }), kind: "color" as const };
      case "background":
        return { items: BACKGROUNDS, current: config.background, set: (id: string) => onChange({ background: id }), kind: "color" as const };
      case "hairStyle":
        return { items: HAIR_STYLES, current: config.hairStyle, set: (id: string) => onChange({ hairStyle: id }), kind: "preview" as const, field: "hairStyle" as const };
      case "eyes":
        return { items: EYES, current: config.eyes, set: (id: string) => onChange({ eyes: id }), kind: "preview" as const, field: "eyes" as const };
      case "mouth":
        return { items: MOUTHS, current: config.mouth, set: (id: string) => onChange({ mouth: id }), kind: "preview" as const, field: "mouth" as const };
      case "accessory":
        return { items: ACCESSORIES, current: config.accessory, set: (id: string) => onChange({ accessory: id }), kind: "preview" as const, field: "accessory" as const };
    }
  }, [tab, config, onChange]);

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
      {view.items.map((opt) => {
        const selected = opt.id === view.current;
        return (
          <button
            key={opt.id}
            onClick={() => view.set(opt.id)}
            className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition ${
              selected ? "border-[#7B2FBE] bg-[#F4ECFB]" : "border-transparent bg-[#F8F8FC] hover:border-[#EBEBF5]"
            }`}
          >
            {view.kind === "color" ? (
              <span
                className="h-10 w-10 rounded-full border border-black/10"
                style={{ background: (opt as { color: string }).color }}
              />
            ) : (
              <span className="h-12 w-12 overflow-hidden rounded-full">
                <Avatar
                  size={48}
                  config={{ ...config, [view.field]: opt.id } as AvatarConfig}
                />
              </span>
            )}
            <span className="text-[10px] font-bold text-[#1A1A2E]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
