import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';

const queryClient = new QueryClient();

function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b p-4 mb-6 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-blue-600">
          SISTEMA ESO
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">{user.vbucks} V$</span>
              <Link to="/dashboard" className="hover:underline">
                Meus Itens
              </Link>
              <button type="button" onClick={signOut} className="text-red-500 hover:text-red-700">
                Sair
              </button>
            </>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-blue-600">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
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
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
