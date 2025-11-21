import { ShoppingCart, Star, Flame, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MouseEvent, KeyboardEvent } from 'react';
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
  description?: string | null;
  type?: string | null;
}

type CosmeticCardProps = {
  item: Cosmetic;
  disableActions?: boolean;
  ownedOverride?: boolean;
};

const rarityThemes: Record<string, string> = {
  common: 'border-slate-200',
  uncommon: 'border-emerald-300',
  rare: 'border-blue-300',
  epic: 'border-purple-300',
  legendary: 'border-amber-400',
};

const rarityBadges: Record<string, string> = {
  common: 'bg-slate-100 text-slate-600',
  uncommon: 'bg-emerald-100 text-emerald-700',
  rare: 'bg-blue-100 text-blue-700',
  epic: 'bg-purple-100 text-purple-700',
  legendary: 'bg-amber-100 text-amber-700',
};

export function CosmeticCard({ item, disableActions = false, ownedOverride }: CosmeticCardProps) {
  const { user, refreshUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const rarityKey = item.rarity?.toLowerCase() ?? 'common';
  const frameClass = rarityThemes[rarityKey] ?? 'border-slate-200';
  const badgeClass = rarityBadges[rarityKey] ?? 'bg-slate-100 text-slate-600';
  const isOwned = ownedOverride ?? (user?.items?.some((owned) => owned.cosmeticId === item.id) ?? false);

  const handleBuy = async (event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
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

  const handleOpenDetails = () => navigate(`/cosmetics/${item.id}`);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenDetails();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleOpenDetails}
      onKeyDown={handleKeyDown}
      className={`group relative flex h-full cursor-pointer flex-col rounded-3xl border bg-white p-5 shadow-lg ring-1 ring-transparent transition hover:-translate-y-2 hover:shadow-2xl ${frameClass}`}
    >
      <div className="absolute left-5 right-5 top-5 flex justify-between text-[11px] font-semibold uppercase tracking-wide">
        {item.isNew && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-amber-700">
            <Star size={12} /> Novo
          </span>
        )}
        {item.isOnSale && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
            <Flame size={12} /> Promoção
          </span>
        )}
      </div>

      <div className="mb-4 mt-10 aspect-square overflow-hidden rounded-2xl bg-gray-100">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-gray-400">Sem imagem</div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs font-semibold">
        <span className={`rounded-full px-3 py-1 capitalize ${badgeClass}`}>{item.rarity || 'Desconhecido'}</span>
        {isOwned && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            <Check size={14} /> Adquirido
          </span>
        )}
      </div>

      <h3 className="mt-4 text-lg font-black text-gray-900" title={item.name}>
        {item.name}
      </h3>
      <p className="text-sm text-gray-500">Cosmético oficial Fortnite</p>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-2xl font-black text-gray-900">
          {item.price > 0 ? (
            <span className="font-mono text-blue-700">{item.price.toLocaleString('pt-BR')} V$</span>
          ) : (
            '---'
          )}
        </div>
      </div>

      {!disableActions && !isOwned && (
        <button
          type="button"
          onClick={handleBuy}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <ShoppingCart size={16} /> Comprar agora
        </button>
      )}
    </article>
  );
}
