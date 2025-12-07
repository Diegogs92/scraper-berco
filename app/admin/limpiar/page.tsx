'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function LimpiarSistemaContent() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirm, setShowConfirm] = useState<'urls' | 'resultados' | 'all' | null>(null);

  const handleClear = async (type: 'urls' | 'resultados' | 'all') => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setShowConfirm(null);
      } else {
        setError(data.error || 'Error al limpiar el sistema');
      }
    } catch (err) {
      console.error('Clear error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const confirmActions = {
    urls: {
      title: '¿Eliminar todas las URLs?',
      description:
        'Esto eliminará todas las URLs del sistema (pendientes, en proceso, completadas y con error). No se pueden recuperar.',
      action: 'Eliminar URLs',
    },
    resultados: {
      title: '¿Eliminar todos los resultados?',
      description:
        'Esto eliminará todos los resultados del scraping. Las URLs permanecerán intactas. No se pueden recuperar.',
      action: 'Eliminar Resultados',
    },
    all: {
      title: '¿Limpiar TODO el sistema?',
      description:
        'Esto eliminará TODAS las URLs y TODOS los resultados del scraping. El sistema quedará completamente limpio. Esta acción NO se puede deshacer.',
      action: 'Limpiar Todo',
    },
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <ArrowLeft className="h-6 w-6 text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold text-white">Limpiar Sistema</h1>
          <p className="text-white/70 mt-1">Elimina información del scraper para comenzar de cero</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-200 font-semibold">Advertencia</p>
            <p className="text-amber-200/80 text-sm mt-1">
              Estas acciones son irreversibles. Asegúrate de hacer una copia de seguridad si necesitas
              conservar la información.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Limpiar URLs */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Eliminar todas las URLs
              </h3>
              <p className="text-white/60 text-sm mt-2">
                Elimina todas las URLs del sistema (pendientes, procesadas, con errores). Los resultados
                del scraping permanecerán intactos.
              </p>
              <ul className="text-white/50 text-xs mt-3 space-y-1 ml-4">
                <li>• URLs pendientes</li>
                <li>• URLs en proceso</li>
                <li>• URLs completadas</li>
                <li>• URLs con errores</li>
              </ul>
            </div>
            <button
              onClick={() => setShowConfirm('urls')}
              disabled={loading}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            >
              Eliminar URLs
            </button>
          </div>
        </div>

        {/* Limpiar Resultados */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Eliminar todos los resultados
              </h3>
              <p className="text-white/60 text-sm mt-2">
                Elimina todos los resultados del scraping. Las URLs permanecerán para poder volver a
                scrapear.
              </p>
              <ul className="text-white/50 text-xs mt-3 space-y-1 ml-4">
                <li>• Productos scrapeados</li>
                <li>• Precios y descuentos</li>
                <li>• Comparaciones de precios</li>
                <li>• Historial de scraping</li>
              </ul>
            </div>
            <button
              onClick={() => setShowConfirm('resultados')}
              disabled={loading}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            >
              Eliminar Resultados
            </button>
          </div>
        </div>

        {/* Limpiar Todo */}
        <div className="card p-6 border-2 border-rose-500/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-rose-300 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Limpiar TODO el sistema
              </h3>
              <p className="text-white/60 text-sm mt-2">
                Elimina TODAS las URLs y TODOS los resultados. El sistema quedará completamente limpio.
              </p>
              <p className="text-rose-300 text-xs mt-3 font-semibold">
                ⚠️ Esta es la opción más destructiva. Úsala solo si quieres empezar completamente de
                cero.
              </p>
            </div>
            <button
              onClick={() => setShowConfirm('all')}
              disabled={loading}
              className="px-4 py-2 bg-rose-600/30 hover:bg-rose-600/40 text-rose-200 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 font-semibold"
            >
              Limpiar Todo
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 border-2 border-rose-500/30">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-rose-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {confirmActions[showConfirm].title}
                </h3>
                <p className="text-white/70 text-sm mt-2">
                  {confirmActions[showConfirm].description}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(null)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleClear(showConfirm)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors disabled:opacity-50 font-semibold"
              >
                {loading ? 'Eliminando...' : confirmActions[showConfirm].action}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function LimpiarSistema() {
  return (
    <ProtectedRoute requiredRole="desarrollador">
      <LimpiarSistemaContent />
    </ProtectedRoute>
  );
}
