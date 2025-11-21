import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Coins } from 'lucide-react';

import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { Home } from './pages/Home.tsx';
import { Login } from './pages/Login.tsx';
import { Register } from './pages/Register.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { UsersPage } from './pages/UsersPage.tsx';
import { UserProfilePage } from './pages/UserProfilePage.tsx';
import { CosmeticDetailsPage } from './pages/CosmeticDetailsPage.tsx';

const queryClient = new QueryClient();

function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-2xl font-black tracking-tight text-gray-900">
            SISTEMA <span className="text-blue-600">ESO</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-gray-600 md:flex">
            <Link to="/" className="transition hover:text-blue-600">
              Loja
            </Link>
            <Link to="/users" className="transition hover:text-blue-600">
              Comunidade
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-semibold text-yellow-800 shadow-inner">
                <Coins size={16} /> {user.vbucks.toLocaleString('pt-BR')} V-Bucks
              </span>
              <Link to="/dashboard" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-500 hover:text-blue-600">
                Meus Itens
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sair
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-gray-600 transition hover:text-blue-600">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700">
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cosmetics/:id" element={<CosmeticDetailsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserProfilePage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;