// frontend/src/lib/api.ts
import axios from 'axios';
import { getToken, clearToken } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:4000',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(err);
  }
);

// ==============================
// PERFIL (Auth)
// ==============================
export async function fetchProfile() {
  try {
    const res = await api.get('/auth/me');
    return res.data; // { id, email, vbucks, createdAt }
  } catch (err: any) {
    if (err?.response?.status === 401) {
      clearToken();
      return null;
    }
    console.error('Erro ao buscar perfil:', err.message || err);
    return null;
  }
}

// ==============================
// SHOP (Compras)
// ==============================
export async function buyCosmetic(cosmeticId: string, cosmeticName: string, price: number) {
  const res = await api.post('/shop/buy', { cosmeticId, cosmeticName, price });
  return res.data; // { message, newBalance }
}

export async function getPurchases() {
  const res = await api.get('/shop/purchases');
  return res.data; // array de compras
}

export default api;
