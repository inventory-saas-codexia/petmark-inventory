import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PetMark Inventory Cloud',
  description: 'Scadenziario lotti per la rete PetMark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <div className="app-shell">
          <header className="app-header">
            <div className="app-header-inner">
              <div className="app-brand">
                {/* usa direttamente il logo dell’app turni */}
                <img
                  src="https://zerodayzeus.github.io/petmark-turni-cloud/logo-petmark.png"
                  alt="PetMark"
                  className="app-brand-logo-img"
                />
                <div>
                  <div className="app-brand-text-main">PetMark Inventory Cloud</div>
                  <div className="app-brand-text-sub">
                    Scadenziario &amp; lotti · ambiente demo
                  </div>
                </div>
              </div>
              <div className="app-header-right">
                <span className="app-pill">
                  <span className="app-pill-dot" />
                  <span>Rete PetMark · 108 negozi</span>
                </span>
                <a href="/login" className="btn-primary">
                  Accedi
                </a>
              </div>
            </div>
          </header>

          <main className="app-main">
            <div className="app-main-inner">{children}</div>
          </main>

          <footer className="app-footer">
            <div className="app-footer-inner">
              <span>© {new Date().getFullYear()} PetMark · uso interno demo</span>
              <span>Inventory · Scadenze · Multi-negozio</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
