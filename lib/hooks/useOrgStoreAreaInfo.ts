'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowserClient } from '../supabase/browserClient';

interface OrgStoreAreaInfoResult {
  orgName: string | null;
  storeName: string | null;
  areaName: string | null;
  loading: boolean;
  error: string | null;
}

export function useOrgStoreAreaInfo(
  organizationId: string | null,
  storeId: string | null,
  areaId: string | null
): OrgStoreAreaInfoResult {
  const [orgName, setOrgName] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [areaName, setAreaName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // se non abbiamo nemmeno l'organizationId, non facciamo query
    if (!organizationId) {
      setOrgName(null);
      setStoreName(null);
      setAreaName(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        // organizazzione
        const [orgRes, storeRes, areaRes] = await Promise.all([
          supabaseBrowserClient
            .from('organizations')
            .select('name')
            .eq('id', organizationId)
            .maybeSingle(),
          storeId
            ? supabaseBrowserClient
                .from('stores')
                .select('name')
                .eq('id', storeId)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          areaId
            ? supabaseBrowserClient
                .from('areas')
                .select('name')
                .eq('id', areaId)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);

        if (!isMounted) return;

        if (orgRes.error || storeRes.error || areaRes.error) {
          setError(
            orgRes.error?.message ??
              storeRes.error?.message ??
              areaRes.error?.message ??
              'Errore nel caricamento dei dati'
          );
        } else {
          setError(null);
        }

        setOrgName((orgRes.data as any)?.name ?? null);
        setStoreName((storeRes.data as any)?.name ?? null);
        setAreaName((areaRes.data as any)?.name ?? null);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? 'Errore sconosciuto');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [organizationId, storeId, areaId]);

  return { orgName, storeName, areaName, loading, error };
}
