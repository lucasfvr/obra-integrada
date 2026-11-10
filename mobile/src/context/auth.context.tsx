import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ApiError, setUnauthorizedHandler } from '../services/api';
import { login, validateSession } from '../services/auth';
import type { Session } from '../shared/types';

const TOKEN_KEY = 'obra_integrada_jwt';
type AuthContextType = {
  session: Session | null;
  loading: boolean;
  startupError: string | null;
  handleAuthenticate: (username: string, password: string) => Promise<void>;
  handleLogout: () => Promise<void>;
  retryStartup: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [startupError, setStartupError] = useState<string | null>(null);

  const retryStartup = useCallback(async () => {
    setLoading(true);
    setStartupError(null);
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        setSession(null);
        return;
      }
      try {
        const user = await validateSession(token);
        setSession({ token, user });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          setSession(null);
        } else {
          setStartupError('Não foi possível validar a sessão. Confira a conexão e tente novamente.');
        }
      }
    } catch {
      setStartupError('Falha ao abrir a sessão segura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void retryStartup(); }, [retryStartup]);

  useEffect(() => {
    setUnauthorizedHandler(async token => {
      const currentToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (currentToken !== token) return;
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setSession(current => current?.token === token ? null : current);
      setStartupError(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const handleAuthenticate = useCallback(async (username: string, password: string) => {
    const response = await login(username, password);
    if (!response.token || !response.user) throw new Error('Login sem dados de sessão.');
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
    setSession({ token: response.token, user: response.user });
    setStartupError(null);
  }, []);

  const handleLogout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setSession(null);
  }, []);

  const value = useMemo(() => ({
    session, loading, startupError, handleAuthenticate, handleLogout, retryStartup
  }), [session, loading, startupError, handleAuthenticate, handleLogout, retryStartup]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuthContext requer AuthContextProvider.');
  return value;
}
