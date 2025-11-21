import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';

interface UserItem {
  id: string;
  cosmeticId: string;
  cosmetic?: any;
}

interface User {
  id: string;
  email: string;
  vbucks: number;
  items?: UserItem[];
}

interface AuthContextData {
  user: User | null;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signOut = () => {
    localStorage.removeItem('eso_token');
    localStorage.removeItem('eso_user');
    delete api.defaults.headers.common.Authorization;
    setUser(null);
    window.location.href = '/';
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/me');
      setUser(response.data);
      localStorage.setItem('eso_user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to refresh user', error);
      signOut();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('eso_token');
    const storedUser = localStorage.getItem('eso_user');
    if (token && storedUser) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
      refreshUser();
    }
  }, []);

  const signIn = (token: string, userData: User) => {
    localStorage.setItem('eso_token', token);
    localStorage.setItem('eso_user', JSON.stringify(userData));
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
