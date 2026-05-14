import { createFileRoute } from "@tanstack/react-router";
import { PlayerAuthProvider } from "@/game/PlayerAuth";
import { PlayerShell } from "@/game/PlayerShell";
import { WorldPage } from "@/game/WorldPage";
import { pillarThemeFromSlug } from "@/game/pillarTheme";

export const Route = createFileRoute("/world/$slug")({
  head: ({ params }) => {
    const t = pillarThemeFromSlug(params.slug);
    const title = `${t.world} — ${t.name}'s journey`;
    const desc = `${t.tagline}. Explore topics, modules, and classes in ${t.world}.`;
    const url = `https://spark-skill-story.lovable.app/world/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: WorldRoute,
});

function WorldRoute() {
  const { slug } = Route.useParams();
  return (
    <PlayerAuthProvider>
      <PlayerShell>
        <WorldPage pillarSlug={slug} />
      </PlayerShell>
    </PlayerAuthProvider>
  );
}
