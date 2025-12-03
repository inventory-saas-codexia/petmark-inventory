'use client';

import React from 'react';

/**
 * Riga di inventario per la vista negozio.
 * Puoi adattare i nomi dei campi se i tuoi dati sono leggermente diversi.
 */
export interface StoreInventoryRow {
  id: string;
  product_name: string;
  sku: string;
  brand: string | null;
  expiry_date: string; // ISO date string (es. "2025-10-19")
  quantity: number;
  batch_code: string | null;
}

/**
 * Calcola giorni alla scadenza (negativo = già scaduto)
 */
function getDaysToExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  const diffMs = exp.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function getStatusLabel(daysToExpiry: number): { label: string; color: string } {
  if (daysToExpiry < 0) {
    return { label: `Scaduto da ${Math.abs(daysToExpiry)}g`, color: '#B91C1C' }; // rosso
  }
  if (daysToExpiry <= 30) {
    return { label: `In scadenza (${daysToExpiry}g)`, color: '#B45309' }; // arancio
  }
  if (daysToExpiry <= 90) {
    return { label: `OK (${daysToExpiry}g)`, color: '#15803D' }; // verde medio
  }
  return { label: `Lungo termine (${daysToExpiry}g)`, color: '#047857' }; // verde più scuro
}

export interface StoreInventoryTableProps {
  batches: StoreInventoryRow[];
}

/**
 * Tabella inventario vista negozio (Store Manager).
 * Responsive grazie alle classi:
 *  - responsive-table-wrapper
 *  - responsive-table
 * definite in globals.css
 */
export function StoreInventoryTable({ batches }: StoreInventoryTableProps) {
  if (!batches || batches.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        Nessun lotto presente per questo negozio.
      </p>
    );
  }

  // Ordino per data scadenza ascendente
  const sorted = [...batches].sort((a, b) => {
    return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
  });

  return (
    <div className="responsive-table-wrapper" style={{ marginTop: 8 }}>
      <table
        className="responsive-table"
        style={{ borderCollapse: 'collapse', fontSize: 13 }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: '#F9FAFB',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <th style={{ padding: '6px 8px', textAlign: 'left' }}>Prodotto</th>
            <th style={{ padding: '6px 8px', textAlign: 'left' }}>SKU</th>
            <th style={{ padding: '6px 8px', textAlign: 'left' }}>Brand</th>
            <th style={{ padding: '6px 8px', textAlign: 'left' }}>Scadenza</th>
            <th style={{ padding: '6px 8px', textAlign: 'left' }}>Stato</th>
            <th style={{ padding: '6px 8px', textAlign: 'left' }}>Quantità</th>
            <th style={{ padding: '6px 8px', textAlign: 'left' }}>Lotto</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => {
            const daysToExpiry = getDaysToExpiry(row.expiry_date);
            const status = getStatusLabel(daysToExpiry);

            return (
              <tr
                key={row.id}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                  borderTop: '1px solid #E5E7EB',
                }}
              >
                <td style={{ padding: '6px 8px' }}>{row.product_name}</td>
                <td style={{ padding: '6px 8px' }}>{row.sku}</td>
                <td style={{ padding: '6px 8px' }}>{row.brand ?? '—'}</td>
                <td style={{ padding: '6px 8px' }}>
                  {formatDate(row.expiry_date)}
                </td>
                <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      borderRadius: 999,
                      padding: '2px 8px',
                      fontSize: 11,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      color: status.color,
                      fontWeight: 500,
                    }}
                  >
                    {status.label}
                  </span>
                </td>
                <td style={{ padding: '6px 8px' }}>{row.quantity}</td>
                <td style={{ padding: '6px 8px' }}>
                  {row.batch_code ?? '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
