import { useState, createContext, useContext, useCallback, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  user: { name: string; avatar: string; login: string } | null;
  loginWithGitHub: () => void;
  logout: () => Promise<void>;
  fetchSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  token: null,
  user: null,
  loginWithGitHub: () => { },
  logout: async () => { },
  fetchSession: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUser({
          name: data.user?.name || data.user?.login,
          avatar: data.user?.avatar_url,
          login: data.user?.login,
        });
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.error("Failed to fetch session", e);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const loginWithGitHub = useCallback(() => {
    window.location.href = "/api/auth/github";
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout failed", e);
    }
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!token && !!user, isLoading, token, user, loginWithGitHub, logout, fetchSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};
