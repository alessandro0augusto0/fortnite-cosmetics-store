// frontend/src/App.tsx
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CosmeticsPage from './pages/CosmeticsPage';
import AuthPage from './pages/AuthPage';
import { getToken, clearToken, getUserEmail, getUserId, isTokenExpired } from './lib/auth';
import ProtectedRoute from './components/ProtectedRoute';
import api, { fetchProfile } from './lib/api';

function Home() {
  return (
    <div className="max-w-3xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-semibold mb-3">Fortnite Cosmetics Store</h1>
      <p className="text-gray-400">Explore, filtre e descubra cosméticos do Fortnite.</p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <Link
          to="/cosmetics"
          className="inline-block px-4 py-2 rounded-md border border-gray-700 hover:bg-gray-800"
        >
          Ir para Cosméticos
        </Link>
        <Link
          to="/auth"
          className="inline-block px-4 py-2 rounded-md border border-gray-700 hover:bg-gray-800"
        >
          Fazer Login / Registrar
        </Link>
      </div>
    </div>
  );
}

function Avatar({ label }: { label: string }) {
  // circle with initials (or first letter)
  const initial = label?.charAt(0)?.toUpperCase() ?? '?';
  return (
    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">
      {initial}
    </div>
  );
}

function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [vbucks, setVbucks] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // se token inválido ou expirado, limpamos
    if (!getToken() || isTokenExpired()) {
      clearToken();
      setEmail(null);
      setVbucks(null);
      return;
    }

    const localEmail = getUserEmail();
    setEmail(localEmail);

    // tenta buscar profile no backend (se endpoint existir)
    (async () => {
      try {
        const profile = await fetchProfile(); // espera { email, vbucks, ... }
        if (profile?.email) setEmail(profile.email);
        if (typeof profile?.vbucks === 'number') setVbucks(profile.vbucks);
      } catch (err) {
        // fallback: se não existir endpoint, podemos tentar usar um valor padrão
        // ou manter null (mostramos fallback visual)
        // console.debug('fetchProfile falhou (ok):', err);
        // opcional: tentar buscar vbucks localmente (se tiver)
        setVbucks(null);
      }
    })();
  }, []);

  function handleLogout() {
    clearToken();
    setEmail(null);
    setVbucks(null);
    navigate('/auth');
  }

  const isLogged = !!email;

  // formata nome curto (antes do @)
  const shortName = email ? email.split('@')[0] : null;

  return (
    <header className="border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-medium">
          Fortnite Cosmetics
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/cosmetics" className="hover:underline">
            Cosméticos
          </Link>

          {isLogged ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar label={shortName ?? 'U'} />
                <div className="text-xs text-gray-300">
                  <div>Bem-vindo, <strong className="text-white">{shortName}</strong></div>
                  <div className="text-[11px] text-gray-400">
                    V-Bucks: {vbucks !== null ? vbucks.toLocaleString() : '—'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="ml-3 text-red-400 hover:text-red-300 underline text-sm"
              >
                Sair
              </button>
            </>
          ) : (
            <Link to="/auth" className="hover:underline">
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/cosmetics"
            element={
              <ProtectedRoute>
                <CosmeticsPage />
              </ProtectedRoute>
            }
          />

          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
