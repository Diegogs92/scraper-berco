import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Edit3, Loader2, Trash, Upload, Search, ChevronLeft, ChevronRight, X, Plus, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { UrlItem } from '@/types';

type Props = {
  onChange?: () => void;
};

export default function URLManager({ onChange }: Props) {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [message, setMessage] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(50);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // File upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadUrls = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((currentPage - 1) * pageSize).toString(),
      });

      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/urls?${params}`);
      const data = await res.json();
      setUrls(data.urls || []);
      setTotalCount(data.total || 0);
      setSelectedIds(new Set());
      setSelectAll(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error cargando URLs';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, searchTerm]);

  useEffect(() => {
    loadUrls();
  }, [loadUrls]);

  const addUrl = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      // Check if input contains multiple lines (batch import)
      const lines = newUrl.trim().split('\n').filter(line => line.trim());

      if (lines.length > 1) {
        // Batch import
        const res = await fetch('/api/urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv: newUrl }),
        });
        const data = await res.json();
        setMessage(`✓ ${data.inserted || 0} URLs agregadas`);
      } else {
        // Single URL
        const res = await fetch('/api/urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: newUrl }),
        });
        const data = await res.json();
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage('✓ URL agregada');
        }
      }

      setNewUrl('');
      await loadUrls();
      onChange?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al agregar';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteUrl = async (id: string) => {
    if (!confirm('Eliminar URL?')) return;
    setLoading(true);
    try {
      await fetch(`/api/urls/${id}`, { method: 'DELETE' });
      await loadUrls();
      onChange?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo eliminar';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const [editingUrl, setEditingUrl] = useState<{ id: string; url: string } | null>(null);
  const [editUrlValue, setEditUrlValue] = useState('');

  const openEditModal = (id: string, url: string) => {
    setEditingUrl({ id, url });
    setEditUrlValue(url);
  };

  const closeEditModal = () => {
    setEditingUrl(null);
    setEditUrlValue('');
  };

  const saveEditUrl = async () => {
    if (!editingUrl || !editUrlValue.trim() || editUrlValue === editingUrl.url) {
      closeEditModal();
      return;
    }

    setLoading(true);
    try {
      await fetch(`/api/urls/${editingUrl.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: editUrlValue }),
      });
      await loadUrls();
      onChange?.();
      closeEditModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo editar';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('');

    try {
      const text = await file.text();
      const res = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: text }),
      });
      const data = await res.json();
      setMessage(`Importadas: ${data.inserted || 0} de ${data.totalReceived || 0}`);
      await loadUrls();
      onChange?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al importar archivo';
      setMessage(msg);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Bulk operations
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(urls.map(u => u.id)));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === urls.length);
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`¿Eliminar ${selectedIds.size} URLs seleccionadas?`)) return;

    setLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/urls/${id}`, { method: 'DELETE' })
        )
      );
      setMessage(`${selectedIds.size} URLs eliminadas`);
      await loadUrls();
      onChange?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar URLs';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Pagination helpers
  const totalPages = Math.ceil(totalCount / pageSize);
  const canPrevPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  return (
    <div className="card flex h-full flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Paso 1</p>
          <h3 className="text-lg font-semibold text-white">Agrega URLs</h3>
          <p className="text-xs text-white/50 mt-1">
            {totalCount > 0 ? `${totalCount} URLs cargadas` : 'Comienza agregando URLs para scrapear'}
          </p>
        </div>
        {selectedIds.size > 0 && (
          <button
            onClick={bulkDelete}
            className="btn bg-rose-500/30 text-white hover:bg-rose-500/50"
            title="Eliminar seleccionadas"
          >
            <Trash className="h-4 w-4" />
            ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-10 pr-10 text-sm text-white outline-none focus:border-emerald-400"
            placeholder="Buscar por URL..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="processing">En proceso</option>
          <option value="done">Completadas</option>
          <option value="error">Con error</option>
        </select>
      </div>

      {/* Simplified unified input */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-white/90">Agregar URLs</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            disabled={loading}
          >
            <Upload className="h-3 w-3" />
            Subir archivo
          </button>
        </div>

        <form onSubmit={addUrl} className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400 placeholder:text-white/40"
            placeholder="Agrega la URL de un nuevo producto"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <button
            type="submit"
            className="btn bg-emerald-500 text-white hover:bg-emerald-400 px-4"
            disabled={loading}
            title="Agregar URL"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </button>
        </form>

        {message && (
          <div className="text-xs text-emerald-300 bg-emerald-500/10 px-3 py-2 rounded-lg">
            {message}
          </div>
        )}
      </div>

      <div className="mt-2 flex-1 overflow-auto rounded-lg border border-white/5">
        <table className="min-w-full text-sm text-white/80">
          <thead className="bg-white/5 text-left text-xs uppercase text-white/60 sticky top-0">
            <tr>
              <th className="px-3 py-2 w-10">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500"
                />
              </th>
              <th className="px-3 py-2">URL</th>
              <th className="px-3 py-2">Proveedor</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && urls.length === 0 ? (
              <tr>
                <td className="px-3 py-12 text-center text-white/60" colSpan={5}>
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Cargando URLs...
                </td>
              </tr>
            ) : urls.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-white/60" colSpan={5}>
                  {searchTerm || statusFilter
                    ? 'No se encontraron URLs con esos filtros.'
                    : 'Aún no hay URLs cargadas.'}
                </td>
              </tr>
            ) : (
              urls.map((u) => (
                <tr key={u.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(u.id)}
                      onChange={() => toggleSelect(u.id)}
                      className="rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="line-clamp-2 break-all text-white">{u.url}</div>
                    {u.ultimoError && (
                      <p className="text-xs text-amber-300">Error: {u.ultimoError}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top">{u.proveedor}</td>
                  <td className="px-3 py-2 align-top">
                    {u.status === 'done' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : u.status === 'error' ? (
                      <XCircle className="h-5 w-5 text-rose-400" />
                    ) : u.status === 'processing' ? (
                      <Loader2 className="h-5 w-5 text-sky-400 animate-spin" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-400" />
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-lg bg-white/5 p-2 text-white hover:bg-white/10"
                        onClick={() => openEditModal(u.id, u.url)}
                        title="Editar URL"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-lg bg-rose-500/30 p-2 text-white hover:bg-rose-500/50"
                        onClick={() => deleteUrl(u.id)}
                        title="Eliminar"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="text-sm text-white/60">
            Página {currentPage} de {totalPages} ({totalCount} URLs totales)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={!canPrevPage}
              className="btn bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={!canNextPage}
              className="btn bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit URL Modal */}
      {editingUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-2xl p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Editar URL</h3>
              <button
                onClick={closeEditModal}
                className="text-white/60 hover:text-white"
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">URL del producto</label>
                <input
                  type="text"
                  value={editUrlValue}
                  onChange={(e) => setEditUrlValue(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                  placeholder="https://ejemplo.com/producto"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      saveEditUrl();
                    }
                  }}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeEditModal}
                  className="btn bg-white/10 text-white hover:bg-white/20"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEditUrl}
                  className="btn bg-emerald-500 text-white hover:bg-emerald-400"
                  disabled={loading || !editUrlValue.trim()}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
