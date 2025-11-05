import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import CosmeticsPage from './pages/CosmeticsPage';

function Home() {
  return (
    <div className="max-w-3xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-semibold mb-3">Fortnite Cosmetics Store</h1>
      <p className="text-gray-400">Explore, filtre e descubra cosméticos do Fortnite.</p>
      <div className="mt-6">
        <Link to="/cosmetics" className="inline-block px-4 py-2 rounded-md border border-gray-700 hover:bg-gray-800">
          Ir para Cosméticos
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <header className="border-b border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-medium">Fortnite Cosmetics</Link>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/cosmetics" className="hover:underline">Cosméticos</Link>
          </div>
        </nav>
      </header>
      <main className="py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cosmetics" element={<CosmeticsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
