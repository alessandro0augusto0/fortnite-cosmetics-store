// frontend/src/lib/api.ts
import axios from 'axios';
import { getToken, clearToken } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:4000',
  timeout: 15000,
});

// Envia Authorization: Bearer <token> se existir
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o backend responder 401, limpamos o token (logout “silencioso”)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
      // opcional: podemos redirecionar para /login depois
    }
    return Promise.reject(err);
  }
);

export default api;
