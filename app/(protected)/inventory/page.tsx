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

type RangeKey = '<=7' | '8-30' | '31-90' | '>90';
type ExportMode = 'filtered' | 'all' | 'urgent' | 'next90';

function daysUntil(dateStr: string) {
  const target = new Date(dateStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function classifyRange(d: number): RangeKey {
  if (d <= 7) return '<=7'; // scaduto incluso
  if (d <= 30) return '8-30';
  if (d <= 90) return '31-90';
  return '>90';
}

// Export helper: crea CSV e forza il download
function exportRowsToCsv(rows: InventoryRow[], filename: string) {
  if (rows.length === 0) {
    alert('Non ci sono lotti da esportare con i filtri selezionati.');
    return;
  }

  const header = [
    'Negozio',
    'Codice negozio',
    'Prodotto',
    'SKU',
    'Lotto',
    'Scadenza',
    'Giorni alla scadenza',
    'Quantità',
  ];

  const lines = rows.map((row) => {
    const d = daysUntil(row.expiry_date);
    const values = [
      row.store?.name ?? '',
      row.store?.code ?? '',
      row.product?.name ?? '',
      row.product?.sku ?? '',
      row.batch_code ?? '',
      row.expiry_date,
      String(d),
      String(row.quantity),
    ];

    // escape valori per CSV
    return values
      .map((v) => {
        if (v.includes('"') || v.includes(';') || v.includes(',') || v.includes('\n')) {
          return `"${v.replace(/"/g, '""')}"`;
        }
        return v;
      })
      .join(';'); // separatore ; per Excel in italiano
  });

  const csvContent = [header.join(';'), ...lines].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function InventoryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedRange, setSelectedRange] = useState<'all' | RangeKey>('all');
  const [exportMode, setExportMode] = useState<ExportMode>('filtered');

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

  if (loading) return <main>Caricamento scadenziario…</main>;
  if (error) return <main>Errore: {error}</main>;

  // elenco negozi per filtro
  const storeOptions = Array.from(
    new Set(
      rows
        .map((r) => r.store?.name)
        .filter((n): n is string => !!n)
    )
  );

  // statistiche generali
  const stats = rows.reduce(
    (acc, row) => {
      const d = daysUntil(row.expiry_date);
      const r = classifyRange(d);
      acc.total += 1;
      if (r === '<=7') acc.red += 1;
      else if (r === '8-30') acc.orange += 1;
      else if (r === '31-90') acc.yellow += 1;
      else acc.green += 1;
      return acc;
    },
    { total: 0, red: 0, orange: 0, yellow: 0, green: 0 }
  );

  // righe visibili in base ai filtri
  const visibleRows = rows.filter((row) => {
    const d = daysUntil(row.expiry_date);
    const rangeKey = classifyRange(d);

    if (selectedStore !== 'all' && row.store?.name !== selectedStore) {
      return false;
    }
    if (selectedRange !== 'all' && rangeKey !== selectedRange) {
      return false;
    }
    return true;
  });

  // righe da esportare in base alla modalità scelta
  function getRowsForExport(): InventoryRow[] {
    if (exportMode === 'filtered') {
      return visibleRows;
    }

    if (exportMode === 'all') {
      return rows;
    }

    if (exportMode === 'urgent') {
      return rows.filter((row) => {
        const d = daysUntil(row.expiry_date);
        const r = classifyRange(d);
        return r === '<=7';
      });
    }

    // next90: 8–90 giorni
    if (exportMode === 'next90') {
      return rows.filter((row) => {
        const d = daysUntil(row.expiry_date);
        const r = classifyRange(d);
        return r === '8-30' || r === '31-90';
      });
    }

    return rows;
  }

  function handleExportClick() {
    const toExport = getRowsForExport();

    let suffix = '';
    if (exportMode === 'filtered') suffix = 'vista-filtrata';
    else if (exportMode === 'all') suffix = 'tutti-i-lotti';
    else if (exportMode === 'urgent') suffix = 'urgenti-rosso';
    else if (exportMode === 'next90') suffix = 'prossimi-90-giorni';

    const filename = `petmark-scadenziario-${suffix}.csv`;
    exportRowsToCsv(toExport, filename);
  }

  return (
    <main>
      <section className="page-title-card">
        <div className="page-title-main">Scadenziario prodotti</div>
        <div className="page-title-sub">
          Vista unica di tutti i lotti PetMark con data di scadenza, negozio di
          appartenenza e quantità.
        </div>
      </section>

      {/* Statistiche sintetiche */}
      <section className="grid-cards" style={{ marginTop: '0.85rem' }}>
        <div className="stat-card">
          <div className="stat-card-title">Lotti totali monitorati</div>
          <div className="stat-card-main">{stats.total}</div>
          <div className="text-xs" style={{ marginTop: '0.25rem' }}>
            Tutti i lotti presenti nel sistema per la rete PetMark.
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Interventi urgenti (rosso)</div>
          <div className="stat-card-main">{stats.red}</div>
          <div className="text-xs" style={{ marginTop: '0.25rem' }}>
            Scaduti o entro 7 giorni: da gestire prima di tutto.
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Prossimi 90 giorni</div>
          <div className="stat-card-main">{stats.orange + stats.yellow}</div>
          <div className="text-xs" style={{ marginTop: '0.25rem' }}>
            Lotti in arancione/giallo, utili per pianificare le visite in store.
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Oltre 90 giorni</div>
          <div className="stat-card-main">{stats.green}</div>
          <div className="text-xs" style={{ marginTop: '0.25rem' }}>
            Stock con ampia copertura: nessuna azione immediata.
          </div>
        </div>
      </section>

      {/* Tabella principale */}
      <section className="table-card">
        <div className="table-header">
          <div>
            <div className="table-header-title">
              Lotti ordinati per data di scadenza
            </div>
            <div className="table-header-sub">
              <strong>Legenda:</strong>{' '}
              <span className="badge badge-danger">≤ 7</span> rosso = scaduto o
              entro 7 giorni ·{' '}
              <span className="badge badge-warn">8–30</span> arancione = entro
              8–30 giorni ·{' '}
              <span className="badge badge-soft">31–90</span> giallo = entro
              31–90 giorni ·{' '}
              <span className="badge badge-ok">&gt; 90</span> verde = oltre 90
              giorni.
            </div>
          </div>
        </div>

        {/* Filtri */}
        <div className="filters-row">
          <div className="text-xs">Filtri:</div>

          <select
            className="filter-select"
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
          >
            <option value="all">Tutti i negozi</option>
            {storeOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selectedRange}
            onChange={(e) =>
              setSelectedRange(e.target.value as typeof selectedRange)
            }
          >
            <option value="all">Tutte le scadenze</option>
            <option value="<=7">Rosso · ≤ 7 giorni</option>
            <option value="8-30">Arancione · 8–30 giorni</option>
            <option value="31-90">Giallo · 31–90 giorni</option>
            <option value=">90">Verde · &gt; 90 giorni</option>
          </select>
        </div>

        {/* Export */}
        <div className="export-row">
          <div className="text-xs">
            Righe visibili: <strong>{visibleRows.length}</strong> su{' '}
            <strong>{rows.length}</strong> totali.
          </div>
          <div className="export-controls">
            <select
              className="filter-select"
              value={exportMode}
              onChange={(e) =>
                setExportMode(e.target.value as ExportMode)
              }
            >
              <option value="filtered">Esporta vista filtrata</option>
              <option value="all">Esporta tutti i lotti</option>
              <option value="urgent">Solo urgenti (rosso ≤ 7 giorni)</option>
              <option value="next90">
                Solo prossimi 90 giorni (8–90 giorni)
              </option>
            </select>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleExportClick}
            >
              Esporta in Excel (CSV)
            </button>
          </div>
        </div>

        {visibleRows.length === 0 ? (
          <div className="table-header-sub" style={{ marginTop: '0.6rem' }}>
            Nessun lotto da mostrare con i filtri selezionati.
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
                {visibleRows.map((row) => {
                  const d = daysUntil(row.expiry_date);
                  const rangeKey = classifyRange(d);

                  let cls = 'badge badge-ok';
                  if (rangeKey === '<=7') cls = 'badge badge-danger';
                  else if (rangeKey === '8-30') cls = 'badge badge-warn';
                  else if (rangeKey === '31-90') cls = 'badge badge-soft';

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
