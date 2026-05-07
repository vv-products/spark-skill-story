import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { StudioLayout } from "../Layout";
import { Btn, Card, Field, Input, Textarea, Toggle } from "../ui";
import {
  createWelcomeCard,
  deleteWelcomeCard,
  listWelcomeCards,
  updateWelcomeCard,
  uploadWelcomeCardImage,
  type WelcomeCard,
} from "../welcomeCards";

export function WelcomeCardsScreen() {
  const [cards, setCards] = useState<WelcomeCard[] | null>(null);
  const [creating, setCreating] = useState(false);

  async function reload() {
    try {
      setCards(await listWelcomeCards());
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load welcome cards");
    }
  }
  useEffect(() => { reload(); }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      await createWelcomeCard();
      toast.success("Welcome card created");
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  const activeCards = (cards ?? []).filter((c) => c.active);

  return (
    <StudioLayout
      title="Welcome Cards"
      actions={<Btn onClick={handleCreate} loading={creating}>+ New Welcome Card</Btn>}
    >
      <div className="grid grid-cols-[1fr_360px] gap-6 px-8 py-6">
        {/* Editor list */}
        <div className="space-y-4">
          {cards === null ? (
            <Card><div className="py-6 text-center text-sm text-[#888]">Loading…</div></Card>
          ) : cards.length === 0 ? (
            <Card>
              <div className="py-8 text-center text-sm text-[#666680]">
                No welcome cards yet. Create one to start rotating hero content on the home screen.
              </div>
            </Card>
          ) : (
            cards.map((card) => (
              <CardEditor key={card.id} card={card} onChanged={reload} />
            ))
          )}
        </div>

        {/* Live preview */}
        <div className="sticky top-6 self-start">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#666680]">
            Preview · {activeCards.length} active
          </div>
          <PreviewRotator cards={activeCards} />
          <p className="mt-3 text-[11px] text-[#888]">
            Active cards rotate every 4s on the learner's home screen.
          </p>
        </div>
      </div>
    </StudioLayout>
  );
}

function CardEditor({ card, onChanged }: { card: WelcomeCard; onChanged: () => void }) {
  const [draft, setDraft] = useState<WelcomeCard>(card);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(card); }, [card]);

  const dirty =
    draft.hero_image_url !== card.hero_image_url ||
    draft.headline !== card.headline ||
    draft.subtitle !== card.subtitle ||
    draft.cta_label !== card.cta_label ||
    draft.cta_destination !== card.cta_destination ||
    draft.position !== card.position;

  async function save() {
    setSaving(true);
    try {
      await updateWelcomeCard(card.id, {
        hero_image_url: draft.hero_image_url,
        headline: draft.headline,
        subtitle: draft.subtitle,
        cta_label: draft.cta_label,
        cta_destination: draft.cta_destination,
        position: draft.position,
      });
      toast.success("Saved");
      onChanged();
    } catch (e: any) { toast.error(e?.message ?? "Save failed"); }
    finally { setSaving(false); }
  }

  async function toggleActive(v: boolean) {
    try {
      await updateWelcomeCard(card.id, { active: v });
      onChanged();
    } catch (e: any) { toast.error(e?.message ?? "Update failed"); }
  }

  async function remove() {
    if (!confirm("Delete this welcome card?")) return;
    try {
      await deleteWelcomeCard(card.id);
      toast.success("Deleted");
      onChanged();
    } catch (e: any) { toast.error(e?.message ?? "Delete failed"); }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be 5MB or smaller."); return; }
    setUploading(true);
    try {
      const url = await uploadWelcomeCardImage(card.id, file);
      await updateWelcomeCard(card.id, { hero_image_url: url });
      toast.success("Image uploaded");
      onChanged();
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <Toggle
          checked={draft.active}
          onChange={toggleActive}
          label={draft.active ? "Active" : "Inactive"}
        />
        <div className="flex gap-2">
          <Btn size="sm" variant="danger" onClick={remove}>Delete</Btn>
          <Btn size="sm" onClick={save} loading={saving} disabled={!dirty}>Save</Btn>
        </div>
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-4">
        {/* Image */}
        <div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-[8px] border border-dashed border-[#EBEBF5] bg-[#F8F8FC]">
            {draft.hero_image_url ? (
              <img src={draft.hero_image_url} alt={draft.headline} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[12px] text-[#888]">No image</div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <div className="mt-2 flex flex-col gap-1.5">
            <Btn size="sm" variant="outline" onClick={() => fileRef.current?.click()} loading={uploading} disabled={uploading}>
              {uploading ? "Uploading…" : draft.hero_image_url ? "Replace" : "Upload"}
            </Btn>
            <p className="text-[10px] leading-snug text-[#888]">
              Recommended: 4:3 landscape, ~1200×900px. JPG or PNG, max 5MB.
            </p>
            {draft.hero_image_url && !uploading && (
              <Btn size="sm" variant="ghost" onClick={async () => {
                await updateWelcomeCard(card.id, { hero_image_url: null });
                onChanged();
              }}>Remove image</Btn>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <Field label="Headline">
            <Input value={draft.headline} onChange={(e) => setDraft({ ...draft, headline: e.target.value })} placeholder="Leo needs your help today..." />
          </Field>
          <Field label="Subtitle (optional)">
            <Textarea rows={2} value={draft.subtitle ?? ""} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value || null })} placeholder="Small intro text shown above the headline" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CTA Label">
              <Input value={draft.cta_label} onChange={(e) => setDraft({ ...draft, cta_label: e.target.value })} placeholder="Start →" />
            </Field>
            <Field label="CTA Destination" hint="Path or URL (e.g. / or /play/the-happy-stall)">
              <Input value={draft.cta_destination} onChange={(e) => setDraft({ ...draft, cta_destination: e.target.value })} placeholder="/" />
            </Field>
          </div>
          <Field label="Position" hint="Lower numbers appear first in rotation">
            <Input type="number" value={draft.position} onChange={(e) => setDraft({ ...draft, position: Number(e.target.value) || 0 })} />
          </Field>
        </div>
      </div>
    </Card>
  );
}

function PreviewRotator({ cards }: { cards: WelcomeCard[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (cards.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % cards.length), 4000);
    return () => clearInterval(id);
  }, [cards.length]);
  const safeIdx = cards.length ? idx % cards.length : 0;
  const card = cards[safeIdx];

  return (
    <div className="rounded-[20px] bg-[#E5E5F2] p-3 shadow-inner">
      <div className="mx-auto w-full max-w-[320px] rounded-[18px] bg-white p-3 shadow-card">
        {card ? <WelcomeCardPreview card={card} /> : (
          <div className="flex h-48 items-center justify-center rounded-[16px] bg-[#F0F0FA] text-xs text-[#888]">
            No active welcome cards
          </div>
        )}
        {cards.length > 1 && (
          <div className="mt-2 flex justify-center gap-1">
            {cards.map((_, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === safeIdx ? "bg-[#7B2FBE]" : "bg-[#D8D8E8]"}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function WelcomeCardPreview({ card }: { card: WelcomeCard }) {
  return (
    <div
      className="relative overflow-hidden rounded-[20px] p-3 text-white shadow-pop"
      style={{ background: "linear-gradient(135deg, #7B2FBE 0%, #B66BFF 100%)" }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-white/15">
          {card.hero_image_url ? (
            <img src={card.hero_image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-white/70">No image</div>
          )}
        </div>
        <div className="mt-3 px-1 pb-1">
          <p className="text-[10px] font-bold text-white/85">Welcome back,</p>
          <p className="text-xs font-extrabold text-yellow-200 drop-shadow-sm">Alex 👋</p>
          <h2 className="mt-1.5 whitespace-pre-line text-base font-black leading-tight drop-shadow-md">
            {card.headline}
          </h2>
          {card.subtitle && (
            <p className="mt-1 text-[11px] font-semibold text-white/85">{card.subtitle}</p>
          )}
          <button className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#7B2FBE]">
            {card.cta_label}
          </button>
        </div>
      </div>
    </div>
  );
}
