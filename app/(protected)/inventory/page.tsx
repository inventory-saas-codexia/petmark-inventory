'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type InventoryRow = {
  id: string;
  expiry_date: string;
  quantity: number;
  batch_code: string | null;
  store: {
    name: string;
    code: string | null;
  } | null;
  product: {
    name: string;
    sku: string;
  } | null;
};

function daysUntil(dateStr: string) {
  const target = new Date(dateStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default function InventoryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<InventoryRow[]>([]);
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
        .from('inventory_batches')
        .select(
          `
          id,
          expiry_date,
          quantity,
          batch_code,
          store:stores (
            name,
            code
          ),
          product:products (
            name,
            sku
          )
        `
        )
        .order('expiry_date', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setRows((data || []) as unknown as InventoryRow[]);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <main className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-8">
        <p className="text-sm text-slate-300">Caricamento scadenziario…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-8">
        <p className="text-sm text-red-300">Errore: {error}</p>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">
            Scadenziario prodotti
          </h1>
          <p className="text-xs text-slate-400">
            Lotti ordinati per data di scadenza su tutti i negozi PetMark.
          </p>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        Colori:{' '}
        <span className="font-medium text-red-400">scaduto</span>,{' '}
        <span className="font-medium text-orange-400">≤ 7 giorni</span>,{' '}
        <span className="font-medium text-amber-400">≤ 30</span>,{' '}
        <span className="font-medium text-yellow-400">≤ 90</span>,{' '}
        <span className="font-medium text-emerald-400">&gt; 90</span>
      </p>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-4 py-6 text-sm text-slate-400">
          Nessun lotto trovato. Aggiungi movimenti di magazzino per vedere lo
          scadenziario.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="min-w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Negozio</th>
                <th className="px-4 py-3">Prodotto</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Lotto</th>
                <th className="px-4 py-3">Scadenza</th>
                <th className="px-4 py-3 text-right">Giorni</th>
                <th className="px-4 py-3 text-right">Qty</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const d = daysUntil(row.expiry_date);

                const badgeClasses =
                  d < 0
                    ? 'bg-red-500/10 text-red-300'
                    : d <= 7
                    ? 'bg-orange-500/10 text-orange-300'
                    : d <= 30
                    ? 'bg-amber-500/10 text-amber-300'
                    : d <= 90
                    ? 'bg-yellow-500/10 text-yellow-300'
                    : 'bg-emerald-500/10 text-emerald-300';

                return (
                  <tr
                    key={row.id}
                    className="border-t border-slate-800/70 hover:bg-slate-800/60"
                  >
                    <td className="px-4 py-2">
                      <div className="text-xs font-medium text-slate-200">
                        {row.store?.name}
                      </div>
                      {row.store?.code && (
                        <div className="text-[11px] text-slate-500">
                          {row.store.code}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs">{row.product?.name}</td>
                    <td className="px-4 py-2 text-xs text-slate-400">
                      {row.product?.sku}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-300">
                      {row.batch_code}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-300">
                      {row.expiry_date}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span
                        className={`inline-flex min-w-[3rem] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeClasses}`}
                      >
                        {d}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-xs">
                      {row.quantity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
