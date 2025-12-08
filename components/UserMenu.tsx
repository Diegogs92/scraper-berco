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
          <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border-b border-white/10">
              <p className="text-sm font-semibold text-white">{user.nombre}</p>
              <p className="text-xs text-white/80 mt-0.5">{user.email}</p>
              <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.rol]} bg-white/20`}>
                <RoleIcon className="h-3 w-3" />
                <span className="capitalize">{user.rol}</span>
              </div>
            </div>

            <div className="py-1 bg-slate-800">
              {hasPermission('administrador') && (
                <Link
                  href="/admin/usuarios"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-emerald-500/20 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4 text-emerald-400" />
                  <span>Administrar usuarios</span>
                </Link>
              )}

              {user.rol === 'desarrollador' && (
                <Link
                  href="/admin/limpiar"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-amber-500/20 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <Trash2 className="h-4 w-4 text-amber-400" />
                  <span>Limpiar sistema</span>
                </Link>
              )}

              <div className="border-t border-white/10 my-1"></div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/20 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
