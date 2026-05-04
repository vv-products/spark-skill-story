import { useState } from "react";
import { useStudioAuth } from "./auth";
import { toast } from "sonner";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, user, canEdit, signOut } = useStudioAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-studio-bg font-studio text-text-secondary">
        Loading…
      </div>
    );
  }

  if (!user) return <SignInScreen />;

  if (!canEdit) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-studio-bg font-studio text-foreground">
        <p className="text-lg font-bold">You don't have editor access yet.</p>
        <p className="text-sm text-text-secondary">Ask an admin to add you to the editor or admin role.</p>
        <button
          onClick={() => signOut()}
          className="rounded-pill border border-border bg-card px-4 py-2 text-sm font-bold"
        >
          Sign out
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

function SignInScreen() {
  const { signIn, signUp } = useStudioAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password, name);
    setBusy(false);
    if (res.error) toast.error(res.error);
    else if (mode === "signup") toast.success("Account created. Check your email if confirmation is required.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-studio-bg p-6 font-studio">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-studio">
        <h1 className="text-2xl font-black text-foreground">Sementa Studio</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {mode === "signin" ? "Sign in to manage content." : "Create an editor account."}
        </p>

        {mode === "signup" && (
          <label className="mt-5 block text-xs font-bold text-text-secondary">
            Display name
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              required
            />
          </label>
        )}
        <label className="mt-4 block text-xs font-bold text-text-secondary">
          Email
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="mt-3 block text-xs font-bold text-text-secondary">
          Password
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            minLength={6} required
          />
        </label>

        <button
          type="submit" disabled={busy}
          className="mt-5 w-full rounded-pill bg-primary py-2.5 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-3 w-full text-xs font-bold text-primary"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>

        <p className="mt-4 text-[11px] text-text-secondary">
          The first account created becomes Admin automatically.
        </p>
      </form>
    </div>
  );
}
