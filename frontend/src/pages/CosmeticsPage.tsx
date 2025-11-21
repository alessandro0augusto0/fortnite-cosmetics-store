// frontend/src/pages/CosmeticsPage.tsx
import React, { useEffect, useState } from 'react';
import api, { buyCosmetic, getPurchases } from '../lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

// ============================
// COMPONENTES LOCAIS (mínimos)
// ============================
type DivProps = React.HTMLAttributes<HTMLDivElement>;

const Card = ({ children, className = '', ...rest }: DivProps) => (
  <div
    className={`rounded-xl border border-gray-700 bg-gray-800 shadow-sm hover:shadow-md hover:scale-[1.01] transition ${className}`}
    {...rest}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = '', ...rest }: DivProps) => (
  <div className={`p-4 ${className}`} {...rest}>
    {children}
  </div>
);

const Button = ({
  children,
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`px-4 py-2 rounded-md font-semibold transition focus:outline-none ${className}`}
    {...rest}
  >
    {children}
  </button>
);

// ============================
// TIPOS
// ============================
interface Cosmetic {
  id: string;
  name: string;
  description?: string;
  type?: string;
  rarity?: string;
  image?: string;
  price: number;
}

interface Purchase {
  cosmeticId: string;
  returned: boolean;
}

// ============================
// PÁGINA PRINCIPAL
// ============================
export default function CosmeticsPage() {
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState<string[]>([]); // IDs dos cosméticos já comprados

  const { vbucks, setVbucks } = useAuth();

  // Carrega cosméticos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCosmetics, resPurchases] = await Promise.all([
          api.get('/cosmetics'),
          getPurchases(),
        ]);

        const payload = Array.isArray(resCosmetics.data) ? resCosmetics.data : [];
        setCosmetics(payload);

        const ownedIds = resPurchases
          .filter((p: Purchase) => !p.returned)
          .map((p: Purchase) => p.cosmeticId);

        setOwned(ownedIds);
      } catch (err) {
        console.error('Erro ao buscar cosméticos:', err);
        toast.error('Erro ao carregar cosméticos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compra
  async function handleBuy(cosmetic: Cosmetic) {
    try {
      const data = await buyCosmetic(cosmetic.id, cosmetic.name, cosmetic.price);

      toast.success(data.message);

      setOwned((prev) => [...prev, cosmetic.id]);
      setVbucks(data.newBalance);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao comprar o item.';
      toast.error(msg);
    }
  }

  if (loading)
    return <div className="text-center py-10 text-gray-400">Carregando cosméticos...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">Loja de Cosméticos</h1>

      {vbucks !== null && (
        <div className="text-center mb-6 text-yellow-400 font-medium">
          💰 Saldo: {vbucks.toLocaleString()} V-Bucks
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cosmetics.map((cosmetic) => {
          const isOwned = owned.includes(cosmetic.id);

          return (
            <Card key={cosmetic.id} className="overflow-hidden">
              {/* LINK PARA DETALHES */}
              <Link to={`/cosmetic/${cosmetic.id}`}>
                <CardContent className="flex flex-col items-center cursor-pointer">
                  {cosmetic.image ? (
                    <img
                      src={cosmetic.image}
                      alt={cosmetic.name}
                      className="w-32 h-32 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-700 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                      Sem imagem
                    </div>
                  )}

                  <h2 className="text-lg font-semibold mb-1">{cosmetic.name}</h2>

                  <p className="text-sm text-gray-400 mb-3 text-center">
                    {cosmetic.description || 'Sem descrição'}
                  </p>

                  <div className="text-yellow-400 mb-3 font-semibold">
                    {cosmetic.price.toLocaleString()} V-Bucks
                  </div>

                  {/* Indicador de já adquirido */}
                  {isOwned && (
                    <div className="text-green-400 text-xs font-semibold mb-2">
                      ✔ Já adquirido
                    </div>
                  )}
                </CardContent>
              </Link>

              {/* Botão de comprar separado (não faz link para detalhes) */}
              {!isOwned && (
                <div className="p-4 pt-0">
                  <Button
                    onClick={() => handleBuy(cosmetic)}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
                  >
                    Comprar com V-Bucks
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
