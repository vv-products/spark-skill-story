// Shared avatar configuration types + option palettes used by both the
// renderer (Avatar.tsx) and the customizer page.

export type AvatarConfig = {
  skin: string;       // option id from SKIN
  hairStyle: string;  // option id from HAIR_STYLES
  hairColor: string;  // option id from HAIR_COLORS
  eyes: string;       // option id from EYES
  expression: string; // option id from EXPRESSIONS — drives mouth + brows
  // Legacy fields kept for back-compat with stored configs:
  mouth?: string;
  accessory?: string;
  background?: string;
};

export const SKIN: { id: string; label: string; color: string }[] = [
  { id: "porcelain", label: "Porcelain", color: "#FFE0CC" },
  { id: "light",     label: "Light",     color: "#F5C9A4" },
  { id: "tan",       label: "Tan",       color: "#E0A878" },
  { id: "olive",     label: "Olive",     color: "#C68B5C" },
  { id: "brown",     label: "Brown",     color: "#8C5A35" },
  { id: "deep",      label: "Deep",      color: "#5A371F" },
];

export const HAIR_COLORS: { id: string; label: string; color: string }[] = [
  { id: "black",   label: "Black",   color: "#1F1A24" },
  { id: "brown",   label: "Brown",   color: "#5A3A22" },
  { id: "blonde",  label: "Blonde",  color: "#E8C770" },
  { id: "red",     label: "Red",     color: "#C8552B" },
  { id: "auburn",  label: "Auburn",  color: "#8B3A1F" },
  { id: "blue",    label: "Blue",    color: "#3FA9F5" },
  { id: "pink",    label: "Pink",    color: "#FF7AB6" },
];

export const HAIR_STYLES: { id: string; label: string }[] = [
  { id: "shortCurly",   label: "Short curly" },
  { id: "longStraight", label: "Long straight" },
  { id: "braids",       label: "Braids" },
  { id: "buzz",         label: "Buzz cut" },
  { id: "ponytail",     label: "Ponytail" },
  { id: "messy",        label: "Messy" },
];

export const EYES: { id: string; label: string }[] = [
  { id: "round",   label: "Round" },
  { id: "starry",  label: "Starry" },
  { id: "sleepy",  label: "Sleepy-happy" },
  { id: "wide",    label: "Wide curious" },
];

export const EXPRESSIONS: { id: string; label: string; emoji: string }[] = [
  { id: "happy",      label: "Happy",      emoji: "😊" },
  { id: "excited",    label: "Excited",    emoji: "🤩" },
  { id: "calm",       label: "Calm",       emoji: "😌" },
  { id: "determined", label: "Determined", emoji: "😤" },
  { id: "shy",        label: "Shy",        emoji: "☺️" },
];

// Backdrop gradients for the preview card. Keyed off the active hair color
// so the card subtly shifts to complement the look.
export const BACKDROPS: Record<string, [string, string]> = {
  default: ["#9B5BE0", "#D9C2F2"],
  black:   ["#7B2FBE", "#C9B0EA"],
  brown:   ["#A567D6", "#E2CCF2"],
  blonde:  ["#C97FE6", "#FFE0F0"],
  red:     ["#E0639A", "#FFD0C2"],
  auburn:  ["#C25A8A", "#F2C7D6"],
  blue:    ["#6B7BE8", "#C7D3FF"],
  pink:    ["#E263B0", "#FFD3EC"],
};

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: "light",
  hairStyle: "shortCurly",
  hairColor: "brown",
  eyes: "round",
  expression: "happy",
};

export function colorOf<T extends { id: string; color: string }>(opts: T[], id: string, fallback: string) {
  return opts.find((o) => o.id === id)?.color ?? fallback;
}

// Deterministically derive an avatar from a string seed (e.g. user id) so
// users without a saved config still get a stable, varied avatar.
export function avatarFromSeed(seed: string): AvatarConfig {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const pick = <T,>(arr: T[]) => { h = Math.imul(h ^ (h >>> 13), 16777619) >>> 0; return arr[h % arr.length]; };
  return {
    skin: pick(SKIN).id,
    hairStyle: pick(HAIR_STYLES).id,
    hairColor: pick(HAIR_COLORS).id,
    eyes: pick(EYES).id,
    expression: pick(EXPRESSIONS).id,
  };
}

export function randomAvatar(): AvatarConfig {
  return avatarFromSeed(`${Math.random()}-${Date.now()}`);
}

// Tolerate older saved configs that used legacy ids.
export function normalizeAvatar(c: Partial<AvatarConfig> | null | undefined): AvatarConfig {
  if (!c) return DEFAULT_AVATAR;
  const hairStyleMap: Record<string, string> = {
    short: "shortCurly", long: "longStraight", curly: "shortCurly",
    buns: "braids", mohawk: "messy", bald: "buzz",
  };
  const eyesMap: Record<string, string> = {
    happy: "round", round: "round", wink: "round",
    stars: "starry", sleepy: "sleepy", curious: "wide",
  };
  const exprFromMouth: Record<string, string> = {
    smile: "happy", grin: "excited", smirk: "determined",
    open: "excited", tongue: "excited",
  };
  return {
    skin: SKIN.find((s) => s.id === c.skin)?.id ?? DEFAULT_AVATAR.skin,
    hairStyle: HAIR_STYLES.find((s) => s.id === c.hairStyle)?.id
      ?? hairStyleMap[c.hairStyle ?? ""] ?? DEFAULT_AVATAR.hairStyle,
    hairColor: HAIR_COLORS.find((s) => s.id === c.hairColor)?.id ?? DEFAULT_AVATAR.hairColor,
    eyes: EYES.find((s) => s.id === c.eyes)?.id ?? eyesMap[c.eyes ?? ""] ?? DEFAULT_AVATAR.eyes,
    expression: EXPRESSIONS.find((s) => s.id === c.expression)?.id
      ?? exprFromMouth[c.mouth ?? ""] ?? DEFAULT_AVATAR.expression,
  };
}
