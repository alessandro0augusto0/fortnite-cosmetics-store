// frontend/src/lib/api.ts
import axios from 'axios';
import { getToken, clearToken } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000',
  timeout: 15000,
});

// ============================================
// INTERCEPTORS (TOKEN)
// ============================================
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

// ============================================
// PERFIL (Auth)
// ============================================
export async function fetchProfile() {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 401) {
      clearToken();
      return null;
    }
    console.error('Erro ao buscar perfil:', err.message);
    return null;
  }
}

// ============================================
// COSMETICS
// ============================================

export async function fetchCosmetics(params?: {
  page?: number;
  search?: string;
  type?: string;
  rarity?: string;
  isNew?: string;
  isOnSale?: string;
}) {
  const res = await api.get('/cosmetics', { params });
  return res.data;
}

// GET /cosmetics/:id — Detalhes
export async function getCosmeticById(id: string) {
  const res = await api.get(`/cosmetics/${id}`);
  return res.data;
}

export const fetchCosmeticById = getCosmeticById;

// ============================================
// SHOP (Compras)
// ============================================
export async function buyCosmetic(cosmeticId: string, cosmeticName: string, price: number) {
  const res = await api.post('/shop/buy', { cosmeticId, cosmeticName, price });
  return res.data;
}

export async function getPurchases() {
  const res = await api.get('/shop/purchases');
  return res.data;
}

// POST /shop/return
export async function returnCosmetic(purchaseId: string) {
  const res = await api.post('/shop/return', { purchaseId });
  return res.data;
}

export default api;
