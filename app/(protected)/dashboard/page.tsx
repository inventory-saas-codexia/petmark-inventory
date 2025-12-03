'use client';

import { useCurrentProfile } from '@/lib/hooks/useCurrentProfile';
import { useOrgStoreAreaInfo } from '@/lib/hooks/useOrgStoreAreaInfo';
import { HqDashboard } from '@/components/dashboard/HqDashboard';
import { AreaManagerDashboard } from '@/components/dashboard/AreaManagerDashboard';
import { StoreManagerDashboard } from '@/components/dashboard/StoreManagerDashboard';
import { StaffDashboard } from '@/components/dashboard/StaffDashboard';

export default function DashboardPage() {
  const { profile, loading, error } = useCurrentProfile();

  const orgId = profile?.organization_id ?? null;
  const storeId = profile?.store_id ?? null;
  const areaId = profile?.area_id ?? null;

  const {
    orgName,
    storeName,
    areaName,
    loading: metaLoading,
    error: metaError,
  } = useOrgStoreAreaInfo(orgId, storeId, areaId);

  if (loading) {
    return <div className="p-6">Caricamento profilo...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Errore: {error}</div>;
  }

  if (!profile) {
    return <div className="p-6">Nessun utente loggato.</div>;
  }

  const renderDashboardByRole = () => {
    switch (profile.role) {
      case 'hq':
        return <HqDashboard profile={profile} />;
      case 'area_manager':
        return <AreaManagerDashboard profile={profile} />;
      case 'store_manager':
        return <StoreManagerDashboard profile={profile} />;
      case 'staff':
        return <StaffDashboard profile={profile} />;
      default:
        return (
          <div className="rounded-lg border p-4">
            <p>Ruolo non gestito: {profile.role}</p>
          </div>
        );
    }
  };

  const roleLabelMap: Record<string, string> = {
    hq: 'HQ',
    area_manager: 'Area Manager',
    store_manager: 'Store Manager',
    staff: 'Staff',
  };

  const roleLabel = roleLabelMap[profile.role] ?? profile.role;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Petmark</h1>

      <div className="rounded-lg border p-4 space-y-1 text-sm text-gray-700">
        <p>
          <strong>Ruolo:</strong> {roleLabel}
        </p>

        {metaLoading ? (
          <p>Caricamento dati organizzazione...</p>
        ) : (
          <>
            <p>
              <strong>Organizzazione:</strong> {orgName ?? 'N/D'}
            </p>
            <p>
              <strong>Area:</strong> {areaName ?? 'Nessuna'}
            </p>
            <p>
              <strong>Negozio:</strong> {storeName ?? 'Nessuno'}
            </p>
          </>
        )}

        {metaError && (
          <p className="text-xs text-red-500 mt-1">
            Errore info organizzazione: {metaError}
          </p>
        )}
      </div>

      {renderDashboardByRole()}
    </div>
  );
}
