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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(data as Profile);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <main className="page-center">
        <div>Caricamento dashboard…</div>
      </main>
    );
  }

  return (
    <main>
      <section className="page-title-card">
        <div className="page-title-main">Benvenuto in Inventory Cloud</div>
        <div className="page-title-sub">
          Vista sintetica per rete PetMark: negozi, profilo utente e accessi
          rapidi.
        </div>
      </section>

      <section className="grid-cards">
        <div className="stat-card">
          <div className="stat-card-title">Profilo utente</div>
          <div className="stat-card-main">ID: {profile?.id}</div>
          <div className="text-xs" style={{ marginTop: '0.3rem' }}>
            Ruolo:{' '}
            <span className="badge badge-ok" style={{ padding: '0.1rem 0.55rem' }}>
              {profile?.role}
            </span>
          </div>
          <div className="text-xs" style={{ marginTop: '0.3rem' }}>
            Organization: {profile?.organization_id}
          </div>
          <div className="text-xs" style={{ marginTop: '0.2rem' }}>
            Store: {profile?.store_id ?? 'HQ (centrale)'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Navigazione rapida</div>
          <div className="text-xs" style={{ marginTop: '0.4rem' }}>
            <strong>Lista negozi</strong> – visualizza i 108 punti vendita
            collegati allo scadenziario.
          </div>
          <div className="text-xs" style={{ marginTop: '0.3rem' }}>
            <strong>Scadenziario prodotti</strong> – tutti i lotti in
            scadenza, ordinati per data.
          </div>
          <div className="stat-pill">Suggerimento: apri scadenziario prima di ogni visita in store</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Sessione</div>
          <div className="text-xs" style={{ marginTop: '0.4rem' }}>
            Accesso demo interno. Nessun dato viene modificato realmente sui
            sistemi PetMark.
          </div>
          <button
            className="btn-danger"
            style={{ marginTop: '0.6rem' }}
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}
