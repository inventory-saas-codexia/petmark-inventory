import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PetMark Inventory',
  description: 'Smart expiry & inventory management for pet shops',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold">
                  PM
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-tight">
                    PetMark Inventory
                  </div>
                  <div className="text-xs text-slate-400">
                    Expiry & stock intelligence
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
          </main>

          <footer className="border-t border-slate-800 bg-slate-950/80">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-xs text-slate-500">
              <span>© {new Date().getFullYear()} PetMark Inventory</span>
              <span>Internal demo · Not for distribution</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
