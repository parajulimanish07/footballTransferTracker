import type { Metadata } from 'next';
import { ThemeFontProvider } from '@/components/theme/theme-font-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Transfer Tracker | Verified Football Transfer Intelligence',
  description: 'Verified football transfer reports from trusted sources and Tier-1 journalists only.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" data-font="space-grotesk">
      <body className="font-sans antialiased bg-bg text-text selection:bg-accent-emerald/30 selection:text-white transition-colors duration-200">
        <ThemeFontProvider>
          {children}
        </ThemeFontProvider>
      </body>
    </html>
  );
}