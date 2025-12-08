'use client';

import { Toaster } from 'sonner';
import { useTheme } from '@/components/ThemeProvider';

export default function ToastProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme === 'dark' ? 'dark' : 'light'}
      position="bottom-right"
      toastOptions={{
        style: {
          background: theme === 'dark' ? '#111827' : '#ffffff',
          color: theme === 'dark' ? '#e5e7eb' : '#0f172a',
          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
          borderRadius: '12px',
          boxShadow: theme === 'dark'
            ? '0 10px 30px rgba(0,0,0,0.5)'
            : '0 10px 30px rgba(15,23,42,0.15)',
        },
        className: 'toast-custom',
      }}
      richColors
    />
  );
}
