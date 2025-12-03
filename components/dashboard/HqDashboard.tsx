'use client';

import { useEffect, useState } from 'react';
import type { Profile } from '@/lib/types/profile';
import { useExpiryKpi } from '@/lib/hooks/useExpiryKpi';
import { useStoresForScope } from '@/lib/hooks/useStoresForScope';
import { supabaseBrowserClient } from '@/lib/supabase/browserClient';
import { KpiCard } from './KpiCard';
import { StoreList } from './StoreList';

interface HqDashboardProps {
  profile: Profile;
}

interface AreaOption {
  id: string;
  name: string;
}

export function HqDashboard({ profile }: HqDashboardProps) {
  const { kpi, loading, error } = useExpiryKpi(profile.organization_id);
  const {
    stores,
    loading: storesLoading,
    error: storesError,
  } = useStoresForScope(profile.organization_id, null);

  // --- Stato per creazione utenti ---
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [areasLoading, setAreasLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'area_manager' | 'store_manager' | 'staff'>(
    'staff'
  );
  const [selectedAreaId, setSelectedAreaId] = useState<string | ''>('');
  const [selectedStoreId, setSelectedStoreId] = useState<string | ''>('');

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // carica aree per l'organizzazione
  useEffect(() => {
    let isMounted = true;

    (async () => {
      setAreasLoading(true);
      try {
        const { data, error } = await supabaseBrowserClient
          .from('areas')
          .select('id, name')
          .eq('organization_id', profile.organization_id)
          .order('name', { ascending: true });

        if (!isMounted) return;

        if (error) {
          setAreas([]);
        } else {
          const mapped: AreaOption[] = (data ?? []).map((a: any) => ({
            id: a.id,
            name: a.name,
          }));
          setAreas(mapped);
        }
      } finally {
        if (isMounted) {
          setAreasLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [profile.organization_id]);

  // negozi filtrati per area selezionata (quando serve)
  const storesForSelectedArea = stores.filter((s) =>
    selectedAreaId ? s.areaName != null : true
  );

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!email || !password) {
      setCreateError('Email e password sono obbligatorie.');
      return;
    }

    if (role !== 'area_manager' && !selectedStoreId) {
      setCreateError('Per store manager / staff devi selezionare un negozio.');
      return;
    }

    setCreating(true);

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role,
          organization_id: profile.organization_id,
          store_id:
            role === 'store_manager' || role === 'staff'
              ? selectedStoreId || null
              : null,
          area_id:
            role === 'area_manager'
              ? selectedAreaId || null
              : role === 'store_manager' || role === 'staff'
              ? selectedAreaId || null
              : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error ?? 'Errore nella creazione utente.');
        return;
      }

      setCreateSuccess(`Utente creato: ${data.email}`);
      setEmail('');
      setPassword('');
      setSelectedAreaId('');
      setSelectedStoreId('');
    } catch (err: any) {
      setCreateError(err?.message ?? 'Errore sconosciuto.');
    } finally {
      setCreating(false);
    }
  }

  // --- Render ---

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>
        HQ · Vista globale rete Petmark
      </h2>

      {/* KPI */}
      {loading && <p style={{ fontSize: 14 }}>Caricamento dati scadenze...</p>}
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
              title="Lotti totali"
              value={kpi.totalBatches}
              subtitle={`Quantità totale: ${kpi.totalQuantity}`}
              color="slate"
            />
            <KpiCard
              title="Scaduti"
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
            KPI calcolati su tutti i lotti della rete Petmark per questa
            organizzazione.
          </p>
        </>
      )}

      {/* Lista negozi */}
      <StoreList
        title="Negozi della rete"
        stores={stores}
        loading={storesLoading}
        error={storesError}
        showArea={true}
      />

      {/* Gestione utenti */}
      <div
        style={{
          marginTop: 8,
          borderRadius: 12,
          border: '1px solid #E5E7EB',
          backgroundColor: 'rgba(255,255,255,0.95)',
          padding: 12,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          Gestione utenti · crea nuovo account
        </h3>

        <form
          onSubmit={handleCreateUser}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#374151' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                padding: '6px 8px',
                fontSize: 14,
              }}
              required
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#374151' }}>Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                padding: '6px 8px',
                fontSize: 14,
              }}
              required
            />
          </div>

          {/* Ruolo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#374151' }}>Ruolo</label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as 'area_manager' | 'store_manager' | 'staff')
              }
              style={{
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                padding: '6px 8px',
                fontSize: 14,
              }}
            >
              <option value="staff">Staff negozio</option>
              <option value="store_manager">Store manager</option>
              <option value="area_manager">Area manager</option>
            </select>
          </div>

          {/* Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#374151' }}>Area</label>
            {areasLoading ? (
              <div style={{ fontSize: 13, color: '#6B7280' }}>Caricamento aree...</div>
            ) : (
              <select
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                style={{
                  borderRadius: 8,
                  border: '1px solid #D1D5DB',
                  padding: '6px 8px',
                  fontSize: 14,
                }}
              >
                <option value="">(Nessuna / tutte)</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Negozio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#374151' }}>Negozio</label>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              style={{
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                padding: '6px 8px',
                fontSize: 14,
              }}
              disabled={role === 'area_manager'}
            >
              <option value="">(Nessuno)</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ''}
                </option>
              ))}
            </select>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>
              Obbligatorio per store manager / staff.
            </div>
          </div>

          {/* Pulsante + messaggi */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              alignItems: 'flex-start',
            }}
          >
            <button
              type="submit"
              disabled={creating}
              style={{
                marginTop: 18,
                borderRadius: 999,
                padding: '6px 16px',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                background:
                  'linear-gradient(90deg, #F97373, #FB7185)',
                color: '#FFFFFF',
                cursor: creating ? 'default' : 'pointer',
                opacity: creating ? 0.6 : 1,
              }}
            >
              {creating ? 'Creazione in corso...' : 'Crea utente'}
            </button>

            {createError && (
              <div style={{ fontSize: 12, color: '#B91C1C' }}>{createError}</div>
            )}
            {createSuccess && (
              <div style={{ fontSize: 12, color: '#15803D' }}>
                {createSuccess}
              </div>
            )}
          </div>
        </form>

        <div style={{ marginTop: 6, fontSize: 11, color: '#9CA3AF' }}>
          Nota: la creazione usa la chiave service role Supabase lato server.  
          Assicurati che <code>SUPABASE_SERVICE_ROLE_KEY</code> sia configurata.
        </div>
      </div>
    </div>
  );
}
