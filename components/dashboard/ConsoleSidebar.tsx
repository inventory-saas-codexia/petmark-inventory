'use client';

import Link from 'next/link';
import { useCurrentProfile } from '@/lib/hooks/useCurrentProfile';

export function ConsoleSidebar() {
  const { profile, loading } = useCurrentProfile();

  const orgName = profile?.organization_name ?? 'PetMark';
  const role =
    profile?.role === 'hq'
      ? 'Admin HQ'
      : profile?.role === 'area_manager'
      ? 'Area manager'
      : profile?.role === 'store_manager'
      ? 'Store manager'
      : 'Staff';

  return (
    <aside className="console-card">
      <div className="console-card-header">
        <p className="console-card-title">CONSOLE PETMARK</p>
        <p className="console-card-subtitle">Inventory &amp; Scadenze</p>
      </div>

      <nav className="console-nav">
        <Link href="/dashboard" className="console-nav-button">
          <span>Dashboard ↻</span>
        </Link>

        <Link href="/stores" className="console-nav-button">
          <span>Negozi</span>
          {/* se hai il numero negozi lo puoi mettere qui */}
        </Link>

        <Link href="/expiry" className="console-nav-button">
          <span>Scadenziario</span>
          <span className="console-badge">lotti</span>
        </Link>

        <Link href="/store-batches" className="console-nav-button">
          <span>Carico lotti negozio</span>
          <span className="console-plus">+</span>
        </Link>

        {/* 👉 NUOVO BOTTONE: Import listino prodotti */}
        <Link href="/products/import" className="console-nav-button console-nav-button-accent">
          <span>Import listino prodotti</span>
        </Link>

        <Link href="/accounts" className="console-nav-button">
          <span>Crea account</span>
        </Link>
      </nav>

      <div className="console-footer">
        <p className="console-footer-env">
          Ambiente demo · ruolo:{' '}
          <span className="console-footer-role">
            {loading ? '…' : role}
          </span>
        </p>
        <p className="console-footer-org">{orgName}</p>
      </div>
    </aside>
  );
}
