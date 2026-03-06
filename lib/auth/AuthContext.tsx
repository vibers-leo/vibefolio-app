import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "../supabase";
import { Session, User } from "@supabase/supabase-js";

const ADMIN_EMAILS = [
  "juuuno@naver.com",
  "juuuno1116@gmail.com",
  "designd@designd.co.kr",
  "designdlab@designdlab.co.kr",
  "admin@vibefolio.net",
  "duscontactus@gmail.com",
];

function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  email: string;
  genre_interest: string[] | null;
  field_interest: string[] | null;
  points: number;
  role: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userProfile: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("User")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          display_name: data.display_name || data.email?.split("@")[0] || "User",
          avatar_url: data.avatar_url,
          bio: data.bio,
          email: data.email,
          genre_interest: data.genre_interest,
          field_interest: data.field_interest,
          points: data.points || 0,
          role: data.role,
        };
        setUserProfile(profile);
        setIsAdmin(
          isAdminEmail(data.email) || data.role === "admin"
        );
      }
    } catch (e) {
      if (__DEV__) console.warn("[Auth] Failed to load profile:", e);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setIsAdmin(isAdminEmail(s.user.email));
        loadProfile(s.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setIsAdmin(isAdminEmail(s.user.email));
        loadProfile(s.user.id);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserProfile(null);
    setIsAdmin(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        isAdmin,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
