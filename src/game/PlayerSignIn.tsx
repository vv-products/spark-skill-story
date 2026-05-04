import { useState } from "react";
import { usePlayerAuth } from "./PlayerAuth";
import { toast } from "sonner";

export function PlayerSignIn({ onContinueAsGuest }: { onContinueAsGuest: () => void }) {
  const { signIn, signUp, signInWithGoogle } = usePlayerAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = mode === "signin" ? await signIn(email, password) : await signUp(email, password, name);
    setBusy(false);
    if (res.error) toast.error(res.error);
    else if (mode === "signup") toast.success("Account created!");
  }
  async function google() {
    setBusy(true);
    const r = await signInWithGoogle();
    setBusy(false);
    if (r.error) toast.error(r.error);
  }

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-[#7B2FBE] to-[#3D1568] p-6 flex flex-col">
      <div className="mt-8 mb-6 text-center text-white">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">🌱</div>
        <h1 className="text-3xl font-black">Sementa</h1>
        <p className="mt-1 text-sm text-white/80">Grow your inner world</p>
      </div>
      <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-bold text-[#1A1A2E]">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
        {mode === "signup" && (
          <label className="mt-4 block text-xs font-bold text-[#666]">
            What should we call you?
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="mt-1 w-full rounded-lg border border-[#E0E0EA] bg-white px-3 py-2 text-sm" />
          </label>
        )}
        <label className="mt-3 block text-xs font-bold text-[#666]">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="mt-1 w-full rounded-lg border border-[#E0E0EA] bg-white px-3 py-2 text-sm" />
        </label>
        <label className="mt-3 block text-xs font-bold text-[#666]">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            className="mt-1 w-full rounded-lg border border-[#E0E0EA] bg-white px-3 py-2 text-sm" />
        </label>
        <button type="submit" disabled={busy}
          className="mt-4 w-full rounded-full bg-[#7B2FBE] py-2.5 text-sm font-extrabold text-white disabled:opacity-60">
          {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <div className="my-3 flex items-center gap-2 text-[11px] font-semibold text-[#999]">
          <span className="h-px flex-1 bg-[#EBEBF5]" />OR<span className="h-px flex-1 bg-[#EBEBF5]" />
        </div>
        <button type="button" onClick={google} disabled={busy}
          className="w-full rounded-full border border-[#E0E0EA] bg-white py-2.5 text-sm font-bold text-[#1A1A2E] hover:bg-[#F8F8FC]">
          <span className="mr-2">🔵</span>Continue with Google
        </button>

        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-3 w-full text-xs font-bold text-[#7B2FBE]">
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </form>
      <button onClick={onContinueAsGuest}
        className="mt-4 w-full rounded-full border border-white/30 bg-white/10 py-2.5 text-sm font-bold text-white">
        Play as guest (progress not saved)
      </button>

      <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-3">
        <div className="mb-2 text-center text-[11px] font-bold uppercase tracking-wide text-white/70">
          Demo accounts
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { name: "Mia", email: "mia.kid@example.com", emoji: "🌟" },
            { name: "Leo", email: "leo.kid@example.com", emoji: "🦁" },
            { name: "Zoe", email: "zoe.kid@example.com", emoji: "🌈" },
            { name: "Kai", email: "kai.kid@example.com", emoji: "🌊" },
            { name: "Ada", email: "ada.kid@example.com", emoji: "🌸" },
          ].map((kid) => (
            <button
              key={kid.email}
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const res = await signIn(kid.email, "KidPass123!");
                setBusy(false);
                if (res.error) toast.error(res.error);
              }}
              className="flex flex-col items-center gap-1 rounded-xl bg-white/15 py-2 text-white hover:bg-white/25 disabled:opacity-50"
            >
              <span className="text-xl">{kid.emoji}</span>
              <span className="text-[11px] font-bold">{kid.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
