'use client';

import type { StoreInfo } from '@/lib/hooks/useStoresForScope';

interface StoreListProps {
  title: string;
  stores: StoreInfo[];
  loading: boolean;
  error: string | null;
  showArea?: boolean;
}

export function StoreList({
  title,
  stores,
  loading,
  error,
  showArea = true,
}: StoreListProps) {
  const wrapperStyle: React.CSSProperties = {
    marginTop: 12,
    borderRadius: 12,
    border: '1px solid #E5E7EB',
    backgroundColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderBottom: '1px solid #E5E7EB',
    background:
      'linear-gradient(90deg, rgba(251,207,232,0.6), rgba(219,234,254,0.6))',
    fontSize: 13,
    fontWeight: 600,
    color: '#111827',
  };

  const tableContainerStyle: React.CSSProperties = {
    maxHeight: 260,
    overflowY: 'auto',
    overflowX: 'auto',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  };

  const thStyle: React.CSSProperties = {
    padding: '6px 10px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#4B5563',
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#F9FAFB',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '6px 10px',
    verticalAlign: 'middle',
    borderTop: '1px solid #E5E7EB',
  };

  if (loading) {
    return (
      <div style={wrapperStyle}>
        <div style={headerStyle}>{title}</div>
        <div style={{ padding: '8px 12px', fontSize: 13 }}>Caricamento...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={wrapperStyle}>
        <div style={headerStyle}>{title}</div>
        <div style={{ padding: '8px 12px', fontSize: 13, color: '#B91C1C' }}>
          Errore: {error}
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div style={wrapperStyle}>
        <div style={headerStyle}>{title}</div>
        <div style={{ padding: '8px 12px', fontSize: 13, color: '#6B7280' }}>
          Nessun negozio trovato.
        </div>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <div style={headerStyle}>{title}</div>
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Codice</th>
              {showArea && <th style={thStyle}>Area</th>}
            </tr>
          </thead>
          <tbody>
            {stores.map((s, idx) => (
              <tr
                key={s.id}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                }}
              >
                <td style={tdStyle}>{s.name}</td>
                <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                  {s.code ?? '—'}
                </td>
                {showArea && (
                  <td style={tdStyle}>{s.areaName ?? 'N/D'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
