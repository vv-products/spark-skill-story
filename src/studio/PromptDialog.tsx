import { useEffect, useState } from "react";
import { Btn, Field, Input } from "./ui";
import type { AgeGroup } from "./data";

const ALL_AGES: AgeGroup[] = ["Explorer", "Builder", "Leader"];

type Props = {
  open: boolean;
  title: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  submitLabel?: string;
  withAgeGroups?: boolean;
  defaultAges?: AgeGroup[];
  onCancel: () => void;
  onSubmit: (value: string, ages?: AgeGroup[]) => void | Promise<void>;
};

export function PromptDialog({
  open, title, label = "Name", placeholder, defaultValue = "",
  submitLabel = "Create", withAgeGroups = false, defaultAges = ALL_AGES,
  onCancel, onSubmit,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [ages, setAges] = useState<AgeGroup[]>(defaultAges);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setAges(defaultAges);
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultValue]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const agesValid = !withAgeGroups || ages.length > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v || busy || !agesValid) return;
    setBusy(true);
    try {
      await onSubmit(v, withAgeGroups ? ages : undefined);
    } finally {
      setBusy(false);
    }
  }

  function toggleAge(a: AgeGroup) {
    setAges((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A2E]/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <form
        onSubmit={submit}
        className="w-[420px] max-w-[90vw] rounded-[16px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      >
        <h2 className="mb-4 text-[18px] font-bold text-[#1A1A2E]">{title}</h2>
        <Field label={label}>
          <Input
            autoFocus
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            disabled={busy}
          />
        </Field>

        {withAgeGroups && (
          <div className="mt-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#666680]">
              Age groups
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_AGES.map((a) => {
                const on = ages.includes(a);
                return (
                  <button
                    type="button"
                    key={a}
                    onClick={() => toggleAge(a)}
                    disabled={busy}
                    className={`rounded-[8px] border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      on
                        ? "border-[#7B2FBE] bg-[#F0F0FA] text-[#7B2FBE]"
                        : "border-[#D8D8E8] text-[#666680] hover:bg-[#F8F8FC]"
                    }`}
                  >
                    {on ? "✓ " : ""}
                    {a}
                  </button>
                );
              })}
            </div>
            {ages.length === 0 && (
              <p className="mt-2 text-[12px] text-[#C0392B]">Select at least one age group.</p>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <Btn variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Btn>
          <Btn type="submit" variant="primary" disabled={!value.trim() || !agesValid} loading={busy}>
            {busy ? "Saving…" : submitLabel}
          </Btn>
        </div>
      </form>
    </div>
  );
}
