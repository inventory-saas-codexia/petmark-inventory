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

function severityColor(days: number) {
  if (days < 0) return 'red';
  if (days <= 7) return 'orangered';
  if (days <= 30) return 'orange';
  if (days <= 90) return 'goldenrod';
  return 'green';
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
        .select(`
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
        `)
        .order('expiry_date', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setRows((data || []) as any);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <main style={{ padding: 40 }}>
        <p>Caricamento scadenziario…</p>
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
      <h1>Scadenziario prodotti</h1>
      <p style={{ marginBottom: 10, fontSize: 14 }}>
        Colori: <span style={{ color: 'red' }}>scaduto</span>,{' '}
        <span style={{ color: 'orangered' }}>≤ 7 giorni</span>,{' '}
        <span style={{ color: 'orange' }}>≤ 30</span>,{' '}
        <span style={{ color: 'goldenrod' }}>≤ 90</span>,{' '}
        <span style={{ color: 'green' }}>&gt; 90</span>


      </p>

      {rows.length === 0 && <p>Nessun lotto trovato.</p>}

      {rows.length > 0 && (
        <table style={{ borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 6 }}>Negozio</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 6 }}>Prodotto</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 6 }}>SKU</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 6 }}>Lotto</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 6 }}>Scadenza</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'right', padding: 6 }}>Giorni</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'right', padding: 6 }}>Qty</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const d = daysUntil(row.expiry_date);
              const color = severityColor(d);
              return (
                <tr key={row.id}>
                  <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>
                    {row.store?.name} {row.store?.code && `(${row.store.code})`}
                  </td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>
                    {row.product?.name}
                  </td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>
                    {row.product?.sku}
                  </td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>
                    {row.batch_code}
                  </td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>
                    {row.expiry_date}
                  </td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 6, textAlign: 'right', color }}>
                    {d}
                  </td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 6, textAlign: 'right' }}>
                    {row.quantity}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
