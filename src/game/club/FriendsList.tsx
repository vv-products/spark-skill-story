import { Avatar } from "../avatar/Avatar";
import { avatarFromSeed } from "../avatar/config";
import type { FriendProfile } from "./clubApi";

export function FriendsList({
  friends,
  onRemove,
}: {
  friends: FriendProfile[];
  onRemove?: (userId: string) => void;
}) {
  if (friends.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-6 text-center shadow-sm border border-[#F0F0F8]">
        <div className="text-3xl">🤝</div>
        <p className="mt-2 text-sm font-bold text-[#1A1A2E]">No friends yet</p>
        <p className="mt-1 text-[11px] text-[#666]">Share your code or add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-3 shadow-sm border border-[#F0F0F8]">
      <ul className="flex flex-col gap-1">
        {friends.map((f) => {
          const cfg = f.avatar_config ?? avatarFromSeed(f.user_id);
          return (
            <li key={f.user_id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-[#F8F8FC]">
              <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow bg-[#F0F0FA]">
                {f.avatar_image_url ? (
                  <img src={f.avatar_image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Avatar config={cfg} size={40} />
                )}
              </span>
              <span className="flex-1 truncate text-sm font-extrabold text-[#1A1A2E]">
                {f.display_name ?? "Explorer"}
              </span>
              {onRemove && (
                <button
                  onClick={() => {
                    if (confirm(`Remove ${f.display_name ?? "this friend"}?`)) onRemove(f.user_id);
                  }}
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold text-[#666] hover:bg-[#F0F0FA] hover:text-[#A33]"
                >
                  Remove
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
