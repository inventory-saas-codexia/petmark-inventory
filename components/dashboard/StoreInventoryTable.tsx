'use client';

import React from 'react';

/**
 * Calcola i giorni alla scadenza (negativo se già scaduto).
 */
function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Classifica la severità in base ai giorni alla scadenza.
 */
function getBadgeClass(days: number): string {
  if (days <= 7) return 'badge badge-danger';
  if (days <= 30) return 'badge badge-warn';
  if (days <= 90) return 'badge badge-soft';
  return 'badge badge-ok';
}

export interface StoreInventoryTableProps {
  // per ora generico, così non dipendiamo da StaffDashboard
  items: any[];
}

/**
 * Tabella inventory per vista Store Manager / Staff.
 * Riceve un array di `items` già filtrati.
 */
export default function StoreInventoryTable({
  items,
}: StoreInventoryTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className="table-card">
        <div className="table-header-sub">
          Nessun lotto presente per questo negozio.
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-header">
        <div>
          <div className="table-header-title">Vista negozio · lotti in scadenza</div>
          <div className="table-header-sub">
            <strong>Legenda:</strong>{' '}
            <span className="badge badge-danger">≤ 7</span> rosso = scaduto o
            entro 7 giorni ·{' '}
            <span className="badge badge-warn">8–30</span> arancione ·{' '}
            <span className="badge badge-soft">31–90</span> giallo ·{' '}
            <span className="badge badge-ok">&gt; 90</span> verde.
          </div>
        </div>
      </div>

      <div className="responsive-table-wrapper">
        <table className="responsive-table data-table">
          <thead>
            <tr>
              <th>Prodotto</th>
              <th>SKU</th>
              <th>Brand</th>
              <th>Scadenza</th>
              <th style={{ textAlign: 'right' }}>Giorni</th>
              <th style={{ textAlign: 'right' }}>Quantità</th>
              <th>Lotto</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row: any) => {
              // ADATTA questi nomi se nel tuo oggetto sono diversi
              const d = daysUntil(row.expiry_date);
              const badgeClass = getBadgeClass(d);

              return (
                <tr key={row.id}>
                  <td>{row.product_name ?? row.product?.name}</td>
                  <td>{row.sku ?? row.product?.sku}</td>
                  <td>{row.brand ?? row.product?.brand}</td>
                  <td>{row.expiry_date}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={badgeClass}>{d}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>{row.quantity}</td>
                  <td>{row.batch_code}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
