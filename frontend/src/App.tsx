import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CosmeticsPage from './pages/CosmeticsPage';
import CosmeticDetailsPage from './pages/CosmeticDetailsPage'; // <--- NOVO
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from "./components/Header";

function Home() {
  return (
    <div className="max-w-3xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-semibold mb-3">Fortnite Cosmetics Store</h1>
      <p className="text-gray-400">Explore, filtre e descubra cosméticos do Fortnite.</p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <a
          href="/cosmetics"
          className="inline-block px-4 py-2 rounded-md border border-gray-700 hover:bg-gray-800"
        >
          Ir para Cosméticos
        </a>
        <a
          href="/auth"
          className="inline-block px-4 py-2 rounded-md border border-gray-700 hover:bg-gray-800"
        >
          Fazer Login / Registrar
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <main className="py-6">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* LISTAGEM DE COSMÉTICOS */}
          <Route
            path="/cosmetics"
            element={
              <ProtectedRoute>
                <CosmeticsPage />
              </ProtectedRoute>
            }
          />

          {/* DETALHES DO COSMÉTICO */}
          <Route
            path="/cosmetic/:id"
            element={
              <ProtectedRoute>
                <CosmeticDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* LOGIN */}
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
