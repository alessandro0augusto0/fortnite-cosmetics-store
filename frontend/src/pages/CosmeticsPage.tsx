import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import type { Cosmetic } from '../types/cosmetic';

type Source = 'all' | 'new' | 'shop';

const PAGE_SIZE = 24;

export default function CosmeticsPage() {
  const [source, setSource] = useState<Source>('all');
  const [data, setData] = useState<Cosmetic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filtros locais (client-side inicialmente)
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [rarity, setRarity] = useState('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // paginação
  const [page, setPage] = useState(1);

  useEffect(() => {
    let canceled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setPage(1); // reset ao trocar a fonte
      try {
        const endpoint =
          source === 'all' ? '/cosmetics' :
          source === 'new' ? '/cosmetics/new' :
          '/cosmetics/shop';

        const res = await api.get(endpoint);
        // Nossa API retorna no formato da Fortnite API:
        // { status: 200, data: { br: [...] } } ou { data: [...] }
        const payload = res.data?.data;
        const arr: Cosmetic[] = Array.isArray(payload?.br) ? payload.br : (Array.isArray(payload) ? payload : []);
        if (!canceled) setData(arr);
      } catch (e: any) {
        if (!canceled) setError(e?.message ?? 'Erro ao carregar dados');
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    return () => { canceled = true; };
  }, [source]);

  const filtered = useMemo(() => {
    const norm = (s: string) => s?.toLowerCase() ?? '';
    return data.filter(item => {
      const matchName = q ? norm(item.name).includes(norm(q)) : true;
      const matchType = type ? norm(item.type?.value ?? '') === norm(type) : true;
      const matchRarity = rarity ? norm(item.rarity?.value ?? '') === norm(rarity) : true;

      let matchDate = true;
      if (dateFrom || dateTo) {
        const added = item.added ? new Date(item.added).getTime() : NaN;
        if (!isNaN(added)) {
          if (dateFrom) {
            matchDate = matchDate && (added >= new Date(dateFrom).getTime());
          }
          if (dateTo) {
            // incluir o fim do dia
            const end = new Date(dateTo);
            end.setHours(23,59,59,999);
            matchDate = matchDate && (added <= end.getTime());
          }
        }
      }

      return matchName && matchType && matchRarity && matchDate;
    });
  }, [data, q, type, rarity, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Cosméticos</h1>

      {/* Seletor de fonte */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'new', label: 'Novos' },
          { key: 'shop', label: 'À venda' },
        ].map(b => (
          <button
            key={b.key}
            onClick={() => setSource(b.key as Source)}
            className={`px-3 py-1 rounded-md border ${source === b.key ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-700 hover:bg-gray-800'}`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        <div className="lg:col-span-2">
          <label className="text-sm text-gray-400">Buscar por nome</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ex.: Renegade, Peely..."
            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">Tipo</label>
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="outfit, backpack, pickaxe..."
            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">Raridade</label>
          <input
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            placeholder="rare, epic, legendary..."
            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">Data inicial</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">Data final</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 outline-none"
          />
        </div>
      </div>

      {/* Conteúdo */}
      {loading && <div className="text-sm text-gray-400">Carregando...</div>}
      {error && <div className="text-sm text-red-400">Erro: {error}</div>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {pageItems.map(item => (
              <article key={item.id} className="rounded-xl border border-gray-800 bg-gray-900/60 p-3 hover:border-gray-700">
                <div className="aspect-square rounded-lg bg-gray-800/70 flex items-center justify-center overflow-hidden">
                  {/* imagem: preferimos icon, fallback smallIcon */}
                  <img
                    src={item.images?.icon || item.images?.smallIcon || '/images/placeholder.png'}
                    alt={item.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder.png'; }}
                  />
                </div>
                <div className="mt-3 space-y-1">
                  <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {item.type?.value && <span className="px-2 py-0.5 rounded bg-gray-800">{item.type.value}</span>}
                    {item.rarity?.value && <span className="px-2 py-0.5 rounded bg-gray-800">{item.rarity.value}</span>}
                    {/* badges de “novo” e “à venda” vindo da fonte selecionada */}
                    {source === 'new' && <span className="px-2 py-0.5 rounded bg-emerald-700/30 text-emerald-300">Novo</span>}
                    {source === 'shop' && <span className="px-2 py-0.5 rounded bg-indigo-700/30 text-indigo-300">Loja</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-md border border-gray-700 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-400">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-md border border-gray-700 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </div>
  );
}
