// frontend/src/pages/CosmeticsPage.tsx
import React, { useEffect, useState } from 'react';
import api, { buyCosmetic } from '../lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// ============================
// COMPONENTES LOCAIS (mínimos)
// ============================
type DivProps = React.HTMLAttributes<HTMLDivElement>;

const Card = ({ children, className = '', ...rest }: DivProps) => (
  <div className={`rounded-xl border border-gray-700 bg-gray-800 shadow-sm ${className}`} {...rest}>
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
// TIPO
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

// ============================
// PÁGINA PRINCIPAL
// ============================
export default function CosmeticsPage() {
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [loading, setLoading] = useState(true);

  const { vbucks, setVbucks } = useAuth();

  // Carrega cosméticos
  useEffect(() => {
    const fetchCosmetics = async () => {
      try {
        const res = await api.get('/cosmetics');

        // O backend retorna diretamente o array
        const payload = Array.isArray(res.data) ? res.data : [];

        setCosmetics(payload);
      } catch (err) {
        console.error('Erro ao buscar cosméticos:', err);
        toast.error('Erro ao carregar cosméticos.');
      } finally {
        setLoading(false);
      }
    };

    fetchCosmetics();
  }, []);

  // Compra
  async function handleBuy(cosmetic: Cosmetic) {
    try {
      const data = await buyCosmetic(cosmetic.id, cosmetic.name, cosmetic.price);

      toast.success(data.message);

      // Atualiza saldo global
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
        {cosmetics.map((cosmetic) => (
          <Card key={cosmetic.id} className="overflow-hidden">
            <CardContent className="flex flex-col items-center">
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

              <Button
                onClick={() => handleBuy(cosmetic)}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
              >
                Comprar com V-Bucks
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
