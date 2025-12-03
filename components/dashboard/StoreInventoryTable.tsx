'use client';

import type { StoreInventoryItem } from '@/lib/hooks/useStoreInventory';

interface StoreInventoryTableProps {
  items: StoreInventoryItem[];
}

function getExpiryStyle(days: number | null) {
  // ritorno: label + colori inline
  if (days === null) {
    return {
      label: 'N/D',
      backgroundColor: '#E5E7EB', // grigio chiaro
      color: '#374151',           // grigio scuro
    };
  }

  if (days < 0) {
    return {
      label: `Scaduto da ${Math.abs(days)}g`,
      backgroundColor: '#FEE2E2', // rosso chiaro
      color: '#B91C1C',           // rosso scuro
    };
  }

  if (days === 0) {
    return {
      label: 'Scade oggi',
      backgroundColor: '#FEE2E2',
      color: '#B91C1C',
    };
  }

  if (days <= 30) {
    return {
      label: `Tra ${days}g`,
      backgroundColor: '#FEF3C7', // ambra chiaro
      color: '#92400E',
    };
  }

  if (days <= 90) {
    return {
      label: `Tra ${days}g`,
      backgroundColor: '#DBEAFE', // azzurro chiaro
      color: '#1D4ED8',
    };
  }

  return {
    label: `Tra ${days}g`,
    backgroundColor: '#DCFCE7', // verde chiaro
    color: '#166534',
  };
}

export function StoreInventoryTable({ items }: StoreInventoryTableProps) {
  if (items.length === 0) {
    return (
      <p style={{ fontSize: '14px', color: '#4B5563' }}>
        Nessun lotto presente per questo negozio.
      </p>
    );
  }

  // stili base
  const wrapperStyle: React.CSSProperties = {
    borderRadius: 12,
    border: '1px solid #F9A8D4',
    backgroundColor: 'rgba(255,255,255,0.95)',
    boxShadow: '0 8px 20px rgba(15,23,42,0.06)',
    overflow: 'hidden',
  };

  const tableContainerStyle: React.CSSProperties = {
    maxHeight: 540,
    overflowX: 'auto',
    overflowY: 'auto',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  };

  const theadStyle: React.CSSProperties = {
    backgroundColor: '#FDF2F8', // rosa chiarissimo
  };

  const headerCellStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontWeight: 600,
    color: '#374151',
    textAlign: 'left' as const,
    borderBottom: '1px solid #E5E7EB',
    whiteSpace: 'nowrap' as const,
  };

  const rowBaseStyle: React.CSSProperties = {
    borderTop: '1px solid #E5E7EB',
    color: '#111827',
    transition: 'background-color 120ms ease-out',
  };

  const cellStyle: React.CSSProperties = {
    padding: '8px 12px',
    verticalAlign: 'middle',
  };

  const footerStyle: React.CSSProperties = {
    borderTop: '1px solid #E5E7EB',
    padding: '6px 12px',
    fontSize: '11px',
    color: '#6B7280',
  };

  return (
    <div style={wrapperStyle}>
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={headerCellStyle}>Prodotto</th>
              <th style={headerCellStyle}>SKU</th>
              <th style={headerCellStyle}>Brand</th>
              <th style={headerCellStyle}>Scadenza</th>
              <th style={headerCellStyle}>Stato</th>
              <th style={{ ...headerCellStyle, textAlign: 'right' }}>Quantità</th>
              <th style={headerCellStyle}>Lotto</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const isEven = idx % 2 === 0;
              const expiry = getExpiryStyle(item.daysToExpiry);

              const rowStyle: React.CSSProperties = {
                ...rowBaseStyle,
                backgroundColor: isEven ? '#FFFFFF' : '#F9FAFB',
              };

              return (
                <tr
                  key={item.id}
                  style={rowStyle}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      '#FEF2F2';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      isEven ? '#FFFFFF' : '#F9FAFB';
                  }}
                >
                  <td style={cellStyle}>
                    <span style={{ fontWeight: 500 }}>{item.product_name}</span>
                  </td>
                  <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                    {item.product_sku ?? '—'}
                  </td>
                  <td style={cellStyle}>{item.product_brand ?? '—'}</td>
                  <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                    {item.expiry_date
                      ? new Date(item.expiry_date).toLocaleDateString()
                      : '—'}
                  </td>
                  <td style={cellStyle}>
                    <span
                      style={{
                        backgroundColor: expiry.backgroundColor,
                        color: expiry.color,
                        borderRadius: 999,
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      {expiry.label}
                    </span>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 600 }}>
                    {item.quantity}
                  </td>
                  <td style={cellStyle}>{item.batch_code ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={footerStyle}>
        Totale lotti: <span style={{ fontWeight: 600 }}>{items.length}</span>
      </div>
    </div>
  );
}
