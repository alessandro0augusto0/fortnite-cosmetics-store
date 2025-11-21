import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCosmeticById, buyCosmetic, returnCosmetic, getPurchases } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";

export default function CosmeticDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vbucks, setVbucks } = useAuth();

  const [cosmetic, setCosmetic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyOwns, setAlreadyOwns] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        // detalhes
        const data = await getCosmeticById(id);
        setCosmetic(data);

        // compras do usuário -> verificar se já possui
        const purchases = await getPurchases();
        const found = purchases.find((p: any) => p.cosmeticId === id && !p.returned);

        if (found) {
          setAlreadyOwns(true);
          setPurchaseId(found.id);
        }

      } catch (err: any) {
        toast.error("Erro ao carregar cosmético.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  async function handleBuy() {
    try {
      const res = await buyCosmetic(cosmetic.id, cosmetic.name, cosmetic.price);
      toast.success(res.message);

      setVbucks(res.newBalance);
      setAlreadyOwns(true);

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao comprar.");
    }
  }

  async function handleReturn() {
    if (!purchaseId) return;

    try {
      const res = await returnCosmetic(purchaseId);
      toast.success(res.message);

      setVbucks(res.newBalance);
      setAlreadyOwns(false);
    } catch (err: any) {
      toast.error("Erro ao devolver.");
    }
  }

  if (loading) {
    return <div className="text-center py-10 text-gray-400">Carregando...</div>;
  }

  if (!cosmetic) {
    return <div className="text-center py-10 text-red-400">Cosmético não encontrado.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-gray-400 hover:text-white underline"
      >
        ← Voltar
      </button>

      <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
        <img
          src={cosmetic.image}
          alt={cosmetic.name}
          className="w-48 h-48 object-cover rounded-lg mx-auto mb-6"
        />

        <h1 className="text-3xl font-bold text-center mb-3">{cosmetic.name}</h1>

        <p className="text-center text-gray-400 mb-6">{cosmetic.description || "Sem descrição"}</p>

        <div className="grid grid-cols-2 gap-4 text-gray-300 text-sm mb-6">
          <div><strong>Tipo:</strong> {cosmetic.type || "?"}</div>
          <div><strong>Raridade:</strong> {cosmetic.rarity || "?"}</div>
          <div><strong>Preço:</strong> {cosmetic.price.toLocaleString()} V-Bucks</div>
        </div>

        {/* BOTÕES */}
        {!alreadyOwns ? (
          <button
            onClick={handleBuy}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg"
          >
            Comprar
          </button>
        ) : (
          <button
            onClick={handleReturn}
            className="w-full py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg"
          >
            Devolver
          </button>
        )}

      </div>
    </div>
  );
}
