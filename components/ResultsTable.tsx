import { useCallback, useEffect, useState } from 'react';
import { FileDown, Loader2, RefreshCw, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ResultFilter, ScrapeResult } from '@/types';

type Props = {
  onRefresh?: () => void;
};

export default function ResultsTable({ onRefresh }: Props) {
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [filters, setFilters] = useState<ResultFilter>({});
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(50);

  const loadResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.proveedor) params.set('proveedor', filters.proveedor);
      if (filters.status) params.set('status', filters.status);
      if (filters.categoria) params.set('categoria', filters.categoria);
      if (filters.search) params.set('search', filters.search);
      params.set('limit', pageSize.toString());
      params.set('offset', ((currentPage - 1) * pageSize).toString());

      const res = await fetch(`/api/resultados?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const updateFilter = (field: keyof ResultFilter, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value || undefined }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  // Pagination helpers
  const totalPages = Math.ceil(totalCount / pageSize);
  const canPrevPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  return (
    <div className="card flex h-full flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Paso 3</p>
          <h3 className="text-lg font-semibold text-white">Revisa los resultados</h3>
          <p className="text-xs text-white/50 mt-1">
            {totalCount > 0 ? `${totalCount} productos scrapeados` : 'Los resultados aparecerán aquí'}
          </p>
        </div>
        {totalCount > 0 && (
          <a
            href="/api/resultados?format=csv"
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <FileDown className="h-3 w-3" />
            Exportar CSV
          </a>
        )}
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-10 pr-10 text-sm text-white outline-none focus:border-emerald-400"
            placeholder="Buscar productos..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
          value={filters.status || ''}
          onChange={(e) => updateFilter('status', e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="success">Exitosos</option>
          <option value="error">Con error</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-emerald-400 hover:text-emerald-300 self-start"
        >
          Limpiar filtros
        </button>
      )}

      <div className="flex-1 overflow-auto rounded-lg border border-white/5">
        <table className="min-w-full text-sm text-white/80">
          <thead className="bg-white/5 text-left text-xs uppercase text-white/60">
            <tr>
              <th className="px-3 py-2">Producto</th>
              <th className="px-3 py-2">Precio</th>
              <th className="px-3 py-2">Desc.</th>
              <th className="px-3 py-2">Proveedor</th>
              <th className="px-3 py-2">Categoria</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">URL</th>
            </tr>
          </thead>
          <tbody>
            {loading && results.length === 0 ? (
              <tr>
                <td className="px-3 py-12 text-center text-white/60" colSpan={8}>
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Cargando resultados...
                </td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-white/60" colSpan={8}>
                  {hasActiveFilters
                    ? 'No se encontraron resultados con esos filtros.'
                    : 'Sin resultados. Ejecuta un scraping para ver datos.'}
                </td>
              </tr>
            ) : (
              results.map((r) => (
                <tr key={r.id || r.url} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-3 py-2">
                    <div className="font-medium text-white">{r.nombre || 'Sin nombre'}</div>
                    {r.error && <div className="text-xs text-amber-300">{r.error}</div>}
                  </td>
                  <td className="px-3 py-2">${r.precio?.toLocaleString('es-AR')}</td>
                  <td className="px-3 py-2">{r.descuento}</td>
                  <td className="px-3 py-2">{r.proveedor}</td>
                  <td className="px-3 py-2">{r.categoria}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        r.status === 'success'
                          ? 'bg-emerald-500/30 text-emerald-100'
                          : 'bg-rose-500/30 text-rose-100'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-white/70">
                    {r.fechaScraping ? new Date(r.fechaScraping).toLocaleString() : '-'}
                  </td>
                  <td className="px-3 py-2 max-w-[240px] break-all text-xs text-white/70">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:underline">
                      {r.url}
                    </a>
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
            Página {currentPage} de {totalPages} ({totalCount} resultados totales)
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
    </div>
  );
}
