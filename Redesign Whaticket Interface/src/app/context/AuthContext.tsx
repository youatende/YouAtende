import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  getToken,
  isDemoMode,
  enableDemo,
  disableDemo,
  clearTokens,
  getBackendUrl,
  setBackendUrl,
  isConnected,
} from "../services/api";
import { login as apiLogin, getMe, logout as apiLogout, AuthUser } from "../services/authService";

/* ── Demo user (no backend) ──────────────────────────────────── */
const DEMO_USER: AuthUser = {
  id: 0,
  name: "Lucca Americo",
  email: "demo@youtickets.com.br",
  profile: "admin",
  company: { id: 0, name: "YouTickets Demo", plan: "Premium" },
};

/* ── Context types ───────────────────────────────────────────── */
export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  /** true = running with mock data, no real backend */
  isDemo: boolean;
  backendUrl: string;
  /**
   * Login with email + password (real API).
   * Pass `backendUrl` to set/update the server URL before logging in.
   */
  login: (email: string, password: string, backendUrl?: string) => Promise<void>;
  /** Switch to demo mode without a backend. */
  enterDemo: () => void;
  logout: () => void;
  setUrl: (url: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isDemo: true,
  backendUrl: "",
  login: async () => {},
  enterDemo: () => {},
  logout: () => {},
  setUrl: () => {},
});

/* ── Provider ────────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendUrl, setBackendUrlState] = useState(getBackendUrl());

  const isDemo = !user || user.id === 0;

  /* On mount: restore session */
  useEffect(() => {
    const restore = async () => {
      try {
        if (isDemoMode()) {
          setUser(DEMO_USER);
          return;
        }
        const token = getToken();
        const url = getBackendUrl();
        if (token && url) {
          const me = await getMe();
          setUser(me);
        }
      } catch {
        clearTokens();
      } finally {
        setLoading(false);
      }
    };
    restore();

    const handleForceLogout = () => {
      setUser(null);
      disableDemo();
    };
    window.addEventListener("youtickets:logout", handleForceLogout);
    return () => window.removeEventListener("youtickets:logout", handleForceLogout);
  }, []);

  const login = useCallback(async (email: string, password: string, url?: string) => {
    if (url) {
      setBackendUrl(url);
      setBackendUrlState(url);
    }
    disableDemo();
    const res = await apiLogin(email, password);
    setUser(res.user);
  }, []);

  const enterDemo = useCallback(() => {
    disableDemo();   // clear flag first
    enableDemo();    // then set it
    setUser(DEMO_USER);
  }, []);

  const logout = useCallback(() => {
    apiLogout().catch(() => {});
    clearTokens();
    disableDemo();
    setUser(null);
  }, []);

  const setUrl = useCallback((url: string) => {
    setBackendUrl(url);
    setBackendUrlState(url);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, backendUrl, login, enterDemo, logout, setUrl }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
