'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { User, UserRole } from '@/types';
import { UserPlus, Shield, Settings, User as UserIcon, Pencil, Trash2, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

function AdminUsuariosContent() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: string; nombre: string } | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    nombre: '',
    rol: 'consultante' as UserRole,
  });
  const [editData, setEditData] = useState({
    nombre: '',
    email: '',
    rol: 'consultante' as UserRole,
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const roleColors = {
    desarrollador: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    administrador: 'text-[#1EA896] bg-[#1EA896]/10 border-[#1EA896]/30',
    consultante: 'text-[#FF715B] bg-[#FF715B]/10 border-[#FF715B]/30',
  };

  const roleIcons = {
    desarrollador: Shield,
    administrador: Settings,
    consultante: UserIcon,
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Usuario registrado exitosamente');
        setShowRegisterModal(false);
        setRegisterData({ email: '', password: '', nombre: '', rol: 'consultante' });
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Error al registrar usuario');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditData({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      password: '',
    });
    setShowEditModal(true);
    setError('');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      const updatePayload: {
        userId: string;
        nombre: string;
        email: string;
        rol: UserRole;
        password?: string;
      } = {
        userId: editingUser.id,
        nombre: editData.nombre,
        email: editData.email,
        rol: editData.rol,
      };

      // Solo incluir password si se proporcionó uno nuevo
      if (editData.password.trim()) {
        updatePayload.password = editData.password;
      }

      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Usuario actualizado exitosamente');
        setShowEditModal(false);
        setEditingUser(null);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Error al actualizar usuario');
      }
    } catch (err) {
      console.error('Edit error:', err);
      setError('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;

    setActionLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: showDeleteConfirm.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Usuario eliminado exitosamente');
        setShowDeleteConfirm(null);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Error al eliminar usuario');
        setShowDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Error de conexión');
      setShowDeleteConfirm(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-[1800px] p-6">
        <Navbar activeSection="urls" onSectionChange={() => {}} />

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-white">Administración de Usuarios</h1>
            <p className="text-white/70 mt-1">Gestiona los usuarios del sistema</p>
          </div>

      {success && (
        <div className="bg-[#1EA896]/10 border border-[#1EA896]/30 text-emerald-200 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-[#DB2B39]/10 border border-[#DB2B39]/30 text-rose-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Usuarios Registrados</h2>
          {currentUser?.rol !== 'consultante' && (
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1EA896] hover:bg-[#147a6a] text-white rounded-lg transition-colors"
            >
              <UserPlus className="h-5 w-5" />
              Registrar Usuario
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-white/60 text-center py-8">Cargando usuarios...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Nombre</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Rol</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Fecha Creación</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const RoleIcon = roleIcons[user.rol];
                  const isCurrentUser = user.id === currentUser?.id;
                  const canModify = user.rol !== 'desarrollador' || currentUser?.rol === 'desarrollador';

                  return (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">
                        {user.nombre}
                        {isCurrentUser && <span className="ml-2 text-xs text-[#1EA896]">(Tú)</span>}
                      </td>
                      <td className="py-3 px-4 text-white/80">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleColors[user.rol]}`}>
                          <RoleIcon className="h-3.5 w-3.5" />
                          {user.rol}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/60 text-sm">
                        {new Date(user.fechaCreacion).toLocaleDateString('es-AR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {canModify && (
                            <>
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-2 bg-[#FF715B]/10 text-[#FF715B] hover:bg-[#FF715B]/20 rounded-lg transition-colors"
                                title="Editar usuario"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              {!isCurrentUser && (
                                <button
                                  onClick={() => setShowDeleteConfirm({ id: user.id, nombre: user.nombre })}
                                  className="p-2 bg-[#DB2B39]/10 text-[#DB2B39] hover:bg-[#DB2B39]/20 rounded-lg transition-colors"
                                  title="Eliminar usuario"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Registrar Nuevo Usuario</h3>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Nombre</label>
                <input
                  type="text"
                  value={registerData.nombre}
                  onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#1EA896]/50"
                  placeholder="Nombre completo"
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#1EA896]/50"
                  placeholder="email@ejemplo.com"
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#1EA896]/50"
                  placeholder="Mínimo 6 caracteres"
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Rol</label>
                <select
                  value={registerData.rol}
                  onChange={(e) => setRegisterData({ ...registerData, rol: e.target.value as UserRole })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1EA896]/50"
                  disabled={actionLoading}
                >
                  <option value="consultante">Consultante</option>
                  <option value="administrador">Administrador</option>
                  {currentUser?.rol === 'desarrollador' && (
                    <option value="desarrollador">Desarrollador</option>
                  )}
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#1EA896] hover:bg-[#147a6a] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Editar Usuario</h3>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Nombre</label>
                <input
                  type="text"
                  value={editData.nombre}
                  onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF715B]/50"
                  placeholder="Nombre completo"
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF715B]/50"
                  placeholder="email@ejemplo.com"
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nueva Contraseña <span className="text-white/50 text-xs">(dejar vacío para mantener actual)</span>
                </label>
                <input
                  type="password"
                  value={editData.password}
                  onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                  minLength={6}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF715B]/50"
                  placeholder="Mínimo 6 caracteres"
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Rol</label>
                <select
                  value={editData.rol}
                  onChange={(e) => setEditData({ ...editData, rol: e.target.value as UserRole })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF715B]/50"
                  disabled={actionLoading}
                >
                  <option value="consultante">Consultante</option>
                  <option value="administrador">Administrador</option>
                  {currentUser?.rol === 'desarrollador' && (
                    <option value="desarrollador">Desarrollador</option>
                  )}
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#FF715B] hover:bg-[#FF715B] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#DB2B39]/20 flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 text-[#DB2B39]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">¿Eliminar Usuario?</h3>
              <p className="text-sm text-white/70 mb-4">
                Esta acción no se puede deshacer. El usuario será eliminado permanentemente.
              </p>
              <div className="w-full bg-white/5 rounded-lg p-3 mb-6">
                <p className="text-sm text-white font-medium">{showDeleteConfirm.nombre}</p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 btn bg-white/10 text-white hover:bg-white/20"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 btn bg-[#DB2B39] text-white hover:bg-[#DB2B39] flex items-center justify-center gap-2"
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </main>
  );
}

export default function AdminUsuarios() {
  return (
    <ProtectedRoute requiredRole="administrador">
      <AdminUsuariosContent />
    </ProtectedRoute>
  );
}
