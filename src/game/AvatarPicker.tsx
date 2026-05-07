import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { listActiveAvatars, setUserAvatar, type AvatarItem } from "./avatarPicker";

type Props = {
  userId: string;
  selectedAvatarId?: string | null;
  onPicked?: (avatar: AvatarItem) => void;
  /** When true the picker is the only thing on screen; otherwise renders inline. */
  fullscreen?: boolean;
};

export function AvatarPicker({ userId, selectedAvatarId, onPicked, fullscreen }: Props) {
  const [avatars, setAvatars] = useState<AvatarItem[] | null>(null);
  const [picking, setPicking] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(selectedAvatarId ?? null);

  useEffect(() => { setCurrentId(selectedAvatarId ?? null); }, [selectedAvatarId]);

  useEffect(() => {
    listActiveAvatars()
      .then(setAvatars)
      .catch(() => {
        toast.error("Couldn't load avatars");
        setAvatars([]);
      });
  }, []);

  async function pick(a: AvatarItem) {
    if (picking) return;
    setPicking(a.id);
    try {
      await setUserAvatar(userId, a.id);
      setCurrentId(a.id);
      confetti({
        particleCount: 70, spread: 70, origin: { y: 0.4 },
        colors: ["#7B2FBE", "#C8A6F0", "#FF7AB6", "#FFB23F"],
      });
      onPicked?.(a);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Couldn't save your pick");
    } finally {
      setPicking(null);
    }
  }

  const grid = (
    <>
      {avatars === null ? (
        <div className="py-12 text-center text-sm text-[#666]">Loading avatars…</div>
      ) : avatars.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#666]">No avatars available yet.</div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {avatars.map((a) => {
            const selected = a.id === currentId;
            return (
              <motion.button
                key={a.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => pick(a)}
                disabled={picking !== null}
                className={`relative aspect-square overflow-hidden rounded-2xl bg-[#F4ECFB] transition ${
                  selected
                    ? "ring-4 ring-[#7B2FBE] shadow-[0_8px_20px_rgba(123,47,190,0.35)]"
                    : "ring-1 ring-[#EBEBF5] hover:ring-[#C8A6F0]"
                } ${picking === a.id ? "opacity-70" : ""}`}
                aria-label="Choose this avatar"
              >
                <img src={a.image_url} alt="" className="h-full w-full object-cover" />
                {selected && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-[#7B2FBE] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                    ✓
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </>
  );

  if (!fullscreen) return grid;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#F4EEFD] to-white px-5 py-8">
      <div className="mx-auto max-w-[430px]">
        <h1 className="text-center text-2xl font-black text-[#1A1A2E]">Choose your avatar</h1>
        <p className="mt-1 text-center text-sm text-[#666]">Tap a character to make it yours.</p>
        <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm border border-[#F0F0F8]">
          {grid}
        </div>
      </div>
    </div>
  );
}
