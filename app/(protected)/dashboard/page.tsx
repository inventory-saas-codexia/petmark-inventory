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
      <main className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-8">
        <p className="text-sm text-slate-300">Caricamento dashboard…</p>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-5">
        <h1 className="text-lg font-semibold text-slate-50">
          Benvenuto in PetMark Inventory
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Controlla a colpo d&apos;occhio negozi, lotti e scadenze critiche.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Profilo utente
          </div>
          <div className="mt-2 space-y-1 text-xs text-slate-300">
            <div>
              <span className="text-slate-400">ID: </span>
              {profile?.id}
            </div>
            <div>
              <span className="text-slate-400">Ruolo: </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                {profile?.role}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Organization: </span>
              {profile?.organization_id}
            </div>
            <div>
              <span className="text-slate-400">Store: </span>
              {profile?.store_id ?? 'HQ'}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Navigazione rapida
          </div>
          <div className="mt-3 flex flex-col gap-2 text-xs">
            <a
              href="/stores"
              className="inline-flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 hover:border-slate-600 hover:bg-slate-800/70"
            >
              <span>Lista negozi</span>
              <span className="text-slate-500">108 negozi</span>
            </a>
            <a
              href="/inventory"
              className="inline-flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 hover:border-slate-600 hover:bg-slate-800/70"
            >
              <span>Scadenziario prodotti</span>
              <span className="text-slate-500">Lotti in scadenza</span>
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Sessione
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="mt-3 inline-flex items-center rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-500/20"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
