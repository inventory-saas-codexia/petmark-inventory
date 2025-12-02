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

      if (error) setError(error.message);
      else setStores(data || []);

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return <main>Caricamento negozi…</main>;
  }

  if (error) {
    return <main>Errore: {error}</main>;
  }

  return (
    <main>
      <section className="page-title-card">
        <div className="page-title-main">Negozi PetMark</div>
        <div className="page-title-sub">
          Elenco dei punti vendita collegati al progetto pilota Inventory Cloud.
        </div>
      </section>

      <section className="table-card">
        <div className="table-header">
          <div>
            <div className="table-header-title">Anagrafica negozi</div>
            <div className="table-header-sub">
              {stores.length} negozi totali nel pilota.
            </div>
          </div>
        </div>

        {stores.length === 0 ? (
          <div className="table-header-sub">Nessun negozio presente.</div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Codice</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.code ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
