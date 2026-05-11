import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { usePlayerAuth } from "./PlayerAuth";
import { Leaderboard, ProfilePreviewCard } from "./Leaderboard";
import { loadProfile, type PlayerProfile, type LeaderboardEntry } from "./profileApi";

export function GrowthPage() {
  const { user, loading } = usePlayerAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [preview, setPreview] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/" }); return; }
    loadProfile(user.id).then(setProfile).catch(() => {});
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="flex h-[100dvh] items-center justify-center bg-[#F8F8FC] text-[#666]">Loading…</div>;
  }
  if (!user) return null;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#F4EEFD] to-white pb-32">
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <h1 className="text-lg font-black text-[#1A1A2E]">My Growth</h1>
        <Link
          to="/profile/edit"
          className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#7B2FBE] shadow-sm border border-[#EBEBF5]"
        >
          <Pencil size={13} strokeWidth={2.5} />
          Edit profile
        </Link>
      </header>

      {/* Hero card */}
      <div className="px-5">
        <Link
          to="/profile/edit"
          className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-[#9B5BE0] to-[#C8A6F0] p-4 text-white shadow-[0_12px_36px_rgba(123,47,190,0.3)]"
        >
          <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-full ring-3 ring-white/40 bg-white/10">
            {profile?.avatar_image_url ? (
              <img src={profile.avatar_image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl">🙂</div>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-black drop-shadow-sm">
              {profile?.display_name ?? "Your name"}
            </div>
            {profile?.age != null && (
              <div className="text-[11px] font-bold text-white/85">Age {profile.age}</div>
            )}
            {profile?.bio && (
              <div className="mt-1 line-clamp-2 text-[11px] text-white/90">{profile.bio}</div>
            )}
          </div>
        </Link>
      </div>

      {/* Leaderboard */}
      <div className="mt-5 px-5">
        <h2 className="mb-2 text-sm font-black text-[#1A1A2E]">Leaderboard</h2>
        <Leaderboard
          currentUserId={user.id}
          showNearMe
          onSelect={(e) => setPreview(e)}
        />
      </div>

      {preview && <ProfilePreviewCard entry={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
