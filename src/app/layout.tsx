import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { AuthProvider } from '@/lib/auth/context';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Nirapod — Dhaka Citizen Safety & AI Hazard Platform',
  description: 'Know the risk before you take the step. Live AI hazard classification, routing, and emergency SOS alerts for Dhaka commuters.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        <I18nProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <footer className="border-t border-slate-800 py-6 bg-slate-900/50 text-center text-xs text-slate-500">
              Nirapod Prototype &copy; 2026 — Built for Dhaka Citizen Safety & Emergency Resilience.
            </footer>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
