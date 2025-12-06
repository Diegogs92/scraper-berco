import { useCallback, useEffect, useState } from 'react';
import { Loader2, Play, Square, Zap } from 'lucide-react';
import { ProgressTotals, ScrapeBatchSummary, ScraperConfig } from '@/types';

type Props = {
  onRefresh?: () => void;
  totals: ProgressTotals;
};

export default function ScraperControls({ onRefresh, totals }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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
    setMessage('');
    try {
      const res = await fetch(path, { method: 'POST' });
      const data: ScrapeBatchSummary | { message?: string; error?: string } = await res.json();

      if ('error' in data && data.error) {
        setMessage(data.error);
      } else if ('message' in data && data.message) {
        setMessage(data.message);
      } else if ('processed' in data) {
        setMessage(
          `${label}: ${data.processed} procesadas, ${data.errors} con error. Restantes: ${data.remaining}`
        );
      } else {
        setMessage('Accion enviada.');
      }

      await loadStatus();
      onRefresh?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Control</p>
            {isPolling && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Actualizando en vivo
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-white">
            {config.scrapingActivo ? 'Automático activo' : 'Listo para ejecutar'}
          </h3>
          <p className="text-sm text-white/70">
            Última ejecución:{' '}
            {config.ultimaEjecucion ? new Date(config.ultimaEjecucion).toLocaleString() : 'N/D'}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            onClick={() => run('/api/scraper/manual', 'Lote manual')}
            className="btn bg-white/10 text-white hover:bg-white/20"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Ejecutar manual
          </button>
          <button
            onClick={() => run('/api/scraper/start', 'Modo automatico')}
            className="btn bg-emerald-500 text-white hover:bg-emerald-400"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Iniciar automatico
          </button>
          <button
            onClick={() => run('/api/scraper/stop', 'Stop')}
            className="btn bg-rose-500/80 text-white hover:bg-rose-500"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
            Detener
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-white/70">
        <span className="rounded-full bg-white/10 px-3 py-1">Pendientes: {totals.pending}</span>
        <span className="rounded-full bg-white/10 px-3 py-1">En curso: {totals.processing}</span>
        <span className="rounded-full bg-white/10 px-3 py-1">Completadas: {totals.done}</span>
        <span className="rounded-full bg-white/10 px-3 py-1">Errores: {totals.error}</span>
      </div>
      {message && <p className="text-sm text-amber-300">{message}</p>}
    </div>
  );
}
