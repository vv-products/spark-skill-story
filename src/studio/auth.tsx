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
      setLoading(true);
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // defer to avoid recursive calls inside the listener
        setTimeout(() => {
          loadRoles(s.user.id).finally(() => setLoading(false));
        }, 0);
      } else {
        setRoles([]);
        setLoading(false);
      }
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) await loadRoles(data.session.user.id);
      else setRoles([]);
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
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) await loadRoles(data.user.id);
    setLoading(false);
    return error ? { error: error.message } : {};
  }

  async function signUp(email: string, password: string, displayName?: string) {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/studio`,
        data: displayName ? { display_name: displayName } : undefined,
      },
    });
    if (!error && data.user) await loadRoles(data.user.id);
    setLoading(false);
    return error ? { error: error.message } : {};
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const canEdit = roles.includes("admin") || roles.includes("editor");
  const refreshRoles = async () => {
    if (!user) return;
    setLoading(true);
    await loadRoles(user.id);
    setLoading(false);
  };

  return (
    <Ctx.Provider value={{ loading, user, session, roles, canEdit, refreshRoles, signIn, signUp, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStudioAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStudioAuth outside provider");
  return c;
}
