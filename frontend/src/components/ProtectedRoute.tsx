// frontend/src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { token, loading } = useAuth();

  // Enquanto carrega perfil/token
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-400">
        Verificando autenticação...
      </div>
    );
  }

  // Sem token → redireciona
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
