'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Link2, FileText, TrendingUp, X } from 'lucide-react';

type SearchResult = {
  type: 'url' | 'result' | 'alert';
  id: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function GlobalSearch({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Search across multiple endpoints
      const [urlsRes, resultsRes] = await Promise.all([
        fetch(`/api/urls?search=${encodeURIComponent(q)}&limit=5`),
        fetch(`/api/resultados?search=${encodeURIComponent(q)}&limit=5`),
      ]);

      const urlsData = await urlsRes.json();
      const resultsData = await resultsRes.json();

      const searchResults: SearchResult[] = [
        ...(urlsData.urls || []).map((url: { id: string; url: string; proveedor: string }) => ({
          type: 'url' as const,
          id: url.id,
          title: url.url,
          subtitle: url.proveedor,
          onClick: () => {
            // Navigate to URLs section
            onClose();
          },
        })),
        ...(resultsData.results || []).map((r: { id: string; nombre: string; proveedor: string; precio: number }) => ({
          type: 'result' as const,
          id: r.id,
          title: r.nombre,
          subtitle: `${r.proveedor} - $${r.precio}`,
          onClick: () => {
            // Navigate to results section
            onClose();
          },
        })),
      ];

      setResults(searchResults);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [onClose]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // Trigger open from parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm pt-20 px-4">
      <div className="card w-full max-w-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Search className="h-5 w-5 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos, URLs, proveedores..."
            className="flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-white/60">
              Buscando...
            </div>
          ) : results.length === 0 && query ? (
            <div className="p-8 text-center text-white/60">
              No se encontraron resultados para &ldquo;{query}&rdquo;
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-white/60">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Busca productos, URLs o proveedores</p>
              <p className="text-xs mt-2 text-white/40">
                Usa <kbd className="px-2 py-1 bg-white/10 rounded">Cmd</kbd> +{' '}
                <kbd className="px-2 py-1 bg-white/10 rounded">K</kbd> para abrir
              </p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((result) => {
                const Icon = result.type === 'url' ? Link2 : result.type === 'result' ? FileText : TrendingUp;
                return (
                  <button
                    key={result.id}
                    onClick={result.onClick}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[#16DB93]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-xs text-white/50 truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white/10 rounded">↑</kbd>
              <kbd className="px-2 py-1 bg-white/10 rounded">↓</kbd>
              <span>navegar</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white/10 rounded">Enter</kbd>
              <span>seleccionar</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-white/10 rounded">Esc</kbd>
            <span>cerrar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
