'use client';

import { useState, useMemo } from 'react';
import type { Profile } from '@/lib/types/profile';
import { useStoreInventory } from '@/lib/hooks/useStoreInventory';
import { StoreInventoryTable } from './StoreInventoryTable';

type FilterKey = 'all' | 'expired' | 'next30' | 'next90' | 'over90';

interface StaffDashboardProps {
  profile: Profile;
}

function filterItems(items: ReturnType<typeof useStoreInventory>['items'], filter: FilterKey) {
  return items.filter((item) => {
    const d = item.daysToExpiry;
    if (d === null) return filter === 'all';

    switch (filter) {
      case 'all':
        return true;
      case 'expired':
        return d < 0;
      case 'next30':
        return d >= 0 && d <= 30;
      case 'next90':
        return d > 30 && d <= 90;
      case 'over90':
        return d > 90;
      default:
        return true;
    }
  });
}

export function StaffDashboard({ profile }: StaffDashboardProps) {
  const { items, loading, error } = useStoreInventory(profile.store_id);
  const [filter, setFilter] = useState<FilterKey>('all');

  const filteredItems = useMemo(() => filterItems(items, filter), [items, filter]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all',     label: 'Tutti' },
    { key: 'expired', label: 'Scaduti' },
    { key: 'next30',  label: 'Entro 30g' },
    { key: 'next90',  label: '31–90g' },
    { key: 'over90',  label: '> 90g' },
  ];

  const pillsWrapper: React.CSSProperties = {
    display: 'inline-flex',
    gap: 6,
    padding: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.8)',
    border: '1px solid #E5E7EB',
  };

  const pillBase: React.CSSProperties = {
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
    border: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Staff · Vista operativa</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 13, color: '#6B7280' }}>
          Lotti visibili:&nbsp;
          <strong>{filteredItems.length}</strong>
          {filter !== 'all' && (
            <span style={{ marginLeft: 4, fontSize: 12 }}>
              (filtro: {filters.find((f) => f.key === filter)?.label})
            </span>
          )}
        </div>

        <div style={pillsWrapper}>
          {filters.map((f) => {
            const active = f.key === filter;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                style={{
                  ...pillBase,
                  backgroundColor: active ? '#F97373' : 'transparent',
                  color: active ? '#FFFFFF' : '#374151',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && <p style={{ fontSize: 14 }}>Caricamento inventario...</p>}
      {error && (
        <p style={{ fontSize: 14, color: '#B91C1C' }}>Errore: {error}</p>
      )}

      {!loading && !error && <StoreInventoryTable items={filteredItems} />}
    </div>
  );
}
