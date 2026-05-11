import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, ArrowLeft } from "lucide-react";
import { usePlayerAuth } from "./PlayerAuth";
import { loadProfile, saveProfile } from "./profileApi";
import { AvatarPicker } from "./AvatarPicker";

export function AvatarProfilePage() {
  const { user, loading } = usePlayerAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [busy, setBusy] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/" }); return; }
    let cancelled = false;
    (async () => {
      try {
        const p = await loadProfile(user.id);
        if (cancelled) return;
        setDisplayName(p?.display_name ?? user.user_metadata?.display_name ?? "");
        setBio(p?.bio ?? "");
        setAge(p?.age != null ? String(p.age) : "");
        setAvatarId(p?.avatar_id ?? null);
        setAvatarImageUrl(p?.avatar_image_url ?? null);
      } catch {
        toast.error("Couldn't load your profile");
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, loading, navigate]);

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
      });
      toast.success("Saved!");
      navigate({ to: "/" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Couldn't save your profile");
    } finally {
      setBusy(false);
    }
  }

  if (loading || hydrating) {
    return <div className="flex h-[100dvh] items-center justify-center bg-[#F8F8FC] text-[#666]">Loading…</div>;
  }
  if (!user) return null;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#F4EEFD] to-white pb-32">
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#7B2FBE] shadow-sm border border-[#EBEBF5]"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-black text-[#1A1A2E]">Your profile</h1>
        <span className="w-10" />
      </header>

      {/* Current avatar preview */}
      <div className="px-5">
        <div className="rounded-[28px] bg-gradient-to-br from-[#9B5BE0] to-[#C8A6F0] p-6 text-center text-white shadow-[0_12px_36px_rgba(123,47,190,0.3)]">
          <div className="mx-auto h-32 w-32 overflow-hidden rounded-full ring-4 ring-white/30 bg-white/10">
            {avatarImageUrl ? (
              <img src={avatarImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">🙂</div>
            )}
          </div>
          <div className="mt-3 text-lg font-black drop-shadow-sm">{displayName || "Your name"}</div>
          {age && <div className="text-xs font-bold text-white/85">Age {age}</div>}
        </div>
      </div>

      {/* Picker */}
      <div className="mt-5 px-5">
        <div className="rounded-3xl bg-white p-4 shadow-sm border border-[#F0F0F8]">
          <h2 className="mb-3 text-sm font-black text-[#1A1A2E]">Choose your avatar</h2>
          <AvatarPicker
            userId={user.id}
            selectedAvatarId={avatarId}
            onPicked={(a) => { setAvatarId(a.id); setAvatarImageUrl(a.image_url); }}
          />
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

      <div className="sticky bottom-0 z-10 w-full border-t border-[#EBEBF5] bg-white/95 px-5 py-3 backdrop-blur">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7B2FBE] to-[#9B5BE0] py-3.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(123,47,190,0.4)] disabled:opacity-60"
        >
          <Check size={18} strokeWidth={3} />
          {busy ? "Saving…" : "Save"}
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
