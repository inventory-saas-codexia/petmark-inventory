'use client';

import type { Profile } from '@/lib/types/profile';
import { useExpiryKpi } from '@/lib/hooks/useExpiryKpi';
import { useStoresForScope } from '@/lib/hooks/useStoresForScope';
import { KpiCard } from './KpiCard';
import { StoreList } from './StoreList';

interface AreaManagerDashboardProps {
  profile: Profile;
}

export function AreaManagerDashboard({ profile }: AreaManagerDashboardProps) {
  const { kpi, loading, error } = useExpiryKpi(
    profile.organization_id,
    profile.area_id,
    null
  );

  const {
    stores,
    loading: storesLoading,
    error: storesError,
  } = useStoresForScope(profile.organization_id, profile.area_id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>
        Area Manager · Vista area
      </h2>

      {loading && <p style={{ fontSize: 14 }}>Caricamento dati area...</p>}
      {error && (
        <p style={{ fontSize: 14, color: '#B91C1C' }}>Errore: {error}</p>
      )}

      {!loading && !error && kpi && (
        <>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <KpiCard
              title="Lotti area"
              value={kpi.totalBatches}
              subtitle={`Quantità totale: ${kpi.totalQuantity}`}
              color="slate"
            />
            <KpiCard
              title="Scaduti area"
              value={kpi.expiredBatches}
              subtitle={`Quantità: ${kpi.expiredQuantity}`}
              color="red"
            />
            <KpiCard
              title="Entro 30 giorni"
              value={kpi.next30Batches}
              subtitle={`Quantità: ${kpi.next30Quantity}`}
              color="amber"
            />
            <KpiCard
              title="31–90 giorni"
              value={kpi.next90Batches}
              subtitle={`Quantità: ${kpi.next90Quantity}`}
              color="blue"
            />
          </div>

          <p
            style={{
              fontSize: 12,
              color: '#6B7280',
              marginTop: 4,
            }}
          >
            KPI calcolati su tutti i negozi dell&apos;area assegnata.
          </p>
        </>
      )}

      <StoreList
        title="Negozi della tua area"
        stores={stores}
        loading={storesLoading}
        error={storesError}
        showArea={false}
      />
    </div>
  );
}
