import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "editor";

type AuthCtx = {
  loading: boolean;
  user: User | null;
  session: Session | null;
  roles: Role[];
  canEdit: boolean;
  refreshRoles: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function StudioAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Set up listener BEFORE getSession (order matters)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // defer to avoid recursive calls inside the listener
        setTimeout(() => loadRoles(s.user.id), 0);
      } else {
        setRoles([]);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadRoles(data.session.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadRoles(uid: string) {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    if (error) {
      console.error("[studio auth] loadRoles failed:", error);
      return;
    }
    setRoles((data ?? []).map((r) => r.role as Role));
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }

  async function signUp(email: string, password: string, displayName?: string) {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/studio`,
        data: displayName ? { display_name: displayName } : undefined,
      },
    });
    return error ? { error: error.message } : {};
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const canEdit = roles.includes("admin") || roles.includes("editor");

  return (
    <Ctx.Provider value={{ loading, user, session, roles, canEdit, signIn, signUp, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStudioAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStudioAuth outside provider");
  return c;
}
