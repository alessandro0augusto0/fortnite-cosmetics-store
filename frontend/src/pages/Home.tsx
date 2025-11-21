import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Search, Filter } from 'lucide-react';
import { api } from '../services/api';
import { CosmeticCard } from '../components/CosmeticCard';

interface Filters {
  type: string;
  rarity: string;
  isNew: boolean;
  isOnSale: boolean;
}

interface Cosmetic {
  id: string;
  name: string;
  image: string | null;
  rarity: string;
  price: number;
  isNew: boolean;
  isOnSale: boolean;
}

interface CosmeticsResponse {
  data: Cosmetic[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export function Home() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({ type: '', rarity: '', isNew: false, isOnSale: false });

  const { data, isLoading } = useQuery<CosmeticsResponse>({
    queryKey: ['cosmetics', page, search, filters],
    queryFn: async () => {
      const params = {
        page,
        search: search || undefined,
        type: filters.type || undefined,
        rarity: filters.rarity || undefined,
        isNew: filters.isNew ? 'true' : undefined,
        isOnSale: filters.isOnSale ? 'true' : undefined,
      };
      const response = await api.get('/cosmetics', { params });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    if (type === 'checkbox') {
      const checked = (target as HTMLInputElement).checked;
      setFilters((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl md:text-5xl font-black text-blue-600 tracking-tight">
          SISTEMA ESO <span className="text-gray-800 text-2xl">Fortnite Market</span>
        </h1>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar cosmético..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 font-bold text-gray-600">
            <Filter size={18} /> Filtros:
          </div>

          <select name="type" onChange={handleFilterChange} className="border p-2 rounded" value={filters.type}>
            <option value="">Todos Tipos</option>
            <option value="outfit">Trajes</option>
            <option value="backpack">Mochilas</option>
            <option value="pickaxe">Picaretas</option>
            <option value="glider">Planadores</option>
          </select>

          <select name="rarity" onChange={handleFilterChange} className="border p-2 rounded" value={filters.rarity}>
            <option value="">Todas Raridades</option>
            <option value="common">Comum</option>
            <option value="rare">Raro</option>
            <option value="epic">Épico</option>
            <option value="legendary">Lendário</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" name="isOnSale" checked={filters.isOnSale} onChange={handleFilterChange} className="w-4 h-4 accent-blue-600" />
            À venda
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" name="isNew" checked={filters.isNew} onChange={handleFilterChange} className="w-4 h-4 accent-blue-600" />
            Novidades
          </label>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-500">Carregando catálogo...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data?.data?.map((item: Cosmetic) => (
                <CosmeticCard key={item.id} item={item} />
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-10">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                className="px-4 py-2 bg-white border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Anterior
              </button>
              <span className="px-4 py-2 font-bold">
                Página {page} de {data?.meta?.lastPage || 1}
              </span>
              <button
                type="button"
                disabled={page >= (data?.meta?.lastPage || 1)}
                onClick={() => setPage((old) => old + 1)}
                className="px-4 py-2 bg-white border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Próxima
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
