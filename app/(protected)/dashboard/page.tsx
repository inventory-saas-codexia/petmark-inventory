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
        <div className="page-title-main">Panoramica Inventory Cloud</div>
        <div className="page-title-sub">
          Da qui puoi accedere rapidamente a negozi e scadenziario, con una
          vista unica per la rete PetMark.
        </div>
      </section>

      <section className="grid-cards">
        <div className="stat-card">
          <div className="stat-card-title">Profilo utente</div>
          <div className="stat-card-main">ID utente: {profile?.id}</div>
          <div className="text-xs" style={{ marginTop: '0.35rem' }}>
            Ruolo:{' '}
            <span className="badge badge-ok" style={{ padding: '0.1rem 0.55rem' }}>
              {profile?.role}
            </span>
          </div>
          <div className="text-xs" style={{ marginTop: '0.3rem' }}>
            Organization: {profile?.organization_id}
          </div>
          <div className="text-xs" style={{ marginTop: '0.2rem' }}>
            Punto di vista: {profile?.store_id ?? 'HQ (centrale)'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Cosa puoi fare da qui</div>
          <div className="text-xs" style={{ marginTop: '0.4rem' }}>
            <strong>• Negozi</strong> – vedere quali punti vendita sono inclusi
            nel pilota e il relativo codice.
          </div>
          <div className="text-xs" style={{ marginTop: '0.25rem' }}>
            <strong>• Scadenziario</strong> – consultare in un clic tutti i
            lotti in scadenza, filtrati per negozio.
          </div>
          <div className="text-xs" style={{ marginTop: '0.25rem' }}>
            <strong>• Estensione futura</strong> – da qui si potranno
            aggiungere alert automatici e report periodici verso HQ.
          </div>
          <div className="stat-pill">
            Suggerimento: apri lo scadenziario prima di ogni giro visite.
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Sessione demo</div>
          <div className="text-xs" style={{ marginTop: '0.4rem' }}>
            Ambiente di prova: i dati sono di esempio e non modificano i
            sistemi operativi PetMark.
          </div>
          <div className="text-xs" style={{ marginTop: '0.25rem' }}>
            Ideale per mostrare come potrebbe funzionare uno scadenziario unico
            per tutti i negozi.
          </div>
          <button
            className="btn-danger"
            style={{ marginTop: '0.7rem' }}
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
