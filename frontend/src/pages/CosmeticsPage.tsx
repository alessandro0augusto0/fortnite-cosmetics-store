import { useEffect, useMemo, useState } from 'react';
import { CosmeticCard } from '../components/CosmeticCard';
import FilterControls, { type CosmeticFilters } from '../components/store/FilterControls';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { api } from '../services/api';

interface CosmeticsResponse {
  data: any[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

const defaultFilters: CosmeticFilters = {
  search: '',
  type: '',
  rarity: '',
  isNew: false,
  isOnSale: false,
};

export default function CosmeticsPage() {
  const [filters, setFilters] = useState<CosmeticFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [response, setResponse] = useState<CosmeticsResponse>({
    data: [],
    meta: { page: 1, lastPage: 1, total: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const params = {
          page,
          search: filters.search || undefined,
          type: filters.type || undefined,
          rarity: filters.rarity || undefined,
          isNew: filters.isNew ? 'true' : undefined,
          isOnSale: filters.isOnSale ? 'true' : undefined,
        };

        const { data } = await api.get('/cosmetics', { params });

        if (active) {
          setResponse({
            data: data?.data ?? [],
            meta: data?.meta ?? { page: 1, lastPage: 1, total: 0 },
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [page, filters]);

  const hasMore = useMemo(() => page < (response.meta.lastPage || 1), [page, response.meta.lastPage]);

  const handleFiltersChange = (next: CosmeticFilters) => {
    setFilters(next);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8 text-white">
        <p className="text-sm uppercase tracking-[4px] text-purple-400 mb-2">Fortnite Market</p>
        <h1 className="text-3xl font-black">Catálogo de Cosméticos</h1>
        <p className="text-gray-400 mt-2">Filtre por raridade, tipo ou status da loja em tempo real.</p>
      </div>

      <FilterControls value={filters} onChange={handleFiltersChange} onReset={handleResetFilters} />

      {loading ? (
        <div className="mt-16">
          <Spinner />
        </div>
      ) : (
        <>
          {response.data.length === 0 ? (
            <div className="text-center text-gray-400 mt-16">Nenhum cosmético encontrado.</div>
          ) : (
            <div className="grid gap-6 mt-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {response.data.map((item) => (
                <CosmeticCard key={item.id} item={item} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-10">
            <Button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="bg-gray-800 border border-gray-700 text-gray-200 disabled:opacity-40"
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-400">
              Página <strong className="text-white">{response.meta.page}</strong> de{' '}
              <strong className="text-white">{response.meta.lastPage || 1}</strong>
            </span>
            <Button
              type="button"
              disabled={!hasMore}
              onClick={() => setPage((prev) => prev + 1)}
              className="bg-purple-600 text-white disabled:opacity-40"
            >
              Próxima
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
