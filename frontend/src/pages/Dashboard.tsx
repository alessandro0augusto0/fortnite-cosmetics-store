import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CosmeticCard } from '../components/CosmeticCard';

export function Dashboard() {
  const { user, refreshUser } = useAuth();

  const { data: history } = useQuery({
    queryKey: ['history'],
    queryFn: async () => (await api.get('/history')).data,
  });

  const handleRefund = async (cosmeticId: string) => {
    if (!confirm('Deseja devolver este item e recuperar seus V-Bucks?')) {
      return;
    }
    try {
      await api.post('/shop/refund', { cosmeticId });
      alert('Reembolso realizado com sucesso!');
      await refreshUser();
      window.location.reload();
    } catch (error) {
      alert('Erro ao processar reembolso.');
    }
  };

  const myItems = user?.items || [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-blue-600 text-white p-8 rounded-lg shadow-lg mb-8">
        <h1 className="text-3xl font-bold">Olá, {user?.email}</h1>
        <p className="text-xl mt-2">
          Seu Saldo:{' '}
          <span className="font-mono font-bold text-yellow-300">{user?.vbucks} V-Bucks</span>
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-4">Meus Itens ({myItems.length})</h2>

      {myItems.length === 0 ? (
        <p className="text-gray-500">Você ainda não comprou nada.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {myItems.map((userItem) => (
            <div key={userItem.id} className="relative group">
              {userItem.cosmetic && <CosmeticCard item={userItem.cosmetic} />}
              <button
                type="button"
                onClick={() => handleRefund(userItem.cosmeticId)}
                className="absolute bottom-4 right-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 z-10"
              >
                Devolver
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-2">Histórico de Transações</h2>
        <ul className="bg-white rounded-lg shadow divide-y">
          {history?.map((tx: any) => (
            <li key={tx.id} className="p-4 flex justify-between text-sm">
              <span>
                {tx.type} - {tx.cosmetic?.name || tx.cosmeticId}
              </span>
              <span className={tx.type === 'PURCHASE' ? 'text-red-500' : 'text-green-600'}>
                {tx.type === 'PURCHASE' ? '-' : '+'}
                {tx.amount} V-Bucks
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
