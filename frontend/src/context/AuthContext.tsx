import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiRequest } from "../lib/api";
import type { ApiResponse, AuthPayload, User } from "../types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = "buyer_portal_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(TOKEN_STORAGE_KEY)
  );
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((payload: AuthPayload) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
    setToken(payload.token);
    setUser(payload.user);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiRequest<ApiResponse<AuthPayload>>("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      persistSession(response.data);
    },
    [persistSession]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await apiRequest<ApiResponse<AuthPayload>>(
        "/auth/register",
        {
          method: "POST",
          body: { name, email, password },
        }
      );

      persistSession(response.data);
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    const hydrateUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest<ApiResponse<User>>("/auth/me", {
          token,
        });
        setUser(response.data);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, [token, clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
