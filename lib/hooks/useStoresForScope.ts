'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowserClient } from '../supabase/browserClient';

export interface StoreInfo {
  id: string;
  name: string;
  code: string | null;
  areaName: string | null;
}

export interface UseStoresForScopeResult {
  stores: StoreInfo[];
  loading: boolean;
  error: string | null;
}

/**
 * Ritorna la lista dei negozi:
 * - di tutta l'organizzazione (se areaId è null)
 * - solo di una area specifica (se areaId è valorizzato)
 */
export function useStoresForScope(
  organizationId: string | null,
  areaId: string | null
): UseStoresForScopeResult {
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setStores([]);
      setLoading(false);
      setError('Nessuna organizzazione.');
      return;
    }

    let isMounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabaseBrowserClient
          .from('stores')
          .select(
            `
            id,
            name,
            code,
            area_id,
            areas (
              name
            )
          `
          )
          .eq('organization_id', organizationId);

        if (areaId) {
          query = query.eq('area_id', areaId);
        }

        const { data, error } = await query.order('name', { ascending: true });

        if (!isMounted) return;

        if (error) {
          setError(error.message);
          setStores([]);
          setLoading(false);
          return;
        }

        const mapped: StoreInfo[] = (data ?? []).map((row: any) => ({
          id: row.id,
          name: row.name,
          code: row.code ?? null,
          areaName: row.areas?.name ?? null,
        }));

        setStores(mapped);
        setLoading(false);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? 'Errore sconosciuto');
        setStores([]);
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [organizationId, areaId]);

  return { stores, loading, error };
}
