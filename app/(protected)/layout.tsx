import type { ReactNode } from 'react';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="protected-layout">
      <aside className="protected-sidebar">
        <div>
          <div className="protected-sidebar-title">Console PetMark</div>
          <div className="protected-sidebar-sub">Inventory &amp; Scadenze</div>
        </div>

        <nav className="protected-nav">
          <a href="/dashboard" className="protected-nav-link">
            <span>Dashboard</span>
            <span>⤵</span>
          </a>
          <a href="/stores" className="protected-nav-link">
            <span>Negozi</span>
            <span className="protected-nav-count">108</span>
          </a>

          <a href="/inventory" className="protected-nav-link">
            <span>Scadenziario</span>
            <span className="protected-nav-count">lotti</span>
          </a>

           <a href="/intake" className="protected-nav-link">
            <span>Carico lotti negozio</span>
            <span>➕</span>
          </a>
            <a href="/accounts" className="protected-nav-link">
            <span>Account</span>
            <span>admin</span>
          </a>

        </nav>

        <div className="protected-sidebar-footer">
          Ambiente demo · ruolo: Admin HQ
        </div>
      </aside>

      <section className="protected-main">{children}</section>
    </div>
  );
}
