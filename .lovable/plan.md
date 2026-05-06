## Goal
Add a hero-image upload picker to the Studio Class Editor. The image is uploaded to a Lovable Cloud storage bucket and the resulting public URL is saved to `classes.hero_image_url`, so the home page picks it up automatically (it already reads `hero_image_url` first, falling back to character images).

## 1. Database / Storage migration

Create a new public storage bucket and editor-only write policies:

```sql
insert into storage.buckets (id, name, public)
values ('class-hero', 'class-hero', true)
on conflict (id) do nothing;

create policy "Public read class hero images"
  on storage.objects for select
  using (bucket_id = 'class-hero');

create policy "Editors upload class hero images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'class-hero'
    and (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin')));

create policy "Editors update class hero images"
  on storage.objects for update to authenticated
  using (bucket_id = 'class-hero'
    and (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin')));

create policy "Editors delete class hero images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'class-hero'
    and (public.has_role(auth.uid(), 'editor') or public.has_role(auth.uid(), 'admin')));
```

Bucket is public so the player home page can render images via the public URL with no signing.

## 2. Type & data wiring

- `src/studio/data.ts` — add `heroImageUrl?: string | null` to `Class`.
- `src/studio/catalog.ts`:
  - In `loadFullCatalog`, map `c.hero_image_url` → `heroImageUrl` on each `HClass`.
  - Add `heroImageUrl` to the `HClass` type.
  - In `saveClass`, include `hero_image_url: c.heroImageUrl ?? null` in the `classes` UPDATE.
- `StudioContext.updateClass` already accepts `Partial<Class>`, so no change needed there.

## 3. Upload picker UI (Class Editor → Class Settings)

In `src/studio/screens/ClassEditor.tsx`, add a new `Field` labelled **"Hero Image"** between Character Focus and Age Group.

A new local component `HeroImagePicker`:
- Shows a 16:9 preview of the current `currentClass.heroImageUrl` (or a dashed placeholder when empty).
- Has two buttons: **Upload image** (opens native file picker, accepts `image/*`, max 5MB) and **Remove** (clears the URL).
- On file select:
  1. Validate type/size (toast error on fail).
  2. `path = ${currentClass.id}/${Date.now()}-${sanitizedName}`
  3. `await supabase.storage.from('class-hero').upload(path, file, { upsert: true, cacheControl: '3600' })`
  4. `const { data } = supabase.storage.from('class-hero').getPublicUrl(path)`
  5. `updateClass({ heroImageUrl: data.publicUrl })`
  6. Toast success. The user still needs to click **Save** to persist (consistent with the rest of the editor).
- Tracks an `uploading` state to disable buttons and show "Uploading…".
- "Remove" just calls `updateClass({ heroImageUrl: null })` — does not delete the storage object (cheap, avoids breaking older snapshots; we can add cleanup later if desired).

## 4. Home page consumption (no change required)

`src/game/GamePlayer.tsx` already does:
```ts
const classImage = (c: DbClass) => c.hero_image_url || FALLBACK_IMAGES[c.position % FALLBACK_IMAGES.length];
```
So once a hero image is saved, the Journey rail card will use it automatically.

## Out of scope
- No image cropping/compression — uploaded as-is.
- No automatic deletion of replaced images from storage.
- No image picker on the Library/Module screens (only the Class Editor where context is clearest).