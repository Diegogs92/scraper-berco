'use client';

import { useCallback, useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrapingProgress from '@/components/ScrapingProgress';
import Navbar from '@/components/Navbar';
import URLSection from '@/components/sections/URLSection';
import ResultsSection from '@/components/sections/ResultsSection';
import EvolutionSection from '@/components/sections/EvolutionSection';
import { ProgressTotals } from '@/types';

const emptyTotals: ProgressTotals = { pending: 0, processing: 0, done: 0, error: 0 };

type NavSection = 'urls' | 'resultados' | 'evolucion';

function DashboardContent() {
  const [totals, setTotals] = useState<ProgressTotals>(emptyTotals);
  const [scrapingActive, setScrapingActive] = useState(false);
  const [activeSection, setActiveSection] = useState<NavSection>('urls');

  const refreshProgress = useCallback(async () => {
    const res = await fetch('/api/urls?limit=1');
    const data = await res.json();
    setTotals(data.totals || emptyTotals);
    setScrapingActive(data.config?.scrapingActivo || false);
  }, []);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const renderSection = () => {
    switch (activeSection) {
      case 'urls':
        return <URLSection totals={totals} onRefresh={refreshProgress} />;
      case 'resultados':
        return <ResultsSection onRefresh={refreshProgress} />;
      case 'evolucion':
        return <EvolutionSection />;
      default:
        return <URLSection totals={totals} onRefresh={refreshProgress} />;
    }
  };

  return (
    <main className="min-h-screen">
      <ScrapingProgress totals={totals} isActive={scrapingActive} />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4">
        <Navbar activeSection={activeSection} onSectionChange={setActiveSection} />

        <div className="animate-fade-in">
          {renderSection()}
        </div>
      </div>
    </main>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
