import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { StudioLayout } from "../Layout";
import { Btn, Card, Toggle } from "../ui";
import {
  createAvatar, deleteAvatar, listAvatars, updateAvatar, uploadAvatarImage,
  type AvatarItem,
} from "../avatars";

export function AvatarsScreen() {
  const [avatars, setAvatars] = useState<AvatarItem[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function reload() {
    try { setAvatars(await listAvatars()); }
    catch (e: any) { toast.error(e?.message ?? "Failed to load avatars"); }
  }
  useEffect(() => { reload(); }, []);

  async function handleNewFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) { toast.error(`${file.name}: not an image`); continue; }
        if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name}: max 5MB`); continue; }
        const url = await uploadAvatarImage(file);
        await createAvatar(url);
      }
      toast.success("Avatar(s) added");
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <StudioLayout
      title="Avatars"
      actions={
        <>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleNewFile} />
          <Btn onClick={() => fileRef.current?.click()} loading={uploading}>+ New Avatar</Btn>
        </>
      }
    >
      <div className="px-8 py-6">
        {avatars === null ? (
          <Card><div className="py-6 text-center text-sm text-[#888]">Loading…</div></Card>
        ) : avatars.length === 0 ? (
          <Card>
            <div className="py-8 text-center text-sm text-[#666680]">
              No avatars yet. Upload images so kids can choose a character.
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {avatars.map((a) => (
              <AvatarCard key={a.id} avatar={a} onChanged={reload} />
            ))}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}

function AvatarCard({ avatar, onChanged }: { avatar: AvatarItem; onChanged: () => void }) {
  const [position, setPosition] = useState(avatar.position);
  const [savingPos, setSavingPos] = useState(false);

  async function toggleActive(v: boolean) {
    try { await updateAvatar(avatar.id, { active: v }); onChanged(); }
    catch (e: any) { toast.error(e?.message ?? "Update failed"); }
  }
  async function savePosition() {
    if (position === avatar.position) return;
    setSavingPos(true);
    try { await updateAvatar(avatar.id, { position }); onChanged(); }
    catch (e: any) { toast.error(e?.message ?? "Update failed"); }
    finally { setSavingPos(false); }
  }
  async function remove() {
    if (!confirm("Delete this avatar? Kids who chose it will lose their pick.")) return;
    try { await deleteAvatar(avatar.id); toast.success("Deleted"); onChanged(); }
    catch (e: any) { toast.error(e?.message ?? "Delete failed"); }
  }

  return (
    <Card padding="p-3">
      <div className="aspect-square w-full overflow-hidden rounded-[10px] bg-[#F0F0FA]">
        <img src={avatar.image_url} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Toggle checked={avatar.active} onChange={toggleActive} label={avatar.active ? "Active" : "Hidden"} />
        <Btn size="sm" variant="danger" onClick={remove}>Delete</Btn>
      </div>
      <label className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-[#666680]">
        Position
        <input
          type="number"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value) || 0)}
          onBlur={savePosition}
          disabled={savingPos}
          className="w-16 rounded-[6px] border border-[#EBEBF5] px-2 py-1 text-[12px] text-[#1A1A2E]"
        />
      </label>
    </Card>
  );
}
