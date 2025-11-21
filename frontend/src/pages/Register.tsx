import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.post('/register', { email, password });
      signIn(response.data.token, response.data.user);
      alert('Conta criada! Você ganhou 10.000 V-Bucks!');
      navigate('/');
    } catch (error) {
      alert('Erro ao criar conta.');
    }
  };

  return (
    <section className="min-h-screen bg-gray-100 py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-10 shadow-xl">
          <h2 className="text-3xl font-black text-gray-900">Crie sua conta</h2>
          <p className="mt-2 text-sm text-gray-500">Ganhe 10.000 V-Bucks de boas-vindas e desbloqueie ofertas exclusivas.</p>

          <form onSubmit={handleRegister} className="mt-8 space-y-6">
            <label className="block text-sm font-semibold text-gray-700">
              Email
              <input
                type="email"
                placeholder="seuemail@epic.com"
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="block text-sm font-semibold text-gray-700">
              Senha
              <input
                type="password"
                placeholder="Crie uma senha segura"
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-purple-600 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-purple-700"
            >
              Ganhar 10.000 V-Bucks
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Já tem conta?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Faça login
            </Link>
          </p>
        </div>

        <div className="hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-10 text-white shadow-2xl md:block">
          <p className="text-xs uppercase tracking-[6px] text-white/70">Benefícios exclusivos</p>
          <h3 className="mt-4 text-4xl font-black leading-snug">Ofertas relâmpago, cashback em V-Bucks e inventário ilimitado.</h3>
          <ul className="mt-8 space-y-4 text-sm text-white/90">
            <li>• Sync automático com loja e atualização diária.</li>
            <li>• Dashboards com histórico e reembolsos rápidos.</li>
            <li>• Comunidade pública para compartilhar coleções.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
