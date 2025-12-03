import { supabaseBrowserClient } from '../supabase/browserClient';
import type { Profile } from '../types/profile';

export async function getCurrentProfile(): Promise<Profile | null> {
  const {
    data: { user },
    error: userError,
  } = await supabaseBrowserClient.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabaseBrowserClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Profile;
}
