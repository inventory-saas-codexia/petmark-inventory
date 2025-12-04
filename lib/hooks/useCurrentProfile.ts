'use client';

import { useEffect, useState } from 'react';
import type { Profile } from '../types/profile';
import { browserClient } from '@/lib/supabase/browserClient';

interface ExtendedProfile extends Profile {
  organization_name?: string;
}

interface UseCurrentProfileResult {
  profile: ExtendedProfile | null;
  loading: boolean;
  error: string | null;
}

export function useCurrentProfile(): UseCurrentProfileResult {
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const supabase = browserClient();

        // 1) user loggato
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) {
          if (isMounted) {
            setProfile(null);
            setError('Non autenticato');
          }
          return;
        }

        // 2) profilo + nome organizzazione
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select(
            `
            id,
            organization_id,
            role,
            store_id,
            area_id,
            organizations ( name )
          `
          )
          .eq('id', auth.user.id)
          .single();

        if (profileError || !data) {
          if (isMounted) {
            setProfile(null);
            setError('Errore caricamento profilo');
          }
          return;
        }

        const extended: ExtendedProfile = {
          ...(data as any),
          organization_name: (data as any).organizations?.name ?? undefined,
        };

        if (isMounted) {
          setProfile(extended);
          setError(null);
        }
      } catch (e) {
        if (isMounted) {
          setError('Failed to load profile');
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return { profile, loading, error };
}
