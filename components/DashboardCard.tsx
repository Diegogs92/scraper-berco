'use client';

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  stats?: { label: string; value: string | number; color?: string }[];
  actions?: ReactNode;
  preview?: ReactNode;
  onClick?: () => void;
  badge?: ReactNode;
};

export default function DashboardCard({
  icon: Icon,
  title,
  description,
  stats,
  actions,
  preview,
  onClick,
  badge,
}: Props) {
  return (
    <div
      className={`card p-6 flex flex-col gap-4 ${onClick ? 'cursor-pointer hover:border-[#16DB93]/30' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-[#16DB93]/20 to-[#598392]/20 p-3">
            <Icon className="h-6 w-6 text-[#16DB93]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {badge}
            </div>
            {description && (
              <p className="text-sm text-white/60 mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex-1 min-w-[120px] rounded-lg bg-white/5 px-4 py-3 border border-white/10"
            >
              <p className="text-xs text-white/60 uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p
                className={`text-2xl font-bold ${stat.color || 'text-white'}`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="border-t border-white/10 pt-4 -mb-2">
          {preview}
        </div>
      )}
    </div>
  );
}
