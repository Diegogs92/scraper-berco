'use client';

import { LucideIcon } from 'lucide-react';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info';

type Props = {
  variant: BadgeVariant;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
};

export default function Badge({ variant, icon: Icon, children, className = '' }: Props) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
