'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { ProgressTotals } from '@/types';

type Props = {
  totals: ProgressTotals;
  isActive: boolean;
};

export default function ScrapingProgress({ totals, isActive }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [prevProcessing, setPrevProcessing] = useState(0);

  useEffect(() => {
    // Mostrar popup cuando hay items en procesamiento o cuando se activa el scraping
    if (isActive || totals.processing > 0) {
      setIsVisible(true);
    } else if (prevProcessing > 0 && totals.processing === 0) {
      // Mantener visible por 3 segundos después de terminar
      setTimeout(() => setIsVisible(false), 3000);
    }
    setPrevProcessing(totals.processing);
  }, [isActive, totals.processing, prevProcessing]);

  if (!isVisible) return null;

  const total = totals.pending + totals.processing + totals.done + totals.error;
  const processed = totals.done + totals.error;
  const progress = total > 0 ? (processed / total) * 100 : 0;
  const isComplete = totals.processing === 0 && processed > 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="card w-80 p-4 shadow-2xl border-2 border-[#16DB93]/30">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {isComplete ? (
              <div className="w-10 h-10 rounded-full bg-[#16DB93]/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-[#16DB93]" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#598392]/20 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-[#598392] animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">
                {isComplete ? 'Scraping completado' : 'Scrapeando URLs'}
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white/40 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {/* Progress bar */}
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#16DB93] to-[#598392] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">
                  {processed} / {total} URLs
                </span>
                <span className="font-semibold text-[#16DB93]">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Detailed counts */}
              <div className="flex flex-wrap gap-2 text-xs pt-1">
                {totals.processing > 0 && (
                  <div className="flex items-center gap-1 text-[#598392]">
                    <Zap className="h-3 w-3" />
                    <span>{totals.processing} en curso</span>
                  </div>
                )}
                {totals.done > 0 && (
                  <div className="flex items-center gap-1 text-[#16DB93]">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{totals.done} exitosas</span>
                  </div>
                )}
                {totals.error > 0 && (
                  <div className="flex items-center gap-1 text-[#DB2B39]">
                    <XCircle className="h-3 w-3" />
                    <span>{totals.error} errores</span>
                  </div>
                )}
                {totals.pending > 0 && (
                  <div className="flex items-center gap-1 text-white/60">
                    <span>{totals.pending} pendientes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
