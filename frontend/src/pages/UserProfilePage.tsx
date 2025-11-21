import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '../services/api';
import { CosmeticCard } from '../components/CosmeticCard';

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

interface Purchase {
  id: string;
  cosmeticId: string;
  cosmetic: Cosmetic | null;
}

interface UserProfileResponse {
  user: {
    id: string;
    email: string;
    createdAt: string;
    vbucks: number;
  };
  purchases: {
    data: Purchase[];
    meta: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [id]);

  const { data, isLoading, isError, isFetching } = useQuery<UserProfileResponse>({
    queryKey: ['public-user-profile', id, page],
    queryFn: async () => (await api.get(`/users/${id}`, { params: { page, limit: 12 } })).data,
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });

  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">Usuário não encontrado.</p>
        <Link to="/users" className="text-blue-600 hover:underline">
          Voltar para lista de usuários
        </Link>
      </div>
    );
  }

  const purchases = data?.purchases.data ?? [];
  const pages = data?.purchases.meta.pages ?? 1;
  const total = data?.purchases.meta.total ?? 0;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Link to="/users" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
        ← Voltar para usuários
      </Link>

      {isLoading || !data ? (
        <p className="text-gray-500">Carregando perfil...</p>
      ) : (
        <>
          <div className="rounded-2xl bg-white p-6 shadow">
            <h1 className="text-2xl font-black text-gray-900">{data.user.email}</h1>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <dt>Inscrito em</dt>
                <dd className="font-semibold text-gray-900">{new Date(data.user.createdAt).toLocaleDateString('pt-BR')}</dd>
              </div>
              <div>
                <dt>V-Bucks atuais</dt>
                <dd className="font-semibold text-gray-900">{data.user.vbucks} V-Bucks</dd>
              </div>
            </dl>
          </div>

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Itens exibidos ({total})</h2>
              {(isLoading || isFetching) && <span className="text-sm text-gray-500">Carregando...</span>}
            </div>
            {purchases.length === 0 ? (
              <p className="text-gray-500">Nenhum cosmético foi exibido por este usuário ainda.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {purchases.map((item) => (
                  <div key={item.id}>{item.cosmetic && <CosmeticCard item={item.cosmetic} disableActions ownedOverride />}</div>
                ))}
              </div>
            )}

            {purchases.length > 0 && (
              <div className="mt-6 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="rounded border px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="text-sm font-semibold text-slate-600">
                  Página {page} de {pages}
                  {isFetching && <span className="ml-2 text-xs text-gray-400">Atualizando...</span>}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                  disabled={page >= pages}
                  className="rounded border px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
