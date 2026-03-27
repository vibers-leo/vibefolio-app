// 인증 컨텍스트 — API 기반 (Supabase 제거)
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getToken,
  setToken,
  removeToken,
  setUserCache,
  getUserCache,
  removeUserCache,
} from "../tokenStore";
import { fetchAPI } from "../api/client";

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

/** 유저 프로필 타입 */
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

/** 인증 API 응답 타입 */
interface AuthResponse {
  token: string;
  user: UserProfile;
}

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
  resetPassword: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  /** 유저 상태 업데이트 헬퍼 */
  const updateUser = useCallback((profile: UserProfile | null) => {
    setUser(profile);
    setIsAdmin(
      profile
        ? isAdminEmail(profile.email) || profile.role === "admin"
        : false
    );
  }, []);

  /** 앱 시작 시 저장된 토큰으로 세션 복원 */
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // 서버에 토큰 유효성 확인
        const profile = await fetchAPI<UserProfile>("/auth/me");
        updateUser(profile);
        await setUserCache(profile);
      } catch {
        // 토큰 만료 또는 무효 — 정리
        await removeToken();
        await removeUserCache();
        updateUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [updateUser]);

  /** 이메일/비밀번호 로그인 */
  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await fetchAPI<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await setToken(res.token);
      await setUserCache(res.user);
      updateUser(res.user);
    },
    [updateUser]
  );

  /** 회원가입 */
  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const res = await fetchAPI<AuthResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, displayName }),
      });
      await setToken(res.token);
      await setUserCache(res.user);
      updateUser(res.user);
    },
    [updateUser]
  );

  /** 로그아웃 */
  const signOut = useCallback(async () => {
    await removeToken();
    await removeUserCache();
    updateUser(null);
  }, [updateUser]);

  /** 프로필 새로고침 */
  const refreshProfile = useCallback(async () => {
    try {
      const profile = await fetchAPI<UserProfile>("/auth/me");
      updateUser(profile);
      await setUserCache(profile);
    } catch {
      // 토큰 만료 시 자동 로그아웃
      await signOut();
    }
  }, [updateUser, signOut]);

  /** 비밀번호 재설정 요청 */
  const resetPassword = useCallback(async (email: string) => {
    await fetchAPI("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        resetPassword,
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
