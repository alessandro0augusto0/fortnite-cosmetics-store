import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, RotateCcw, Star, Flame, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Cosmetic {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  rarity: string;
  type: string;
  price: number;
  isNew: boolean;
  isOnSale: boolean;
  addedAt: string;
  lastSync: string;
  owned?: boolean;
}

export function CosmeticDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const cosmeticId = id ?? '';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, refreshUser } = useAuth();

  const { data, isLoading, isError } = useQuery<Cosmetic>({
    queryKey: ['cosmetic', cosmeticId, user?.id],
    queryFn: async () => (await api.get(`/cosmetics/${cosmeticId}`)).data,
    enabled: Boolean(cosmeticId),
  });

  const purchaseMutation = useMutation({
    mutationFn: () => api.post('/shop/purchase', { cosmeticId }),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['cosmetics'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      alert('Item comprado com sucesso!');
    },
    onError: () => alert('Erro ao realizar compra.'),
  });

  const refundMutation = useMutation({
    mutationFn: () => api.post('/shop/refund', { cosmeticId }),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['cosmetics'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      alert('Item devolvido com sucesso!');
    },
    onError: () => alert('Erro ao processar devolução.'),
  });

  const owned = data?.owned ?? (user?.items?.some((ownedItem) => ownedItem.cosmeticId === cosmeticId) ?? false);

  const handlePurchase = () => {
    if (!cosmeticId) {
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (data && user && user.vbucks < data.price) {
      alert('Saldo insuficiente.');
      return;
    }
    purchaseMutation.mutate();
  };

  const handleRefund = () => {
    if (!cosmeticId) {
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!confirm('Deseja mesmo devolver este cosmético?')) {
      return;
    }
    refundMutation.mutate();
  };

  if (isLoading) {
    return <p className="p-6 text-center text-gray-500">Carregando detalhes...</p>;
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">Não foi possível carregar este cosmético.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Voltar para o catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
        <ArrowLeft size={16} /> Voltar ao catálogo
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-900/90 p-6 shadow-lg">
          {data.image ? (
            <img src={data.image} alt={data.name} className="w-full rounded-xl object-contain" />
          ) : (
            <div className="flex h-72 items-center justify-center rounded-xl bg-slate-800 text-gray-400">Sem imagem</div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {data.isNew && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                <Star size={14} /> Novo
              </span>
            )}
            {data.isOnSale && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                <Flame size={14} /> Em loja
              </span>
            )}
            {owned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                ✓ Já adquirido
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black text-gray-900">{data.name}</h1>
          <p className="mt-3 text-gray-600">{data.description || 'Sem descrição disponível.'}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Tipo</dt>
              <dd className="font-semibold text-gray-900 capitalize">{data.type || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Raridade</dt>
              <dd className="font-semibold text-gray-900 capitalize">{data.rarity}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Adicionado em</dt>
              <dd className="font-semibold text-gray-900">{new Date(data.addedAt).toLocaleDateString('pt-BR')}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Última sincronização</dt>
              <dd className="font-semibold text-gray-900">{new Date(data.lastSync).toLocaleString('pt-BR')}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="text-3xl font-black text-blue-600">{data.price} V-Bucks</span>
            {owned ? (
              <button
                type="button"
                onClick={handleRefund}
                disabled={refundMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              >
                <RotateCcw size={16} /> Devolver
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePurchase}
                disabled={purchaseMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
              >
                <ShoppingCart size={16} /> Comprar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
