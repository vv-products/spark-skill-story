// Flask Orbs — the in-game currency. Earned alongside XP from missions.
// Persisted in localStorage so a kid can spend across sessions even before
// signing in. Balance = lifetime earned − total spent.

const EARN_KEY = "sementa.orbs.earned";
const SPENT_KEY = "sementa.orbs.spent";
const OWN_KEY = "sementa.orbs.owned";

// 1 orb per 5 XP feels rewarding without being trivial.
export function xpToOrbs(xp: number): number {
  return Math.max(0, Math.floor(xp / 5));
}

function read(key: string, fallback = 0): number {
  if (typeof window === "undefined") return fallback;
  const v = Number(window.localStorage.getItem(key) ?? fallback);
  return Number.isFinite(v) ? v : fallback;
}
function write(key: string, value: number) {
  try { window.localStorage.setItem(key, String(value)); } catch { /* ignore */ }
}

export function getEarned() { return read(EARN_KEY); }
export function getSpent() { return read(SPENT_KEY); }
export function getBalance() { return Math.max(0, getEarned() - getSpent()); }

export function awardOrbs(amount: number) {
  if (amount <= 0) return getBalance();
  write(EARN_KEY, getEarned() + amount);
  window.dispatchEvent(new CustomEvent("orbs:changed"));
  return getBalance();
}

export function spendOrbs(amount: number): boolean {
  if (amount <= 0) return true;
  if (getBalance() < amount) return false;
  write(SPENT_KEY, getSpent() + amount);
  window.dispatchEvent(new CustomEvent("orbs:changed"));
  return true;
}

export function getOwned(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(OWN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}
function setOwned(ids: string[]) {
  try { window.localStorage.setItem(OWN_KEY, JSON.stringify(ids)); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent("orbs:changed"));
}
export function ownsItem(id: string) { return getOwned().includes(id); }
export function purchaseItem(id: string, cost: number): boolean {
  if (ownsItem(id)) return false;
  if (!spendOrbs(cost)) return false;
  setOwned([...getOwned(), id]);
  return true;
}

export type ShopItem = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  category: "Avatar Frame" | "Title" | "Boost" | "Theme";
};

export const SHOP_ITEMS: ShopItem[] = [
  { id: "frame-galaxy",  name: "Galaxy Frame",   emoji: "🌌", description: "A swirling cosmic ring around your avatar.", cost: 40,  category: "Avatar Frame" },
  { id: "frame-flame",   name: "Flame Frame",    emoji: "🔥", description: "Show off a fiery streak ring.",              cost: 60,  category: "Avatar Frame" },
  { id: "frame-rainbow", name: "Rainbow Frame",  emoji: "🌈", description: "All-the-feels rainbow border.",              cost: 90,  category: "Avatar Frame" },
  { id: "title-explorer",name: "Title: Explorer",emoji: "🧭", description: "Display the “Explorer” title on your card.", cost: 30,  category: "Title" },
  { id: "title-empath",  name: "Title: Empath",  emoji: "💞", description: "Display the “Empath” title on your card.",   cost: 50,  category: "Title" },
  { id: "title-sage",    name: "Title: Sage",    emoji: "🦉", description: "Display the “Sage” title on your card.",     cost: 120, category: "Title" },
  { id: "boost-2x",      name: "2× XP Booster",  emoji: "⚡", description: "Doubles XP on your next mission run.",       cost: 80,  category: "Boost" },
  { id: "theme-sunset",  name: "Sunset Theme",   emoji: "🌇", description: "Warm sunset gradient on the home card.",     cost: 70,  category: "Theme" },
  { id: "theme-ocean",   name: "Ocean Theme",    emoji: "🌊", description: "Cool ocean gradient on the home card.",      cost: 70,  category: "Theme" },
];
