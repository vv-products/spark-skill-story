// Shared avatar configuration types + option palettes used by both the
// renderer (Avatar.tsx) and the customizer page.

export type AvatarConfig = {
  skin: string;       // option id from SKIN
  hairStyle: string;  // option id from HAIR_STYLES
  hairColor: string;  // option id from HAIR_COLORS
  eyes: string;       // option id from EYES
  mouth: string;      // option id from MOUTHS
  accessory: string;  // option id from ACCESSORIES ("none" allowed)
  background: string; // option id from BACKGROUNDS
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
  { id: "ginger",  label: "Ginger",  color: "#C8552B" },
  { id: "white",   label: "White",   color: "#EFEFEF" },
  { id: "pink",    label: "Pink",    color: "#FF7AB6" },
  { id: "purple",  label: "Purple",  color: "#8A4DD6" },
  { id: "blue",    label: "Blue",    color: "#3FA9F5" },
  { id: "green",   label: "Green",   color: "#3FB97A" },
];

export const HAIR_STYLES: { id: string; label: string }[] = [
  { id: "short",   label: "Short" },
  { id: "long",    label: "Long" },
  { id: "curly",   label: "Curly" },
  { id: "buns",    label: "Space buns" },
  { id: "mohawk",  label: "Mohawk" },
  { id: "bald",    label: "Bald" },
];

export const EYES: { id: string; label: string }[] = [
  { id: "happy",    label: "Happy" },
  { id: "round",    label: "Round" },
  { id: "wink",     label: "Wink" },
  { id: "stars",    label: "Stars" },
  { id: "sleepy",   label: "Sleepy" },
];

export const MOUTHS: { id: string; label: string }[] = [
  { id: "smile",    label: "Smile" },
  { id: "grin",     label: "Grin" },
  { id: "smirk",    label: "Smirk" },
  { id: "open",     label: "Surprised" },
  { id: "tongue",   label: "Tongue out" },
];

export const ACCESSORIES: { id: string; label: string }[] = [
  { id: "none",     label: "None" },
  { id: "glasses",  label: "Glasses" },
  { id: "sunnies",  label: "Sunglasses" },
  { id: "freckles", label: "Freckles" },
  { id: "blush",    label: "Blush" },
];

export const BACKGROUNDS: { id: string; label: string; color: string }[] = [
  { id: "purple",  label: "Purple",  color: "#7B2FBE" },
  { id: "pink",    label: "Pink",    color: "#FF7AB6" },
  { id: "teal",    label: "Teal",    color: "#3FB9B0" },
  { id: "sun",     label: "Sun",     color: "#FFB23F" },
  { id: "sky",     label: "Sky",     color: "#3FA9F5" },
  { id: "mint",    label: "Mint",    color: "#7AD89C" },
  { id: "slate",   label: "Slate",   color: "#3D4A66" },
];

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: "light",
  hairStyle: "short",
  hairColor: "brown",
  eyes: "happy",
  mouth: "smile",
  accessory: "none",
  background: "purple",
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
    hairStyle: pick(HAIR_STYLES.filter((s) => s.id !== "bald")).id,
    hairColor: pick(HAIR_COLORS).id,
    eyes: pick(EYES).id,
    mouth: pick(MOUTHS).id,
    accessory: pick(ACCESSORIES).id,
    background: pick(BACKGROUNDS).id,
  };
}
