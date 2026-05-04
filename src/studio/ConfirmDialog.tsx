import { useEffect, useState } from "react";
import { Btn } from "./ui";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open, title, message, confirmLabel = "Confirm",
  destructive = false, onCancel, onConfirm,
}: Props) {
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) setBusy(false); }, [open]);
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onCancel(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  async function confirm() {
    if (busy) return;
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A2E]/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-[440px] max-w-[90vw] rounded-[16px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <h2 className="mb-2 text-[18px] font-bold text-[#1A1A2E]">{title}</h2>
        <p className="mb-6 text-sm text-[#666680]">{message}</p>
        <div className="flex items-center justify-end gap-2">
          <Btn variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Btn>
          <Btn variant={destructive ? "danger" : "primary"} onClick={confirm} loading={busy}>
            {busy ? "Working…" : confirmLabel}
          </Btn>
        </div>
      </div>
    </div>
  );
}
