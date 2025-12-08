'use client';

import { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, X, ChevronRight } from 'lucide-react';

type Alert = {
  id: string;
  nombreProducto: string;
  precioAnterior: number;
  precioActual: number;
  porcentajeCambio: number;
};

type Props = {
  onViewAlerts: () => void;
};

export default function AlertBanner({ onViewAlerts }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await fetch('/api/alerts');
        const data = await res.json();
        const unreadAlerts = data.alerts?.filter((a: { leido: boolean }) => !a.leido) || [];
        setAlerts(unreadAlerts.slice(0, 3)); // Show max 3 in banner
      } catch (err) {
        console.error('Error loading alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
    // Refresh every 5 minutes
    const interval = setInterval(loadAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || alerts.length === 0 || dismissed) return null;

  const priceDrops = alerts.filter((a) => a.porcentajeCambio < 0);
  const hasDrops = priceDrops.length > 0;

  return (
    <div
      className={`card mb-6 p-4 border-l-4 ${
        hasDrops ? 'border-[#16DB93] bg-[#16DB93]/10' : 'border-[#598392] bg-[#598392]/10'
      } animate-slide-up`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {hasDrops ? (
            <div className="w-10 h-10 rounded-full bg-[#16DB93]/20 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-[#16DB93]" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#598392]/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-[#598392]" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white mb-1">
                {hasDrops
                  ? `¡${priceDrops.length} producto${priceDrops.length > 1 ? 's bajaron' : ' bajó'} de precio!`
                  : `${alerts.length} cambio${alerts.length > 1 ? 's' : ''} de precio detectado${alerts.length > 1 ? 's' : ''}`}
              </h3>
              <div className="space-y-1">
                {alerts.slice(0, 2).map((alert) => (
                  <p key={alert.id} className="text-sm text-white/80">
                    <span className="font-medium">{alert.nombreProducto}</span> -{' '}
                    <span
                      className={
                        alert.porcentajeCambio < 0 ? 'text-[#16DB93]' : 'text-[#DB2B39]'
                      }
                    >
                      {alert.porcentajeCambio > 0 ? '+' : ''}
                      {alert.porcentajeCambio.toFixed(1)}%
                    </span>
                  </p>
                ))}
                {alerts.length > 2 && (
                  <p className="text-xs text-white/60">
                    y {alerts.length - 2} más...
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={onViewAlerts}
              className="btn bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
            >
              Ver todas las alertas
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-sm text-white/60 hover:text-white/80 transition-colors"
            >
              Recordarme después
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
