'use client';

import { useCallback, useEffect, useState } from 'react';
import URLManager from '@/components/URLManager';
import ResultsTable from '@/components/ResultsTable';
import ScraperControls from '@/components/ScraperControls';
import ProgressBar from '@/components/ProgressBar';
import { ProgressTotals } from '@/types';

const emptyTotals: ProgressTotals = { pending: 0, processing: 0, done: 0, error: 0 };

export default function Dashboard() {
  const [totals, setTotals] = useState<ProgressTotals>(emptyTotals);

  const refreshProgress = useCallback(async () => {
    const res = await fetch('/api/urls?limit=1');
    const data = await res.json();
    setTotals(data.totals || emptyTotals);
  }, []);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.2em] text-white/60">Scraper</p>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-semibold text-white">Scraper de precios</h1>
            <p className="text-white/70">
              Ejecuta scraping manual o automatico, gestiona las URLs y exporta resultados.
            </p>
          </div>
          <ScraperControls onRefresh={refreshProgress} totals={totals} />
        </div>
      </div>

      <ProgressBar totals={totals} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <URLManager onChange={refreshProgress} />
        </div>
        <div className="lg:col-span-3">
          <ResultsTable onRefresh={refreshProgress} />
        </div>
      </div>
    </main>
  );
}
