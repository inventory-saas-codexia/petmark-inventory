'use client';

import { useEffect, useState } from 'react';
import type { Profile } from '../types/profile';
import { getCurrentProfile } from '../auth/getCurrentProfile';

interface UseCurrentProfileResult {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export function useCurrentProfile(): UseCurrentProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const result = await getCurrentProfile();
        if (!isMounted) return;

        setProfile(result);
        setError(null);
      } catch (e) {
        if (!isMounted) return;
        setError('Failed to load profile');
        setProfile(null);
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
