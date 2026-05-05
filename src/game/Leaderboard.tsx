import { useEffect, useState } from "react";
import { Avatar } from "./avatar/Avatar";
import { avatarFromSeed } from "./avatar/config";
import { loadLeaderboard, type LeaderboardEntry } from "./profileApi";

type Props = {
  currentUserId?: string | null;
  onSelect?: (entry: LeaderboardEntry) => void;
};

export function Leaderboard({ currentUserId, onSelect }: Props) {
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard(20)
      .then(setRows)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : "Couldn't load leaderboard"));
  }, []);

  if (err) return <div className="rounded-2xl bg-white p-4 text-sm text-[#A33]">{err}</div>;
  if (!rows) return <div className="rounded-2xl bg-white p-4 text-sm text-[#666]">Loading leaderboard…</div>;
  if (rows.length === 0) return <div className="rounded-2xl bg-white p-4 text-sm text-[#666]">No players yet.</div>;

  return (
    <div className="rounded-2xl bg-white p-3 shadow border border-[#EBEBF5]">
      <ol className="flex flex-col gap-1.5">
        {rows.map((r, i) => {
          const rank = i + 1;
          const me = currentUserId === r.user_id;
          const cfg = r.avatar_config ?? avatarFromSeed(r.user_id);
          const name = r.display_name ?? "Explorer";
          return (
            <li key={r.user_id}>
              <button
                type="button"
                onClick={() => onSelect?.(r)}
                className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition active:scale-[0.99] ${
                  me ? "bg-[#F4ECFB] ring-1 ring-[#7B2FBE]/30" : "hover:bg-[#F8F8FC]"
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                  rank === 1 ? "bg-[#FFD66E] text-[#5A3A22]" :
                  rank === 2 ? "bg-[#D7DEEA] text-[#1A1A2E]" :
                  rank === 3 ? "bg-[#F2C29B] text-[#5A3A22]" :
                  "bg-[#F0F0FA] text-[#666]"
                }`}>
                  {rank}
                </span>
                <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow">
                  <Avatar config={cfg} size={40} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold text-[#1A1A2E]">
                    {name}{me && <span className="ml-1 text-[10px] font-bold text-[#7B2FBE]">YOU</span>}
                  </span>
                  <span className="block text-[11px] font-semibold text-[#666]">{r.total_xp} XP</span>
                </span>
                <span className="text-[#7B2FBE]">→</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ProfilePreviewCard({
  entry, onClose,
}: { entry: LeaderboardEntry; onClose: () => void }) {
  const cfg = entry.avatar_config ?? avatarFromSeed(entry.user_id);
  const name = entry.display_name ?? "Explorer";
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="h-28 w-28 overflow-hidden rounded-full ring-4 ring-[#F4ECFB] shadow">
            <Avatar config={cfg} size={112} />
          </div>
          <h3 className="mt-3 text-xl font-black text-[#1A1A2E]">{name}</h3>
          {entry.age != null && (
            <p className="text-xs font-semibold text-[#666]">Age {entry.age}</p>
          )}
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#FFF8E8] px-3 py-1 text-xs font-extrabold text-[#A66D00]">
            ⭐ {entry.total_xp} XP
          </div>
          {entry.bio && (
            <p className="mt-4 rounded-2xl bg-[#F8F8FC] px-4 py-3 text-sm text-[#1A1A2E]">
              {entry.bio}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-[#7B2FBE] py-3 text-sm font-extrabold text-white shadow"
        >
          Close
        </button>
      </div>
    </div>
  );
}
