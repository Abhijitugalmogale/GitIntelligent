import { useState, createContext, useContext, useCallback } from "react";
import { getAuthenticatedUser, GitHubUser } from "@/services/githubApi";

const TOKEN_KEY = "gh_pat";
const USER_KEY = "gh_user";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: { name: string; avatar: string; login: string } | null;
  login: (username: string, token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  user: null,
  login: async () => { },
  logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

function storedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function toUser(gh: GitHubUser) {
  return {
    name: gh.name || gh.login,
    avatar: gh.avatar_url,
    login: gh.login,
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<AuthContextType["user"]>(() => storedUser());

  const login = useCallback(async (username: string, pat: string) => {
    // Validate by fetching the authenticated user — throws on bad credentials
    const ghUser = await getAuthenticatedUser(pat);

    if (ghUser.login.toLowerCase() !== username.toLowerCase()) {
      throw new Error(
        "Token does not belong to that username. Please double-check."
      );
    }

    const userData = toUser(ghUser);
    localStorage.setItem(TOKEN_KEY, pat);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(pat);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!token && !!user, token, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
