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
            <span>108</span>
          </a>
          <a href="/inventory" className="protected-nav-link">
            <span>Scadenziario</span>
            <span>lotti</span>
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
