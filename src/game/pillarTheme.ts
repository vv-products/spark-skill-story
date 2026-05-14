import mayaImg from "@/assets/images/maya-world.png";
import leoImg from "@/assets/images/leo-world.png";
import dashImg from "@/assets/images/dash-world.png";
import pipImg from "@/assets/images/pip-world.png";

export type PillarSlug = "inner" | "social" | "action" | "real";

export type PillarTheme = {
  slug: PillarSlug;
  charId: "maya" | "leo" | "dash" | "pip";
  name: string;
  world: string;
  tagline: string;
  accent: string; // hex
  glow: string; // rgba
  mascot: string; // image URL
};

export const PILLAR_THEMES: Record<PillarSlug, PillarTheme> = {
  inner: {
    slug: "inner",
    charId: "maya",
    name: "Maya",
    world: "Inner World",
    tagline: "Brave enough to try, strong enough to fail",
    accent: "#7c3aed",
    glow: "rgba(167,139,250,0.25)",
    mascot: mayaImg,
  },
  social: {
    slug: "social",
    charId: "leo",
    name: "Leo",
    world: "Social World",
    tagline: "Kind heart, learning to speak up",
    accent: "#e11d48",
    glow: "rgba(251,113,133,0.25)",
    mascot: leoImg,
  },
  action: {
    slug: "action",
    charId: "dash",
    name: "Dash",
    world: "Action World",
    tagline: "Full speed ahead, learning to pause",
    accent: "#6366f1",
    glow: "rgba(129,140,248,0.25)",
    mascot: dashImg,
  },
  real: {
    slug: "real",
    charId: "pip",
    name: "Pip",
    world: "Real World",
    tagline: "Small steps, giant leaps",
    accent: "#f97316",
    glow: "rgba(251,191,36,0.25)",
    mascot: pipImg,
  },
};

export const PILLAR_ORDER: PillarSlug[] = ["inner", "social", "action", "real"];

export function pillarThemeFromSlug(slug: string): PillarTheme {
  return (PILLAR_THEMES as Record<string, PillarTheme>)[slug] ?? PILLAR_THEMES.inner;
}
