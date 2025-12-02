'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  id: string;
  organization_id: string;
  store_id: string | null;
  role: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function load() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/login');
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
      } else {
        setProfile(data as Profile);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <main style={{ padding: 40 }}>
        <p>Caricamento...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 40 }}>
        <p style={{ color: 'red' }}>Errore: {error}</p>
        <button onClick={() => router.push('/login')}>Vai al login</button>
      </main>
    );
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Dashboard PetMark</h1>
      <p><strong>Utente:</strong> {profile?.id}</p>
      <p><strong>Ruolo:</strong> {profile?.role}</p>
      <p><strong>Organization:</strong> {profile?.organization_id}</p>
      <p><strong>Store:</strong> {profile?.store_id ?? 'HQ'}</p>
      <p style={{ marginTop: 20 }}>
  <a href="/stores">Vai alla lista negozi</a>
</p>


      <button
        style={{ marginTop: 20 }}
        onClick={async () => {
          await supabase.auth.signOut();
          router.push('/login');
        }}
      >
        Logout
      </button>
    </main>
  );
}
