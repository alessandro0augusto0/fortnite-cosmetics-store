// frontend/src/pages/AuthPage.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, { email, password });

      if (!res.data?.token) {
        toast.error('Resposta inesperada do servidor.');
        return;
      }

      const token = res.data.token;

      // Autentica globalmente via AuthProvider
      await login(token);

      toast.success(
        mode === 'login'
          ? 'Login realizado com sucesso!'
          : 'Conta criada! Você já está logado.'
      );

      navigate('/cosmetics');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Falha na autenticação.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 mt-10 bg-gray-800 rounded-xl border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-center">
        {mode === 'login' ? 'Entrar' : 'Criar conta'}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="E-mail"
          className="px-3 py-2 rounded bg-gray-900 border border-gray-700 focus:outline-none"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="px-3 py-2 rounded bg-gray-900 border border-gray-700 focus:outline-none"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-500 text-black font-semibold py-2 rounded-md hover:bg-yellow-400 transition"
        >
          {loading
            ? 'Enviando...'
            : mode === 'login'
            ? 'Entrar'
            : 'Registrar'}
        </button>
      </form>

      <p
        className="text-center text-sm text-blue-400 mt-4 cursor-pointer hover:underline"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        {mode === 'login'
          ? 'Criar uma conta'
          : 'Já tenho uma conta'}
      </p>
    </div>
  );
}
