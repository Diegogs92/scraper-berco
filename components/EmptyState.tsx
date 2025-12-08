'use client';

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  helpText?: string;
};

export default function EmptyState({ icon: Icon, title, description, action, helpText }: Props) {
  return (
    <div className="text-center py-12 px-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
        <Icon className="h-8 w-8 text-white/30" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-white/60 max-w-md mx-auto mb-6">{description}</p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
      {helpText && (
        <p className="text-xs text-white/40 mt-4 max-w-sm mx-auto">{helpText}</p>
      )}
    </div>
  );
}
