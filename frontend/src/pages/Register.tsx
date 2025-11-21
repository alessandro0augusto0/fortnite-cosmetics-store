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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-2 text-center text-green-600">Cadastro</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">Ganhe 10.000 V-Bucks agora!</p>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full p-2 mb-6 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Criar Conta e Ganhar Créditos
        </button>
        <p className="mt-4 text-center text-sm">
          Já tem conta?{' '}
          <Link to="/login" className="text-blue-600 font-bold">
            Faça Login
          </Link>
        </p>
      </form>
    </div>
  );
}
