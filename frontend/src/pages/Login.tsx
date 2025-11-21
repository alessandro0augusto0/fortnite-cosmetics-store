import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.post('/login', { email, password });
      signIn(response.data.token, response.data.user);
      navigate('/');
    } catch (error) {
      alert('Erro no login. Verifique suas credenciais.');
    }
  };

  return (
    <section className="min-h-screen bg-gray-100 py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 md:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700 p-10 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-[6px] text-blue-200">Bem-vindo de volta</p>
          <h1 className="mt-4 text-4xl font-black leading-tight">Acesse sua conta ESO e continue comprando cosméticos lendários.</h1>
          <ul className="mt-6 space-y-3 text-sm text-blue-100">
            <li>• Sincronização em tempo real com a loja Fortnite.</li>
            <li>• Histórico de compras, inventário e reembolsos inteligentes.</li>
            <li>• Segurança nível enterprise com autenticação JWT.</li>
          </ul>
        </div>

        <form onSubmit={handleLogin} className="rounded-3xl bg-white p-10 shadow-xl">
          <h2 className="text-3xl font-black text-gray-900">Entrar</h2>
          <p className="mt-2 text-sm text-gray-500">Use seus dados cadastrados para continuar navegando.</p>

          <label className="mt-8 block text-sm font-semibold text-gray-700">
            Email
            <input
              type="email"
              placeholder="seuemail@epic.com"
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="mt-6 block text-sm font-semibold text-gray-700">
            Senha
            <input
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="mt-8 w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700"
          >
            Entrar agora
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Não tem conta?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Cadastre-se grátis
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
