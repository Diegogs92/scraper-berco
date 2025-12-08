'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (requiredRole) {
        const roleHierarchy: Record<UserRole, number> = {
          desarrollador: 3,
          administrador: 2,
          consultante: 1,
        };

        if (roleHierarchy[user.rol] < roleHierarchy[requiredRole]) {
          router.push('/dashboard');
        }
      }
    }
  }, [user, loading, router, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#16DB93] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole) {
    const roleHierarchy: Record<UserRole, number> = {
      desarrollador: 3,
      administrador: 2,
      consultante: 1,
    };

    if (roleHierarchy[user.rol] < roleHierarchy[requiredRole]) {
      return null;
    }
  }

  return <>{children}</>;
}
