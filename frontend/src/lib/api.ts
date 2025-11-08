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
      // opcional: redirecionamento global para /auth pode ser feito aqui
    }
    return Promise.reject(err);
  }
);

/**
 * Helper para buscar perfil do usuário no backend (se existir endpoint /auth/me).
 * Se o endpoint não existir, o catch vai falhar graciosamente.
 */
export async function fetchProfile() {
  const res = await api.get('/auth/me'); // backend: opcional, se existir
  return res.data;
}

export default api;
