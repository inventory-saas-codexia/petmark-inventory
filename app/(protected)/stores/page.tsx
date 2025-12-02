'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Store = {
  id: string;
  name: string;
  code: string | null;
};

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      // controllo login
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('stores')
        .select('id, name, code')
        .order('name', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setStores(data || []);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <main style={{ padding: 40 }}>
        <p>Caricamento negozi…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 40 }}>
        <p style={{ color: 'red' }}>Errore: {error}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Negozi PetMark</h1>

      {stores.length === 0 && <p>Nessun negozio trovato.</p>}

      <ul>
        {stores.map((s) => (
          <li key={s.id} style={{ marginBottom: 4 }}>
            <strong>{s.name}</strong> {s.code && <span>({s.code})</span>}
          </li>
        ))}
      </ul>
    </main>
  );
}
