import { Avatar } from "../avatar/Avatar";
import { avatarFromSeed } from "../avatar/config";
import type { FriendProfile, Friendship } from "./clubApi";

export type InboxItem = {
  friendship: Friendship;
  profile: FriendProfile;
  direction: "incoming" | "outgoing";
};

export function RequestsInbox({
  items,
  onAccept,
  onDecline,
  onCancel,
}: {
  items: InboxItem[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-6 text-center shadow-sm border border-[#F0F0F8]">
        <div className="text-3xl">📭</div>
        <p className="mt-2 text-sm font-bold text-[#1A1A2E]">No pending requests</p>
      </div>
    );
  }
  return (
    <div className="rounded-3xl bg-white p-3 shadow-sm border border-[#F0F0F8]">
      <ul className="flex flex-col gap-2">
        {items.map(({ friendship, profile, direction }) => {
          const cfg = profile.avatar_config ?? avatarFromSeed(profile.user_id);
          return (
            <li key={friendship.id} className="flex items-center gap-3 rounded-xl bg-[#F8F8FC] p-2">
              <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow bg-[#F0F0FA]">
                {profile.avatar_image_url ? (
                  <img src={profile.avatar_image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Avatar config={cfg} size={40} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold text-[#1A1A2E]">
                  {profile.display_name ?? "Explorer"}
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#666]">
                  {direction === "incoming" ? "Wants to be your friend" : "Request sent"}
                </span>
              </span>
              {direction === "incoming" ? (
                <span className="flex gap-1.5">
                  <button
                    onClick={() => onAccept(friendship.id)}
                    className="rounded-full bg-[#7B2FBE] px-3 py-1.5 text-[11px] font-extrabold text-white shadow"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onDecline(friendship.id)}
                    className="rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#666] border border-[#E0E0EA]"
                  >
                    Decline
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => onCancel(friendship.id)}
                  className="rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#666] border border-[#E0E0EA]"
                >
                  Cancel
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
