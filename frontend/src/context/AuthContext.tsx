import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

import api from '../lib/api';
import type { LoginPayload, RegisterPayload, User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasKnownSession = (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem('marketplace_session') === 'active';
  };

  const setKnownSession = (isActive: boolean): void => {
    if (typeof window === 'undefined') {
      return;
    }

    if (isActive) {
      window.localStorage.setItem('marketplace_session', 'active');
      return;
    }

    window.localStorage.removeItem('marketplace_session');
  };

  const refreshUser = async (): Promise<void> => {
    if (!hasKnownSession()) {
      setUser(null);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user as User);
    } catch {
      setKnownSession(false);
      setUser(null);
    }
  };

  useEffect(() => {
    void refreshUser().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as typeof error.config & { __retry?: boolean };

        if (error.response?.status === 401 && !originalRequest.__retry) {
          originalRequest.__retry = true;

          try {
            await api.post('/auth/refresh-token');
            return await api(originalRequest);
          } catch {
            setKnownSession(false);
            setUser(null);
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, []);

  const login = async (payload: LoginPayload): Promise<User> => {
    const { data } = await api.post('/auth/login', payload);
    setKnownSession(true);
    setUser(data.user as User);
    return data.user as User;
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    const { data } = await api.post('/auth/register', payload);
    setKnownSession(true);
    setUser(data.user as User);
    return data.user as User;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      setKnownSession(false);
      setUser(null);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, login, register, logout, refreshUser }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
