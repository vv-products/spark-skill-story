import { useEffect, useState } from "react";
import { Btn, Field, Input } from "./ui";

type Props = {
  open: boolean;
  title: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (value: string) => void | Promise<void>;
};

export function PromptDialog({
  open, title, label = "Name", placeholder, defaultValue = "",
  submitLabel = "Create", onCancel, onSubmit,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setBusy(false);
    }
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v || busy) return;
    setBusy(true);
    try {
      await onSubmit(v);
    } finally {
      setBusy(false);
    }
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
        <div className="mt-6 flex items-center justify-end gap-2">
          <Btn variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Btn>
          <Btn type="submit" variant="primary" disabled={!value.trim()} loading={busy}>
            {busy ? "Saving…" : submitLabel}
          </Btn>
        </div>
      </form>
    </div>
  );
}
