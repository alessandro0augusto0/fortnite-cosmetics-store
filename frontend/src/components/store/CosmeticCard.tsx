// src/components/store/CosmeticCard.tsx
import Button from '../ui/Button';
import PriceBlock from './PriceBlock';
import CosmeticBadges from './CosmeticBadges';

interface CosmeticCardProps {
  item: {
    id: string;
    name: string;
    description?: string | null;
    image?: string | null;
    price: number;
    rarity: string;
    isNew?: boolean;
    isOnSale?: boolean;
    owned?: boolean;
  };
  onBuy?: (item: CosmeticCardProps['item']) => void;
}

const rarityStyles: Record<string, string> = {
  common: 'border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800',
  uncommon: 'border border-green-500/40 bg-gradient-to-br from-emerald-950 to-emerald-900',
  rare: 'border border-blue-500/40 bg-gradient-to-br from-blue-950 to-blue-900',
  epic: 'border border-purple-500/50 bg-gradient-to-br from-purple-950 to-purple-900',
  legendary: 'border border-amber-500/50 bg-gradient-to-br from-amber-900 to-amber-800',
  default: 'border border-gray-700 bg-gray-900',
};

export default function CosmeticCard({ item, onBuy }: CosmeticCardProps) {
  const rarityKey = item.rarity?.toLowerCase() || 'default';
  const rarityClass = rarityStyles[rarityKey] ?? rarityStyles.default;

  return (
    <div className={`relative rounded-2xl p-4 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl ${rarityClass}`}>
      <CosmeticBadges isNew={item.isNew} isOnSale={item.isOnSale} owned={item.owned} />

      <div className="aspect-square rounded-xl mb-4 bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-contain" loading="lazy" />
        ) : (
          <span className="text-xs text-gray-400">Sem imagem</span>
        )}
      </div>

      <h3 className="text-lg font-bold text-white truncate">{item.name}</h3>
      <p className="text-xs uppercase tracking-wide text-gray-300 mb-2">{item.rarity}</p>
      <p className="text-sm text-gray-400 min-h-[40px] overflow-hidden">
        {item.description || 'Sem descrição disponível.'}
      </p>

      <div className="mt-4">
        <PriceBlock price={item.price} />
      </div>

      {onBuy && (
        <Button
          type="button"
          onClick={() => onBuy(item)}
          className="mt-4 w-full bg-yellow-500 text-black hover:bg-yellow-400"
        >
          Comprar
        </Button>
      )}
    </div>
  );
}
