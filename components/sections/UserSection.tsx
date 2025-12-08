'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Settings, Trash2, LogOut, Shield, User as UserIcon, HelpCircle } from 'lucide-react';
import Link from 'next/link';

type Props = {
  onShowGuide: () => void;
};

export default function UserSection({ onShowGuide }: Props) {
  const { user, logout, hasPermission } = useAuth();

  if (!user) return null;

  const roleColors = {
    desarrollador: 'from-purple-500 to-purple-600',
    administrador: 'from-[#16DB93] to-[#16DB93]',
    consultante: 'from-[#598392] to-[#598392]',
  };

  const roleIcons = {
    desarrollador: Shield,
    administrador: Settings,
    consultante: UserIcon,
  };

  const RoleIcon = roleIcons[user.rol];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Configuración de Usuario</h2>
        <p className="text-white/70">
          Administra tu cuenta y configuraciones del sistema
        </p>
      </div>

      {/* User Profile Card */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${roleColors[user.rol]} flex items-center justify-center flex-shrink-0`}>
            <RoleIcon className="h-10 w-10 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white">{user.nombre}</h3>
            <p className="text-white/70 mt-1">{user.email}</p>
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-white/10">
              <RoleIcon className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white capitalize">{user.rol}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Help Guide */}
        <button
          onClick={onShowGuide}
          className="card p-6 hover:scale-105 transition-all duration-200 text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#598392]/20 to-[#598392]/20 flex items-center justify-center group-hover:from-[#598392]/30 group-hover:to-[#598392]/30 transition-all">
              <HelpCircle className="h-6 w-6 text-[#598392]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Guía de Uso</h3>
              <p className="text-sm text-white/70">
                Ver cómo funciona el sistema paso a paso
              </p>
            </div>
          </div>
        </button>

        {/* Admin Users */}
        {hasPermission('administrador') && (
          <Link
            href="/admin/usuarios"
            className="card p-6 hover:scale-105 transition-all duration-200 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#16DB93]/20 to-[#16DB93]/20 flex items-center justify-center group-hover:from-[#16DB93]/30 group-hover:to-[#16DB93]/30 transition-all">
                <Settings className="h-6 w-6 text-[#16DB93]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Administrar Usuarios</h3>
                <p className="text-sm text-white/70">
                  Gestionar usuarios del sistema
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Clean System */}
        {user.rol === 'desarrollador' && (
          <Link
            href="/admin/limpiar"
            className="card p-6 hover:scale-105 transition-all duration-200 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#598392]/20 to-amber-600/20 flex items-center justify-center group-hover:from-[#598392]/30 group-hover:to-amber-600/30 transition-all">
                <Trash2 className="h-6 w-6 text-[#598392]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Limpiar Sistema</h3>
                <p className="text-sm text-white/70">
                  Eliminar URLs y resultados del sistema
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="card p-6 hover:scale-105 transition-all duration-200 text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DB2B39]/20 to-[#DB2B39]/20 flex items-center justify-center group-hover:from-[#DB2B39]/30 group-hover:to-[#DB2B39]/30 transition-all">
              <LogOut className="h-6 w-6 text-[#DB2B39]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Cerrar Sesión</h3>
              <p className="text-sm text-white/70">
                Salir de tu cuenta de forma segura
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
