'use client';

import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { PriceAlert } from '@/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type SeriesPoint = { fecha: string; precio: number; proveedor: string };

export default function PriceEvolution() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [selected, setSelected] = useState<PriceAlert | null>(null);
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAlerts = async () => {
    try {
      const res = await fetch('/api/alerts?limit=50');
      const data = await res.json();
      setAlerts(data.alerts || []);
      const savedId = typeof window !== 'undefined' ? sessionStorage.getItem('selectedAlertId') : null;
      const saved = data.alerts?.find((a: PriceAlert) => a.id === savedId);
      if (saved) {
        setSelected(saved);
      } else if (!selected && data.alerts && data.alerts.length > 0) {
        setSelected(data.alerts[0]);
      }
    } catch (err) {
      console.error('Error loading alerts', err);
    }
  };

  const loadSeries = async (urlId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/evolucion?urlId=${encodeURIComponent(urlId)}&limit=120`);
      const data = await res.json();
      setSeries(data.series || []);
    } catch (err) {
      console.error('Error loading series', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    if (selected?.urlId) {
      loadSeries(selected.urlId);
    }
  }, [selected?.urlId]);

  const chartData = useMemo(() => {
    const labels = series.map((p) =>
      new Date(p.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
    );
    const data = series.map((p) => p.precio);
    return {
      labels,
      datasets: [
        {
          label: 'Precio',
          data,
          fill: false,
          borderColor: '#34d399',
          backgroundColor: '#34d399',
          tension: 0.25,
        },
      ],
    };
  }, [series]);

  const current = useMemo(() => series[series.length - 1], [series]);
  const previous = useMemo(() => (series.length > 1 ? series[series.length - 2] : null), [series]);
  const delta = current && previous ? current.precio - previous.precio : 0;
  const deltaPct = previous && previous.precio ? (delta / previous.precio) * 100 : 0;

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Evolución</p>
          <h3 className="text-lg font-semibold text-white">Histórico de precios</h3>
          <p className="text-xs text-white/50 mt-1">Selecciona un producto con cambios recientes.</p>
        </div>
        <button
          onClick={loadAlerts}
          className="text-xs text-[#16DB93] hover:text-[#16DB93]"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualizar'}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-white/80">Producto</label>
        <select
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#16DB93]"
          value={selected?.id || ''}
          onChange={(e) => {
            const next = alerts.find((a) => a.id === e.target.value);
            if (next) setSelected(next);
          }}
        >
          {!selected && <option value="">Selecciona un producto</option>}
          {alerts.map((alert) => (
            <option key={alert.id} value={alert.id}>
              {alert.nombre} — {alert.proveedor}
            </option>
          ))}
        </select>
        {selected && (
          <p className="text-xs text-white/60 break-all">
            {selected.url}
          </p>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-white/60">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Cargando evolución...
        </div>
      ) : series.length < 2 ? (
        <div className="py-8 text-center text-white/60 text-sm">
          Aún no hay suficientes puntos históricos para este producto.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            {delta === 0 ? null : delta > 0 ? (
              <ArrowUpRight className="h-5 w-5 text-[#DB2B39]" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-[#16DB93]" />
            )}
            <div>
              <div className="text-white text-lg font-semibold">
                ${Math.abs(delta).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                {delta > 0 ? ' más' : delta < 0 ? ' menos' : ''}
              </div>
              <div className="text-xs text-white/60">
                Cambio vs último punto: {deltaPct.toFixed(2)}%
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { ticks: { color: '#cbd5e1' }, grid: { color: '#1f2937' } },
                  x: { ticks: { color: '#cbd5e1' }, grid: { color: '#1f2937' } },
                },
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
