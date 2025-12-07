'use client';

import { useCallback, useEffect, useState } from 'react';
import PriceComparison from '../PriceComparison';
import { TrendingUp, Package, DollarSign, AlertCircle } from 'lucide-react';
import { ProgressTotals } from '@/types';

type Props = {
  totals: ProgressTotals;
};

export default function StatsSection({ totals }: Props) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    avgPrice: 0,
    providerCount: 0,
    errorRate: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/resultados?limit=1');
      const data = await res.json();

      // Calculate basic stats
      const total = totals.done + totals.error;
      const errorRate = total > 0 ? (totals.error / total) * 100 : 0;

      setStats({
        totalProducts: data.total || 0,
        avgPrice: 0, // We could calculate this from results
        providerCount: 0, // We could get unique providers
        errorRate,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, [totals]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const statCards = [
    {
      label: 'Productos Totales',
      value: stats.totalProducts,
      icon: Package,
      color: 'emerald',
    },
    {
      label: 'URLs Procesadas',
      value: totals.done,
      icon: TrendingUp,
      color: 'sky',
    },
    {
      label: 'Con Errores',
      value: totals.error,
      icon: AlertCircle,
      color: 'rose',
    },
    {
      label: 'Tasa de Error',
      value: `${stats.errorRate.toFixed(1)}%`,
      icon: DollarSign,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Estadísticas y Comparativas</h2>
        <p className="text-white/70">
          Análisis de datos y comparación de precios entre proveedores
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="card p-4 hover:scale-105 transition-transform duration-200"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/20 flex items-center justify-center`}
                >
                  <Icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Comparison */}
      <PriceComparison />
    </div>
  );
}
