import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Edit3, Loader2, Trash, Upload, Search, ChevronLeft, ChevronRight, X, Plus, CheckCircle2, XCircle, Clock, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from './EmptyState';
import Badge from './Badge';
import { UrlItem } from '@/types';

type Props = {
  onChange?: () => void;
};

export default function URLManager({ onChange }: Props) {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUrl, setNewUrl] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(50);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; url: string } | null>(null);

  // File upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadUrls = useCallback(async () => {
    setLoading(true);
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error cargando URLs';
      toast.error(msg);
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

    try {
      // Check if input contains multiple lines (batch import)
      const lines = newUrl.trim().split('\n').filter(line => line.trim());
      let insertedCount = 0;

      if (lines.length > 1) {
        // Batch import
        const res = await fetch('/api/urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv: newUrl }),
        });
        const data = await res.json();
        insertedCount = data.inserted || 0;
        toast.success(`${insertedCount} URLs agregadas exitosamente`);
      } else {
        // Single URL
        const res = await fetch('/api/urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: newUrl }),
        });
        const data = await res.json();
        if (data.error) {
          toast.error(data.error);
          setLoading(false);
          return;
        } else {
          insertedCount = 1;
          toast.success('URL agregada exitosamente');
        }
      }

      setNewUrl('');
      await loadUrls();
      onChange?.();

      // Auto-ejecutar scraper si se agregaron URLs
      if (insertedCount > 0) {
        toast.info('Ejecutando scraper automáticamente...');
        try {
          const scraperRes = await fetch('/api/scraper/manual', { method: 'POST' });
          const scraperData = await scraperRes.json();
          if (scraperData.error) {
            toast.error(`Error en scraper: ${scraperData.error}`);
          } else {
            toast.success('Scraper ejecutado correctamente');
          }
          onChange?.();
        } catch (scraperErr) {
          toast.error('Error al ejecutar el scraper');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al agregar';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: string, url: string) => {
    setDeleteConfirm({ id, url });
  };

  const deleteUrl = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    try {
      await fetch(`/api/urls/${deleteConfirm.id}`, { method: 'DELETE' });
      toast.success('URL eliminada exitosamente');
      await loadUrls();
      onChange?.();
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo eliminar';
      toast.error(msg);
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
      toast.success('URL actualizada exitosamente');
      await loadUrls();
      onChange?.();
      closeEditModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo editar';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const text = await file.text();
      const res = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: text }),
      });
      const data = await res.json();
      const insertedCount = data.inserted || 0;

      if (insertedCount > 0) {
        toast.success(`${insertedCount} URLs importadas de ${data.totalReceived} en el archivo`);
      }

      if (data.duplicates > 0) {
        toast.warning(`${data.duplicates} URLs ya existían`);
      }

      await loadUrls();
      onChange?.();

      // Auto-ejecutar scraper si se agregaron URLs
      if (insertedCount > 0) {
        toast.info('Ejecutando scraper automáticamente...');
        try {
          const scraperRes = await fetch('/api/scraper/manual', { method: 'POST' });
          const scraperData = await scraperRes.json();
          if (scraperData.error) {
            toast.error(`Error en scraper: ${scraperData.error}`);
          } else {
            toast.success('Scraper ejecutado correctamente');
          }
          onChange?.();
        } catch (scraperErr) {
          toast.error('Error al ejecutar el scraper');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al importar archivo';
      toast.error(msg);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      </div>

      {/* Search and Filters */}
      <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
        <div className="card bg-white/5 border border-white/10 px-4 py-3">
          <p className="text-xs text-white/50 uppercase tracking-[0.2em] mb-1">Buscar</p>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              className="w-full rounded-lg border border-white/10 bg-black/40 py-2.5 pl-10 pr-10 text-sm text-white outline-none focus:border-[#16DB93]"
              placeholder="Busca por URL exacta o parte de ella"
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
          <p className="text-[11px] text-white/40 mt-2">Solo filtra la lista, no agrega URLs nuevas.</p>
        </div>

        <div className="card bg-white/5 border border-white/10 px-4 py-3">
          <p className="text-xs text-white/50 uppercase tracking-[0.2em] mb-1">Filtrar estado</p>
          <select
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#16DB93]"
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
          <p className="text-[11px] text-white/40 mt-2">Ajusta qué URLs ves en la tabla.</p>
        </div>
      </div>

      {/* Add URLs */}
      <div className="card bg-white/5 border border-white/10 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Agregar URLs</p>
            <p className="text-sm text-white/50">Pega una URL o importa varias desde archivo.</p>
          </div>
          <div className="flex items-center gap-2">
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
              className="text-xs text-[#16DB93] hover:text-[#16DB93] flex items-center gap-1"
              disabled={loading}
            >
              <Upload className="h-3 w-3" />
              Subir archivo
            </button>
          </div>
        </div>

        <form onSubmit={addUrl} className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#16DB93] placeholder:text-white/40"
            placeholder="Agregar una nueva URL para scrapear"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <button
            type="submit"
            className="btn bg-[#16DB93] text-white hover:bg-[#16DB93] px-4 flex items-center gap-2"
            disabled={loading}
            title="Agregar URL"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </form>
      </div>

      <div className="mt-2 flex-1 overflow-auto rounded-lg border border-white/5">
        <table className="min-w-full text-sm text-white/80">
          <thead className="bg-white/5 text-left text-xs uppercase text-white/60 sticky top-0">
            <tr>
              <th className="px-3 py-2">URL</th>
              <th className="px-3 py-2">Proveedor</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && urls.length === 0 ? (
              <tr>
                <td className="px-3 py-12 text-center text-white/60" colSpan={4}>
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Cargando URLs...
                </td>
              </tr>
            ) : urls.length === 0 ? (
              <tr>
                <td className="px-3 py-0" colSpan={4}>
                  <EmptyState
                    icon={Link2}
                    title={searchTerm || statusFilter ? 'No se encontraron URLs' : 'Aún no tienes URLs monitoreadas'}
                    description={
                      searchTerm || statusFilter
                        ? 'Intenta ajustar los filtros para ver más resultados'
                        : 'Agrega tu primera URL de producto para comenzar a rastrear precios'
                    }
                    action={
                      !searchTerm && !statusFilter ? (
                        <button
                          onClick={() => document.querySelector<HTMLInputElement>('input[placeholder*="Agregar"]')?.focus()}
                          className="btn bg-[#16DB93] text-white hover:bg-[#16DB93] flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Agregar primera URL
                        </button>
                      ) : undefined
                    }
                    helpText="Puedes agregar URLs de MercadoLibre, Amazon y otros proveedores"
                  />
                </td>
              </tr>
            ) : (
              urls.map((u) => (
                <tr key={u.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-3 py-2 align-top">
                    {u.url ? (
                      <a
                        href={u.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="line-clamp-2 break-all text-[#16DB93] hover:text-emerald-200 underline decoration-[#16DB93]/60"
                      >
                        {u.url}
                      </a>
                    ) : (
                      <div className="line-clamp-2 break-all text-white">-</div>
                    )}
                    {u.ultimoError && (
                      <p className="text-xs text-[#598392]">Error: {u.ultimoError}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top">{u.proveedor}</td>
                  <td className="px-3 py-2 align-top">
                    {u.status === 'done' ? (
                      <Badge variant="success" icon={CheckCircle2}>
                        Completada
                      </Badge>
                    ) : u.status === 'error' ? (
                      <Badge variant="error" icon={XCircle}>
                        Error
                      </Badge>
                    ) : u.status === 'processing' ? (
                      <Badge variant="info" icon={Loader2}>
                        En proceso
                      </Badge>
                    ) : (
                      <Badge variant="warning" icon={Clock}>
                        Pendiente
                      </Badge>
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
                        className="rounded-lg bg-[#DB2B39]/30 p-2 text-white hover:bg-[#DB2B39]/50"
                        onClick={() => confirmDelete(u.id, u.url)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
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
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#16DB93]"
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
                  className="btn bg-[#16DB93] text-white hover:bg-[#16DB93]"
                  disabled={loading || !editUrlValue.trim()}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#DB2B39]/20 flex items-center justify-center mb-4">
                <Trash className="h-6 w-6 text-[#DB2B39]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">¿Eliminar URL?</h3>
              <p className="text-sm text-white/70 mb-4">
                Esta acción no se puede deshacer.
              </p>
              <div className="w-full bg-white/5 rounded-lg p-3 mb-6">
                <a
                  href={deleteConfirm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/60 break-all line-clamp-2 underline decoration-[#16DB93]/60"
                >
                  {deleteConfirm.url}
                </a>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 btn bg-white/10 text-white hover:bg-white/20"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteUrl}
                  className="flex-1 btn bg-[#DB2B39] text-white hover:bg-[#DB2B39]"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
