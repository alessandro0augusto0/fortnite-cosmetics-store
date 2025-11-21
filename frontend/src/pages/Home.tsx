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
    <div className="min-h-screen bg-gray-100 py-10">
      <header className="mx-auto mb-10 max-w-6xl px-6">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[6px] text-blue-200">Fortnite Market</p>
              <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">Descubra cosméticos lendários com curadoria ESO</h1>
              <p className="mt-3 max-w-xl text-sm text-blue-100">Filtros avançados, estoque atualizado em tempo real e experiência premium inspirada em lojas AAA do mercado gamer.</p>
            </div>
            <div className="w-full max-w-md rounded-2xl bg-white/10 p-1 shadow-inner">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por nome, raridade ou tipo..."
                  className="w-full rounded-xl border border-transparent bg-white/90 py-3 pl-12 pr-4 text-base font-medium text-gray-900 placeholder:text-gray-500 focus:border-blue-300 focus:outline-none"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="mb-8 grid gap-4 rounded-3xl bg-white p-6 shadow-lg lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Filter size={20} />
            </span>
            Filtros inteligentes
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              name="type"
              onChange={handleFilterChange}
              value={filters.type}
              className="h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Todos Tipos</option>
              <option value="outfit">Trajes</option>
              <option value="backpack">Mochilas</option>
              <option value="pickaxe">Picaretas</option>
              <option value="glider">Planadores</option>
            </select>

            <select
              name="rarity"
              onChange={handleFilterChange}
              value={filters.rarity}
              className="h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="">Todas Raridades</option>
              <option value="common">Comum</option>
              <option value="rare">Raro</option>
              <option value="epic">Épico</option>
              <option value="legendary">Lendário</option>
            </select>

            <label className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
              <input type="checkbox" name="isOnSale" checked={filters.isOnSale} onChange={handleFilterChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              À venda agora
            </label>

            <label className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
              <input type="checkbox" name="isNew" checked={filters.isNew} onChange={handleFilterChange} className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              Novidades
            </label>
          </div>
        </section>

        {isLoading ? (
          <div className="rounded-3xl bg-white py-20 text-center text-gray-500 shadow">
            Carregando catálogo premium...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data?.data?.map((item: Cosmetic) => (
                <CosmeticCard key={item.id} item={item} />
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                className="inline-flex items-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-sm font-semibold text-gray-600">
                Página <span className="text-gray-900">{page}</span> de {data?.meta?.lastPage || 1}
              </span>
              <button
                type="button"
                disabled={page >= (data?.meta?.lastPage || 1)}
                onClick={() => setPage((old) => old + 1)}
                className="inline-flex items-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
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
