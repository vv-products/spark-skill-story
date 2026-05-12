import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, FlaskConical, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  SHOP_ITEMS, type ShopItem,
  getBalance, getOwned, purchaseItem,
} from "./flaskOrbs";

export function useOrbState() {
  const [balance, setBalance] = useState(0);
  const [owned, setOwned] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => { setBalance(getBalance()); setOwned(getOwned()); };
    sync();
    window.addEventListener("orbs:changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("orbs:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return { balance, owned };
}

export function FlaskBadge({ className = "" }: { className?: string }) {
  const { balance } = useOrbState();
  return (
    <Link
      to="/shop"
      className={`inline-flex items-center gap-1 rounded-pill bg-gradient-to-r from-cyan-500 to-violet-500 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-pop ${className}`}
      title="XP — spend in the shop"
    >
      <FlaskConical size={12} className="drop-shadow" />
      <span className="tabular-nums">{balance}</span>
    </Link>
  );
}

export function Shop() {
  const { balance, owned } = useOrbState();
  const categories = Array.from(new Set(SHOP_ITEMS.map((i) => i.category)));

  function buy(item: ShopItem) {
    if (owned.includes(item.id)) return;
    if (balance < item.cost) {
      toast.error(`Need ${item.cost - balance} more XP!`);
      return;
    }
    if (purchaseItem(item.id, item.cost)) {
      toast.success(`Unlocked ${item.name}!`);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-6">
      <Link to="/" className="inline-flex items-center gap-1 text-xs font-extrabold text-text-secondary">
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="mt-3 rounded-3xl bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 p-6 text-white shadow-pop">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20">
            <FlaskConical size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black">Shop</h1>
            <p className="text-xs font-bold opacity-90">Spend XP on cosmetics, titles &amp; boosts.</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/20 px-4 py-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-90">Your balance</span>
          <span className="inline-flex items-center gap-1 text-lg font-black">
            <FlaskConical size={18} /> <span className="tabular-nums">{balance}</span>
          </span>
        </div>
        <p className="mt-3 text-[11px] font-bold opacity-90">
          Earn XP by playing missions — every 5 mission XP adds 1 to your shop XP flask.
        </p>
      </div>

      {categories.map((cat) => (
        <section key={cat} className="mt-5">
          <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-text-secondary">{cat}</h2>
          <div className="space-y-2">
            {SHOP_ITEMS.filter((i) => i.category === cat).map((item) => {
              const isOwned = owned.includes(item.id);
              const canAfford = balance >= item.cost;
              return (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-muted text-2xl">{item.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold text-foreground">{item.name}</div>
                    <div className="truncate text-[11px] font-bold text-text-secondary">{item.description}</div>
                  </div>
                  <button
                    onClick={() => buy(item)}
                    disabled={isOwned || !canAfford}
                    className={`shrink-0 rounded-pill px-3 py-1.5 text-[11px] font-extrabold transition ${
                      isOwned
                        ? "bg-green-500/15 text-green-700"
                        : canAfford
                        ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-pop active:scale-95"
                        : "bg-muted text-text-secondary"
                    }`}
                  >
                    {isOwned ? (
                      <span className="inline-flex items-center gap-1"><Check size={11} /> Owned</span>
                    ) : !canAfford ? (
                      <span className="inline-flex items-center gap-1"><Lock size={11} /> {item.cost}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1"><FlaskConical size={11} /> {item.cost}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
