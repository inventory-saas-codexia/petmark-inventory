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

      if (error) setError(error.message);
      else setRows((data || []) as unknown as InventoryRow[]);

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return <main>Caricamento scadenziario…</main>;
  }

  if (error) {
    return <main>Errore: {error}</main>;
  }

  return (
    <main>
      <section className="page-title-card">
        <div className="page-title-main">Scadenziario prodotti</div>
        <div className="page-title-sub">
          Tutti i lotti in scadenza nella rete PetMark, ordinati per data.
        </div>
      </section>

      <section className="table-card">
        <div className="table-header">
          <div>
            <div className="table-header-title">Lotti per data di scadenza</div>
            <div className="table-header-sub">
              Colori: rosso = scaduto / &lt;= 7 giorni, giallo = entro 30–90 giorni,
              verde = oltre 90 giorni.
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="table-header-sub">
            Nessun lotto presente. Inserisci qualche lotto di test in Supabase per
            vedere lo scadenziario.
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Negozio</th>
                  <th>Prodotto</th>
                  <th>SKU</th>
                  <th>Lotto</th>
                  <th>Scadenza</th>
                  <th style={{ textAlign: 'right' }}>Giorni</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const d = daysUntil(row.expiry_date);
                  let cls = 'badge badge-ok';
                  if (d < 0) cls = 'badge badge-danger';
                  else if (d <= 7) cls = 'badge badge-danger';
                  else if (d <= 30) cls = 'badge badge-warn';
                  else if (d <= 90) cls = 'badge badge-soft';

                  return (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.store?.name}</strong>
                        {row.store?.code && (
                          <span className="text-xs"> ({row.store.code})</span>
                        )}
                      </td>
                      <td>{row.product?.name}</td>
                      <td>{row.product?.sku}</td>
                      <td>{row.batch_code}</td>
                      <td>{row.expiry_date}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={cls}>{d}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>{row.quantity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
