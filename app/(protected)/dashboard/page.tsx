'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  role: string;
  store_id: string | null;
};

const ORG_LABEL = 'PetMark · ambiente demo';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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

      setUserEmail(user.email ?? null);

      const { data } = await supabase
        .from('profiles')
        .select('role, store_id')
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

  const viewLabel =
    profile?.store_id == null ? 'HQ (centrale)' : 'Negozio collegato allo scadenziario';

  return (
    <main>
      <section className="page-title-card">
        <div className="page-title-main">Panoramica Inventory Cloud</div>
        <div className="page-title-sub">
          Da qui puoi accedere rapidamente a negozi e scadenziario, con una vista
          unica per la rete PetMark.
        </div>
      </section>

      <section className="grid-cards">
        {/* PROFILO UTENTE */}
        <div className="stat-card">
          <div className="stat-card-title">Profilo utente</div>
          <div className="stat-card-main">
            {userEmail ?? 'Utente demo PetMark'}
          </div>

          <div className="text-xs" style={{ marginTop: '0.35rem' }}>
            Ruolo:{' '}
            <span className="badge badge-ok" style={{ padding: '0.1rem 0.55rem' }}>
              {profile?.role ?? 'admin'}
            </span>
          </div>

          <div className="text-xs" style={{ marginTop: '0.3rem' }}>
            Organizzazione: {ORG_LABEL}
          </div>

          <div className="text-xs" style={{ marginTop: '0.2rem' }}>
            Punto di vista:&nbsp;{viewLabel}
          </div>
        </div>

        {/* COSA PUOI FARE */}
        <div className="stat-card">
          <div className="stat-card-title">Cosa puoi fare da qui</div>
          <div className="text-xs" style={{ marginTop: '0.4rem' }}>
            <strong>• Negozi</strong> – vedere quali punti vendita sono inclusi nel
            pilota e il relativo codice.
          </div>
          <div className="text-xs" style={{ marginTop: '0.25rem' }}>
            <strong>• Scadenziario</strong> – consultare in un clic tutti i lotti in
            scadenza, filtrati per negozio.
          </div>
          <div className="text-xs" style={{ marginTop: '0.25rem' }}>
            <strong>• Estensione futura</strong> – da qui si potranno aggiungere alert
            automatici e report periodici verso HQ.
          </div>
          <div className="stat-pill">
            Suggerimento: apri lo scadenziario prima di ogni giro visite.
          </div>
        </div>

        {/* SESSIONE DEMO */}
        <div className="stat-card">
          <div className="stat-card-title">Sessione demo</div>
          <div className="text-xs" style={{ marginTop: '0.4rem' }}>
            Ambiente di prova: i dati sono di esempio e non modificano i sistemi
            operativi PetMark.
          </div>
          <div className="text-xs" style={{ marginTop: '0.25rem' }}>
            Ideale per mostrare come potrebbe funzionare uno scadenziario unico per
            tutti i negozi.
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
