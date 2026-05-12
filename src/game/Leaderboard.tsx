import { useEffect, useState } from "react";
import { Avatar } from "./avatar/Avatar";
import { avatarFromSeed } from "./avatar/config";
import { loadLeaderboard, loadXpBreakdown, type LeaderboardEntry, type XpBreakdownRow } from "./profileApi";

type Scope = "all" | "friends" | "nearby";

type Props = {
  currentUserId?: string | null;
  onSelect?: (entry: LeaderboardEntry) => void;
  showNearMe?: boolean;
  limit?: number;
};

export function Leaderboard({ currentUserId, onSelect, showNearMe = false, limit = 20 }: Props) {
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [scope, setScope] = useState<Scope>("all");

  useEffect(() => {
    if (scope === "nearby") {
      setRows([]);
      setErr(null);
      return;
    }
    setRows(null);
    setErr(null);
    loadLeaderboard(limit, scope)
      .then(setRows)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : "Couldn't load leaderboard"));
  }, [scope, limit]);

  const tabBtn = (s: Scope, label: string, activeColor: string) => (
    <button
      onClick={() => setScope(s)}
      className={`flex-1 rounded-full px-3 py-1.5 text-[11px] font-extrabold transition-colors ${
        scope === s ? `bg-white ${activeColor} shadow-sm` : "text-[#666]"
      }`}
    >
      {label}
    </button>
  );

  const toggle = (
    <div className="mb-2 flex gap-1 rounded-full bg-[#F0F0FA] p-1">
      {tabBtn("all", "🌍 Everyone", "text-[#1A1A2E]")}
      {tabBtn("friends", "🤝 Friends", "text-[#7B2FBE]")}
      {showNearMe && tabBtn("nearby", "📍 Near me", "text-[#2F8FBE]")}
    </div>
  );

  if (scope === "nearby") {
    return (
      <div>
        {toggle}
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#666] border border-[#EBEBF5]">
          <div className="text-2xl mb-2">📍</div>
          <div className="font-extrabold text-[#1A1A2E]">Near me — coming soon</div>
          <div className="mt-1 text-[11px]">We'll show kids in your school and area here.</div>
        </div>
      </div>
    );
  }

  if (err) return <div className="rounded-2xl bg-white p-4 text-sm text-[#A33]">{err}</div>;
  if (!rows) return <div>{toggle}<div className="rounded-2xl bg-white p-4 text-sm text-[#666]">Loading leaderboard…</div></div>;
  if (rows.length === 0) {
    return (
      <div>
        {toggle}
        <div className="rounded-2xl bg-white p-4 text-sm text-[#666]">
          {scope === "friends" ? "Add friends in Sementa Club to see them here." : "No players yet."}
        </div>
      </div>
    );
  }

  return (
    <div>
      {toggle}
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
                <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow bg-[#F0F0FA]">
                  {r.avatar_image_url ? (
                    <img src={r.avatar_image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Avatar config={cfg} size={40} />
                  )}
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
          <div className="h-28 w-28 overflow-hidden rounded-full ring-4 ring-[#F4ECFB] shadow bg-[#F0F0FA]">
            {entry.avatar_image_url ? (
              <img src={entry.avatar_image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Avatar config={cfg} size={112} />
            )}
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
          <XpBreakdown userId={entry.user_id} />
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

function prettySource(src: string): { mission: string; mode: string } {
  // mission:emotions-crossword:medium:coop, mission:emotions-quiz:coop, class:<id>
  if (src.startsWith("mission:")) {
    const parts = src.split(":");
    const slug = parts[1] ?? "mission";
    const isCoop = parts.includes("coop");
    const tail = parts.slice(2).filter((p) => p !== "coop").join(" · ");
    const labels: Record<string, string> = {
      "emotions-crossword": "🧩 Crossword",
      "emotions-quiz": "🌿 Quiz",
      "emotions-quickfire": "⚡ Quick-Fire",
    };
    const m = labels[slug] ?? slug;
    return { mission: tail ? `${m} (${tail})` : m, mode: isCoop ? "Co-op" : "Solo" };
  }
  if (src.startsWith("class:")) return { mission: "📚 Class", mode: "—" };
  return { mission: src, mode: "—" };
}

function XpBreakdown({ userId }: { userId: string }) {
  const [rows, setRows] = useState<XpBreakdownRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    loadXpBreakdown(userId).then(setRows).catch((e) => setErr(e?.message ?? "Couldn't load"));
  }, [userId]);
  if (err) return <div className="mt-4 text-xs text-[#A33]">{err}</div>;
  if (!rows) return <div className="mt-4 text-xs text-[#666]">Loading XP breakdown…</div>;
  if (rows.length === 0) return <div className="mt-4 text-xs text-[#666]">No XP yet.</div>;
  const total = rows.reduce((s, r) => s + r.total_xp, 0);
  return (
    <div className="mt-4 w-full text-left">
      <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-[#666]">XP breakdown</div>
      <div className="rounded-xl border border-[#EBEBF5] bg-white">
        <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] font-bold uppercase text-[#888]">
          <span className="col-span-7">Mission</span>
          <span className="col-span-2">Mode</span>
          <span className="col-span-1 text-right">×</span>
          <span className="col-span-2 text-right">XP</span>
        </div>
        {rows.map((r, i) => {
          const { mission, mode } = prettySource(r.source);
          return (
            <div key={i} className="grid grid-cols-12 border-t border-[#F0F0FA] px-3 py-1.5 text-[12px]">
              <span className="col-span-7 truncate font-semibold text-[#1A1A2E]">{mission}</span>
              <span className="col-span-2 text-[#666]">{mode}</span>
              <span className="col-span-1 text-right text-[#666]">{r.events}</span>
              <span className="col-span-2 text-right font-extrabold text-[#7B2FBE]">+{r.total_xp}</span>
            </div>
          );
        })}
        <div className="grid grid-cols-12 border-t border-[#F0F0FA] bg-[#FAFAFC] px-3 py-1.5 text-[12px] font-extrabold">
          <span className="col-span-10">Total</span>
          <span className="col-span-2 text-right text-[#7B2FBE]">+{total}</span>
        </div>
      </div>
    </div>
  );
}
