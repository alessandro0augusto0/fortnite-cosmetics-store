// src/components/store/CosmeticBadges.tsx
interface CosmeticBadgesProps {
  isNew?: boolean;
  isOnSale?: boolean;
  owned?: boolean;
}

export default function CosmeticBadges({ isNew, isOnSale, owned }: CosmeticBadgesProps) {
  return (
    <div className="flex items-center gap-2 absolute top-3 left-3">
      {isNew && (
        <span className="px-2 py-1 text-xs rounded bg-purple-600 text-white">
          Novo
        </span>
      )}

      {isOnSale && (
        <span className="px-2 py-1 text-xs rounded bg-blue-600 text-white">
          À venda
        </span>
      )}

      {owned && (
        <span className="px-2 py-1 text-xs rounded bg-green-600 text-white">
          Comprado
        </span>
      )}
    </div>
  );
}
