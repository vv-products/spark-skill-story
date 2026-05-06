import { useEffect, useState } from "react";
import type { AgeGroup } from "./data";

const ALL_AGES: AgeGroup[] = ["Explorer", "Builder", "Leader"];

export function TopicEditDialog({
  open,
  initialName,
  initialAges,
  onCancel,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  initialName: string;
  initialAges: AgeGroup[];
  onCancel: () => void;
  onSubmit: (patch: { name: string; ages: AgeGroup[] }) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}) {
  const [name, setName] = useState(initialName);
  const [ages, setAges] = useState<AgeGroup[]>(initialAges);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setAges(initialAges);
      setBusy(false);
    }
  }, [open, initialName, initialAges]);

  if (!open) return null;

  function toggle(age: AgeGroup) {
    setAges((prev) => (prev.includes(age) ? prev.filter((a) => a !== age) : [...prev, age]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || ages.length === 0 || busy) return;
    setBusy(true);
    try {
      await onSubmit({ name: name.trim(), ages });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onCancel}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl"
      >
        <h3 className="text-[16px] font-bold text-[#1A1A2E]">Edit topic</h3>

        <label className="mt-4 block text-[12px] font-semibold uppercase tracking-wide text-[#666680]">
          Topic name
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-[8px] border border-[#D8D8E8] px-3 py-2 text-sm focus:border-[#7B2FBE] focus:outline-none"
        />

        <div className="mt-4 text-[12px] font-semibold uppercase tracking-wide text-[#666680]">
          Age groups
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_AGES.map((age) => {
            const on = ages.includes(age);
            return (
              <button
                type="button"
                key={age}
                onClick={() => toggle(age)}
                className={`rounded-[8px] border px-3 py-1.5 text-sm font-semibold transition-colors ${
                  on
                    ? "border-[#7B2FBE] bg-[#F0F0FA] text-[#7B2FBE]"
                    : "border-[#D8D8E8] text-[#666680] hover:bg-[#F8F8FC]"
                }`}
              >
                {on ? "✓ " : ""}
                {age}
              </button>
            );
          })}
        </div>
        {ages.length === 0 && (
          <p className="mt-2 text-[12px] text-[#C0392B]">Select at least one age group.</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[8px] px-4 py-2 text-sm font-semibold text-[#666680] hover:bg-[#F8F8FC]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !name.trim() || ages.length === 0}
            className="rounded-[8px] bg-[#7B2FBE] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
