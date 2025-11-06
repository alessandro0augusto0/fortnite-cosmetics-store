// frontend/src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../lib/auth';

export default function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}
