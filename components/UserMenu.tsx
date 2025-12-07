'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Shield, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function UserMenu() {
  const { user, logout, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const roleColors = {
    desarrollador: 'text-purple-400',
    administrador: 'text-emerald-400',
    consultante: 'text-sky-400',
  };

  const roleIcons = {
    desarrollador: Shield,
    administrador: Settings,
    consultante: User,
  };

  const RoleIcon = roleIcons[user.rol];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
      >
        <RoleIcon className={`h-5 w-5 ${roleColors[user.rol]}`} />
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-white">{user.nombre}</p>
          <p className="text-xs text-white/60 capitalize">{user.rol}</p>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl z-50">
            <div className="p-4 border-b border-white/10">
              <p className="text-sm font-medium text-white">{user.nombre}</p>
              <p className="text-xs text-white/60">{user.email}</p>
              <p className="text-xs text-emerald-400 mt-1 capitalize">{user.rol}</p>
            </div>

            <div className="py-2">
              {hasPermission('administrador') && (
                <Link
                  href="/admin/usuarios"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Administrar usuarios
                </Link>
              )}

              {user.rol === 'desarrollador' && (
                <Link
                  href="/admin/limpiar"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Trash2 className="h-4 w-4" />
                  Limpiar sistema
                </Link>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
