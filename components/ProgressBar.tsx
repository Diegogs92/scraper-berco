import { ProgressTotals } from '@/types';

type Props = {
  totals: ProgressTotals;
};

export default function ProgressBar({ totals }: Props) {
  const total = totals.pending + totals.processing + totals.done + totals.error || 1;
  const segments = [
    { label: 'Pendientes', value: totals.pending, color: 'bg-[#598392]' },
    { label: 'En curso', value: totals.processing, color: 'bg-[#598392]' },
    { label: 'OK', value: totals.done, color: 'bg-[#16DB93]' },
    { label: 'Errores', value: totals.error, color: 'bg-[#DB2B39]' },
  ];

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Progreso</p>
          <h2 className="text-lg font-semibold text-white">
            {totals.done} procesadas / {totals.pending} pendientes
          </h2>
        </div>
        <div className="flex gap-3 text-sm text-white/70">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${s.color}`} />
              <span>
                {s.label}: {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
        <div className="flex h-full">
          {segments.map((s) => (
            <div
              key={s.label}
              className={`${s.color} h-full`}
              style={{ width: `${(s.value / total) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
