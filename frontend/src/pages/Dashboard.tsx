import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CosmeticCard } from '../components/CosmeticCard';

type InventoryItem = {
  id: string;
  cosmeticId: string;
  acquiredAt: string;
  cosmetic: {
    id: string;
    name: string;
    image: string | null;
    rarity: string;
    price: number;
    isNew: boolean;
    isOnSale: boolean;
    description?: string | null;
    type?: string | null;
  } | null;
};

type Transaction = {
  id: string;
  type: 'PURCHASE' | 'REFUND';
  amount: number;
  date: string;
  cosmeticId: string;
  cosmetic?: { name: string } | null;
};

export function Dashboard() {
  const { user, refreshUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const { data: inventory, isLoading: inventoryLoading } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => (await api.get('/shop/purchases')).data,
    enabled: isAuthenticated,
  });

  const { data: history, isLoading: historyLoading } = useQuery<Transaction[]>({
    queryKey: ['history'],
    queryFn: async () => (await api.get('/history')).data,
    enabled: isAuthenticated,
  });

  const refundMutation = useMutation({
    mutationFn: (cosmeticId: string) => api.post('/shop/refund', { cosmeticId }),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      alert('Reembolso realizado com sucesso!');
    },
    onError: () => alert('Erro ao processar reembolso.'),
  });

  const handleRefund = (cosmeticId: string) => {
    if (!confirm('Deseja devolver este item e recuperar seus V-Bucks?')) {
      return;
    }
    refundMutation.mutate(cosmeticId);
  };

  if (!isAuthenticated) {
    return null;
  }

  const myItems = inventory ?? [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-blue-600 text-white p-8 rounded-lg shadow-lg mb-8">
        <h1 className="text-3xl font-bold">Olá, {user?.email}</h1>
        <p className="text-xl mt-2">
          Seu Saldo: <span className="font-mono font-bold text-yellow-300">{user?.vbucks} V-Bucks</span>
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Meus Itens ({myItems.length})</h2>
          {inventoryLoading && <span className="text-sm text-gray-500">Carregando...</span>}
        </div>

        {myItems.length === 0 ? (
          <p className="text-gray-500">Você ainda não comprou nada.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myItems.map((userItem) => (
              <div key={userItem.id} className="relative">
                {userItem.cosmetic && <CosmeticCard item={userItem.cosmetic} disableActions ownedOverride />}
                <button
                  type="button"
                  onClick={() => handleRefund(userItem.cosmeticId)}
                  className="absolute bottom-4 right-4 rounded-lg bg-red-600 px-3 py-1 text-sm font-semibold text-white shadow hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                  disabled={refundMutation.isPending}
                >
                  Devolver
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Histórico de Transações</h2>
          {historyLoading && <span className="text-sm text-gray-500">Carregando...</span>}
        </div>
        {history && history.length > 0 ? (
          <ul className="bg-white rounded-lg shadow divide-y">
            {history.map((tx) => (
              <li key={tx.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-800">{tx.cosmetic?.name || tx.cosmeticId}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleString('pt-BR')}</p>
                </div>
                <span className={`font-bold ${tx.type === 'PURCHASE' ? 'text-red-500' : 'text-green-600'}`}>
                  {tx.type === 'PURCHASE' ? '-' : '+'}
                  {tx.amount} V-Bucks
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhuma transação registrada.</p>
        )}
      </section>
    </div>
  );
}
