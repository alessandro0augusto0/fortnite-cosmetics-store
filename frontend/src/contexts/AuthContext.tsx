import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api, { fetchProfile } from '../lib/api';
import { 
  getToken, 
  setToken as storeToken, 
  clearToken as removeToken, 
  getUserEmail 
} from '../lib/auth';

type UserProfile = {
  id: string;
  email: string;
  vbucks: number;
  createdAt?: string;
} | null;

type AuthContextValue = {
  token: string | null;
  profile: UserProfile;
  vbucks: number | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  setVbucks: (n: number) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getToken() ?? null);
  const [profile, setProfile] = useState<UserProfile>(null);
  const [vbucks, setVbucksState] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Carrega o perfil quando o app inicia e quando o token é alterado
   */
  async function load() {
    setLoading(true);

    const stored = getToken();
    if (!stored) {
      setToken(null);
      setProfile(null);
      setVbucksState(null);
      setLoading(false);
      return;
    }

    setToken(stored);

    try {
      const p = await fetchProfile();
      if (p) {
        setProfile(p);
        setVbucksState(p.vbucks ?? null);
      } else {
        // fallback mínimo caso o token não traga perfil
        setProfile({ id: '', email: getUserEmail() ?? '', vbucks: 0 });
      }
    } catch (e) {
      console.error('Erro ao buscar perfil no init:', e);
      setProfile(null);
      setVbucksState(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /**
   * LOGIN
   */
  async function login(newToken: string) {
    storeToken(newToken);
    setToken(newToken);

    try {
      await refreshProfile();
    } catch (e) {
      console.error('Erro ao atualizar perfil após login', e);
    }
  }

  /**
   * LOGOUT
   */
  function logout() {
    removeToken();
    setToken(null);
    setProfile(null);
    setVbucksState(null);
  }

  /**
   * REFRESH PROFILE
   */
  async function refreshProfile() {
    try {
      const p = await fetchProfile();
      if (p) {
        setProfile(p);
        setVbucksState(p.vbucks ?? null);
      } else {
        setProfile(null);
        setVbucksState(null);
      }
    } catch (err: any) {
      console.error('refreshProfile error', err);
      toast.error('Erro ao atualizar perfil.');
      setProfile(null);
      setVbucksState(null);
      throw err;
    }
  }

  /**
   * ATUALIZAR SALDO GLOBAL
   */
  function setVbucks(n: number) {
    setVbucksState(n);
    setProfile((old) => (old ? { ...old, vbucks: n } : old));
  }

  return (
    <AuthContext.Provider 
      value={{ token, profile, vbucks, loading, login, logout, refreshProfile, setVbucks }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
