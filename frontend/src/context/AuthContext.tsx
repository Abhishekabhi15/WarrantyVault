import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  api,
  configureApiClient,
  getStoredToken,
  setStoredToken,
  type User,
} from '@/lib/api';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthState = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await api.getAuthMe();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    configureApiClient({
      token,
      onUnauthorized: clearAuthState,
    });
  }, [clearAuthState, token]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await api.getAuthMe();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        if (!cancelled) {
          clearAuthState();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [clearAuthState, token]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const authResponse = await api.login({ email, password });
      setStoredToken(authResponse.access_token);
      setToken(authResponse.access_token);
      const currentUser = await api.getAuthMe();
      setUser(currentUser);
    } catch (error) {
      clearAuthState();
      throw error;
    }
  }, [clearAuthState]);

  const register = useCallback(
    async (payload: { name: string; email: string; password: string }) => {
      await api.register(payload);
      await login(payload.email, payload.password);
    },
    [login],
  );

  const logout = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [isLoading, login, logout, refreshUser, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
