import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { lookupCode, sendFriendRequest } from "./clubApi";

export function AddFriend({ myUserId, onSent }: { myUserId: string; onSent?: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase().replace(/\s/g, "");
    if (cleaned.length < 6) { toast.error("Enter a friend's code"); return; }
    setBusy(true);
    try {
      const target = await lookupCode(cleaned);
      if (!target) { toast.error("No one found with that code"); return; }
      await sendFriendRequest(myUserId, target.user_id);
      toast.success(`Request sent to ${target.display_name ?? "your friend"}!`);
      setCode("");
      onSent?.();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Couldn't send request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl bg-white p-4 shadow-sm border border-[#F0F0F8]">
      <h2 className="mb-2 text-sm font-black text-[#1A1A2E]">Add a friend</h2>
      <p className="mb-3 text-[11px] text-[#666]">Enter the 6-letter code your friend shared with you.</p>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC-123"
          maxLength={8}
          className="flex-1 rounded-xl border border-[#E0E0EA] bg-white px-3 py-2.5 text-center text-base font-black tracking-[0.25em] text-[#1A1A2E] focus:border-[#7B2FBE] focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-1 rounded-xl bg-[#7B2FBE] px-4 text-xs font-extrabold text-white shadow disabled:opacity-50"
        >
          <UserPlus size={14} /> Add
        </button>
      </div>
    </form>
  );
}
