// frontend/src/pages/AuthPage.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../lib/api';
import { setToken } from '../lib/auth';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, { email, password });

      if (res.data?.token) {
        setToken(res.data.token);
        setMessage('✅ Autenticação bem-sucedida!');
        setTimeout(() => navigate('/cosmetics'), 1000);
      } else {
        setMessage('⚠️ Resposta inesperada do servidor.');
      }
    } catch (err: any) {
      console.error(err);
      setMessage('❌ Erro: ' + (err.response?.data?.message || 'Falha na autenticação.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
      <h2>{mode === 'login' ? 'Entrar' : 'Registrar'}</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : mode === 'login' ? 'Entrar' : 'Registrar'}
        </button>
      </form>

      <p style={{ marginTop: 12, cursor: 'pointer', color: 'blue' }}
         onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Criar uma conta' : 'Já tenho uma conta'}
      </p>

      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </div>
  );
}
