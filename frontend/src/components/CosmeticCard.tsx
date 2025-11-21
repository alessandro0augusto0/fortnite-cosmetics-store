import { ShoppingCart, Star, Flame, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface Cosmetic {
  id: string;
  name: string;
  image: string | null;
  rarity: string;
  price: number;
  isNew: boolean;
  isOnSale: boolean;
}

const rarityThemes: Record<string, string> = {
  common: 'border-gray-200',
  uncommon: 'border-emerald-300',
  rare: 'border-blue-300',
  epic: 'border-purple-300',
  legendary: 'border-amber-400',
};

export function CosmeticCard({ item }: { item: Cosmetic }) {
  const { user, refreshUser, isAuthenticated } = useAuth();
  const rarityKey = item.rarity?.toLowerCase() ?? 'common';
  const frameClass = rarityThemes[rarityKey] ?? 'border-gray-200';
  const isOwned = user?.items?.some((owned) => owned.cosmeticId === item.id) ?? false;

  const handleBuy = async () => {
    if (!isAuthenticated) {
      alert('Faça login para comprar!');
      return;
    }
    if (user && user.vbucks < item.price) {
      alert('Saldo insuficiente!');
      return;
    }

    try {
      await api.post('/shop/purchase', { cosmeticId: item.id });
      alert(`Você comprou ${item.name}!`);
      await refreshUser();
    } catch {
      alert('Erro na compra.');
    }
  };

  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${frameClass}`}
    >
      <div className="absolute left-5 right-5 top-4 flex justify-between text-xs font-semibold">
        {item.isNew && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-amber-700">
            <Star size={12} /> Novo
          </span>
        )}
        {item.isOnSale && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-red-600">
            <Flame size={12} /> Loja
          </span>
        )}
      </div>

      <div className="mb-4 mt-6 aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-black">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-contain" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">Sem imagem</div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900" title={item.name}>
        {item.name}
      </h3>
      <p className="mb-4 text-sm text-gray-500 capitalize">{item.rarity || 'Desconhecido'}</p>

      <div className="mt-auto flex items-center justify-between">
        <div className="text-lg font-bold text-blue-600">{item.price > 0 ? `${item.price} V-Bucks` : '---'}</div>
        {isOwned ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
            <Check size={16} /> Adquirido
          </span>
        ) : (
          <button
            type="button"
            onClick={handleBuy}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            <ShoppingCart size={16} /> Comprar
          </button>
        )}
      </div>
    </article>
  );
}
