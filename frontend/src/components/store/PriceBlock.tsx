interface PriceBlockProps {
  price: number;
}

export default function PriceBlock({ price }: PriceBlockProps) {
  return (
    <div className="rounded-2xl bg-black/40 px-4 py-3 text-center text-white">
      <p className="text-xs uppercase tracking-[3px] text-gray-300">Valor</p>
      <p className="mt-1 text-2xl font-black text-amber-300">{price.toLocaleString('pt-BR')} V-Bucks</p>
    </div>
  );
}
