'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowserClient } from '../supabase/browserClient';

export interface ExpiryKpi {
  totalBatches: number;
  totalQuantity: number;
  expiredBatches: number;
  expiredQuantity: number;
  next30Batches: number;
  next30Quantity: number;
  next90Batches: number;
  next90Quantity: number;
}

export interface UseExpiryKpiResult {
  kpi: ExpiryKpi | null;
  loading: boolean;
  error: string | null;
}

/**
 * Calcola KPI di scadenza per:
 * - tutta l'organizzazione (se solo orgId)
 * - una sola area (se areaId)
 * - un singolo negozio (se storeId)
 */
export function useExpiryKpi(
  orgId: string | null,
  areaId?: string | null,
  storeId?: string | null
): UseExpiryKpiResult {
  const [kpi, setKpi] = useState<ExpiryKpi | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) {
      setKpi(null);
      setLoading(false);
      setError('Nessuna organizzazione associata.');
      return;
    }

    let isMounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        // partiamo dalla tabella inventory_batches filtrata per orgId
        let query = supabaseBrowserClient
          .from('inventory_batches')
          .select(
            `
            id,
            quantity,
            expiry_date,
            store_id,
            stores (
              area_id
            )
          `
          )
          .eq('organization_id', orgId);

        if (storeId) {
          query = query.eq('store_id', storeId);
        } else if (areaId) {
          // filtra per area: via join su stores
          query = query.eq('stores.area_id', areaId);
        }

        const { data, error } = await query;

        if (!isMounted) return;

        if (error) {
          setError(error.message);
          setKpi(null);
          setLoading(false);
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const base: ExpiryKpi = {
          totalBatches: 0,
          totalQuantity: 0,
          expiredBatches: 0,
          expiredQuantity: 0,
          next30Batches: 0,
          next30Quantity: 0,
          next90Batches: 0,
          next90Quantity: 0,
        };

        (data ?? []).forEach((row: any) => {
          base.totalBatches += 1;
          base.totalQuantity += row.quantity ?? 0;

          if (!row.expiry_date) return;

          const exp = new Date(row.expiry_date);
          exp.setHours(0, 0, 0, 0);

          const diffMs = exp.getTime() - today.getTime();
          const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

          if (days < 0) {
            base.expiredBatches += 1;
            base.expiredQuantity += row.quantity ?? 0;
          } else if (days <= 30) {
            base.next30Batches += 1;
            base.next30Quantity += row.quantity ?? 0;
          } else if (days <= 90) {
            base.next90Batches += 1;
            base.next90Quantity += row.quantity ?? 0;
          }
        });

        setKpi(base);
        setLoading(false);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? 'Errore sconosciuto');
        setKpi(null);
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [orgId, areaId, storeId]);

  return { kpi, loading, error };
}
