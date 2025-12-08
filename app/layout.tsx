import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import ToastProvider from '@/components/ToastProvider';
import { activeFont } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Scraper de Precios',
  description: 'Dashboard para scraping de precios en Next.js + Firebase',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${activeFont.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
