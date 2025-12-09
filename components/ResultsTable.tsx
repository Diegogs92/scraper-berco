import { useCallback, useEffect, useState } from 'react';
import { FileDown, Loader2, Search, ChevronLeft, ChevronRight, X, CheckCircle2, XCircle, BarChart3, FileText, Play } from 'lucide-react';
import { ResultFilter, ScrapeResult } from '@/types';
import ComparisonModal from './ComparisonModal';
import EmptyState from './EmptyState';
import Badge from './Badge';

type Props = {
  onRefresh?: () => void;
};

// Función para formatear precios correctamente en formato argentino
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

export default function ResultsTable({ onRefresh }: Props) {
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [filters, setFilters] = useState<ResultFilter>({});
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);

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

  // Selection handlers
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map(r => r.id || r.url)));
    }
  };

  const selectedProducts = results.filter(r => selectedIds.has(r.id || r.url));

  return (
    <div className="card flex h-full flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/50 font-semibold mb-2">Paso 3</p>
          <h3 className="text-xl font-bold text-white mb-1">Revisa los resultados</h3>
          <p className="text-sm text-white/60">
            {totalCount > 0 ? `${totalCount} productos scrapeados` : 'Los resultados aparecerán aquí'}
          </p>
        </div>
        {totalCount > 0 && (
          <a
            href="/api/resultados?format=csv"
            className="btn bg-white/5 text-[#1EA896] hover:bg-white/10 flex items-center gap-2 border border-[#1EA896]/30"
          >
            <FileDown className="h-4 w-4" />
            <span>Exportar CSV</span>
          </a>
        )}
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            className="input w-full pl-10 pr-10"
            placeholder="Buscar productos..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          className="input min-w-[200px]"
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
          className="text-xs text-[#1EA896] hover:text-[#1EA896] self-start"
        >
          Limpiar filtros
        </button>
      )}

      {selectedIds.size > 0 && (
        <button
          onClick={() => setShowComparison(true)}
          className="btn bg-[#1EA896] hover:bg-[#147a6a] text-white flex items-center gap-2 shadow-md shadow-[#1EA896]/20"
        >
          <BarChart3 className="h-4 w-4" />
          Comparar {selectedIds.size} {selectedIds.size === 1 ? 'Producto' : 'Productos'}
        </button>
      )}

      <div className="table-container flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase font-semibold text-white/70 sticky top-0 backdrop-blur-sm">
            <tr className="border-b border-white/10">
              <th className="px-5 py-4 w-12">
                <input
                  type="checkbox"
                  checked={results.length > 0 && selectedIds.size === results.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#1EA896] focus:ring-[#1EA896] focus:ring-offset-0 cursor-pointer"
                />
              </th>
              <th className="px-5 py-4">Producto</th>
              <th className="px-5 py-4">Precio</th>
              <th className="px-5 py-4">Descuento</th>
              <th className="px-5 py-4">Proveedor</th>
              <th className="px-5 py-4">Categoría</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading && results.length === 0 ? (
              <tr>
                <td className="px-4 py-12 text-center text-white/60" colSpan={8}>
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Cargando resultados...
                </td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td className="px-4 py-0" colSpan={8}>
                  <EmptyState
                    icon={hasActiveFilters ? Search : FileText}
                    title={hasActiveFilters ? 'No se encontraron resultados' : 'No hay resultados aún'}
                    description={
                      hasActiveFilters
                        ? 'Intenta ajustar o limpiar los filtros para ver más resultados'
                        : 'Agrega URLs y ejecuta el scraper para ver productos y precios'
                    }
                    action={
                      !hasActiveFilters ? (
                        <button
                          onClick={() => {/* Navigate to URLs section */}}
                          className="btn bg-[#1EA896] text-white hover:bg-[#147a6a] flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Ir a agregar URLs
                        </button>
                      ) : undefined
                    }
                    helpText={hasActiveFilters ? undefined : 'Los resultados aparecerán aquí después del scraping'}
                  />
                </td>
              </tr>
            ) : (
              results.map((r, index) => {
                const rowId = r.id || r.url;
                const isSelected = selectedIds.has(rowId);
                return (
                  <tr key={rowId} className={`border-b border-white/5 transition-colors ${
                    index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'
                  } hover:bg-white/[0.05]`}>
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(rowId)}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#1EA896] focus:ring-[#1EA896] focus:ring-offset-0 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white mb-1">{r.nombre || 'Sin nombre'}</div>
                      {r.error && <div className="text-xs text-[#FF715B] mb-1">{r.error}</div>}
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#1EA896] hover:text-[#1EA896]/80 transition-colors inline-flex items-center gap-1"
                      >
                        Ver producto
                      </a>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-white text-base">${r.precio ? formatPrice(r.precio) : '-'}</span>
                    </td>
                    <td className="px-5 py-4">
                      {r.descuento ? (
                        <span className="text-[#1EA896] font-semibold">{r.descuento}</span>
                      ) : (
                        <span className="text-white/30">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-white/80 font-medium">{r.proveedor}</td>
                    <td className="px-5 py-4 text-white/60">{r.categoria || '-'}</td>
                    <td className="px-5 py-4">
                      {r.status === 'success' ? (
                        <Badge variant="success" icon={CheckCircle2}>
                          Exitoso
                        </Badge>
                      ) : (
                        <Badge variant="error" icon={XCircle}>
                          Error
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-white/50 whitespace-nowrap font-medium">
                      {r.fechaScraping ? new Date(r.fechaScraping).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                      }) : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
          <div className="text-sm text-white/60 font-medium">
            Página <span className="text-white">{currentPage}</span> de <span className="text-white">{totalPages}</span>
            <span className="text-white/40 ml-2">({totalCount} resultados totales)</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={!canPrevPage}
              className="btn bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={!canNextPage}
              className="btn bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10"
            >
              <span>Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <ComparisonModal
          products={selectedProducts}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
