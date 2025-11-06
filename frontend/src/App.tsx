import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CosmeticsPage from './pages/CosmeticsPage';
import AuthPage from './pages/AuthPage';
import { getToken, clearToken } from './lib/auth';
import ProtectedRoute from './components/ProtectedRoute';

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

function Header() {
  const [isLogged, setIsLogged] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    setIsLogged(!!token);
  }, []);

  function handleLogout() {
    clearToken();
    setIsLogged(false);
    navigate('/auth');
  }

  return (
    <header className="border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-medium">
          Fortnite Cosmetics
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/cosmetics" className="hover:underline">
            Cosméticos
          </Link>
          {isLogged ? (
            <>
              <span className="text-gray-400">Bem-vindo, jogador!</span>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 underline"
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
