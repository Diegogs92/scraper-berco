import { useCallback, useEffect, useState } from 'react';
import { Loader2, Play, Square } from 'lucide-react';
import { toast } from 'sonner';
import { ProgressTotals, ScrapeBatchSummary, ScraperConfig } from '@/types';

type Props = {
  onRefresh?: () => void;
  totals: ProgressTotals;
};

export default function ScraperControls({ onRefresh, totals }: Props) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ScraperConfig>({ scrapingActivo: false });
  const [isPolling, setIsPolling] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/urls?limit=1');
      const data = await res.json();
      setConfig(data.config || { scrapingActivo: false });
      return data.config?.scrapingActivo || false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Auto-refresh when scraping is active (polling every 5 seconds)
  useEffect(() => {
    if (config.scrapingActivo || totals.processing > 0) {
      setIsPolling(true);
      const interval = setInterval(async () => {
        const status = await loadStatus();
        onRefresh?.();

        // Stop polling if scraping is no longer active and no items are processing
        if (!status && totals.processing === 0) {
          setIsPolling(false);
          clearInterval(interval);
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    } else {
      setIsPolling(false);
    }
  }, [config.scrapingActivo, totals.processing, loadStatus, onRefresh]);

  const run = async (path: string, label: string) => {
    setLoading(true);
    try {
      const res = await fetch(path, { method: 'POST' });
      const data: ScrapeBatchSummary | { message?: string; error?: string } = await res.json();

      if ('error' in data && data.error) {
        toast.error(data.error);
      } else if ('message' in data && data.message) {
        toast.success(data.message);
      } else if ('processed' in data) {
        toast.success(
          `${label}: ${data.processed} procesadas, ${data.errors} con error. Restantes: ${data.remaining}`
        );
      } else {
        toast.success('Acción enviada exitosamente');
      }

      await loadStatus();
      onRefresh?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Paso 2</p>
            {isPolling && (
              <span className="flex items-center gap-1 text-xs text-[#16DB93]">
                <span className="h-2 w-2 rounded-full bg-[#16DB93] animate-pulse"></span>
                Actualizando
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-white">Ejecuta el scraper</h3>
          <p className="text-xs text-white/50 mt-1">
            {config.scrapingActivo
              ? 'Modo automático activo - el scraper se ejecuta diariamente'
              : 'Presiona para procesar URLs pendientes'}
          </p>
        </div>
        <button
          onClick={() => run(
            config.scrapingActivo ? '/api/scraper/stop' : '/api/scraper/start',
            config.scrapingActivo ? 'Stop' : 'Inicio automático'
          )}
          className={`btn ${
            config.scrapingActivo
              ? 'bg-[#DB2B39]/80 text-white hover:bg-[#DB2B39]'
              : 'bg-[#16DB93] text-white hover:bg-[#16DB93]'
          }`}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : config.scrapingActivo ? (
            <Square className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {config.scrapingActivo ? 'Detener' : 'Iniciar'}
        </button>
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-white/70">
        <span className="rounded-full bg-white/10 px-3 py-1">Pendientes: {totals.pending}</span>
        <span className="rounded-full bg-white/10 px-3 py-1">En curso: {totals.processing}</span>
        <span className="rounded-full bg-white/10 px-3 py-1">Completadas: {totals.done}</span>
        <span className="rounded-full bg-white/10 px-3 py-1">Errores: {totals.error}</span>
      </div>
      {config.ultimaEjecucion && (
        <p className="text-xs text-white/50">
          Última ejecución: {new Date(config.ultimaEjecucion).toLocaleString()}
        </p>
      )}
    </div>
  );
}
