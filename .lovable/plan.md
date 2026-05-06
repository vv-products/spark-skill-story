## Problem

The `T01Video` layer in `src/game/LayerRenderer.tsx` renders the video using a native `<video src={url}>` tag. That element only plays direct media files (mp4/webm/ogg). The URL saved in Studio is a YouTube watch link (`https://www.youtube.com/watch?v=Kv6qKvCtszA`), which YouTube serves as an HTML page, not a video file — so the player shows a black box and never starts.

## Fix (single file: `src/game/LayerRenderer.tsx`)

Update `T01Video` to detect the URL type and render the right element:

1. Add a small helper `getEmbedUrl(url)` that:
   - Detects YouTube (`youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`) → returns `https://www.youtube.com/embed/{id}?rel=0&modestbranding=1`.
   - Detects Vimeo (`vimeo.com/{id}`) → returns `https://player.vimeo.com/video/{id}`.
   - Otherwise returns `null` (treat as a direct media file).

2. In `T01Video`:
   - If `getEmbedUrl(url)` returns an embed URL → render an `<iframe>` (with `allow="autoplay; encrypted-media; picture-in-picture"`, `allowFullScreen`, `referrerPolicy="strict-origin-when-cross-origin"`) inside the existing aspect-video container. Since iframes don't fire `onEnded`, enable the Continue button after a short watch threshold (e.g. show a "Mark as watched" button immediately, since requiring the user to actually finish a YouTube embed isn't feasible without the YouTube IFrame API).
   - If it's a direct media file → keep the current `<video controls onEnded>` behaviour.
   - If no URL → keep the current placeholder.

3. No DB changes. No changes to Studio. Existing classes that store direct mp4 URLs continue to work.

## Optional follow-up (not in this change)

If you want strict "must watch to the end" gating for YouTube, we'd need to load the YouTube IFrame Player API and listen for the `ended` state — happy to add that as a follow-up if needed.