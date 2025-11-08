// frontend/src/lib/auth.ts
import { jwtDecode } from 'jwt-decode';

const KEY = 'auth_token';

export function getToken(): string | null {
  return localStorage.getItem(KEY);
}

export function setToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function clearToken() {
  localStorage.removeItem(KEY);
}

export type TokenPayload = {
  email?: string;
  sub?: string; // user id
  iat?: number;
  exp?: number;
};

export function getUserEmail(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded?.email ?? null;
  } catch {
    return null;
  }
}

export function getUserId(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded?.sub ?? null;
  } catch {
    return null;
  }
}

export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return true;
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    if (!decoded?.exp) return false; // se não tiver exp, assumimos válido
    // exp é em segundos unix
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}
