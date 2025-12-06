import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const font = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Scraper de Precios',
  description: 'Dashboard para scraping de precios en Next.js + Firebase',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${font.className} bg-surface text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
