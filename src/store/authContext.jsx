import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import { AUTH_TOKEN_KEY } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((token) => {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
    else localStorage.removeItem(AUTH_TOKEN_KEY);
  }, []);

  /** Load profile using session cookie and/or Bearer token. Returns user object or null. */
  const loadUser = useCallback(async () => {
    try {
      const data = await authService.getMe();
      const userObj = data?.data?.user ?? data?.user ?? data;
      const u = userObj && typeof userObj === 'object' ? userObj : null;
      setUser(u);
      return u;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setToken(null);
      }
      setUser(null);
      return null;
    }
  }, [setToken]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadUser();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadUser]);

  const getTokenFromResponse = useCallback((data) => {
    return (
      data?.token ??
      data?.accessToken ??
      data?.access_token ??
      data?.jwt ??
      data?.data?.token
    );
  }, []);

  const login = useCallback(
    async (email, password) => {
      try {
        const data = await authService.login({ email, password });
        const token = getTokenFromResponse(data);
        if (token) setToken(token);
        const u = await loadUser();
        if (u) return { success: true };
        return {
          success: false,
          message:
            'Signed in but profile could not be loaded. Check cookies (withCredentials) and backend CORS (Allow-Credentials).',
        };
      } catch (err) {
        const msg =
          err?.response?.data?.message ??
          err?.response?.data?.detail ??
          err?.message ??
          'Login failed';
        return { success: false, message: typeof msg === 'string' ? msg : 'Login failed' };
      }
    },
    [setToken, loadUser, getTokenFromResponse]
  );

  const registerUser = useCallback(
    async (payload) => {
      try {
        const data = await authService.register(payload);
        const token = getTokenFromResponse(data);
        if (token) setToken(token);
        const u = await loadUser();
        if (u) return { success: true };
        return {
          success: false,
          message: 'Account may be created. Sign in if you were not logged in automatically.',
        };
      } catch (err) {
        const msg =
          err?.response?.data?.message ??
          err?.response?.data?.detail ??
          err?.message ??
          'Registration failed';
        return { success: false, message: typeof msg === 'string' ? msg : 'Registration failed' };
      }
    },
    [setToken, loadUser, getTokenFromResponse]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // still clear local state so UI logs out
    }
    setToken(null);
    setUser(null);
  }, [setToken]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register: registerUser,
    logout,
    setToken,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
