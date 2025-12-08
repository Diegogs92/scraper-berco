'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, ArrowDownRight, ArrowUpRight, Loader2, Check } from 'lucide-react';
import { PriceAlert } from '@/types';

type Props = {
  onSelect?: (alert: PriceAlert) => void;
};

export default function PriceAlertsBadge({ onSelect }: Props) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const unread = useMemo(() => alerts.filter((a) => !a.leida), [alerts]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/alerts?limit=15');
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Error loading alerts', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setAlerts((prev) => prev.map((a) => ({ ...a, leida: true })));
    } catch (err) {
      console.error('Error marking alerts', err);
    }
  };

  useEffect(() => {
    loadAlerts();
    const id = setInterval(loadAlerts, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
        aria-label="Ver alertas de precio"
      >
        <Bell className="h-5 w-5" />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#DB2B39] text-[10px] font-semibold flex items-center justify-center">
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 rounded-xl border border-white/10 bg-black/80 backdrop-blur shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div>
              <p className="text-sm font-semibold text-white">Cambios de precio</p>
              <p className="text-xs text-white/50">Últimos movimientos detectados</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllRead}
                className="text-xs text-[#16DB93] hover:text-[#16DB93] flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                Marcar leídas
              </button>
              <button
                onClick={loadAlerts}
                className="p-1 rounded bg-white/5 text-white hover:bg-white/10"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-xs">Recargar</span>}
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-auto divide-y divide-white/5">
            {loading && alerts.length === 0 ? (
              <div className="py-6 text-center text-white/60 text-sm">Cargando alertas...</div>
            ) : alerts.length === 0 ? (
              <div className="py-6 text-center text-white/60 text-sm">Sin cambios de precio aún.</div>
            ) : (
              alerts.map((alert) => {
                const isUp = alert.delta > 0;
                return (
                  <button
                    key={alert.id}
                  onClick={() => {
                      sessionStorage.setItem('selectedAlertId', alert.id || '');
                      onSelect?.(alert);
                      setOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white line-clamp-1">{alert.nombre}</p>
                        <p className="text-xs text-white/60 line-clamp-1">{alert.proveedor}</p>
                        <p className="text-[11px] text-white/50 mt-1">
                          {new Date(alert.fecha).toLocaleString('es-AR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isUp ? (
                          <ArrowUpRight className="h-4 w-4 text-[#DB2B39]" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-[#16DB93]" />
                        )}
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">
                            {isUp ? '+' : '-'}${Math.abs(alert.delta).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-[11px] text-white/60">
                            {alert.deltaPorcentaje.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
