import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface UserSummary {
  id: string;
  email: string;
  createdAt: string;
  vbucks: number;
}

interface UsersResponse {
  data: UserSummary[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function UsersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery<UsersResponse>({
    queryKey: ['public-users', page],
    queryFn: async () => (await api.get('/users', { params: { page, limit: 12 } })).data,
    placeholderData: keepPreviousData,
  });

  const users = data?.data ?? [];
  const pages = data?.meta?.pages ?? 1;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-black text-gray-900">Comunidade</h1>
        <p className="text-gray-600">Veja quem já está usando o sistema ESO e quais itens ela já exibiu no perfil público.</p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">V-Bucks</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3">Perfil</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                  Carregando usuários...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-900">{user.email}</td>
                  <td className="px-4 py-3 text-slate-600">{user.vbucks} V-Bucks</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    <Link to={`/users/${user.id}`} className="text-blue-600 hover:underline">
                      Ver perfil
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {users.length > 0 && (
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
    </div>
  );
}
