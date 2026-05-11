import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Copy, Share2, RefreshCw } from "lucide-react";
import { getOrCreateMyCode, rotateMyCode, shareUrlFor } from "./clubApi";

export function JoinCard({ userId, displayName }: { userId: string; displayName: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getOrCreateMyCode(userId)
      .then(setCode)
      .catch((e: unknown) => toast.error(e instanceof Error ? e.message : "Couldn't load your code"));
  }, [userId]);

  const url = code ? shareUrlFor(code) : "";

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  async function share() {
    if (!url || !code) return;
    const shareData = {
      title: "Join me on Sementa!",
      text: `${displayName} invited you. Use code ${code}`,
      url,
    };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share(shareData);
        return;
      } catch {
        /* user cancelled */
      }
    }
    await copy();
  }

  async function rotate() {
    if (!confirm("Get a new code? Your old code/link will stop working.")) return;
    setBusy(true);
    try {
      const next = await rotateMyCode(userId);
      setCode(next);
      toast.success("New code!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Couldn't rotate code");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#9B5BE0] to-[#C8A6F0] p-6 text-center text-white shadow-[0_12px_36px_rgba(123,47,190,0.3)]">
      <h2 className="text-sm font-extrabold uppercase tracking-wider text-white/85">Your join code</h2>
      <div className="mt-4 flex justify-center">
        <div className="rounded-2xl bg-white p-3 shadow-lg">
          {code ? (
            <QRCodeSVG value={url} size={168} level="M" includeMargin={false} />
          ) : (
            <div className="h-[168px] w-[168px] animate-pulse rounded-lg bg-[#F0F0FA]" />
          )}
        </div>
      </div>
      <div className="mt-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-2xl font-black tracking-[0.3em] backdrop-blur">
        {code ?? "····-···"}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={copy}
          disabled={!code}
          className="flex items-center justify-center gap-1.5 rounded-full bg-white/15 py-2.5 text-xs font-extrabold text-white backdrop-blur disabled:opacity-50"
        >
          <Copy size={14} /> Copy link
        </button>
        <button
          onClick={share}
          disabled={!code}
          className="flex items-center justify-center gap-1.5 rounded-full bg-white py-2.5 text-xs font-extrabold text-[#7B2FBE] disabled:opacity-50"
        >
          <Share2 size={14} /> Share
        </button>
      </div>
      <button
        onClick={rotate}
        disabled={busy || !code}
        className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-white/80 underline-offset-2 hover:underline disabled:opacity-50"
      >
        <RefreshCw size={11} /> New code
      </button>
    </div>
  );
}
